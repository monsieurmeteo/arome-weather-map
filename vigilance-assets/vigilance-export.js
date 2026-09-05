/* ============================================================================
   Vigilance — Téléchargement PNG « comme les cartes AROME HD »
   Composition calquée sur l'export de monsieurmeteo.github.io/arome-weather-map
   (js/arome-map.js) :
     • canevas 2200×1640, fond #0b1220 ;
     • cartouche « antenne » en haut à GAUCHE (boîte sombre arrondie, liseré
       cyan) : titre du paramètre (blanc, gras), modèle + run (cyan), date en
       grand (blanc) ;
     • LOGO en haut à DROITE (image centrée sur la hauteur du bandeau) ;
     • LÉGENDE en dessous, centrée en bas (boîte sombre arrondie liseré cyan,
       étiquette + barre colorée par paliers avec libellés) ;
     • la carte (SVG affiché, icônes comprises) occupe tout le canevas, les
       cartouches se posant par-dessus — comme sur vos exports météo.
   Aucune modification du code du widget : module externe d'amélioration.
   ========================================================================== */
(function () {
    'use strict';

    var LOGO_CANDIDATES = [
        'assets/logo.png',
        'vigilance-assets/logo.png',
        'logo.png'
    ];

    // Dimensions et constantes calquées sur arome-map.js
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

    function pickSvgNode() {
        return document.querySelector('.hrw-card [data-hrw-map]') || document.querySelector('[data-hrw-map]');
    }

    function activeTabText(root, selector) {
        var node = root.querySelector(selector + ' .hrw-tab.is-active');
        return node ? (node.textContent || '').trim() : '';
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
            p.setAttribute('stroke', '#0b1220');
            p.setAttribute('stroke-width', '1.4');
            p.setAttribute('stroke-linejoin', 'round');
        });
        return new XMLSerializer().serializeToString(clone);
    }

    function renderExport(card, callback) {
        var svg = pickSvgNode();
        if (!svg) { callback(new Error('Carte non trouvée')); return; }

        var hazard = activeTabText(card, '.hrw-hazard-tabs') || 'Vigilance';
        var day = activeTabText(card, '.hrw-day-tabs') || '';
        var legendTitle = (card.querySelector('[data-hrw-legend-title]') || {}).textContent || hazard;

        var items = Array.prototype.map.call(
            card.querySelectorAll('.hrw-legend .hrw-legend-item'),
            function (el) {
                var swatch = el.querySelector('.hrw-legend-swatch');
                var label = (el.textContent || '').trim();
                return { color: (swatch && swatch.style.backgroundColor) || '#888888', label: label };
            }
        );
        if (!items.length) { items = [{ color: '#31aa35', label: 'Nul' }]; }

        loadImage(LOGO_CANDIDATES, 0, function (logo) {
            var svgBlob = new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' });
            var svgUrl = URL.createObjectURL(svgBlob);
            var mapImg = new Image();
            mapImg.onload = function () {
                URL.revokeObjectURL(svgUrl);

                var canvas = document.createElement('canvas');
                canvas.width = W;
                canvas.height = H;
                var ctx = canvas.getContext('2d');

                // --- Fond sombre (identique aux exports AROME HD) ---
                ctx.fillStyle = '#0b1220';
                ctx.fillRect(0, 0, W, H);

                // --- Carte pleine zone (carré centré, cartouches par-dessus) ---
                var mapSize = H - 20;
                var mapX = (W - mapSize) / 2;
                ctx.drawImage(mapImg, Math.round(mapX), 10, mapSize, mapSize);

                // --- LOGO en haut à DROITE (centré sur le bandeau) ---
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

                // --- Cartouche « antenne » en haut à GAUCHE ---
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

                // --- Légende en dessous, centrée (même style que les exports) ---
                var legendW = 1100;
                var legendH = 128;
                var legendBottom = 20;
                var legendX = (W - legendW) / 2;
                var legendY = H - legendH - legendBottom;

                ctx.fillStyle = 'rgba(7, 11, 20, 0.96)';
                roundRectPath(ctx, legendX - 22, legendY - 16, legendW + 44, legendH + 46, 18);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 30px ' + FONT;
                ctx.fillText('Légende — ' + legendTitle, W / 2, legendY + 28);

                var barY = legendY + 46;
                var segX = legendX;
                var segW = legendW / items.length;
                items.forEach(function (item) {
                    ctx.fillStyle = item.color;
                    ctx.beginPath();
                    ctx.rect(segX, barY, segW - 2, 26);
                    ctx.fill();
                    segX += segW;
                });

                // Libellés de paliers sous la barre
                var labelFont = items.length > 7 ? 17 : 20;
                ctx.fillStyle = '#c7d3e4';
                ctx.font = '600 ' + labelFont + 'px ' + FONT;
                items.forEach(function (item, idx) {
                    ctx.textAlign = 'center';
                    var cx = legendX + segW * (idx + 0.5);
                    var text = item.label;
                    if (ctx.measureText(text).width > segW - 8) {
                        // Tronque élégamment les libellés trop longs (ex. « (≥ 150 km/h) »)
                        while (ctx.measureText(text + '…').width > segW - 8 && text.length > 2) {
                            text = text.slice(0, -1);
                        }
                        text += '…';
                    }
                    ctx.fillText(text, cx, barY + 58);
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
            };
            mapImg.onerror = function () {
                URL.revokeObjectURL(svgUrl);
                callback(new Error('Rendu de la carte impossible'));
            };
            mapImg.src = svgUrl;
        });
    }

    function injectButton(card) {
        var tools = card.querySelector('.hrw-map-tools');
        if (!tools || tools.querySelector('[data-hrw-export-cartouche]')) { return; }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-hrw-export-cartouche', '1');
        btn.title = 'Télécharger la carte (2200×1640) avec titre, date, légende et logo — comme les exports AROME HD';
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
