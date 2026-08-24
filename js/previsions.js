/* =========================================================================
 * Météo-Climat Pro — Prévisions AROME HD par commune
 * -------------------------------------------------------------------------
 *  - Recherche par nom de commune ou code postal (geo.api.gouv.fr)
 *  - Données : output/arome/maps/communes/{dept}.bin.gz (format MCV2, zlib)
 *  - Décodage : DecompressionStream('deflate') natif + DataView
 *  - 3 tableaux (général / orages / neige) + graphiques SVG + synthèse
 * ========================================================================= */
(function () {
    'use strict';

    var BASE = 'output/arome/maps';
    var COMMUNES_API = 'https://geo.api.gouv.fr/communes';
    var NAN_I16 = -32768;

    var DIRECTIONS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];

    var CONDITIONS = {
        0: { label: 'Indéterminé', icon: '•' },
        1: { label: 'Dégagé', icon: '☀️' },
        2: { label: 'Peu nuageux', icon: '🌤️' },
        3: { label: 'Nuageux', icon: '⛅' },
        4: { label: 'Couvert', icon: '☁️' },
        5: { label: 'Pluie', icon: '🌦️' },
        6: { label: 'Forte pluie', icon: '🌧️' },
        7: { label: 'Neige', icon: '❄️' },
        8: { label: 'Brouillard', icon: '🌫️' },
        9: { label: 'Très venteux', icon: '💨' }
    };
    var THUNDER_RISKS = {
        0: { label: 'Minimal', icon: '⚪' },
        1: { label: 'Faible', icon: '🟢' },
        2: { label: 'Modéré', icon: '🟡' },
        3: { label: 'Fort', icon: '🟠' },
        4: { label: 'Sévère', icon: '🔴' }
    };
    var STORM_TYPES = {
        0: 'Pas d’orage organisé', 1: 'Cellules isolées', 2: 'Multicellulaire',
        3: 'Ligne / MCS', 4: 'Convection très intense'
    };
    var SNOW_RISKS = {
        0: { label: 'Aucun', icon: '⚪' }, 1: { label: 'Faible', icon: '🟢' },
        2: { label: 'Modéré', icon: '🟡' }, 3: { label: 'Fort', icon: '🟠' },
        4: { label: 'Très fort', icon: '🔴' }
    };
    var SNOW_STICK = { 0: 'Aucune', 1: 'Faible', 2: 'Possible', 3: 'Probable' };
    var SNOW_PHASE = { 0: '—', 1: 'Pluie', 2: 'Pluie/neige', 3: 'Neige' };
    var HAZARD_RISKS = { 0: 'Faible', 1: 'Faible', 2: 'Modéré', 3: 'Fort' };

    var $ = function (id) { return document.getElementById(id); };
    var el = function (tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
    };

    function finite(v) { return typeof v === 'number' && Number.isFinite(v); }
    function fmt(v, d, suffix) {
        if (!finite(v)) return '—';
        return v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }) + (suffix || '');
    }
    function windDirection(deg) {
        if (!finite(deg)) return '';
        return DIRECTIONS[Math.round(deg / 22.5) % 16];
    }
    function tempClass(v) {
        if (!finite(v)) return '';
        if (v >= 30) return 'temp-hot';
        if (v >= 22) return 'temp-warm';
        if (v >= 12) return 'temp-mild';
        if (v >= 4) return 'temp-cool';
        return 'temp-cold';
    }
    function roundUp5(v) { return finite(v) ? Math.ceil(Math.max(0, Number(v)) / 5) * 5 : null; }
    function localDayKey(d) {
        var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return k;
    }
    function weekdayToken(d) { return ['dim','lun','mar','mer','jeu','ven','sam'][d.getDay()]; }
    function dayLabel(d) {
        var wd = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][d.getDay()];
        return wd + ' ' + d.getDate() + '/' + String(d.getMonth() + 1).padStart(2, '0');
    }
    function hourLabel(d) { return String(d.getHours()).padStart(2, '0') + 'h'; }

    /* ── État global ─────────────────────────────────────────────────── */
    var state = {
        index: null,           // index.json
        deptCache: {},         // code dépt → {header, data}
        communes: [],          // communes du département courant
        colIndex: {},          // nom colonne → index
        colScale: [], colOffset: [],
        leads: [],             // heures d'échéance
        runTime: null,
        pointIdx: -1,          // index de la commune dans le fichier dépt
        city: null,
        debounce: null,
        searchCtrl: null
    };

    var ui = {
        input: $('mcp-input'), results: $('mcp-results'), locate: $('mcp-locate'),
        meta: $('mcp-meta'), run: $('mcp-run'), generated: $('mcp-generated'),
        error: $('mcp-error'), loading: $('mcp-loading'), main: $('mcp-main'),
        city: $('mcp-city'), cityMeta: $('mcp-city-meta'),
        summary: $('mcp-summary'), charts: $('mcp-charts'),
        tblGeneral: $('tbl-general'), tblStorms: $('tbl-storms'), tblSnow: $('tbl-snow')
    };

    /* ── Helpers réseau ───────────────────────────────────────────────── */
    function fetchJson(url, opts) {
        return fetch(url, opts).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }
    function showError(msg) {
        ui.error.textContent = msg;
        ui.error.style.display = 'block';
    }
    function clearError() { ui.error.style.display = 'none'; }
    function setLoading(on) {
        ui.loading.style.display = on ? 'block' : 'none';
        ui.main.style.display = on ? 'none' : 'block';
        if (!on) clearError();
    }

    /* ── Chargement de l'index ────────────────────────────────────────── */
    function loadIndex() {
        return fetchJson(BASE + '/communes/index.json', { cache: 'no-cache' })
            .then(function (payload) {
                if (!payload || payload.format !== 'MCV2' || !payload.departments) {
                    throw new Error('Index des communes invalide (format MCV2 requis)');
                }
                state.index = payload;
                state.runTime = payload.run_time;
                state.leads = payload.leads || [];
                ui.run.textContent = new Date(payload.run_time).toLocaleString('fr-FR', {
                    timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }).replace(',', ' à') + ' (run ' + (payload.run_time || '').slice(11, 16) + 'Z)';
                ui.generated.textContent = 'maj ' + new Date(payload.generated_at).toLocaleString('fr-FR', {
                    timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                });
                ui.meta.style.display = 'flex';
                return payload;
            });
    }

    /* ── Décompression + décodage binaire MCV2 ────────────────────────── */
    function gunzip(buf) {
        if (typeof DecompressionStream !== 'undefined') {
            return new Response(new Blob([buf]).stream()
                .pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
        }
        // Fallback : pas de DecompressionStream → on charge sans compression
        return Promise.resolve(buf);
    }

    function loadDepartment(dept) {
        if (state.deptCache[dept]) return Promise.resolve(state.deptCache[dept]);
        var url = BASE + '/communes/' + dept + '.bin.gz';
        return fetch(url, { cache: 'default' })
            .then(function (r) {
                if (!r.ok) throw new Error('Fichier département ' + dept + ' indisponible');
                return r.arrayBuffer();
            })
            .then(gunzip)
            .then(function (buf) { return decodeMCV2(buf); })
            .then(function (decoded) {
                state.deptCache[dept] = decoded;
                return decoded;
            });
    }

    function decodeMCV2(buf) {
        var dv = new DataView(buf);
        var magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (magic !== 'MCV2') throw new Error('Format binaire inconnu : ' + magic);
        var n = dv.getUint16(4, true);
        var nleads = dv.getUint16(6, true);
        var ncols = dv.getUint16(8, true);
        var run = '';
        for (var i = 0; i < 40; i++) {
            var c = dv.getUint8(10 + i);
            if (c === 0) break;
            run += String.fromCharCode(c);
        }
        var off = 50;
        var communes = [];
        for (var k = 0; k < n; k++) {
            var code = '';
            for (var j = 0; j < 5; j++) {
                var cc = dv.getUint8(off + j);
                if (cc === 0) break;
                code += String.fromCharCode(cc);
            }
            off += 5;
            var nl = dv.getUint8(off); off += 1;
            var nom = '';
            for (var j2 = 0; j2 < nl; j2++) nom += String.fromCharCode(dv.getUint8(off + j2));
            off += nl;
            var lat = dv.getFloat32(off, true); off += 4;
            var lon = dv.getFloat32(off, true); off += 4;
            var pop = dv.getUint32(off, true); off += 4;
            communes.push({ code: code, nom: nom, lat: lat, lon: lon, pop: pop });
        }
        var colScale = [], colOffset = [], colNames = [];
        for (var j3 = 0; j3 < ncols; j3++) {
            var cname = '';
            for (var j4 = 0; j4 < 16; j4++) {
                var cc2 = dv.getUint8(off + j4);
                if (cc2 === 0) break;
                cname += String.fromCharCode(cc2);
            }
            off += 16;
            colScale.push(dv.getFloat32(off, true)); off += 4;
            colOffset.push(dv.getFloat32(off, true)); off += 4;
            colNames.push(cname);
        }
        var leads = [];
        for (var j5 = 0; j5 < nleads; j5++) { leads.push(dv.getUint16(off, true)); off += 2; }
        // Alignement 2 octets (padding ajouté côté pipeline)
        if (off % 2 !== 0) off += 1;

        var colIndex = {};
        colNames.forEach(function (nm, idx) { colIndex[nm] = idx; });

        // Données : [commune][lead][col] int16
        var data = new Int16Array(buf, off, n * nleads * ncols);
        var shape = { n: n, nleads: nleads, ncols: ncols };

        return { communes: communes, leads: leads, colIndex: colIndex,
                 colScale: colScale, colOffset: colOffset, data: data, shape: shape, run: run };
    }

    function getValue(deptData, pointIdx, leadPos, colName) {
        var ci = deptData.colIndex[colName];
        if (ci === undefined) return null;
        var q = deptData.data[pointIdx * deptData.shape.nleads * deptData.shape.ncols
                             + leadPos * deptData.shape.ncols + ci];
        if (q === NAN_I16) return null;
        return q * deptData.colScale[ci] - deptData.colOffset[ci];
    }

    /* ── Recherche de communes ────────────────────────────────────────── */
    function displayResults(candidates) {
        ui.results.replaceChildren();
        if (!candidates.length) { ui.results.classList.remove('open'); return; }
        candidates.forEach(function (cand) {
            var btn = el('button', 'mcp-result');
            btn.type = 'button';
            var left = el('span');
            left.appendChild(el('span', 'r-name', cand.nom));
            left.appendChild(el('span', 'r-detail', ' ' + (cand.codesPostaux || []).join(', ') +
                ' • dépt ' + cand.codeDepartement + (cand.population ? ' • ' + Number(cand.population).toLocaleString('fr-FR') + ' hab.' : '')));
            left.style.display = 'flex';
            left.style.flexDirection = 'column';
            btn.appendChild(left);
            btn.appendChild(el('span', 'r-detail', '📍'));
            btn.addEventListener('click', function () { selectCommune(cand); });
            ui.results.appendChild(btn);
        });
        ui.results.classList.add('open');
    }

    function searchCommunes(query) {
        if (state.searchCtrl) state.searchCtrl.abort();
        state.searchCtrl = new AbortController();
        var params = new URLSearchParams({
            fields: 'nom,code,codesPostaux,codeDepartement,population',
            format: 'json', boost: 'population', limit: '10'
        });
        if (/^\d{5}$/.test(query)) params.set('codePostal', query);
        else params.set('nom', query);
        fetchJson(COMMUNES_API + '?' + params.toString(), { signal: state.searchCtrl.signal })
            .then(function (payload) { displayResults(Array.isArray(payload) ? payload : []); })
            .catch(function (err) { if (err.name !== 'AbortError') displayResults([]); });
    }

    /* ── Sélection d'une commune → chargement + rendu ─────────────────── */
    function selectCommune(cand) {
        ui.results.classList.remove('open');
        ui.input.value = cand.nom;
        state.city = cand;
        var dept = String(cand.codeDepartement || '').toUpperCase();
        if (!state.index || !state.index.departments[dept]) {
            showError('Ce département n’est pas couvert par les données AROME (métropole uniquement).');
            return;
        }
        setLoading(true);
        showError('');
        loadDepartment(dept)
            .then(function (deptData) {
                var idx = -1;
                for (var i = 0; i < deptData.communes.length; i++) {
                    if (deptData.communes[i].code === String(cand.code).padStart(5, '0') ||
                        deptData.communes[i].code === String(cand.code)) { idx = i; break; }
                }
                if (idx < 0) throw new Error('Commune absente du catalogue AROME : ' + cand.nom);
                state.pointIdx = idx;
                state.dept = deptData;
                renderForecast(deptData, idx, cand);
            })
            .catch(function (err) {
                setLoading(false);
                showError('Prévisions indisponibles : ' + err.message);
            });
    }

    /* ── Rendu ────────────────────────────────────────────────────────── */
    function valueAt(leadPos, colName) {
        return getValue(state.dept, state.pointIdx, leadPos, colName);
    }

    function makeDayCell(d, count) {
        var td = el('td', 'mcp-day-cell');
        td.colSpan = 1;
        td.textContent = dayLabel(d) + (count > 1 ? ' (' + count + ')' : '');
        return td;
    }

    function renderForecast(deptData, idx, cand) {
        var nleads = deptData.shape.nleads;
        var forecasts = [];
        var now = Date.now() - 3600000;
        for (var lp = 0; lp < nleads; lp++) {
            var lh = deptData.leads[lp];
            var valid = new Date(new Date(state.runTime).getTime() + lh * 3600000);
            if (valid.getTime() < now) continue;
            forecasts.push({ lp: lp, lh: lh, valid: valid });
        }

        var runDate = new Date(state.runTime);
        var tz = 'Europe/Paris';
        var hourFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        var dayFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: '2-digit', month: '2-digit' });

        // Titre
        var postal = (cand.codesPostaux && cand.codesPostaux.length) ? cand.codesPostaux[0] : '';
        ui.city.replaceChildren();
        ui.city.appendChild(el('span', null, cand.nom));
        if (postal) ui.city.appendChild(el('span', 'postal', postal));
        var alt = valueAt(0, 'altitude_m');
        ui.cityMeta.textContent = 'Altitude ≈ ' + (finite(alt) ? Math.round(alt) + ' m' : '—') +
            ' • Département ' + cand.codeDepartement +
            ' • Interpolation bilinéaire sur la grille AROME 0,01° (≈1,3 km) • ' + forecasts.length + ' échéances';

        // Synthèse
        renderSummary(forecasts);

        // Graphiques
        renderCharts(forecasts, cand);

        // Tableaux
        renderGeneralTable(forecasts, hourFmt, dayFmt);
        renderStormsTable(forecasts, hourFmt, dayFmt);
        renderSnowTable(forecasts, hourFmt, dayFmt);

        setLoading(false);
    }

    /* ── Synthèse (cartes de risques) ─────────────────────────────────── */
    function renderSummary(forecasts) {
        var maxThunder = 0, maxSnow = 0, maxGust = 0, rainTotal = 0, tMin = null, tMax = null;
        forecasts.forEach(function (f) {
            var th = valueAt(f.lp, 'thunder_risk_code');
            if (finite(th)) maxThunder = Math.max(maxThunder, Number(th));
            var sn = valueAt(f.lp, 'snow_risk_code');
            if (finite(sn)) maxSnow = Math.max(maxSnow, Number(sn));
            var g = valueAt(f.lp, 'wind_gust_max_kmh');
            if (finite(g)) maxGust = Math.max(maxGust, Number(g));
            var r = valueAt(f.lp, 'precipitation_mm');
            if (finite(r)) rainTotal += Math.max(0, Number(r));
            var t = valueAt(f.lp, 'temperature_c');
            if (finite(t)) { tMin = tMin === null ? Number(t) : Math.min(tMin, Number(t)); tMax = tMax === null ? Number(t) : Math.max(tMax, Number(t)); }
        });
        var cards = [
            { label: 'Risque orage max', html: riskPill(maxThunder, THUNDER_RISKS), sub: 'MUCAPE + réflectivité + cisaillement AROME' },
            { label: 'Risque neige max', html: riskPill(maxSnow, SNOW_RISKS), sub: 'Neige fraîche + température AROME' },
            { label: 'Rafale max échéance', value: fmt(maxGust || null, 0, ' km/h'), sub: 'Maximum cumulé depuis le début du run', cls: maxGust >= 100 ? 'risk-4' : (maxGust >= 70 ? 'risk-3' : 'risk-0') },
            { label: 'Températures', value: (tMin !== null ? Math.round(tMin) : '—') + '° / ' + (tMax !== null ? Math.round(tMax) : '—') + '°', sub: 'Min / Max sur la période' },
            { label: 'Pluie cumulée', value: fmt(rainTotal || null, 1, ' mm'), sub: 'Somme horaire sur la période' }
        ];
        ui.summary.replaceChildren();
        cards.forEach(function (c) {
            var card = el('div', 'mcp-sum-card');
            card.appendChild(el('div', 's-label', c.label));
            var val = el('div', 's-value' + (c.cls ? ' ' + c.cls : ''));
            if (c.html) val.appendChild(c.html);
            else val.appendChild(el('span', null, c.value));
            card.appendChild(val);
            card.appendChild(el('div', 's-sub', c.sub));
            ui.summary.appendChild(card);
        });
    }

    function riskPill(code, table) {
        var r = table[Number(code)] || table[0];
        var pill = el('span', 'risk-pill risk-' + Number(code));
        pill.appendChild(el('span', null, r.icon + ' ' + r.label));
        return pill;
    }

    /* ── Graphiques SVG ───────────────────────────────────────────────── */
    function renderCharts(forecasts, cand) {
        var temp = [], press = [], rain = [], cumul = 0, wind = [], gust = [];
        forecasts.forEach(function (f) {
            temp.push(valueAt(f.lp, 'temperature_c'));
            press.push(valueAt(f.lp, 'pressure_hpa'));
            var r = valueAt(f.lp, 'precipitation_mm');
            rain.push(finite(r) ? Math.max(0, Number(r)) : null);
            cumul += finite(r) ? Math.max(0, Number(r)) : 0;
            wind.push(roundUp5(valueAt(f.lp, 'wind_speed_kmh')));
            gust.push(roundUp5(valueAt(f.lp, 'wind_gust_kmh')));
        });
        var labels = forecasts.map(function (f) { return hourLabel(f.valid); });

        ui.charts.replaceChildren();
        ui.charts.appendChild(chartCard('🌡️ Température (°C)', lineChart(labels, temp, { unit: '°C', color: '#ffb84d' })));
        ui.charts.appendChild(chartCard('🧭 Pression niveau mer (hPa)', lineChart(labels, press, { unit: 'hPa', color: '#35c7ff' })));
        ui.charts.appendChild(chartCard('🌧️ Pluie horaire (mm)', barsChart(labels, rain, { color: '#3f9dff' })));
        ui.charts.appendChild(chartCard('💨 Vent moyen / rafales (km/h)', twoLinesChart(labels, wind, gust, { c1: '#2dd4a7', c2: '#ff5d5d' })));
    }

    function chartCard(title, svg) {
        var card = el('div', 'mcp-chart-card');
        card.appendChild(el('h3', null, title));
        card.appendChild(svg);
        return card;
    }

    function svgNS() { return 'http://www.w3.org/2000/svg'; }
    function makeSvg(w, h) {
        var s = document.createElementNS(svgNS(), 'svg');
        s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        s.setAttribute('preserveAspectRatio', 'none');
        return s;
    }
    function polyPoints(values, w, h, pad, min, max) {
        var pts = '';
        var span = (max - min) || 1;
        values.forEach(function (v, i) {
            var x = pad + (i / (values.length - 1 || 1)) * (w - 2 * pad);
            var y = h - pad - ((finite(v) ? v : min) - min) / span * (h - 2 * pad);
            pts += x.toFixed(1) + ',' + y.toFixed(1) + ' ';
        });
        return pts;
    }

    function lineChart(labels, values, opt) {
        var w = 600, h = 160, pad = 8;
        var fin = values.filter(finite);
        var min = fin.length ? Math.min.apply(null, fin) : 0;
        var max = fin.length ? Math.max.apply(null, fin) : 1;
        if (opt.unit === '°C') { min = Math.floor(min / 5) * 5; max = Math.ceil(max / 5) * 5; }
        if (max - min < 4) max = min + 4;
        var svg = makeSvg(w, h);
        var pts = polyPoints(values, w, h, pad, min, max);
        if (values.length > 1) {
            var poly = document.createElementNS(svgNS(), 'polygon');
            poly.setAttribute('points', pad + ',' + (h - pad) + ' ' + pts + ' ' + (w - pad) + ',' + (h - pad));
            poly.setAttribute('fill', opt.color);
            poly.setAttribute('opacity', '0.12');
            svg.appendChild(poly);
            var line = document.createElementNS(svgNS(), 'polyline');
            line.setAttribute('points', pts);
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', opt.color);
            line.setAttribute('stroke-width', '2.5');
            line.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(line);
        }
        return svg;
    }

    function barsChart(labels, values, opt) {
        var w = 600, h = 160, pad = 8;
        var max = Math.max.apply(null, values.map(function (v) { return finite(v) ? v : 0; }));
        if (max <= 0) max = 1;
        var svg = makeSvg(w, h);
        var n = values.length;
        var bw = (w - 2 * pad) / n;
        values.forEach(function (v, i) {
            var bh = finite(v) ? (v / max) * (h - 2 * pad) : 0;
            var x = pad + i * bw + bw * 0.25;
            var rect = document.createElementNS(svgNS(), 'rect');
            rect.setAttribute('x', x.toFixed(1));
            rect.setAttribute('y', (h - pad - bh).toFixed(1));
            rect.setAttribute('width', (bw * 0.5).toFixed(1));
            rect.setAttribute('height', bh.toFixed(1));
            rect.setAttribute('fill', opt.color);
            rect.setAttribute('rx', '2');
            rect.setAttribute('opacity', finite(v) && v > 0 ? '0.85' : '0.15');
            svg.appendChild(rect);
        });
        return svg;
    }

    function twoLinesChart(labels, a, b, opt) {
        var w = 600, h = 160, pad = 8;
        var fin = a.concat(b).filter(finite);
        var max = fin.length ? Math.ceil(Math.max.apply(null, fin) / 10) * 10 : 20;
        var min = 0;
        var svg = makeSvg(w, h);
        [['#2dd4a7', a], ['#ff5d5d', b]].forEach(function (pair) {
            var pts = polyPoints(pair[1], w, h, pad, min, max);
            if (pair[1].length > 1) {
                var line = document.createElementNS(svgNS(), 'polyline');
                line.setAttribute('points', pts);
                line.setAttribute('fill', 'none');
                line.setAttribute('stroke', pair[0]);
                line.setAttribute('stroke-width', '2');
                line.setAttribute('opacity', '0.9');
                svg.appendChild(line);
            }
        });
        return svg;
    }

    /* ── Tableau général ──────────────────────────────────────────────── */
    function renderGeneralTable(forecasts, hourFmt, dayFmt) {
        var head = ['Jour', 'Heure', 'Temps', 'Temp.', 'Ressenti', 'Rosée', 'Humidité', 'Pluie 1h', 'Nuages',
                    'Vent', 'Rafales', 'Pression'];
        var thead = ui.tblGeneral.tHead || ui.tblGeneral.createTHead();
        var tr = thead.insertRow();
        head.forEach(function (h) { tr.appendChild(el('th', null, h)); });
        var tbody = ui.tblGeneral.createTBody();
        tbody.replaceChildren();
        var dayCounts = {};
        forecasts.forEach(function (f) {
            var k = localDayKey(f.valid);
            dayCounts[k] = (dayCounts[k] || 0) + 1;
        });
        var prevDay = '';
        forecasts.forEach(function (f) {
            var row = tbody.insertRow();
            var k = localDayKey(f.valid);
            if (k !== prevDay) { row.classList.add('mcp-new-day'); prevDay = k; }
            row.appendChild(el('td', 'mcp-day-cell', dayLabel(f.valid) + (dayCounts[k] > 1 ? ' · ' + dayCounts[k] : '')));
            row.appendChild(el('td', 'mcp-hour', hourFmt.format(f.valid)));

            var condCode = valueAt(f.lp, 'condition_code');
            var cond = CONDITIONS[Number(condCode)] || CONDITIONS[0];
            var tdCond = el('td', 'mcp-condition');
            tdCond.title = cond.label;
            tdCond.textContent = cond.icon + ' ' + cond.label;
            row.appendChild(tdCond);

            var t = valueAt(f.lp, 'temperature_c');
            var tdT = el('td', 'tempClass' in {} ? 'temp-' + tempClass(t) : '');
            tdT.textContent = fmt(t, 0, '°');
            tdT.className = tempClass(t);
            row.appendChild(tdT);

            appendNum(row, valueAt(f.lp, 'wind_chill_c'), 0, '°');
            appendNum(row, valueAt(f.lp, 'dewpoint_c'), 1, '°');
            appendNum(row, valueAt(f.lp, 'humidity_pct'), 0, '%');
            var r = valueAt(f.lp, 'precipitation_mm');
            appendNum(row, r, 1, ' mm', finite(r) && r >= 5 ? 'num-strong' : '');
            appendNum(row, valueAt(f.lp, 'cloud_cover_pct'), 0, '%');

            var w = roundUp5(valueAt(f.lp, 'wind_speed_kmh'));
            var tdW = el('td');
            var dirDeg = valueAt(f.lp, 'wind_direction_deg');
            var dir = windDirection(dirDeg);
            if (dir) {
                tdW.appendChild(el('span', 'wind-arrow', '➜'));
                tdW.lastChild.style.display = 'inline-block';
                tdW.lastChild.style.transform = 'rotate(' + ((Number(dirDeg) + 180) % 360) + 'deg)';
                tdW.appendChild(el('span', null, ' ' + dir + ' '));
            }
            tdW.appendChild(el('strong', null, fmt(w, 0, '')));
            tdW.appendChild(el('span', 'muted', ' km/h'));
            row.appendChild(tdW);

            var g = roundUp5(valueAt(f.lp, 'wind_gust_kmh'));
            var tdG = el('td', finite(g) && g >= 80 ? 'num-strong' : '');
            tdG.textContent = fmt(g, 0, ' km/h');
            row.appendChild(tdG);

            appendNum(row, valueAt(f.lp, 'pressure_hpa'), 0, ' hPa');
        });
    }

    function appendNum(row, v, d, suffix, cls) {
        var td = el('td', cls || '');
        td.textContent = fmt(v, d, suffix);
        row.appendChild(td);
    }

    /* ── Tableau orages ───────────────────────────────────────────────── */
    function renderStormsTable(forecasts, hourFmt, dayFmt) {
        var head = ['Jour', 'Heure', 'Risque orage', 'CAPE', 'LCL', 'Foudre', 'Grêle', 'Pluie conv.',
                    'Graupel', 'Pluie 1h', 'Rafales', 'Type d’orage'];
        var thead = ui.tblStorms.tHead || ui.tblStorms.createTHead();
        thead.replaceChildren();
        var tr = thead.insertRow();
        head.forEach(function (h) { tr.appendChild(el('th', null, h)); });
        var tbody = ui.tblStorms.createTBody();
        tbody.replaceChildren();
        var dayCounts = {};
        forecasts.forEach(function (f) {
            var k = localDayKey(f.valid);
            dayCounts[k] = (dayCounts[k] || 0) + 1;
        });
        var prevDay = '';
        forecasts.forEach(function (f) {
            var row = tbody.insertRow();
            var k = localDayKey(f.valid);
            if (k !== prevDay) { row.classList.add('mcp-new-day'); prevDay = k; }
            row.appendChild(el('td', 'mcp-day-cell', dayLabel(f.valid) + (dayCounts[k] > 1 ? ' · ' + dayCounts[k] : '')));
            row.appendChild(el('td', 'mcp-hour', hourFmt.format(f.valid)));

            var th = valueAt(f.lp, 'thunder_risk_code');
            var tdTh = el('td');
            tdTh.appendChild(riskPill(finite(th) ? th : 0, THUNDER_RISKS));
            row.appendChild(tdTh);

            var cape = valueAt(f.lp, 'cape_jkg');
            var tdCape = el('td', finite(cape) && cape >= 1500 ? 'num-strong' : (finite(cape) && cape >= 500 ? 'temp-warm' : ''));
            tdCape.textContent = finite(cape) && cape >= 25 ? fmt(cape, 0, ' J/kg') : '—';
            tdCape.title = 'MUCAPE instantanée AROME';
            row.appendChild(tdCape);

            appendNum(row, valueAt(f.lp, 'lcl_m'), 0, ' m');
            var lig = valueAt(f.lp, 'lightning_score');
            appendNum(row, lig, 0, '/100', finite(lig) && lig >= 60 ? 'num-strong' : '');
            appendHazard(row, valueAt(f.lp, 'hail_risk_code'));
            appendNum(row, valueAt(f.lp, 'convective_precipitation_mm'), 1, ' mm');
            appendNum(row, valueAt(f.lp, 'graupel_mm'), 2, ' mm');
            var r = valueAt(f.lp, 'precipitation_mm');
            appendNum(row, r, 1, ' mm', finite(r) && r >= 5 ? 'num-strong' : '');
            var g = roundUp5(valueAt(f.lp, 'wind_gust_kmh'));
            appendNum(row, g, 0, ' km/h', finite(g) && g >= 80 ? 'num-strong' : '');

            var st = valueAt(f.lp, 'storm_type_code');
            row.appendChild(el('td', null, finite(st) ? (STORM_TYPES[Number(st)] || '—') : '—'));
        });
    }

    function appendHazard(row, code) {
        var td = el('td', finite(code) ? 'risk-pill risk-' + Number(code) : '');
        td.style.padding = '2px 8px';
        td.style.fontSize = '11px';
        td.textContent = finite(code) ? (HAZARD_RISKS[Number(code)] || '—') : '—';
        row.appendChild(td);
    }

    /* ── Tableau neige ────────────────────────────────────────────────── */
    function renderSnowTable(forecasts, hourFmt, dayFmt) {
        var head = ['Jour', 'Heure', 'Risque neige', 'Phase', 'Neige 1h', 'Neige 3h', 'Neige 6h',
                    'Tenue', 'Cumul fraîche', 'Pression', 'Humidité', 'Vent moyen / rafales'];
        var thead = ui.tblSnow.tHead || ui.tblSnow.createTHead();
        thead.replaceChildren();
        var tr = thead.insertRow();
        head.forEach(function (h) { tr.appendChild(el('th', null, h)); });
        var tbody = ui.tblSnow.createTBody();
        tbody.replaceChildren();
        var dayCounts = {};
        forecasts.forEach(function (f) {
            var k = localDayKey(f.valid);
            dayCounts[k] = (dayCounts[k] || 0) + 1;
        });
        var prevDay = '';
        forecasts.forEach(function (f, idx) {
            var row = tbody.insertRow();
            var k = localDayKey(f.valid);
            if (k !== prevDay) { row.classList.add('mcp-new-day'); prevDay = k; }
            row.appendChild(el('td', 'mcp-day-cell', dayLabel(f.valid) + (dayCounts[k] > 1 ? ' · ' + dayCounts[k] : '')));
            row.appendChild(el('td', 'mcp-hour', hourFmt.format(f.valid)));

            var sn = valueAt(f.lp, 'snow_risk_code');
            var tdSn = el('td');
            tdSn.appendChild(riskPill(finite(sn) ? sn : 0, SNOW_RISKS));
            row.appendChild(tdSn);

            var ph = valueAt(f.lp, 'snow_phase_code');
            row.appendChild(el('td', null, finite(ph) ? (SNOW_PHASE[Number(ph)] || '—') : '—'));

            appendNum(row, valueAt(f.lp, 'snow_fresh_cm'), 1, ' cm');
            appendNum(row, snowSum(idx, 3), 1, ' cm');
            appendNum(row, snowSum(idx, 6), 1, ' cm');

            var stick = valueAt(f.lp, 'snow_stick_risk_code');
            var tdStick = el('td', finite(stick) ? 'risk-pill risk-' + Number(stick) : '');
            tdStick.style.padding = '2px 8px';
            tdStick.style.fontSize = '11px';
            tdStick.textContent = finite(stick) ? (SNOW_STICK[Number(stick)] || '—') : '—';
            row.appendChild(tdStick);

            appendNum(row, valueAt(f.lp, 'snow_depth_cm'), 1, ' cm');
            appendNum(row, valueAt(f.lp, 'pressure_hpa'), 0, ' hPa');
            appendNum(row, valueAt(f.lp, 'humidity_pct'), 0, '%');

            var w = roundUp5(valueAt(f.lp, 'wind_speed_kmh'));
            var g = roundUp5(valueAt(f.lp, 'wind_gust_kmh'));
            var tdW = el('td');
            tdW.textContent = fmt(w, 0, '') + ' / ' + fmt(g, 0, '') + ' km/h';
            row.appendChild(tdW);
        });

        function snowSum(startIdx, windowHours) {
            var total = 0, found = false;
            for (var off = 0; off < windowHours && startIdx + off < forecasts.length; off++) {
                var v = valueAt(forecasts[startIdx + off].lp, 'snow_fresh_cm');
                if (finite(v)) { total += Number(v); found = true; }
            }
            return found ? total : null;
        }
    }

    /* ── Géolocalisation ──────────────────────────────────────────────── */
    function detectCurrentCommune() {
        if (!navigator.geolocation) { showError('La géolocalisation n’est pas disponible.'); return; }
        ui.locate.disabled = true;
        ui.locate.classList.add('is-loading');
        ui.locate.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Localisation…';
        navigator.geolocation.getCurrentPosition(function (pos) {
            var params = new URLSearchParams({
                lat: String(pos.coords.latitude), lon: String(pos.coords.longitude),
                fields: 'nom,code,codesPostaux,codeDepartement,population', format: 'json'
            });
            fetchJson(COMMUNES_API + '?' + params.toString(), { cache: 'default' })
                .then(function (payload) {
                    var candidates = Array.isArray(payload) ? payload : (payload ? [payload] : []);
                    var cand = candidates.find(function (c) {
                        return state.index && state.index.departments[String(c.codeDepartement).toUpperCase()];
                    });
                    if (!cand) throw new Error('position hors couverture AROME');
                    selectCommune(cand);
                })
                .catch(function (err) { showError('Impossible de détecter votre commune : ' + err.message); })
                .finally(function () {
                    ui.locate.disabled = false;
                    ui.locate.classList.remove('is-loading');
                    ui.locate.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Me localiser';
                });
        }, function () {
            showError('Localisation refusée ou indisponible.');
            ui.locate.disabled = false;
            ui.locate.classList.remove('is-loading');
            ui.locate.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Me localiser';
        }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
    }

    /* ── Onglets ──────────────────────────────────────────────────────── */
    function bindTabs() {
        document.querySelectorAll('.mcp-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.mcp-tab').forEach(function (t) { t.classList.remove('active'); });
                document.querySelectorAll('.mcp-panel').forEach(function (p) { p.classList.remove('active'); });
                tab.classList.add('active');
                $('panel-' + tab.dataset.panel).classList.add('active');
            });
        });
    }

    /* ── Init ─────────────────────────────────────────────────────────── */
    function init() {
        bindTabs();
        ui.locate.addEventListener('click', detectCurrentCommune);
        ui.input.addEventListener('input', function () {
            window.clearTimeout(state.debounce);
            var q = ui.input.value.trim();
            if (q.length < 2) { ui.results.classList.remove('open'); return; }
            if (/^\d+$/.test(q) && q.length < 5) { ui.results.classList.remove('open'); return; }
            state.debounce = window.setTimeout(function () { searchCommunes(q); }, 280);
        });
        ui.input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') ui.results.classList.remove('open');
        });
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.mcp-search-wrap')) ui.results.classList.remove('open');
        });

        setLoading(true);
        loadIndex()
            .then(function () {
                // Commune par défaut ou via URL ?commune=
                var params = new URLSearchParams(location.search);
                var code = params.get('commune');
                if (code) {
                    var dept = String(code).slice(0, 2).toUpperCase();
                    return loadDepartment(dept).then(function (deptData) {
                        var idx = -1;
                        for (var i = 0; i < deptData.communes.length; i++) {
                            if (deptData.communes[i].code === String(code).padStart(5, '0') ||
                                deptData.communes[i].code === String(code)) { idx = i; break; }
                        }
                        if (idx < 0) throw new Error('Commune ' + code + ' introuvable');
                        var c = deptData.communes[idx];
                        state.city = { nom: c.nom, code: c.code, codesPostaux: [], codeDepartement: dept, population: c.pop };
                        state.pointIdx = idx;
                        state.dept = deptData;
                        ui.input.value = c.nom;
                        renderForecast(deptData, idx, { nom: c.nom, codesPostaux: [], codeDepartement: dept, population: c.pop });
                    });
                }
                // Commune par défaut : Paris
                return loadDepartment('75').then(function (deptData) {
                    var idx = 0;
                    for (var i = 0; i < deptData.communes.length; i++) {
                        if (deptData.communes[i].code === '75056') { idx = i; break; }
                    }
                    var c = deptData.communes[idx];
                    state.city = { nom: c.nom, code: c.code, codesPostaux: [], codeDepartement: '75', population: c.pop };
                    state.pointIdx = idx;
                    state.dept = deptData;
                    ui.input.value = c.nom;
                    renderForecast(deptData, idx, { nom: c.nom, codesPostaux: [], codeDepartement: '75', population: c.pop });
                });
            })
            .catch(function (err) {
                setLoading(false);
                showError('Données indisponibles : ' + err.message +
                    '. Les prévisions par commune seront actives après le prochain run AROME (pipeline v2).');
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
