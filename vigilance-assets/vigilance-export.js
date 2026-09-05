/* ============================================================================
   Vigilance — Téléchargement PNG « cartouche pro »
   (titre + légende + logo), cohérent avec les exports des cartes AROME HD.

   Fonctionne PAR-DESSUS le widget (aucune modification de son code) :
   - lit la carte SVG affichée ([data-hrw-map]), l'onglet aléa/jour actif,
     la légende en cours (.hrw-legend-item) et la date du run ;
   - recompose une image PNG haute résolution avec logo, titre, légende et
     mentions, puis la télécharge.
   ========================================================================== */
(function () {
    'use strict';

    var LOGO_CANDIDATES = [
        'assets/logo.png',
        'vigilance-assets/logo.png',
        'logo.png'
    ];
    var W = 2200;              // largeur export (haute résolution)
    var PAD = 72;              // marge externe
    var FONT = '"Segoe UI", Roboto, Arial, sans-serif';

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
        var svg = document.querySelector('.hrw-card [data-hrw-map]');
        return svg || document.querySelector('[data-hrw-map]');
    }

    function activeTabText(root, selector) {
        var node = root.querySelector(selector + ' .hrw-tab.is-active');
        return node ? (node.textContent || '').trim() : '';
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
        // Bordures départementales lisibles sur fond sombre.
        clone.querySelectorAll('path').forEach(function (p) {
            if (!p.getAttribute('fill')) { p.setAttribute('fill', '#31aa35'); }
            p.setAttribute('stroke', '#0a1424');
            p.setAttribute('stroke-width', '1');
            p.setAttribute('stroke-linejoin', 'round');
        });
        return new XMLSerializer().serializeToString(clone);
    }

    function drawLegend(ctx, items, x, y, maxWidth, rowHeight, fontPx) {
        var row = 0, xCursor = x;
        ctx.font = '600 ' + fontPx + 'px ' + FONT;
        ctx.textBaseline = 'middle';
        items.forEach(function (item) {
            var labelW = ctx.measureText(item.label).width;
            var boxW = 34 + 10 + labelW + 18;
            if (xCursor + boxW > x + maxWidth && xCursor > x) {
                row += 1;
                xCursor = x;
            }
            var cy = y + row * rowHeight + fontPx;
            ctx.fillStyle = item.color;
            roundRect(ctx, xCursor, cy - fontPx * 0.75, 30, fontPx * 1.5, 6);
            ctx.fill();
            ctx.fillStyle = '#e8eef6';
            ctx.fillText(item.label, xCursor + 44, cy + 1);
            xCursor += boxW;
        });
        return row;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function renderExport(card, callback) {
        var svg = pickSvgNode();
        if (!svg) { callback(new Error('Carte non trouvée')); return; }

        var hazard = activeTabText(card, '.hrw-hazard-tabs') || 'Vigilance';
        var day = activeTabText(card, '.hrw-day-tabs') || 'J0';
        var runText = (card.querySelector('[data-hrw-run]') || {}).textContent || '';
        var legendTitle = (card.querySelector('[data-hrw-legend-title]') || {}).textContent || (hazard + ' — ' + day);

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
            var svgText = serializeSvg(svg);
            var svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
            var svgUrl = URL.createObjectURL(svgBlob);
            var mapImg = new Image();
            mapImg.onload = function () {
                URL.revokeObjectURL(svgUrl);
                var vb = svg.viewBox.baseVal || { x: 0, y: 0, width: 1000, height: 1000 };
                var mapW = W - 2 * PAD;
                var mapH = mapW * (vb.height / vb.width);

                var topH = 240;                       // bandeau titre + logo
                var legFont = 46;
                var legRowH = 110;
                var legMaxRows = 3;
                var footH = 96;
                var H = Math.round(topH + mapH + legRowH * legMaxRows + footH);

                var canvas = document.createElement('canvas');
                canvas.width = W;
                canvas.height = H;
                var ctx = canvas.getContext('2d');

                // Fond dégradé sombre (cohérent UI Météo-Climat Pro).
                var grad = ctx.createLinearGradient(0, 0, 0, H);
                grad.addColorStop(0, '#0d1930');
                grad.addColorStop(0.5, '#0b1322');
                grad.addColorStop(1, '#070d18');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, W, H);

                // --- Logo (gauche, haut) ---
                var logoSize = 150;
                if (logo) {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 24;
                    ctx.drawImage(logo, PAD + 10, 40, logoSize, logoSize);
                    ctx.restore();
                }

                // --- Titre (droite) ---
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#7dd3fc';
                ctx.font = '800 34px ' + FONT;
                ctx.fillText('VIGILANCE MÉTÉO 48H — NON OFFICIELLE', W - PAD - 10, 62);
                ctx.textAlign = 'right';

                ctx.fillStyle = '#ffffff';
                ctx.font = '800 92px ' + FONT;
                var title = hazard + (day ? ' · ' + day : '');
                ctx.fillText(title, W - PAD - 10, 168);

                ctx.fillStyle = '#93a5bf';
                ctx.font = '500 38px ' + FONT;
                ctx.fillText((runText || '').replace(/\s+/g, ' ').trim(), W - PAD - 10, 224);
                ctx.textAlign = 'left';

                // --- Carte ---
                var mapY = topH;
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = 40;
                ctx.fillStyle = '#05090f';
                roundRect(ctx, PAD - 14, mapY - 14, mapW + 28, mapH + 28, 26);
                ctx.fill();
                ctx.restore();
                ctx.drawImage(mapImg, PAD, mapY, mapW, mapH);

                // --- Légende (bas) ---
                var legY = mapY + mapH + 46;
                ctx.textAlign = 'left';
                ctx.fillStyle = '#9fdcff';
                ctx.font = '700 44px ' + FONT;
                ctx.fillText('Légende — ' + legendTitle, PAD, legY + 6);
                var rows = drawLegend(ctx, items, PAD, legY + 60, mapW, legRowH, legFont);

                // --- Pied ---
                var footY = legY + legRowH * legMaxRows;
                ctx.strokeStyle = 'rgba(255,255,255,0.18)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(PAD, footY + 6);
                ctx.lineTo(W - PAD, footY + 6);
                ctx.stroke();
                ctx.fillStyle = '#7c8db0';
                ctx.font = '500 30px ' + FONT;
                ctx.fillText(
                    'Vigilance non officielle dérivée du modèle AROME (Météo-France) via monsieurmeteo/arome-weather-map — ne remplace pas la vigilance Météo-France. ' +
                    'Cartes téléchargeables : © Météo-Climat Pro.',
                    PAD, footY + 62
                );

                canvas.toBlob(function (blob) {
                    if (!blob) { callback(new Error('Export impossible')); return; }
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = exportFilename(hazard, day);
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        URL.revokeObjectURL(url);
                        a.remove();
                    }, 1200);
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
        btn.title = 'Télécharger la carte avec titre, légende et logo';
        btn.textContent = '⬇️ Télécharger (titre + légende + logo)';
        btn.style.cssText = 'background:linear-gradient(135deg,rgba(0,210,255,.25),rgba(2,132,199,.22));' +
            'border:1px solid rgba(0,210,255,.55);color:#fff;border-radius:9px;padding:6px 10px;' +
            'font-weight:800;font-size:12px;cursor:pointer;';
        btn.addEventListener('click', function () {
            btn.disabled = true;
            var old = btn.textContent;
            btn.textContent = 'Génération…';
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
            // Le bouton n'est ajouté qu'une fois la carte chargée (légende présente).
            if (card.querySelector('.hrw-legend-item')) {
                injectButton(card);
                clearInterval(timer);
            }
        }, 800);
    });
})();
