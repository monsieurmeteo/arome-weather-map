/* =========================================================================
 * Météo-Climat Pro — Prévisions AROME HD par commune (refonte UI v2)
 * -------------------------------------------------------------------------
 *  LOGIQUE DE DONNÉES CONSERVÉE À L'IDENTIQUE :
 *   - Recherche geo.api.gouv.fr, décodage binaire MCV2, interpolations,
 *     calculs météo, seuils orage/neige, échéances : AUCUNE MODIFICATION.
 *  REFONTE UI/UX : hero ville, cartes de synthèse premium, graphiques avec
 *   axes/tooltips/états vides, tableaux sticky, responsive complet.
 * ========================================================================= */
(function () {
    'use strict';

    /* ── Constantes (données — inchangées) ───────────────────────────── */
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

    /* ── Aide utilisateur (tooltips ⓘ) ───────────────────────────────── */
    var HELP = {
        mucape: 'MUCAPE : énergie potentielle de convection disponible. Plus la valeur est élevée, plus l’air est instable et propice aux orages.',
        reflectivite: 'Réflectivité : intensité des précipitations estimée par le modèle (en dBZ), comme un radar. Au-delà de 45 dBZ, pluie forte ou grêle possible.',
        cisaillement: 'Cisaillement : variation du vent entre le sol et 100 m. Un cisaillement fort favorise les orages organisés (lignes, supercellulaires).',
        rafale_max: 'Rafale max échéance : plus forte rafale de vent atteinte depuis le début du run jusqu’à cette échéance (maximum cumulé).',
        interpolation: 'Interpolation bilinéaire : la valeur affichée est calculée à la position exacte de la commune à partir des 4 points de grille AROME les plus proches (grille 0,01° ≈ 1,3 km).',
        arome: 'AROME 0,01° : modèle haute résolution de Météo-France, maille d’environ 1,3 km sur la France.',
        lcl: 'LCL : niveau de condensation par soulèvement. Altitude à laquelle une parcelle d’air devient saturée (base des nuages convectifs).',
        foudre: 'Score d’activité foudre estimé (0 à 100) à partir de la MUCAPE et de la réflectivité.',
        grele: 'Risque de grêle estimé à partir de la MUCAPE, de la réflectivité et du graupel.',
        cape: 'CAPE (MUCAPE) : énergie convective disponible. 0-500 J/kg : faible ; 500-1500 : modérée ; >1500 : forte.',
        tenue: 'Tenue de la neige au sol : capacité de la neige fraîche à se maintenir (dépend de la température du sol et de l’air).'
    };
    function helpIcon(key, text) {
        var span = el('span', 'help-ic', 'ⓘ');
        span.title = text || HELP[key] || '';
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', span.title);
        return span;
    }

    /* ── Helpers (inchangés) ─────────────────────────────────────────── */
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
        if (v >= 35) return 'temp-hot';
        if (v >= 30) return 'temp-hot';
        if (v >= 25) return 'temp-warm';
        if (v >= 20) return 'temp-warm';
        if (v >= 10) return 'temp-mild';
        if (v >= 0) return 'temp-cool';
        return 'temp-cold';
    }
    function roundUp5(v) { return finite(v) ? Math.ceil(Math.max(0, Number(v)) / 5) * 5 : null; }
    function localDayKey(d) {
        var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return k;
    }
    function dayLabel(d) {
        var wd = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][d.getDay()];
        return wd + ' ' + d.getDate() + '/' + String(d.getMonth() + 1).padStart(2, '0');
    }
    function shortDayLabel(d) {
        var wd = ['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'][d.getDay()];
        return wd + ' ' + d.getDate() + '/' + String(d.getMonth() + 1).padStart(2, '0');
    }
    function hourLabel(d) { return String(d.getHours()).padStart(2, '0') + 'h'; }

    /* ── État global ─────────────────────────────────────────────────── */
    var state = {
        index: null,
        deptCache: {},
        communes: [],
        colIndex: {},
        colScale: [], colOffset: [],
        leads: [],
        runTime: null,
        pointIdx: -1,
        city: null,
        debounce: null,
        searchCtrl: null
    };

    var ui = {
        input: $('mcp-input'), results: $('mcp-results'), locate: $('mcp-locate'),
        runbar: $('mcp-runbar'), run: $('mcp-run'), generated: $('mcp-generated'),
        error: $('mcp-error'), loading: $('mcp-loading'), main: $('mcp-main'),
        city: $('mcp-city'), cityMeta: $('mcp-city-meta'),
        summary: $('mcp-summary'), charts: $('mcp-charts'),
        tblDaily: $('tbl-daily'), tblGeneral: $('tbl-general'),
        tblStorms: $('tbl-storms'), tblSnow: $('tbl-snow')
    };

    /* ── Réseau + décodage (INCHANGÉ) ────────────────────────────────── */
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

    function loadIndex() {
        return fetchJson(BASE + '/communes/index.json', { cache: 'no-cache' })
            .then(function (payload) {
                if (!payload || payload.format !== 'MCV2' || !payload.departments) {
                    throw new Error('Index des communes invalide (format MCV2 requis)');
                }
                state.index = payload;
                state.runTime = payload.run_time;
                state.leads = payload.leads || [];
                var runDate = new Date(payload.run_time);
                var runStr = runDate.toLocaleString('fr-FR', {
                    timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }).replace(',', ' à');
                ui.run.textContent = 'Run du ' + runStr +
                    ' (' + (payload.run_time || '').slice(11, 16) + 'Z)';
                ui.generated.textContent = 'Mise à jour : ' +
                    new Date(payload.generated_at).toLocaleString('fr-FR', {
                        timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                    });
                ui.runbar.style.display = 'flex';
                return payload;
            });
    }

    function gunzip(buf) {
        if (typeof DecompressionStream !== 'undefined') {
            return new Response(new Blob([buf]).stream()
                .pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
        }
        return Promise.reject(new Error(
            'Votre navigateur ne supporte pas la décompression native (DecompressionStream). ' +
            'Utilisez une version récente de Chrome, Firefox, Safari ou Edge.'));
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
            for (var j4 = 0; j4 < 32; j4++) {
                var cc2 = dv.getUint8(off + j4);
                if (cc2 === 0) break;
                cname += String.fromCharCode(cc2);
            }
            off += 32;
            colScale.push(dv.getFloat32(off, true)); off += 4;
            colOffset.push(dv.getFloat32(off, true)); off += 4;
            colNames.push(cname);
        }
        var leads = [];
        for (var j5 = 0; j5 < nleads; j5++) { leads.push(dv.getUint16(off, true)); off += 2; }
        if (off % 2 !== 0) off += 1;
        var colIndex = {};
        colNames.forEach(function (nm, idx) { colIndex[nm] = idx; });
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

    function valueAt(leadPos, colName) {
        return getValue(state.dept, state.pointIdx, leadPos, colName);
    }

    /* ── Recherche (inchangée) ───────────────────────────────────────── */
    function displayResults(candidates) {
        ui.results.replaceChildren();
        if (!candidates.length) { ui.results.classList.remove('open'); return; }
        candidates.forEach(function (cand) {
            var btn = el('button', 'mcp-result');
            btn.type = 'button';
            var left = el('span');
            left.style.display = 'flex';
            left.style.flexDirection = 'column';
            left.appendChild(el('span', 'r-name', cand.nom));
            left.appendChild(el('span', 'r-detail', ' ' + (cand.codesPostaux || []).join(', ') +
                ' • dépt ' + cand.codeDepartement +
                (cand.population ? ' • ' + Number(cand.population).toLocaleString('fr-FR') + ' hab.' : '')));
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
        clearError();
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

    /* ── Rendu principal ─────────────────────────────────────────────── */
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

        var tz = 'Europe/Paris';
        var hourFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        var dayFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: '2-digit', month: '2-digit' });

        renderHero(cand, forecasts);
        renderSummary(forecasts);
        renderCharts(forecasts);
        renderDailyTable(forecasts);
        renderGeneralTable(forecasts, hourFmt, dayFmt);
        renderStormsTable(forecasts, hourFmt, dayFmt);
        renderSnowTable(forecasts, hourFmt, dayFmt);

        setLoading(false);
    }

    /* ── Hero ville ──────────────────────────────────────────────────── */
    function renderHero(cand, forecasts) {
        var postal = (cand.codesPostaux && cand.codesPostaux.length) ? cand.codesPostaux[0] : '';
        ui.city.replaceChildren();
        ui.city.appendChild(el('span', null, cand.nom));
        if (postal) ui.city.appendChild(el('span', 'postal', postal));

        var alt = valueAt(0, 'altitude_m');
        var items = [
            { icon: 'fa-solid fa-location-dot', label: '📍', text: cand.nom + (postal ? ' — ' + postal : '') + ' · Département ' + cand.codeDepartement },
            { icon: 'fa-solid fa-mountain-sun', label: 'Altitude', text: finite(alt) ? Math.round(alt) + ' m' : '—' },
            { icon: 'fa-solid fa-microchip', label: 'Modèle', text: 'AROME 0,01°' + helpIcon('arome') },
            { icon: 'fa-solid fa-border-all', label: 'Résolution', text: '≈ 1,3 km' },
            { icon: 'fa-solid fa-clock', label: 'Échéances', text: forecasts.length + ' heures' },
            { icon: 'fa-solid fa-location-crosshairs', label: 'Précision', text: 'Interpolation bilinéaire' + helpIcon('interpolation') }
        ];
        ui.cityMeta.replaceChildren();
        items.forEach(function (it) {
            var item = el('div', 'mcp-hero-item');
            var ic = el('i', it.icon);
            ic.setAttribute('aria-hidden', 'true');
            item.appendChild(ic);
            var label = el('span', null, it.label + ' : ');
            var val = el('b', null);
            if (typeof it.text === 'string') val.textContent = it.text;
            else val.appendChild(it.text);
            item.appendChild(label);
            item.appendChild(val);
            ui.cityMeta.appendChild(item);
        });
    }

    /* ── Cartes de synthèse (Aperçu de la période) ───────────────────── */
    function renderSummary(forecasts) {
        var maxThunder = 0, maxSnow = 0, maxGust = 0, rainTotal = 0, snowTotal = 0;
        var tMin = null, tMax = null, gustAt = null, rainAt = null, snowAt = null;
        forecasts.forEach(function (f) {
            var th = valueAt(f.lp, 'thunder_risk_code');
            if (finite(th)) maxThunder = Math.max(maxThunder, Number(th));
            var sn = valueAt(f.lp, 'snow_risk_code');
            if (finite(sn)) maxSnow = Math.max(maxSnow, Number(sn));
            var g = valueAt(f.lp, 'wind_gust_max_kmh');
            if (finite(g) && Number(g) > maxGust) { maxGust = Number(g); gustAt = f.valid; }
            var r = valueAt(f.lp, 'precipitation_mm');
            if (finite(r)) rainTotal += Math.max(0, Number(r));
            var sf = valueAt(f.lp, 'snow_fresh_cm');
            if (finite(sf)) snowTotal += Math.max(0, Number(sf));
            var t = valueAt(f.lp, 'temperature_c');
            if (finite(t)) { tMin = tMin === null ? Number(t) : Math.min(tMin, Number(t)); tMax = tMax === null ? Number(t) : Math.max(tMax, Number(t)); }
        });

        ui.summary.replaceChildren();

        // Carte 1 — Risque orage
        ui.summary.appendChild(summaryCard({
            icon: '⛈️', label: 'Risque orage',
            html: riskPill(maxThunder, THUNDER_RISKS),
            sub: maxThunder === 0 ? 'Aucun signal orageux significatif' :
                'Maximum sur la période — MUCAPE + réflectivité' + helpIcon('mucape')
        }));

        // Carte 2 — Risque neige
        ui.summary.appendChild(summaryCard({
            icon: '❄️', label: 'Risque neige',
            html: riskPill(maxSnow, SNOW_RISKS),
            sub: maxSnow === 0 ? 'Aucune neige attendue' : 'Maximum sur la période'
        }));

        // Carte 3 — Rafale max
        ui.summary.appendChild(summaryCard({
            icon: '💨', label: 'Rafale maximale',
            value: maxGust > 0 ? String(Math.round(maxGust)) : null,
            unit: maxGust > 0 ? 'km/h' : '',
            sub: maxGust > 0
                ? (gustAt ? 'vers ' + hourLabel(gustAt) + ' · ' : '') + 'Maximum prévu sur la période' + helpIcon('rafale_max')
                : 'Donnée indisponible',
            valueClass: maxGust >= 100 ? 'temp-hot' : (maxGust >= 70 ? 'temp-warm' : '')
        }));

        // Carte 4 — Températures
        var amplitude = (tMin !== null && tMax !== null) ? Math.round(tMax - tMin) : null;
        ui.summary.appendChild(summaryCard({
            icon: '🌡️', label: 'Température',
            value: (tMin !== null ? Math.round(tMin) : '—') + '° → ' + (tMax !== null ? Math.round(tMax) : '—') + '°',
            sub: 'Min ' + (tMin !== null ? Math.round(tMin) + '°' : '—') +
                 ' · Max ' + (tMax !== null ? Math.round(tMax) + '°' : '—') +
                 (amplitude !== null ? ' · Amplitude ' + amplitude + '°' : '')
        }));

        // Carte 5 — Pluie cumulée
        ui.summary.appendChild(summaryCard({
            icon: '🌧️', label: 'Pluie cumulée',
            value: rainTotal > 0 ? fmt(rainTotal, 1) : (forecasts.length ? '0' : null),
            unit: rainTotal >= 0 ? 'mm' : '',
            sub: rainTotal === 0 ? 'Aucune pluie prévue sur la période' : 'Cumul sur la période'
        }));

        // Carte 6 — Neige fraîche
        ui.summary.appendChild(summaryCard({
            icon: '🌨️', label: 'Neige fraîche',
            value: snowTotal > 0 ? fmt(snowTotal, 1) : (forecasts.length ? '0' : null),
            unit: snowTotal >= 0 ? 'cm' : '',
            sub: snowTotal === 0 ? 'Aucune neige prévue' : 'Cumul sur la période'
        }));
    }

    function summaryCard(opt) {
        var card = el('div', 'mcp-sum-card');
        card.appendChild(el('span', 's-icon', opt.icon));
        card.appendChild(el('div', 's-label', opt.label));
        var val = el('div', 's-value' + (opt.valueClass ? ' ' + opt.valueClass : ''));
        if (opt.html) {
            val.style.fontSize = '16px';
            val.style.display = 'flex';
            val.style.alignItems = 'center';
            val.style.marginTop = '10px';
            val.appendChild(opt.html);
        } else if (opt.value !== null && opt.value !== undefined) {
            val.appendChild(document.createTextNode(opt.value));
            if (opt.unit) val.appendChild(el('span', 's-unit', opt.unit));
        } else {
            val.textContent = 'Donnée indisponible';
            val.style.fontSize = '18px';
            val.style.color = 'var(--text-3)';
        }
        card.appendChild(val);
        if (opt.sub) {
            var sub = el('div', 's-sub');
            if (typeof opt.sub === 'string') sub.textContent = opt.sub;
            else sub.appendChild(opt.sub);
            card.appendChild(sub);
        }
        return card;
    }

    function riskPill(code, table) {
        var r = table[Number(code)] || table[0];
        var pill = el('span', 'risk-pill risk-' + Number(code));
        pill.appendChild(el('span', null, r.label));
        return pill;
    }

    /* ══════════════════════════════════════════════════════════════════
       GRAPHIQUES — moteur SVG avec axes, grille, tooltip, états vides
       ══════════════════════════════════════════════════════════════════ */
    function svgNS() { return 'http://www.w3.org/2000/svg'; }

    function renderCharts(forecasts) {
        var temp = [], feel = [], press = [], rain = [], wind = [], gust = [], gustMax = [];
        var humidity = [], dir = [], labels = [], fullLabels = [];
        forecasts.forEach(function (f) {
            temp.push(valueAt(f.lp, 'temperature_c'));
            feel.push(valueAt(f.lp, 'wind_chill_c'));
            press.push(valueAt(f.lp, 'pressure_hpa'));
            var r = valueAt(f.lp, 'precipitation_mm');
            rain.push(finite(r) ? Math.max(0, Number(r)) : null);
            wind.push(roundUp5(valueAt(f.lp, 'wind_speed_kmh')));
            gust.push(roundUp5(valueAt(f.lp, 'wind_gust_kmh')));
            gustMax.push(roundUp5(valueAt(f.lp, 'wind_gust_max_kmh')));
            humidity.push(valueAt(f.lp, 'humidity_pct'));
            dir.push(valueAt(f.lp, 'wind_direction_deg'));
            labels.push(hourLabel(f.valid));
            fullLabels.push(shortDayLabel(f.valid) + ' ' + hourLabel(f.valid));
        });

        ui.charts.replaceChildren();

        // 1 — Température (+ ressenti discret)
        ui.charts.appendChild(chartCard('temp', '🌡️', 'Température', chartLegend([
            ['#fbbf24', 'Température'], ['#818cf8', 'Ressenti']
        ]), function (wrap) {
            buildLineChart(wrap, {
                labels: labels, fullLabels: fullLabels,
                series: [
                    { label: 'Température', color: '#fbbf24', values: temp, width: 3 },
                    { label: 'Ressenti', color: '#818cf8', values: feel, width: 1.6, dashed: true }
                ],
                yUnit: '°C', yDecimals: 0, nice: true,
                tooltipRows: function (i) {
                    return [
                        ['Température', fmt(temp[i], 0, '°')],
                        ['Ressenti', fmt(feel[i], 0, '°')],
                        ['Humidité', fmt(humidity[i], 0, '%')]
                    ];
                }
            });
        }));

        // 2 — Pression (+ tendance)
        var trend = pressTrend(press);
        ui.charts.appendChild(chartCard('press', '🧭', 'Pression niveau mer' + helpIcon('arome'),
            el('span', 'mcp-chart-trend', trend), function (wrap) {
            buildLineChart(wrap, {
                labels: labels, fullLabels: fullLabels,
                series: [
                    { label: 'Pression', color: '#38bdf8', values: press, width: 2.5 }
                ],
                yUnit: 'hPa', yDecimals: 0, nice: false, padY: 2,
                tooltipRows: function (i) {
                    return [['Pression', fmt(press[i], 0, ' hPa')]];
                }
            });
        }));

        // 3 — Pluie (état vide si aucune précipitation)
        var hasRain = rain.some(function (v) { return finite(v) && v > 0; });
        var rainCard = chartCard('rain', '🌧️', 'Pluie horaire', '', function (wrap) {
            if (!hasRain) {
                var empty = el('div', 'mcp-chart-empty');
                empty.appendChild(el('div', 'e-icon', '🌤️'));
                empty.appendChild(el('div', 'e-title', 'Aucune précipitation prévue'));
                empty.appendChild(el('div', 'e-sub', '0 mm sur la période'));
                wrap.appendChild(empty);
                return;
            }
            buildBarsChart(wrap, {
                labels: labels, fullLabels: fullLabels,
                values: rain, color: '#3b82f6',
                yUnit: 'mm', yDecimals: 1,
                tooltipRows: function (i) {
                    return [['Pluie 1h', fmt(rain[i], 1, ' mm')]];
                }
            });
        });
        ui.charts.appendChild(rainCard);

        // 4 — Vent (3 courbes, pleine largeur)
        ui.charts.appendChild(chartCard('wind wide', '💨', 'Vent moyen / Rafales / Rafale max éch.' + helpIcon('rafale_max'),
            chartLegend([
                ['#34d399', 'Vent moyen'], ['#f87171', 'Rafales'], ['#fbbf24', 'Rafale max éch.']
            ]), function (wrap) {
            buildLineChart(wrap, {
                labels: labels, fullLabels: fullLabels,
                series: [
                    { label: 'Vent moyen', color: '#34d399', values: wind, width: 2 },
                    { label: 'Rafales', color: '#f87171', values: gust, width: 2 },
                    { label: 'Rafale max éch.', color: '#fbbf24', values: gustMax, width: 2.6 }
                ],
                yUnit: 'km/h', yDecimals: 0, nice: true, forceZero: true,
                tooltipRows: function (i) {
                    var d = dir[i];
                    return [
                        ['Direction', finite(d) ? (windDirection(d) || '—') + ' (' + Math.round(d) + '°)' : '—'],
                        ['Vent moyen', fmt(wind[i], 0, ' km/h')],
                        ['Rafales', fmt(gust[i], 0, ' km/h')],
                        ['Rafale max', fmt(gustMax[i], 0, ' km/h')]
                    ];
                }
            });
        }));
    }

    function chartLegend(items) {
        var leg = el('div', 'mcp-chart-legend');
        items.forEach(function (it) {
            var s = el('span');
            var sw = el('span', 'lg');
            sw.style.background = it[0];
            s.appendChild(sw);
            s.appendChild(document.createTextNode(it[1]));
            leg.appendChild(s);
        });
        return leg;
    }

    function chartCard(kind, icon, title, legendOrTrend, buildFn) {
        var card = el('div', 'mcp-chart-card' + (kind.indexOf('wide') >= 0 ? ' wide' : ''));
        var head = el('div', 'mcp-chart-head');
        var h = el('h3');
        var ic = el('i', icon);
        ic.setAttribute('aria-hidden', 'true');
        h.appendChild(ic);
        if (typeof title === 'string') h.appendChild(document.createTextNode(title));
        else h.appendChild(title);
        head.appendChild(h);
        if (legendOrTrend) head.appendChild(legendOrTrend);
        card.appendChild(head);
        var wrap = el('div', 'mcp-chart-wrap');
        card.appendChild(wrap);
        // Tooltip
        var tip = el('div', 'mcp-chart-tip');
        wrap.appendChild(tip);
        buildFn(wrap, tip);
        return card;
    }

    /* Positionne un tooltip dans sa carte */
    function positionTip(tip, wrap, evt) {
        var rect = wrap.getBoundingClientRect();
        var x = evt.clientX - rect.left;
        var y = evt.clientY - rect.top;
        var tw = tip.offsetWidth || 180;
        var th = tip.offsetHeight || 80;
        var left = x + 14;
        var top = y - th / 2;
        if (left + tw > rect.width - 6) left = x - tw - 14;
        if (top < 4) top = 4;
        if (top + th > rect.height - 4) top = rect.height - th - 4;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }

    /* Graphique en ligne générique (axes X/Y, grille, tooltip) */
    function buildLineChart(wrap, opt) {
        var tip = wrap.querySelector('.mcp-chart-tip');
        var W = 860, H = 300;
        var padL = 52, padR = 14, padT = 14, padB = 34;
        var plotW = W - padL - padR;
        var plotH = H - padT - padB;

        var allVals = [];
        opt.series.forEach(function (s) { allVals = allVals.concat(s.values.filter(finite)); });
        if (!allVals.length) {
            var empty = el('div', 'mcp-chart-empty');
            empty.appendChild(el('div', 'e-icon', '📊'));
            empty.appendChild(el('div', 'e-title', 'Donnée indisponible'));
            wrap.appendChild(empty);
            return;
        }
        var rawMin = Math.min.apply(null, allVals);
        var rawMax = Math.max.apply(null, allVals);
        var yMin = rawMin, yMax = rawMax;
        if (opt.forceZero) { yMin = Math.min(0, yMin); }
        if (opt.nice && opt.yUnit === '°C') {
            yMin = Math.floor(yMin / 5) * 5;
            yMax = Math.ceil(yMax / 5) * 5;
        } else if (opt.nice) {
            yMin = Math.floor(yMin / 10) * 10;
            yMax = Math.ceil(yMax / 10) * 10;
        }
        var padY = opt.padY || 0;
        yMin -= padY; yMax += padY;
        if (yMax - yMin < 2) yMax = yMin + 2;

        var svg = document.createElementNS(svgNS(), 'svg');
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('role', 'img');

        function xAt(i) {
            return padL + (opt.labels.length > 1 ? i / (opt.labels.length - 1) : 0) * plotW;
        }
        function yAt(v) {
            return padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;
        }

        // Grille horizontale discrète + axe Y
        var gridSteps = 4;
        var g = document.createElementNS(svgNS(), 'g');
        for (var gi = 0; gi <= gridSteps; gi++) {
            var val = yMin + (yMax - yMin) * gi / gridSteps;
            var yy = yAt(val);
            var line = document.createElementNS(svgNS(), 'line');
            line.setAttribute('x1', padL); line.setAttribute('y1', yy);
            line.setAttribute('x2', W - padR); line.setAttribute('y2', yy);
            line.setAttribute('stroke', 'rgba(148, 163, 184, 0.12)');
            line.setAttribute('stroke-width', '1');
            g.appendChild(line);
            var txt = document.createElementNS(svgNS(), 'text');
            txt.setAttribute('x', padL - 8); txt.setAttribute('y', yy + 4);
            txt.setAttribute('text-anchor', 'end');
            txt.setAttribute('font-size', '11');
            txt.setAttribute('fill', '#6f83a3');
            var labelVal = opt.yDecimals === 0 ? Math.round(val) : (Math.round(val * 10) / 10);
            txt.textContent = String(labelVal) + (opt.yUnit ? ' ' + opt.yUnit : '');
            g.appendChild(txt);
        }
        svg.appendChild(g);

        // Axe X : heures (un label sur ~6 pour éviter la surcharge)
        var step = Math.max(1, Math.ceil(opt.labels.length / 14));
        var xg = document.createElementNS(svgNS(), 'g');
        for (var xi = 0; xi < opt.labels.length; xi += step) {
            var tx = document.createElementNS(svgNS(), 'text');
            tx.setAttribute('x', xAt(xi));
            tx.setAttribute('y', H - 12);
            tx.setAttribute('text-anchor', 'middle');
            tx.setAttribute('font-size', '11');
            tx.setAttribute('fill', '#6f83a3');
            tx.textContent = opt.labels[xi];
            xg.appendChild(tx);
            // petit tick vertical
            var tk = document.createElementNS(svgNS(), 'line');
            tk.setAttribute('x1', xAt(xi)); tk.setAttribute('y1', padT + plotH);
            tk.setAttribute('x2', xAt(xi)); tk.setAttribute('y2', padT + plotH + 4);
            tk.setAttribute('stroke', 'rgba(148,163,184,0.25)');
            xg.appendChild(tk);
        }
        svg.appendChild(xg);

        // Courbes
        opt.series.forEach(function (s) {
            var pts = '';
            var has = false;
            s.values.forEach(function (v, i) {
                if (!finite(v)) return;
                has = true;
                pts += (i === 0 ? '' : ' ') + xAt(i).toFixed(1) + ',' + yAt(v).toFixed(1);
                pts += i === 0 ? '' : '';
            });
            if (!has) return;
            // remplissage doux sous la courbe principale
            if (s.fill) {
                var poly = document.createElementNS(svgNS(), 'polygon');
                var fillPts = pts + ' ' + xAt(s.values.length - 1).toFixed(1) + ',' + (padT + plotH) +
                    ' ' + xAt(0).toFixed(1) + ',' + (padT + plotH);
                poly.setAttribute('points', fillPts);
                poly.setAttribute('fill', s.color);
                poly.setAttribute('opacity', '0.08');
                svg.appendChild(poly);
            }
            var line = document.createElementNS(svgNS(), 'polyline');
            line.setAttribute('points', pts);
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', s.color);
            line.setAttribute('stroke-width', String(s.width || 2.5));
            line.setAttribute('stroke-linejoin', 'round');
            line.setAttribute('stroke-linecap', 'round');
            if (s.dashed) line.setAttribute('stroke-dasharray', '5 5');
            line.setAttribute('opacity', '0.95');
            svg.appendChild(line);
        });

        // Zones de survol (tooltip)
        var hit = document.createElementNS(svgNS(), 'g');
        opt.labels.forEach(function (_, i) {
            var rect = document.createElementNS(svgNS(), 'rect');
            var bw = plotW / Math.max(1, opt.labels.length);
            rect.setAttribute('x', (xAt(i) - bw / 2).toFixed(1));
            rect.setAttribute('y', padT);
            rect.setAttribute('width', bw.toFixed(1));
            rect.setAttribute('height', plotH.toFixed(1));
            rect.setAttribute('fill', 'transparent');
            rect.style.cursor = 'crosshair';
            rect.addEventListener('mousemove', function (evt) {
                if (!tip) return;
                tip.innerHTML = '';
                var tt = el('div', 't-title', opt.fullLabels[i] || opt.labels[i]);
                tip.appendChild(tt);
                (opt.tooltipRows(i) || []).forEach(function (row) {
                    var r = el('div', 't-row');
                    r.appendChild(el('span', 'k', row[0]));
                    r.appendChild(el('span', 'v', row[1]));
                    tip.appendChild(r);
                });
                tip.classList.add('show');
                positionTip(tip, wrap, evt);
            });
            rect.addEventListener('mouseleave', function () {
                if (tip) tip.classList.remove('show');
            });
            hit.appendChild(rect);
        });
        svg.appendChild(hit);

        wrap.appendChild(svg);
    }

    /* Graphique en barres (pluie) */
    function buildBarsChart(wrap, opt) {
        var tip = wrap.querySelector('.mcp-chart-tip');
        var W = 860, H = 300;
        var padL = 52, padR = 14, padT = 14, padB = 34;
        var plotW = W - padL - padR;
        var plotH = H - padT - padB;

        var fin = opt.values.filter(finite);
        var max = fin.length ? Math.max.apply(null, fin) : 0;
        if (max <= 0) max = 1;
        max = Math.ceil(max * 2) / 2;

        var svg = document.createElementNS(svgNS(), 'svg');
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        function xAt(i) {
            return padL + (opt.labels.length > 1 ? i / (opt.labels.length - 1) : 0) * plotW;
        }

        // grille
        var g = document.createElementNS(svgNS(), 'g');
        for (var gi = 0; gi <= 4; gi++) {
            var val = max * gi / 4;
            var yy = padT + (1 - val / max) * plotH;
            var line = document.createElementNS(svgNS(), 'line');
            line.setAttribute('x1', padL); line.setAttribute('y1', yy);
            line.setAttribute('x2', W - padR); line.setAttribute('y2', yy);
            line.setAttribute('stroke', 'rgba(148, 163, 184, 0.12)');
            g.appendChild(line);
            var txt = document.createElementNS(svgNS(), 'text');
            txt.setAttribute('x', padL - 8); txt.setAttribute('y', yy + 4);
            txt.setAttribute('text-anchor', 'end');
            txt.setAttribute('font-size', '11');
            txt.setAttribute('fill', '#6f83a3');
            txt.textContent = (Math.round(val * 10) / 10) + ' ' + opt.yUnit;
            g.appendChild(txt);
        }
        svg.appendChild(g);

        // axe X
        var step = Math.max(1, Math.ceil(opt.labels.length / 14));
        for (var xi = 0; xi < opt.labels.length; xi += step) {
            var tx = document.createElementNS(svgNS(), 'text');
            tx.setAttribute('x', xAt(xi));
            tx.setAttribute('y', H - 12);
            tx.setAttribute('text-anchor', 'middle');
            tx.setAttribute('font-size', '11');
            tx.setAttribute('fill', '#6f83a3');
            tx.textContent = opt.labels[xi];
            svg.appendChild(tx);
        }

        // barres
        var bw = plotW / opt.labels.length;
        opt.values.forEach(function (v, i) {
            var bh = finite(v) && v > 0 ? (v / max) * plotH : 0;
            var x = xAt(i) - bw * 0.3;
            var rect = document.createElementNS(svgNS(), 'rect');
            rect.setAttribute('x', x.toFixed(1));
            rect.setAttribute('y', (padT + plotH - bh).toFixed(1));
            rect.setAttribute('width', (bw * 0.6).toFixed(1));
            rect.setAttribute('height', bh.toFixed(1));
            rect.setAttribute('fill', opt.color);
            rect.setAttribute('rx', '2');
            rect.setAttribute('opacity', finite(v) && v > 0 ? '0.85' : '0.12');
            svg.appendChild(rect);
        });

        // survol
        opt.labels.forEach(function (_, i) {
            var rect = document.createElementNS(svgNS(), 'rect');
            rect.setAttribute('x', (xAt(i) - bw / 2).toFixed(1));
            rect.setAttribute('y', padT);
            rect.setAttribute('width', bw.toFixed(1));
            rect.setAttribute('height', plotH.toFixed(1));
            rect.setAttribute('fill', 'transparent');
            rect.style.cursor = 'crosshair';
            rect.addEventListener('mousemove', function (evt) {
                if (!tip) return;
                tip.innerHTML = '';
                var tt = el('div', 't-title', opt.fullLabels[i] || opt.labels[i]);
                tip.appendChild(tt);
                (opt.tooltipRows(i) || []).forEach(function (row) {
                    var r = el('div', 't-row');
                    r.appendChild(el('span', 'k', row[0]));
                    r.appendChild(el('span', 'v', row[1]));
                    tip.appendChild(r);
                });
                tip.classList.add('show');
                positionTip(tip, wrap, evt);
            });
            rect.addEventListener('mouseleave', function () {
                if (tip) tip.classList.remove('show');
            });
            svg.appendChild(rect);
        });

        wrap.appendChild(svg);
    }

    /* Tendance pression : ↗ hausse / → stable / ↘ baisse */
    function pressTrend(press) {
        var first = null, last = null;
        press.forEach(function (v) { if (finite(v)) { if (first === null) first = v; last = v; } });
        if (first === null || last === null) return '';
        var diff = last - first;
        if (diff > 2) return '↗ hausse';
        if (diff < -2) return '↘ baisse';
        return '→ stable';
    }

    /* ══════════════════════════════════════════════════════════════════
       TABLEAUX
       ══════════════════════════════════════════════════════════════════ */

    /* Helper : cellule jour avec séparation propre et compteur explicite */
    function makeDayCell(d, count) {
        var td = el('td', 'mcp-day-cell');
        td.appendChild(document.createTextNode(dayLabel(d)));
        if (count > 1) {
            var cnt = el('span', 'day-count', '· ' + count + ' éch.');
            cnt.title = count + ' échéances horaires ce jour';
            td.appendChild(cnt);
        }
        return td;
    }

    /* ── Tableau journalier ──────────────────────────────────────────── */
    function renderDailyTable(forecasts) {
        var head = ['Jour', 'Temps', 'T min', 'T max', 'Pluie cumul.', 'Rafale max', 'Vent max',
                    'Risque orage', 'Risque neige', 'Neige fraîche'];
        var thead = ui.tblDaily.tHead || ui.tblDaily.createTHead();
        thead.replaceChildren();
        var tr = thead.insertRow();
        head.forEach(function (h) { tr.appendChild(el('th', null, h)); });
        var tbody = ui.tblDaily.createTBody();
        tbody.replaceChildren();

        var days = {};
        forecasts.forEach(function (f) {
            var k = localDayKey(f.valid);
            if (!days[k]) days[k] = { date: f.valid, items: [] };
            days[k].items.push(f);
        });

        Object.keys(days).forEach(function (k, di) {
            var day = days[k];
            var items = day.items;
            var row = tbody.insertRow();
            if (di > 0) row.classList.add('mcp-new-day');

            row.appendChild(makeDayCell(day.date, items.length));

            // Temps dominant
            var condCounts = {};
            items.forEach(function (f) {
                var cc = valueAt(f.lp, 'condition_code');
                var key = finite(cc) ? Number(cc) : 0;
                condCounts[key] = (condCounts[key] || 0) + 1;
            });
            var dominant = 0, dominantCount = 0;
            Object.keys(condCounts).forEach(function (cc) {
                if (condCounts[cc] > dominantCount) { dominant = Number(cc); dominantCount = condCounts[cc]; }
            });
            var cond = CONDITIONS[dominant] || CONDITIONS[0];
            var tdCond = el('td', 'mcp-condition');
            tdCond.textContent = cond.icon + ' ' + cond.label;
            tdCond.title = 'Condition dominante sur la journée';
            row.appendChild(tdCond);

            var tMin = null, tMax = null, rainDay = 0, gustMax = 0, windMax = 0;
            var thMax = 0, snMax = 0, snowFresh = 0;
            items.forEach(function (f) {
                var t = valueAt(f.lp, 'temperature_c');
                if (finite(t)) {
                    tMin = tMin === null ? Number(t) : Math.min(tMin, Number(t));
                    tMax = tMax === null ? Number(t) : Math.max(tMax, Number(t));
                }
                var r = valueAt(f.lp, 'precipitation_mm');
                if (finite(r)) rainDay += Math.max(0, Number(r));
                var g = valueAt(f.lp, 'wind_gust_max_kmh');
                if (finite(g)) gustMax = Math.max(gustMax, Number(g));
                var w = valueAt(f.lp, 'wind_speed_kmh');
                if (finite(w)) windMax = Math.max(windMax, Number(w));
                var th = valueAt(f.lp, 'thunder_risk_code');
                if (finite(th)) thMax = Math.max(thMax, Number(th));
                var sn = valueAt(f.lp, 'snow_risk_code');
                if (finite(sn)) snMax = Math.max(snMax, Number(sn));
                var sf = valueAt(f.lp, 'snow_fresh_cm');
                if (finite(sf)) snowFresh += Math.max(0, Number(sf));
            });

            var tdTmin = el('td', tMin !== null ? tempClass(tMin) : '');
            tdTmin.textContent = tMin !== null ? Math.round(tMin) + '°' : '—';
            row.appendChild(tdTmin);
            var tdTmax = el('td', tMax !== null ? tempClass(tMax) : '');
            tdTmax.textContent = tMax !== null ? Math.round(tMax) + '°' : '—';
            row.appendChild(tdTmax);

            var tdRain = el('td', rainDay >= 10 ? 'num-strong' : '');
            tdRain.textContent = rainDay > 0 ? fmt(rainDay, 1, ' mm') : (rainDay === 0 ? '0 mm' : '—');
            row.appendChild(tdRain);

            var tdGust = el('td', gustMax >= 100 ? 'num-strong' : (gustMax >= 70 ? 'temp-warm' : ''));
            tdGust.textContent = fmt(gustMax || null, 0, ' km/h');
            tdGust.title = 'Rafale max cumulée depuis le début du run';
            row.appendChild(tdGust);

            var tdWind = el('td');
            tdWind.textContent = fmt(windMax || null, 0, ' km/h');
            row.appendChild(tdWind);

            var tdTh = el('td');
            tdTh.appendChild(riskPill(thMax, THUNDER_RISKS));
            row.appendChild(tdTh);

            var tdSn = el('td');
            tdSn.appendChild(riskPill(snMax, SNOW_RISKS));
            row.appendChild(tdSn);

            var tdSnow = el('td');
            tdSnow.textContent = snowFresh > 0 ? fmt(snowFresh, 1, ' cm') : (snowFresh === 0 ? '0 cm' : '—');
            row.appendChild(tdSnow);
        });
    }

    /* ── Tableau général ─────────────────────────────────────────────── */
    function renderGeneralTable(forecasts, hourFmt, dayFmt) {
        var head = ['Jour', 'Heure', 'Temps', 'Temp.', 'Ressenti', 'Rosée', 'Humidité', 'Pluie 1h',
                    'Nuages', 'Vent', 'Rafales', 'Rafale max éch.', 'Pression'];
        var thead = ui.tblGeneral.tHead || ui.tblGeneral.createTHead();
        thead.replaceChildren();
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
            row.appendChild(makeDayCell(f.valid, dayCounts[k]));
            row.appendChild(el('td', 'mcp-hour', hourFmt.format(f.valid)));

            var condCode = valueAt(f.lp, 'condition_code');
            var cond = CONDITIONS[Number(condCode)] || CONDITIONS[0];
            var tdCond = el('td', 'mcp-condition');
            tdCond.title = cond.label;
            tdCond.textContent = cond.icon + ' ' + cond.label;
            row.appendChild(tdCond);

            var t = valueAt(f.lp, 'temperature_c');
            var tdT = el('td');
            tdT.textContent = fmt(t, 0, '°');
            tdT.className = tempClass(t);
            row.appendChild(tdT);

            appendNum(row, valueAt(f.lp, 'wind_chill_c'), 0, '°');
            appendNum(row, valueAt(f.lp, 'dewpoint_c'), 1, '°');
            appendNum(row, valueAt(f.lp, 'humidity_pct'), 0, '%');
            var r = valueAt(f.lp, 'precipitation_mm');
            appendNum(row, r, 1, ' mm', finite(r) && r >= 5 ? 'num-strong' : '');
            appendNum(row, valueAt(f.lp, 'cloud_cover_pct'), 0, '%');

            // Vent : direction + valeur typographiée
            var w = roundUp5(valueAt(f.lp, 'wind_speed_kmh'));
            var tdW = el('td');
            var windBox = el('span', 'wind-cell');
            var dirDeg = valueAt(f.lp, 'wind_direction_deg');
            var dir = windDirection(dirDeg);
            if (dir) {
                var arrow = el('span', 'wind-arrow', '➜');
                arrow.style.transform = 'rotate(' + ((Number(dirDeg) + 180) % 360) + 'deg)';
                windBox.appendChild(arrow);
                windBox.appendChild(el('span', 'wind-dir', dir));
            }
            var strong = el('span', 'wind-speed', fmt(w, 0, ''));
            windBox.appendChild(strong);
            windBox.appendChild(el('span', 'wind-unit', 'km/h'));
            tdW.appendChild(windBox);
            row.appendChild(tdW);

            var g = roundUp5(valueAt(f.lp, 'wind_gust_kmh'));
            var tdG = el('td', finite(g) && g >= 80 ? 'num-strong' : '');
            tdG.textContent = fmt(g, 0, ' km/h');
            row.appendChild(tdG);

            var gm = valueAt(f.lp, 'wind_gust_max_kmh');
            var tdGm = el('td', finite(gm) && gm >= 100 ? 'num-strong' : (finite(gm) && gm >= 70 ? 'temp-warm' : ''));
            tdGm.textContent = fmt(gm, 0, ' km/h');
            tdGm.title = 'Rafale maximale cumulée depuis le début du run';
            row.appendChild(tdGm);

            appendNum(row, valueAt(f.lp, 'pressure_hpa'), 0, ' hPa');
        });
    }

    function appendNum(row, v, d, suffix, cls) {
        var td = el('td', cls || '');
        td.textContent = fmt(v, d, suffix);
        row.appendChild(td);
    }

    /* ── Tableau orages ──────────────────────────────────────────────── */
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
            row.appendChild(makeDayCell(f.valid, dayCounts[k]));
            row.appendChild(el('td', 'mcp-hour', hourFmt.format(f.valid)));

            var th = valueAt(f.lp, 'thunder_risk_code');
            var tdTh = el('td');
            tdTh.appendChild(riskPill(finite(th) ? th : 0, THUNDER_RISKS));
            row.appendChild(tdTh);

            var cape = valueAt(f.lp, 'cape_jkg');
            var tdCape = el('td', finite(cape) && cape >= 1500 ? 'num-strong' : (finite(cape) && cape >= 500 ? 'temp-warm' : ''));
            tdCape.textContent = finite(cape) && cape >= 25 ? fmt(cape, 0, ' J/kg') : '—';
            tdCape.appendChild(helpIcon('cape'));
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

    /* ── Tableau neige ───────────────────────────────────────────────── */
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
            row.appendChild(makeDayCell(f.valid, dayCounts[k]));
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
            tdStick.title = HELP.tenue;
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

    /* ── Géolocalisation (inchangée) ─────────────────────────────────── */
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

    /* ── Onglets (avec aria + scroll horizontal) ─────────────────────── */
    function bindTabs() {
        document.querySelectorAll('.mcp-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.mcp-tab').forEach(function (t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                document.querySelectorAll('.mcp-panel').forEach(function (p) { p.classList.remove('active'); });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                var panel = $('panel-' + tab.dataset.panel);
                if (panel) panel.classList.add('active');
            });
        });
    }

    /* ── Init (inchangé) ─────────────────────────────────────────────── */
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
