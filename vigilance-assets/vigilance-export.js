/* ============================================================================
   Vigilance — Téléchargement PNG « comme les cartes AROME HD »
   Composition calquée sur l'export de monsieurmeteo.github.io/arome-weather-map
   (js/arome-map.js) :
     • canevas 2200×1640, fond #0b1220 ;
     • cartouche « antenne » haut GAUCHE : titre (blanc gras), modèle+run
       (cyan), date en grand (blanc) ;
     • LOGO haut DROITE ;
     • LÉGENDE centrée en bas (étiquette + barre de paliers + libellés) ;
     • la carte France occupe tout le canevas, cartouches par-dessus ;
     • ENCARTS : l'Île-de-France (carte détaillée) est ajoutée sur l'export
       (panneau à droite) — comme sur l'écran, pour identifier les
       départements IDF non symbolisés sur la carte principale.
   Module externe : ne modifie pas le code du widget.
   ========================================================================== */
(function () {
    'use strict';

    var LOGO_CANDIDATES = [
        'assets/logo.png',
        'vigilance-assets/logo.png',
        'logo.png'
    ];

    var W = 2200;
    var H = 1640;
    var MARGIN = 24;
    var BANNER_Y = 24;
    var BANNER_H = 175;
    var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    function ready(fn) {
        if (document.readyState !== 'loading') { fn(); }
        else { document.addEventListener('DOMContentLoaded', fn); }
    }

    function loadImage(urls, index, done) {
        index = index || 0;
        if (index >= urls.length) { done(null); return; }
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () { done(img); };
        img.onerror = function () { loadImage(urls, index + 1, done); };
        img.src = urls[index];
    }

    function node(selector) {
        return document.querySelector('.hrw-card ' + selector) || document.querySelector(selector);
    }

    function activeTabText(root, selector) {
        var el = root.querySelector(selector + ' .hrw-tab.is-active');
        return el ? (el.textContent || '').trim() : '';
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function exportFilename(hazard, day) {
        var safe = function (s) {
            return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'carte';
        };
        return 'vigilance-' + safe(hazard) + '-' + safe(day) + '.png';
    }

    function serializeSvg(svg) {
        var clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        clone.querySelectorAll('path').forEach(function (p) {
            if (!p.getAttribute('fill')) { p.setAttribute('fill', '#31aa35'); }
            p.setAttribute('stroke', '#05080c');
            p.setAttribute('stroke-width', '2.4');
            p.setAttribute('stroke-linejoin', 'round');
        });
        return new XMLSerializer().serializeToString(clone);
    }

    function drawSvgImage(ctx, svg, x, y, size) {
        return new Promise(function (resolve) {
            var blob = new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, x, y, size, size);
                URL.revokeObjectURL(url);
                resolve(true);
            };
            img.onerror = function () { URL.revokeObjectURL(url); resolve(false); };
            img.src = url;
        });
    }

    function renderExport(card, callback) {
        var svg = node('[data-hrw-map]');
        var insetSvg = node('[data-hrw-inset-map]');
        if (!svg) { callback(new Error('Carte non trouvée')); return; }

        var hazard = activeTabText(card, '.hrw-hazard-tabs') || 'Vigilance';
        var day = activeTabText(card, '.hrw-day-tabs') || '';
        var legendTitle = ((card.querySelector('[data-hrw-legend-title]') || {}).textContent || hazard).trim();

        var items = Array.prototype.map.call(
            card.querySelectorAll('.hrw-legend .hrw-legend-item'),
            function (el) {
                var swatch = el.querySelector('.hrw-legend-swatch');
                return {
                    color: (swatch && swatch.style.backgroundColor) || '#888888',
                    label: (el.textContent || '').trim()
                };
            }
        );
        if (!items.length) { items = [{ color: '#31aa35', label: 'Nul' }]; }

        loadImage(LOGO_CANDIDATES, 0, function (logo) {
            var canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            var ctx = canvas.getContext('2d');

            ctx.fillStyle = '#0b1220';
            ctx.fillRect(0, 0, W, H);

            var mapSize = H - 20;
            var mapX = (W - mapSize) / 2;
            drawSvgImage(ctx, svg, Math.round(mapX), 10, mapSize).then(function () {
                // --- EncarÎ Île-de-France (carte détaillée) à droite ---
                if (insetSvg) {
                    var panelW = 470;
                    var panelH = 560;
                    var px = W - MARGIN - panelW;
                    var py = 400;
                    ctx.fillStyle = 'rgba(7, 11, 20, 0.95)';
                    roundRectPath(ctx, px, py, panelW, panelH, 18);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 210, 255, 0.6)';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'alphabetic';
                    ctx.fillStyle = '#9fdcff';
                    ctx.font = '800 34px ' + FONT;
                    ctx.fillText('Île-de-France', px + panelW / 2, py + 52);
                    ctx.fillStyle = '#93a5bf';
                    ctx.font = '500 24px ' + FONT;
                    ctx.fillText('zoom — ' + hazard + (day ? ' · ' + day : ''), px + panelW / 2, py + 88);
                    ctx.textAlign = 'left';
                    drawSvgImage(ctx, insetSvg, px + 18, py + 110, panelW - 36);
                }

                // --- LOGO en haut à droite ---
                var logoTargetW = 150;
                var lx = W - MARGIN - logoTargetW;
                var ly = BANNER_Y + (BANNER_H - logoTargetW) / 2;
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                if (logo) {
                    ctx.drawImage(logo, lx, ly, logoTargetW, logoTargetW);
                } else {
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    ctx.font = '800 38px ' + FONT;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('MÉTÉO-CLIMAT', W - MARGIN, BANNER_Y + 20);
                    ctx.font = '900 32px ' + FONT;
                    ctx.fillStyle = '#00d2ff';
                    ctx.fillText('PRO', W - MARGIN, BANNER_Y + 68);
                    ctx.textAlign = 'left';
                }
                ctx.restore();

                // --- Cartouche « antenne » haut gauche ---
                var paramTitle = hazard;
                var modelAndRun = 'AROME HD (Météo-France) — vigilance non officielle';
                var dateText = day;

                ctx.font = '700 38px ' + FONT;
                var w1 = ctx.measureText(paramTitle).width;
                ctx.font = '700 26px ' + FONT;
                var w2 = ctx.measureText(modelAndRun).width;
                ctx.font = '800 34px ' + FONT;
                var w3 = ctx.measureText(dateText).width;
                var bannerW = Math.max(w1, w2, w3) + 48;

                ctx.fillStyle = 'rgba(7, 11, 20, 0.94)';
                roundRectPath(ctx, MARGIN, BANNER_Y, bannerW, BANNER_H, 16);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.8)';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 38px ' + FONT;
                ctx.fillText(paramTitle, MARGIN + 24, BANNER_Y + 48);
                ctx.fillStyle = '#00d2ff';
                ctx.font = '700 26px ' + FONT;
                ctx.fillText(modelAndRun, MARGIN + 24, BANNER_Y + 88);
                ctx.fillStyle = '#ffffff';
                ctx.font = '800 34px ' + FONT;
                ctx.fillText(dateText, MARGIN + 24, BANNER_Y + 140);

                // --- Légende basse centrée ---
                var legendW = 1180;
                var legendH = 132;
                var legendBottom = 18;
                var legendX = (W - legendW) / 2;
                var legendY = H - legendH - legendBottom;

                ctx.fillStyle = 'rgba(7, 11, 20, 0.96)';
                roundRectPath(ctx, legendX - 22, legendY - 18, legendW + 44, legendH + 50, 18);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 30px ' + FONT;
                ctx.fillText('Légende — ' + legendTitle, W / 2, legendY + 30);

                var barY = legendY + 50;
                var segW = legendW / items.length;
                var segX = legendX;
                items.forEach(function (item) {
                    ctx.fillStyle = item.color;
                    ctx.fillRect(segX, barY, segW - 2, 28);
                    segX += segW;
                });

                var labelFont = items.length > 7 ? 17 : 20;
                ctx.fillStyle = '#c7d3e4';
                ctx.font = '600 ' + labelFont + 'px ' + FONT;
                items.forEach(function (item, idx) {
                    var cx = legendX + segW * (idx + 0.5);
                    var text = item.label;
                    if (ctx.measureText(text).width > segW - 8) {
                        while (ctx.measureText(text + '…').width > segW - 8 && text.length > 2) { text = text.slice(0, -1); }
                        text += '…';
                    }
                    ctx.textAlign = 'center';
                    ctx.fillText(text, cx, barY + 64);
                });
                ctx.textAlign = 'left';

                canvas.toBlob(function (blob) {
                    if (!blob) { callback(new Error('Export impossible')); return; }
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = exportFilename(hazard, day);
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1200);
                    callback(null, blob);
                }, 'image/png');
            });
        });
    }

    function injectButton(card) {
        var tools = card.querySelector('.hrw-map-tools');
        if (!tools || tools.querySelector('[data-hrw-export-cartouche]')) { return; }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-hrw-export-cartouche', '1');
        btn.title = 'Télécharger la carte 2200×1640 : titre, date, légende, logo + encart Île-de-France';
        btn.textContent = '⬇️ Télécharger (titre + date + légende + logo)';
        btn.style.cssText = 'background:linear-gradient(135deg,rgba(0,210,255,.25),rgba(2,132,199,.22));' +
            'border:1px solid rgba(0,210,255,.55);color:#fff;border-radius:9px;padding:6px 10px;' +
            'font-weight:800;font-size:12px;cursor:pointer;';
        btn.addEventListener('click', function () {
            btn.disabled = true;
            var old = btn.textContent;
            btn.textContent = 'Génération 2200×1640…';
            renderExport(card, function (err) {
                btn.disabled = false;
                btn.textContent = old;
                if (err) { window.alert('Export : ' + err.message); }
            });
        });
        tools.appendChild(btn);
    }

    ready(function () {
        var timer = setInterval(function () {
            var card = document.querySelector('.hrw-card[data-hrw-app]');
            if (!card) { clearInterval(timer); return; }
            if (card.querySelector('.hrw-legend-item')) {
                injectButton(card);
                clearInterval(timer);
            }
        }, 800);
    });
})();
