(function () {
    'use strict';

    function whenReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function fetchJson(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Réponse HTTP ' + response.status);
            }
            return response.json();
        });
    }

    function fetchText(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Réponse HTTP ' + response.status);
            }
            return response.text();
        });
    }

    function fetchBuffer(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Réponse HTTP ' + response.status);
            }
            return response.arrayBuffer();
        });
    }

    function decompressIfNeeded(buffer) {
        var bytes = new Uint8Array(buffer);
        if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
            return Promise.resolve(buffer);
        }
        if (typeof window.DecompressionStream !== 'function') {
            return Promise.reject(new Error('Décompression gzip indisponible'));
        }
        var stream = new Blob([buffer]).stream().pipeThrough(
            new window.DecompressionStream('gzip')
        );
        return new Response(stream).arrayBuffer();
    }

    function clamp(value, minimum, maximum) {
        return Math.max(minimum, Math.min(maximum, value));
    }

    function runLabelUtc(value) {
        var date = new Date(value);
        function two(number) {
            return String(number).padStart(2, '0');
        }
        return two(date.getUTCDate()) + '/' + two(date.getUTCMonth() + 1) +
            ' ' + two(date.getUTCHours()) + 'z';
    }

    function initMap(app) {
        var baseUrl = (app.dataset.baseUrl || '').replace(/\/+$/, '');
        var requestedLayer = app.dataset.variable || 'temperature';
        var timezone = app.dataset.timezone || 'Europe/Paris';
        var moduleVersion = app.dataset.moduleVersion || '1.0.0';
        var animationEnabled = app.dataset.animation !== '0';
        var reducedMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var menuToggle = app.querySelector('[data-amfm-menu-toggle]');
        var menuClose = app.querySelector('[data-amfm-menu-close]');
        var layerMenu = app.querySelector('[data-amfm-layer-menu]');
        var layerGrid = app.querySelector('[data-amfm-layer-grid]');
        var currentLayerText = app.querySelector('[data-amfm-current-layer]');
        var previousButton = app.querySelector('[data-amfm-previous]');
        var playButton = app.querySelector('[data-amfm-play]');
        var nextButton = app.querySelector('[data-amfm-next]');
        var validity = app.querySelector('[data-amfm-validity]');
        var lead = app.querySelector('[data-amfm-lead]');
        var run = app.querySelector('[data-amfm-run]');
        var generated = app.querySelector('[data-amfm-generated]');
        var stale = app.querySelector('[data-amfm-stale]');
        var viewport = app.querySelector('[data-amfm-viewport]');
        var weatherCanvas = app.querySelector('[data-amfm-weather]');
        var vectorCanvas = app.querySelector('[data-amfm-vectors]');
        var labelsCanvas = app.querySelector('[data-amfm-labels]');
        var vectorContext = vectorCanvas ? vectorCanvas.getContext('2d') : null;
        var labelsContext = labelsCanvas ? labelsCanvas.getContext('2d') : null;
        var mapTitle = app.querySelector('[data-amfm-map-title]');
        var mapRun = app.querySelector('[data-amfm-map-run]');
        var mapDate = app.querySelector('[data-amfm-map-date]');
        var loading = app.querySelector('[data-amfm-loading]');
        var errorBox = app.querySelector('[data-amfm-error]');
        var slider = app.querySelector('[data-amfm-slider]');
        var legend = app.querySelector('[data-amfm-legend]');
        var zoomIn = app.querySelector('[data-amfm-zoom-in]');
        var zoomOut = app.querySelector('[data-amfm-zoom-out]');
        var reset = app.querySelector('[data-amfm-reset]');
        var fullscreen = app.querySelector('[data-amfm-fullscreen]');
        var zoomLevel = app.querySelector('[data-amfm-zoom-level]');
        var probe = app.querySelector('[data-amfm-probe]');
        var probeValue = app.querySelector('[data-amfm-probe-value]');
        var probeLabel = app.querySelector('[data-amfm-probe-label]');
        var toolButtons = app.querySelectorAll('[data-amfm-tool]');
        var toolHint = app.querySelector('[data-amfm-tool-hint]');
        var advancedTools = app.querySelector('[data-amfm-advanced-tools]');
        var captureButton = app.querySelector('[data-amfm-capture]');
        var captureJpegButton = app.querySelector('[data-amfm-capture-jpeg]');
        var captureGifButton = app.querySelector('[data-amfm-capture-gif]');
        var toggleCitiesButton = app.querySelector('[data-amfm-toggle-cities]');
        var pinButton = app.querySelector('[data-amfm-pin]');
        var diagramPopup = app.querySelector('[data-amfm-diagram-popup]');
        var diagramTitle = app.querySelector('[data-amfm-diagram-title]');
        var diagramBody = app.querySelector('[data-amfm-diagram-body]');
        var diagramStatus = app.querySelector('[data-amfm-diagram-status]');
        var diagramClose = app.querySelector('[data-amfm-diagram-close]');

        var manifest = null;
        var currentLayer = requestedLayer;
        var currentModel = app.dataset.model || 'arome';
        var currentStep = 0;
        var loadToken = 0;
        var timer = null;
        var transform = { scale: 1, x: 0, y: 0 };
        var activePointers = new Map();
        var gesture = null;
        var places = [];
        var placeBuckets = new Map();
        var citiesVisible = true;
        var vectorDefinition = null;
        var currentWeatherImage = null;
        var logoImage = new Image();
        logoImage.crossOrigin = 'anonymous';
        logoImage.src = app.dataset.logo || 'logo.png';
        var franceMaskImage = new Image();
        franceMaskImage.crossOrigin = 'anonymous';
        franceMaskImage.src = resolvePath('maps/mask_france.png');
        franceMaskImage.onload = function () {
            // Le bbox du masque pilote le cadrage France : dès qu'il est
            // connu, on re-rend pour appliquer le cadrage intelligent.
            visibleBBoxCache = null;
            scheduleRender();
        };
        // Fond de carte (pays voisins inclus, style Positron)
        var fondImageElement = new Image();
        fondImageElement.crossOrigin = 'anonymous';
        fondImageElement.src = resolvePath('maps/fond.webp');
        var currentProbe = null;
        var probeLoadToken = 0;
        var samplerCanvas = document.createElement('canvas');
        var samplerContext = samplerCanvas.getContext ? samplerCanvas.getContext(
            '2d', { willReadFrequently: true }
        ) : null;
        var samplerReady = false;
        var hoverFrame = null;
        var lastHover = null;
        var renderFrame = null;
        var webgl = null;
        var fallbackContext = null;
        var maxScale = 64;
        var pendingFocus = null;
        var toolMode = null;
        var pinnedEnabled = false;
        var pinnedPoint = null;
        var tapStart = null;
        var departmentCache = new Map();
        var diagramLoadToken = 0;

        var validityFormat;
        var runFormat;
        var mapDateFormat;
        try {
            validityFormat = new Intl.DateTimeFormat('fr-FR', {
                timeZone: timezone,
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            });
            runFormat = new Intl.DateTimeFormat('fr-FR', {
                timeZone: timezone,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            });
            mapDateFormat = new Intl.DateTimeFormat('fr-FR', {
                timeZone: timezone,
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            });
        } catch (formatError) {
            validityFormat = new Intl.DateTimeFormat('fr-FR');
            runFormat = validityFormat;
            mapDateFormat = validityFormat;
        }

        function resolvePath(path) {
            if (/^(?:https?:\/\/|data:|blob:)/i.test(path || '')) {
                return path;
            }
            return baseUrl + '/' + String(path || '').replace(/^\/+/, '');
        }

        function versioned(path) {
            if (/^(?:data:|blob:)/i.test(path || '')) {
                return String(path);
            }
            var separator = String(path).indexOf('?') === -1 ? '?' : '&';
            var version = manifest && manifest.generated_at ? manifest.generated_at : Date.now();
            return resolvePath(path) + separator + 'v=' + encodeURIComponent(version);
        }

        function showError(message) {
            stopAnimation();
            if (loading) loading.hidden = true;
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.hidden = false;
            }
        }

        function clearError() {
            if (errorBox) {
                errorBox.hidden = true;
                errorBox.textContent = '';
            }
        }

        function parseProbe(buffer) {
            if (!buffer || buffer.byteLength < 16) {
                throw new Error('grille de valeurs tronquée');
            }
            var view = new DataView(buffer);
            var signature = String.fromCharCode(
                view.getUint8(0),
                view.getUint8(1),
                view.getUint8(2),
                view.getUint8(3)
            );
            var width = view.getUint16(4, true);
            var height = view.getUint16(6, true);
            if (signature !== 'HKV1' || !width || !height ||
                    buffer.byteLength < 16 + width * height * 2) {
                throw new Error('grille de valeurs invalide');
            }
            return {
                view: view,
                width: width,
                height: height,
                minimum: view.getFloat32(8, true),
                maximum: view.getFloat32(12, true)
            };
        }

        function probeCell(grid, x, y) {
            var code = grid.view.getUint16(
                16 + (y * grid.width + x) * 2,
                true
            );
            if (code === 65535) {
                return null;
            }
            return grid.minimum + code / 65534 *
                (grid.maximum - grid.minimum);
        }

        function sampleProbe(grid, u, v) {
            if (!grid) {
                return null;
            }
            var x = clamp(u, 0, 1) * (grid.width - 1);
            var y = clamp(v, 0, 1) * (grid.height - 1);
            var x0 = Math.floor(x);
            var y0 = Math.floor(y);
            var x1 = Math.min(x0 + 1, grid.width - 1);
            var y1 = Math.min(y0 + 1, grid.height - 1);
            var fx = x - x0;
            var fy = y - y0;
            var samples = [
                [x0, y0, (1 - fx) * (1 - fy)],
                [x1, y0, fx * (1 - fy)],
                [x0, y1, (1 - fx) * fy],
                [x1, y1, fx * fy]
            ];
            var total = 0;
            var weight = 0;
            samples.forEach(function (entry) {
                var value = probeCell(grid, entry[0], entry[1]);
                if (value === null || entry[2] <= 0) {
                    return;
                }
                total += value * entry[2];
                weight += entry[2];
            });
            return weight > 0 ? total / weight : null;
        }

        function parseColour(value) {
            var clean = String(value || '').replace('#', '');
            if (!/^[0-9a-f]{6}$/i.test(clean)) {
                return [0, 0, 0];
            }
            return [
                parseInt(clean.slice(0, 2), 16),
                parseInt(clean.slice(2, 4), 16),
                parseInt(clean.slice(4, 6), 16)
            ];
        }

        function valueFromColour(red, green, blue, layer) {
            if (!layer || !Array.isArray(layer.stops) || layer.stops.length < 2) {
                return null;
            }
            var stops = layer.stops.map(function (stop) {
                return {
                    value: Number(stop.value),
                    colour: parseColour(stop.color)
                };
            });
            var target = [red, green, blue];
            var bestValue = null;
            var bestDistance = Infinity;
            for (var index = 0; index < stops.length - 1; index += 1) {
                var first = stops[index];
                var second = stops[index + 1];
                var fraction = 0;
                if (!layer.discrete) {
                    var dr = second.colour[0] - first.colour[0];
                    var dg = second.colour[1] - first.colour[1];
                    var db = second.colour[2] - first.colour[2];
                    var denominator = dr * dr + dg * dg + db * db;
                    if (denominator > 0) {
                        fraction = clamp(
                            ((target[0] - first.colour[0]) * dr +
                                (target[1] - first.colour[1]) * dg +
                                (target[2] - first.colour[2]) * db) /
                                denominator,
                            0,
                            1
                        );
                    }
                }
                var candidate = [
                    first.colour[0] + (second.colour[0] - first.colour[0]) * fraction,
                    first.colour[1] + (second.colour[1] - first.colour[1]) * fraction,
                    first.colour[2] + (second.colour[2] - first.colour[2]) * fraction
                ];
                var distance = Math.pow(target[0] - candidate[0], 2) +
                    Math.pow(target[1] - candidate[1], 2) +
                    Math.pow(target[2] - candidate[2], 2);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestValue = first.value +
                        (second.value - first.value) * fraction;
                }
            }
            return bestValue;
        }

        function prepareImageSampler(source) {
            samplerReady = false;
            if (!samplerContext || !source) {
                return;
            }
            var width = Number(source.naturalWidth || source.width ||
                (manifest && manifest.width) || 0);
            var height = Number(source.naturalHeight || source.height ||
                (manifest && manifest.height) || 0);
            if (!width || !height) {
                return;
            }
            try {
                samplerCanvas.width = width;
                samplerCanvas.height = height;
                samplerContext.clearRect(0, 0, width, height);
                samplerContext.drawImage(source, 0, 0, width, height);
                samplerReady = true;
            } catch (samplingError) {
                samplerReady = false;
            }
        }

        function samplePalette(u, v, layer) {
            if (!samplerReady || !samplerContext) {
                return null;
            }
            var x = clamp(Math.round(u * (samplerCanvas.width - 1)),
                0, samplerCanvas.width - 1);
            var y = clamp(Math.round(v * (samplerCanvas.height - 1)),
                0, samplerCanvas.height - 1);
            try {
                var pixel = samplerContext.getImageData(x, y, 1, 1).data;
                if (pixel[3] < 12) {
                    return layer.transparent_below !== null &&
                        layer.transparent_below !== undefined ? 0 : null;
                }
                return valueFromColour(pixel[0], pixel[1], pixel[2], layer);
            } catch (samplingError) {
                samplerReady = false;
                return null;
            }
        }

        function loadProbe(step) {
            var token = ++probeLoadToken;
            currentProbe = null;
            var path = step && step.probes && step.probes[currentLayer];
            if (!path) {
                return Promise.resolve();
            }
            return fetchBuffer(versioned(path))
                .then(decompressIfNeeded)
                .then(parseProbe)
                .then(function (grid) {
                    if (token !== probeLoadToken) {
                        return;
                    }
                    currentProbe = grid;
                    if (lastHover) {
                        updateProbe(lastHover.x, lastHover.y);
                    }
                })
                .catch(function () {
                    if (token === probeLoadToken) {
                        currentProbe = null;
                    }
                });
        }

        function hideProbe() {
            lastHover = null;
            if (hoverFrame !== null && window.cancelAnimationFrame) {
                window.cancelAnimationFrame(hoverFrame);
                hoverFrame = null;
            }
            if (probe) {
                probe.hidden = true;
                probe.classList.remove('active');
            }
        }

        function pointerMapPosition(clientX, clientY) {
            var box = viewport.getBoundingClientRect();
            var screenX = clientX - box.left;
            var screenY = clientY - box.top;
            // Projection UNIQUE (computeMapRect) : identique au raster et aux
            // vecteurs → la sonde lit exactement ce qui est affiché.
            var mapRect = computeMapRect(box.width, box.height);
            var u = (screenX - mapRect.x) / mapRect.w;
            var v = (screenY - mapRect.y) / mapRect.h;
            if (u < 0 || u > 1 || v < 0 || v > 1) {
                return null;
            }
            return {
                screenX: screenX,
                screenY: screenY,
                u: u,
                v: v,
                width: box.width,
                height: box.height
            };
        }

        function updateProbe(clientX, clientY) {
            if (!probe || !probeValue || !probeLabel || !manifest ||
                    !currentWeatherImage) {
                hideProbe();
                return;
            }
            lastHover = { x: clientX, y: clientY };
            var position = pointerMapPosition(clientX, clientY);
            var layer = manifest.layers[currentLayer];
            if (!position || !layer) {
                probe.hidden = true;
                return;
            }
            var value = sampleProbe(currentProbe, position.u, position.v);
            var estimated = false;
            if (value === null) {
                value = samplePalette(position.u, position.v, layer);
                estimated = value !== null;
            }
            if (value === null || !Number.isFinite(value)) {
                probe.hidden = true;
                return;
            }
            var decimals = clamp(Number(layer.decimals) || 0, 0, 2);
            var formatted = Number(value).toLocaleString('fr-FR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            probeValue.textContent = (estimated ? '≈ ' : '') + formatted +
                (layer.unit ? ' ' + layer.unit : '');
            probeLabel.textContent = layer.label || currentLayer;
            probe.hidden = false;
            probe.classList.add('active');

            var tooltipWidth = probe.offsetWidth || 170;
            var tooltipHeight = probe.offsetHeight || 54;
            var left = position.screenX + 16;
            var top = position.screenY + 16;
            if (left + tooltipWidth > position.width - 8) {
                left = position.screenX - tooltipWidth - 16;
            }
            if (top + tooltipHeight > position.height - 8) {
                top = position.screenY - tooltipHeight - 16;
            }
            probe.style.left = Math.max(8, left) + 'px';
            probe.style.top = Math.max(8, top) + 'px';
        }

        var pinnedElement = null;

        function clearPinned() {
            if (pinnedElement && pinnedElement.parentNode) {
                pinnedElement.parentNode.removeChild(pinnedElement);
            }
            pinnedElement = null;
            pinnedPoint = null;
        }

        function positionPinned() {
            if (!pinnedElement || !pinnedPoint || !viewport) {
                return;
            }
            var box = viewport.getBoundingClientRect();
            // Projection UNIQUE (computeMapRect) : l'épingle reste collée au
            // point exact du raster, cohérente avec la sonde et l'affichage.
            var mapRect = computeMapRect(box.width, box.height);
            var screenX = mapRect.x + pinnedPoint.u * mapRect.w;
            var screenY = mapRect.y + pinnedPoint.v * mapRect.h;
            if (screenX < -40 || screenX > box.width + 40 || screenY < -40 || screenY > box.height + 40) {
                pinnedElement.style.display = 'none';
                return;
            }
            pinnedElement.style.display = '';
            var width = pinnedElement.offsetWidth || 170;
            var height = pinnedElement.offsetHeight || 54;
            var left = screenX + 14;
            var top = screenY - height - 14;
            if (left + width > box.width - 8) {
                left = screenX - width - 14;
            }
            if (top < 8) {
                top = screenY + 14;
            }
            pinnedElement.style.left = Math.max(8, Math.min(left, box.width - width - 8)) + 'px';
            pinnedElement.style.top = Math.max(8, Math.min(top, box.height - height - 8)) + 'px';
        }

        function pinProbeAt(clientX, clientY) {
            if (!manifest || !currentWeatherImage) {
                return;
            }
            var position = pointerMapPosition(clientX, clientY);
            var layer = manifest.layers[currentLayer];
            if (!position || !layer) {
                return;
            }
            var value = sampleProbe(currentProbe, position.u, position.v);
            var estimated = false;
            if (value === null) {
                value = samplePalette(position.u, position.v, layer);
                estimated = value !== null;
            }
            if (value === null || !Number.isFinite(value)) {
                return;
            }
            clearPinned();
            var decimals = clamp(Number(layer.decimals) || 0, 0, 2);
            var formatted = Number(value).toLocaleString('fr-FR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            pinnedElement = document.createElement('div');
            pinnedElement.className = 'amfm-probe amfm-probe-pinned';
            var strong = document.createElement('strong');
            strong.textContent = (estimated ? '≈ ' : '') + formatted + (layer.unit ? ' ' + layer.unit : '');
            var label = document.createElement('span');
            label.textContent = layer.label || currentLayer;
            var close = document.createElement('button');
            close.type = 'button';
            close.className = 'amfm-probe-pin-close';
            close.setAttribute('aria-label', 'Retirer l’épingle');
            close.textContent = '×';
            close.addEventListener('click', function (event) {
                event.stopPropagation();
                clearPinned();
            });
            pinnedElement.appendChild(strong);
            pinnedElement.appendChild(label);
            pinnedElement.appendChild(close);
            viewport.appendChild(pinnedElement);
            pinnedPoint = { u: position.u, v: position.v };
            positionPinned();
        }

        function screenToLatLon(clientX, clientY) {
            if (!manifest || !manifest.bounds) {
                return null;
            }
            var position = pointerMapPosition(clientX, clientY);
            if (!position) {
                return null;
            }
            var bounds = manifest.bounds;
            var west = Number(bounds.west);
            var east = Number(bounds.east);
            var northY = mercator(Number(bounds.north));
            var southY = mercator(Number(bounds.south));
            return {
                latitude: inverseMercator(northY - position.v * (northY - southY)),
                longitude: west + position.u * (east - west)
            };
        }

        function nearestPlace(latitude, longitude) {
            if (!placeBuckets.size) {
                return null;
            }
            var baseLat = Math.floor(latitude);
            var baseLon = Math.floor(longitude);
            var best = null;
            var bestDistance = Infinity;
            for (var dLat = -2; dLat <= 2; dLat += 1) {
                for (var dLon = -2; dLon <= 2; dLon += 1) {
                    var bucket = placeBuckets.get((baseLat + dLat) + '|' + (baseLon + dLon));
                    if (!bucket) {
                        continue;
                    }
                    for (var index = 0; index < bucket.length; index += 1) {
                        var place = bucket[index];
                        var placeLat = Number(place[2]);
                        var placeLon = Number(place[3]);
                        var dy = placeLat - latitude;
                        var dx = (placeLon - longitude) * Math.cos(latitude * Math.PI / 180);
                        var distance = dx * dx + dy * dy;
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            best = place;
                        }
                    }
                }
            }
            return best;
        }

        function setToolHint(message) {
            if (!toolHint) {
                return;
            }
            toolHint.textContent = message || '';
            toolHint.hidden = !message;
        }

        function setToolMode(mode) {
            toolMode = toolMode === mode ? null : mode;
            toolButtons.forEach(function (button) {
                var active = button.dataset.amfmTool === toolMode;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            if (advancedTools) {
                advancedTools.hidden = toolMode !== 'zoom';
            }
            if (toolMode !== 'zoom' && pinnedEnabled) {
                pinnedEnabled = false;
                if (pinButton) {
                    pinButton.setAttribute('aria-pressed', 'false');
                }
                clearPinned();
            }
            if (toolMode === 'diagram') {
                setToolHint('Cliquez sur la carte pour afficher le diagramme AROME du point choisi.');
            } else {
                setToolHint('');
                closeDiagram();
            }
        }

        // Scanne le masque France (2200×1640) et retourne le rectangle englobant
        // des pixels effectivement couverts (valeur > 0). Permet un cadrage
        // d'export qui ne montre JAMAIS de zone vide (coins du trapèze AROME,
        // mer, pays voisins non maillés) : le cadre suit la donnée réelle.
        var visibleBBoxCache = null;
        function computeVisibleBBox() {
            if (visibleBBoxCache) {
                return visibleBBoxCache;
            }
            if (!franceMaskImage || !franceMaskImage.complete || !franceMaskImage.naturalWidth) {
                return null;
            }
            var mw = franceMaskImage.naturalWidth;
            var mh = franceMaskImage.naturalHeight;
            if (mw < 2 || mh < 2) {
                return null;
            }
            try {
                var mc = document.createElement('canvas');
                mc.width = mw;
                mc.height = mh;
                var mctx = mc.getContext('2d', { willReadFrequently: true });
                if (!mctx) {
                    return null;
                }
                mctx.drawImage(franceMaskImage, 0, 0);
                var data = mctx.getImageData(0, 0, mw, mh).data;
                var x0 = mw, y0 = mh, x1 = -1, y1 = -1;
                // Balayage par pas de 2 puis affinage : 2200×1640 pixels = 3,6 M
                // de lectures, quelques dizaines de ms suffisent en pas de 2.
                for (var y = 0; y < mh; y += 2) {
                    var row = y * mw * 4;
                    for (var x = 0; x < mw; x += 2) {
                        if (data[row + x * 4 + 3] > 8) {
                            if (x < x0) x0 = x;
                            if (x > x1) x1 = x;
                            if (y < y0) y0 = y;
                            if (y > y1) y1 = y;
                        }
                    }
                }
                if (x1 < 0) {
                    return null;
                }
                // Affinage sur la bande de 1 px autour du bbox grossier.
                var xa = Math.max(0, x0 - 2), xb = Math.min(mw - 1, x1 + 2);
                var ya = Math.max(0, y0 - 2), yb = Math.min(mh - 1, y1 + 2);
                for (var yy = ya; yy <= yb; yy++) {
                    var rr = yy * mw * 4;
                    for (var xx = xa; xx <= xb; xx++) {
                        if (data[rr + xx * 4 + 3] > 8) {
                            if (xx < x0) x0 = xx;
                            if (xx > x1) x1 = xx;
                            if (yy < y0) y0 = yy;
                            if (yy > y1) y1 = yy;
                        }
                    }
                }
                visibleBBoxCache = { x0: x0, y0: y0, x1: x1, y1: y1 };
                return visibleBBoxCache;
            } catch (e) {
                return null;
            }
        }

        function composeCaptureCanvas() {
            if (!currentWeatherImage) {
                return null;
            }
            var vw = viewport.clientWidth;
            var vh = viewport.clientHeight;
            if (!vw || !vh) {
                return null;
            }

            // Dimensions HD format carré Météo-NPDC officiel (2000×2000)
            var outW = 2000;
            var outH = 2000;
            var topBannerH = 130;
            var bottomBannerH = 110;
            var mapAreaH = outH - topBannerH - bottomBannerH; // 1760 px

            var hScale, vScale, offX, offY;

            if (transform.scale <= 1.15) {
                // Cadrage boîte Météo-NPDC France entière :
                // (West: -5.8°, East: +10.2°, North: 51.6°, South: 41.1°)
                // 100% de la surface est modélisée par AROME (zéro zone grise)
                var fx0 = 270;  // Ouest Bretagne
                var fx1 = 1870; // Est Corse
                var fy0 = 125;  // Nord Mer du Nord / Sud Angleterre
                var fy1 = 1460; // Sud Bonifacio (Corse complète)
                var fw = fx1 - fx0; // 1600
                var fh = fy1 - fy0; // 1335
                var scale = Math.min(outW / fw, mapAreaH / fh);
                hScale = scale;
                vScale = scale; // Échelle strictement isotrope 1:1
                var cx = (fx0 + fx1) / 2; // 1070
                var cy = (fy0 + fy1) / 2; // 792.5
                offX = outW / 2 - cx * scale;
                offY = topBannerH + mapAreaH / 2 - cy * scale;
            } else {
                // Vue zoomée (région/département) : cadrée proprement dans la zone utile
                var viewRect = computeMapRect(vw, vh);
                var u0 = (0 - viewRect.x) / viewRect.w;
                var u1 = (vw - viewRect.x) / viewRect.w;
                var v0 = (0 - viewRect.y) / viewRect.h;
                var v1 = (vh - viewRect.y) / viewRect.h;
                var vueW = Math.max(0.01, u1 - u0);
                var vueH = Math.max(0.01, v1 - v0);
                var k = Math.min(outW / (vueW * 2200.0), mapAreaH / (vueH * 1640.0));
                hScale = k;
                vScale = k;
                var uc = (u0 + u1) / 2;
                var vc = (v0 + v1) / 2;
                offX = outW / 2 - uc * 2200.0 * k;
                offY = topBannerH + mapAreaH / 2 - vc * 1640.0 * k;
            }

            var output = document.createElement('canvas');
            output.width = outW;
            output.height = outH;
            var context = output.getContext('2d');

            // 1. Fond bleu nuit Météo-NPDC (#0b1626)
            context.fillStyle = '#0b1626';
            context.fillRect(0, 0, output.width, output.height);

            // 2. Zone cartographique avec clipping
            context.save();
            context.beginPath();
            context.rect(0, topBannerH, outW, mapAreaH);
            context.clip();

            // Fond de carte terres/mers
            if (fondImageElement && fondImageElement.complete && fondImageElement.naturalWidth) {
                context.save();
                context.transform(hScale, 0, 0, vScale, offX, offY);
                context.drawImage(fondImageElement, 0, 0);
                context.restore();
            } else {
                context.fillStyle = '#8fa3b8';
                context.fillRect(0, topBannerH, outW, mapAreaH);
            }

            // Dalle météo
            var weatherMasked = document.createElement('canvas');
            weatherMasked.width = output.width;
            weatherMasked.height = output.height;
            var weatherCtx = weatherMasked.getContext('2d');
            weatherCtx.save();
            weatherCtx.transform(hScale, 0, 0, vScale, offX, offY);
            weatherCtx.drawImage(currentWeatherImage, 0, 0);
            weatherCtx.restore();
            context.drawImage(weatherMasked, 0, 0);

            // Frontières vectorielles haute définition
            if (vectorDefinition && vectorDefinition.paths && vectorDefinition.paths.length) {
                context.save();
                context.transform(hScale, 0, 0, vScale, offX, offY);
                vectorDefinition.paths.forEach(function (entry) {
                    var fade = 1;
                    if (entry.kind === 'department') {
                        fade = transform.scale <= 3 ? 1 : Math.max(0.22, 1 - (transform.scale - 3) / 14);
                    } else if (entry.kind === 'region') {
                        fade = transform.scale <= 8 ? 1 : Math.max(0.35, 1 - (transform.scale - 8) / 20);
                    }
                    context.strokeStyle = entry.colour || '#1a1f26';
                    context.globalAlpha = (entry.opacity || 1) * fade;
                    context.lineCap = entry.lineCap || 'round';
                    context.lineJoin = entry.lineJoin || 'round';
                    context.lineWidth = (entry.width || 1.0) / hScale;
                    context.stroke(entry.path);
                });
                context.restore();
                context.globalAlpha = 1;
            }
            context.restore(); // Fin clip carte

            // ── 3. BANDEAU SUPÉRIEUR STYLE METEO-NPDC ──────────────────────────
            context.fillStyle = '#0a192f';
            context.fillRect(0, 0, outW, topBannerH);
            context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(0, topBannerH);
            context.lineTo(outW, topBannerH);
            context.stroke();

            var layer = manifest && manifest.layers && manifest.layers[currentLayer];
            var step = availableSteps()[currentStep];
            var prettyLabel = layer ? layer.label : '';
            var prettyUnit = layer && layer.unit ? layer.unit : '';
            if (typeof window.getLayerPalette === 'function') {
                try {
                    var prettyPal = window.getLayerPalette(currentLayer);
                    if (prettyPal) {
                        prettyLabel = prettyPal.label || prettyLabel;
                        prettyUnit = prettyPal.unit !== undefined ? prettyPal.unit : prettyUnit;
                    }
                } catch (e) {}
            }

            var dateStr = '';
            if (step) {
                try {
                    dateStr = validityFormat.format(new Date(step.valid_time)).replace(':', 'h');
                } catch (e) {
                    dateStr = new Date(step.valid_time).toLocaleDateString('fr-FR');
                }
            }

            // Titre du paramètre (grand, blanc gras)
            context.fillStyle = '#ffffff';
            context.font = '700 42px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            var mainTitle = prettyLabel + (prettyUnit ? ' (' + prettyUnit + ')' : '');
            context.fillText(mainTitle, 24, 38);

            // Cartouche d'échéance arrondi bleu roi
            var leadText = dateStr + (step ? ' (+' + String(step.lead_hour) + 'h)' : '');
            context.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            var leadW = context.measureText(leadText).width;
            var capH = 42;
            var capY = 68;
            context.fillStyle = '#15529a';
            context.beginPath();
            if (typeof context.roundRect === 'function') {
                context.roundRect(24, capY, leadW + 28, capH, 8);
            } else {
                context.rect(24, capY, leadW + 28, capH);
            }
            context.fill();
            context.strokeStyle = '#2b7fff';
            context.lineWidth = 1.5;
            context.stroke();

            context.fillStyle = '#ffffff';
            context.fillText(leadText, 38, capY + capH / 2 + 1);

            // À droite : Run et Modèle
            var runLabel = '';
            if (manifest && manifest.run_time) {
                try {
                    var rD = new Date(manifest.run_time);
                    var dayStr = String(rD.getUTCDate()).padStart(2, '0') + '/' + String(rD.getUTCMonth() + 1).padStart(2, '0');
                    var hourStr = String(rD.getUTCHours()).padStart(2, '0') + 'z';
                    runLabel = 'Run AROME ' + dayStr + ' ' + hourStr;
                } catch (e) {}
            }
            if (!runLabel) runLabel = 'AROME HD • Météo-Climat Pro';

            context.textAlign = 'right';
            context.fillStyle = '#c5d8f0';
            context.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            context.fillText(runLabel, outW - 24, 40);

            context.fillStyle = '#8bb4e8';
            context.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            context.fillText('Météo-Climat Pro', outW - 24, 88);

            // ── 4. BANDEAU INFÉRIEUR STYLE METEO-NPDC ──────────────────────────
            var botY = outH - bottomBannerH;
            context.fillStyle = '#0a192f';
            context.fillRect(0, botY, outW, bottomBannerH);
            context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(0, botY);
            context.lineTo(outW, botY);
            context.stroke();

            // Signature au centre au-dessus de la barre
            context.textAlign = 'center';
            context.fillStyle = '#ffffff';
            context.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            context.fillText('Météo-France • meteo-climat.pro', outW / 2, botY + 24);

            // Barre de légende colorimétrique Météo-NPDC
            if (layer && typeof window.getLayerPalette === 'function') {
                try {
                    var pal = window.getLayerPalette(currentLayer);
                    var stops = pal && pal.stops ? pal.stops : [];
                    if (stops.length) {
                        var legX = 24;
                        var legW = outW - 48;
                        var legBarY = botY + 42;
                        var legBarH = 22;

                        var low = (pal.transparent_below !== null && pal.transparent_below !== undefined) ?
                            pal.transparent_below : stops[0].value;
                        var max = stops[stops.length - 1].value;
                        var span = (max - low) || 1;

                        var grad = context.createLinearGradient(legX, 0, legX + legW, 0);
                        if (pal.transparent_below !== null && pal.transparent_below !== undefined) {
                            grad.addColorStop(0, 'rgba(0,0,0,0)');
                        }
                        stops.forEach(function (s) {
                            var pos = Math.max(0, Math.min(1, (Number(s.value) - low) / span));
                            grad.addColorStop(pos, s.color);
                        });
                        context.fillStyle = grad;
                        context.fillRect(legX, legBarY, legW, legBarH);
                        context.strokeStyle = '#000000';
                        context.lineWidth = 1;
                        context.strokeRect(legX, legBarY, legW, legBarH);

                        // Graduations chiffrées sous la barre
                        context.fillStyle = '#ffffff';
                        context.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                        context.textBaseline = 'top';

                        // Sélectionner 15 à 20 graduations bien réparties
                        var stepCount = Math.min(stops.length, 25);
                        var stepIdx = Math.max(1, Math.floor(stops.length / stepCount));
                        for (var i = 0; i < stops.length; i += stepIdx) {
                            var sVal = Number(stops[i].value);
                            var sPos = legX + Math.max(0, Math.min(1, (sVal - low) / span)) * legW;
                            var sText = Number.isInteger(sVal) ? String(sVal) : sVal.toFixed(1);
                            context.fillText(sText, sPos, legBarY + legBarH + 5);
                        }
                    }
                } catch (e) {}
            }
            // Villes sur la carte
            if (manifest && manifest.bounds && places.length) {
                try {
                    var bounds = manifest.bounds;
                    var northY = mercator(Number(bounds.north));
                    var southY = mercator(Number(bounds.south));
                    var longitudeSpan = Number(bounds.east) - Number(bounds.west);
                    var mercatorSpan = northY - southY;
                    if (longitudeSpan && mercatorSpan) {
                        var exportScale = hScale;
                        var popMin = exportScale < 1.35 ? 180000 : (exportScale < 2.25 ? 70000 : (exportScale < 3.75 ? 25000 : 5000));
                        var maxLabels = exportScale < 1.35 ? 25 : (exportScale < 2.25 ? 40 : 60);
                        context.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.lineJoin = 'round';
                        context.strokeStyle = 'rgba(8, 19, 28, 0.94)';
                        context.fillStyle = '#ffffff';
                        context.lineWidth = 4;
                        var occupied = [];
                        var drawn = 0;
                        for (var pi = 0; pi < places.length; pi += 1) {
                            var place = places[pi];
                            if (!Array.isArray(place) || place.length < 4) { continue; }
                            if (Number(place[1]) < popMin) { continue; }
                            var u = (Number(place[3]) - Number(bounds.west)) / longitudeSpan;
                            var v = (northY - mercator(Number(place[2]))) / mercatorSpan;
                            var sx = u * 2200 * hScale + offX;
                            var sy = v * 1640 * vScale + offY;
                            if (sx < 20 || sx > output.width - 20 || sy < topBannerH + 20 || sy > outH - bottomBannerH - 20) {
                                continue;
                            }
                            var text = String(place[0]);
                            var tw = context.measureText(text).width;
                            var rect = { left: sx - tw / 2 - 5, right: sx + tw / 2 + 5, top: sy - 14, bottom: sy + 14 };
                            var clash = false;
                            for (var oi = 0; oi < occupied.length; oi += 1) {
                                var other = occupied[oi];
                                if (rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top) {
                                    clash = true;
                                    break;
                                }
                            }
                            if (clash) { continue; }
                            occupied.push(rect);
                            context.strokeText(text, sx, sy);
                            context.fillText(text, sx, sy);
                            drawn += 1;
                            if (drawn >= maxLabels) { break; }
                        }
                    }
                } catch (e) {}
            }

            return output;
        }

        function captureImage(format) {
            format = format || 'png';
            var canvas = composeCaptureCanvas();
            if (!canvas || !canvas.toBlob) {
                setToolHint('Capture indisponible pour ce navigateur.');
                return;
            }
            var mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            var ext = format === 'jpeg' ? 'jpg' : 'png';
            canvas.toBlob(function (blob) {
                if (!blob) {
                    return;
                }
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                var layerLabel = manifest && manifest.layers && manifest.layers[currentLayer]
                    ? manifest.layers[currentLayer].label
                    : currentLayer;
                var slug = String(layerLabel || 'arome').toLowerCase()
                    .normalize('NFD').replace(/[̀-ͯ]/g, '')
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                link.href = url;
                link.download = 'MeteoClimatPro_' + (manifest ? manifest.model_name.replace(/[^a-zA-Z0-9]/g, '_') : 'AROME') + '_' + (slug || 'carte') + '_' + Date.now() + '.' + ext;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            }, mimeType, format === 'jpeg' ? 0.92 : undefined);
        }

        // ────────────────────────────────────────────────────────────────────
        // EXPORT GIF ANIMÉ PROFESSIONNEL (avec modal & sélection d'échéances)
        // ────────────────────────────────────────────────────────────────────
        var gifModal = app.querySelector('[data-amfm-gif-modal]');
        var gifModalClose = app.querySelector('[data-amfm-gif-close]');
        var gifCustomRangeDiv = app.querySelector('[data-amfm-gif-custom-range]');
        var gifStartSelect = app.querySelector('[data-amfm-gif-start]');
        var gifEndSelect = app.querySelector('[data-amfm-gif-end]');
        var gifProgressBox = app.querySelector('[data-amfm-gif-progress-box]');
        var gifPercentText = app.querySelector('[data-amfm-gif-percent]');
        var gifProgressBar = app.querySelector('[data-amfm-gif-bar]');
        var gifStatusText = app.querySelector('[data-amfm-gif-status-text]');
        var gifSubmitBtn = app.querySelector('[data-amfm-gif-submit]');

        function openGifModal() {
            var steps = availableSteps();
            if (!steps.length) {
                showError('Aucune échéance disponible pour le GIF.');
                return;
            }
            if (gifModal) {
                // Remplir les sélecteurs de plage personnalisée
                if (gifStartSelect && gifEndSelect) {
                    gifStartSelect.innerHTML = '';
                    gifEndSelect.innerHTML = '';
                    steps.forEach(function (step, i) {
                        var opt1 = document.createElement('option');
                        opt1.value = String(i);
                        opt1.textContent = 'H+' + String(step.lead_hour).padStart(2, '0');
                        gifStartSelect.appendChild(opt1);

                        var opt2 = document.createElement('option');
                        opt2.value = String(i);
                        opt2.textContent = 'H+' + String(step.lead_hour).padStart(2, '0');
                        if (i === steps.length - 1) opt2.selected = true;
                        gifEndSelect.appendChild(opt2);
                    });
                }
                if (gifProgressBox) gifProgressBox.style.display = 'none';
                if (gifSubmitBtn) {
                    gifSubmitBtn.disabled = false;
                    gifSubmitBtn.innerHTML = '<i class="fa-solid fa-download"></i> Lancer la Génération GIF';
                }
                gifModal.hidden = false;
            } else {
                startGifGeneration();
            }
        }

        if (gifModalClose) {
            gifModalClose.addEventListener('click', function () {
                if (gifModal) gifModal.hidden = true;
            });
        }
        if (gifModal) {
            gifModal.addEventListener('click', function (e) {
                if (e.target === gifModal) gifModal.hidden = true;
            });
            var rangeRadios = gifModal.querySelectorAll('input[name="gif-range"]');
            rangeRadios.forEach(function (radio) {
                radio.addEventListener('change', function () {
                    if (gifCustomRangeDiv) {
                        gifCustomRangeDiv.style.display = (radio.value === 'custom') ? 'flex' : 'none';
                    }
                });
            });
        }
        if (gifSubmitBtn) {
            gifSubmitBtn.addEventListener('click', function () {
                startGifGeneration();
            });
        }

        function startGifGeneration() {
            var allSteps = availableSteps();
            if (!allSteps.length) return;
            if (typeof window.GIF !== 'function') {
                showError('Bibliothèque gif.js non chargée.');
                return;
            }

            // Déterminer la plage d'échéances choisie
            var selectedRange = 'all';
            var checkedRange = gifModal ? gifModal.querySelector('input[name="gif-range"]:checked') : null;
            if (checkedRange) selectedRange = checkedRange.value;

            var filteredSteps = allSteps;
            if (selectedRange === '24h') {
                filteredSteps = allSteps.filter(function (s) { return Number(s.lead_hour) <= 24; });
            } else if (selectedRange === '48h') {
                filteredSteps = allSteps.filter(function (s) { return Number(s.lead_hour) <= 48; });
            } else if (selectedRange === 'custom') {
                var startIdx = gifStartSelect ? parseInt(gifStartSelect.value, 10) : 0;
                var endIdx = gifEndSelect ? parseInt(gifEndSelect.value, 10) : allSteps.length - 1;
                if (startIdx > endIdx) { var tmp = startIdx; startIdx = endIdx; endIdx = tmp; }
                filteredSteps = allSteps.slice(startIdx, endIdx + 1);
            }
            if (!filteredSteps.length) filteredSteps = allSteps;

            // Déterminer la vitesse
            var frameDelay = 1000;
            var checkedSpeed = gifModal ? gifModal.querySelector('input[name="gif-speed"]:checked') : null;
            if (checkedSpeed) frameDelay = parseInt(checkedSpeed.value, 10) || 1000;

            // Interface de progression
            if (gifProgressBox) gifProgressBox.style.display = 'block';
            if (gifSubmitBtn) {
                gifSubmitBtn.disabled = true;
                gifSubmitBtn.innerHTML = '<i class="fa-solid fa-hourglass-half fa-spin"></i> Génération en cours…';
            }
            if (captureGifButton) {
                captureGifButton.classList.add('is-loading');
                captureGifButton.innerHTML = '<i class="fa-solid fa-hourglass-half fa-spin"></i> <span>0%</span>';
            }

            // Calcul du CADRAGE EXACT sans bandes noires
            var gw = 760;
            var gh;
            var hScale, vScale, offX, offY;
            var vw = viewport.clientWidth;
            var vh = viewport.clientHeight;
            var layer = manifest && manifest.layers && manifest.layers[currentLayer];

            if (transform.scale <= 1.15) {
                // Cadrage France métropolitaine + Corse bord à bord (sans coin gris sud-est)
                var fx0 = 240;  // Ouest Bretagne / Atlantique
                var fx1 = 1860; // Est Alsace / Corse
                var fy0 = 130;  // Nord Dunkerque / Manche
                var fy1 = 1480; // Sud Corse / Méditerranée
                var fw = fx1 - fx0;
                var fh = fy1 - fy0;
                gh = Math.round(gw * fh / fw);
                hScale = gw / fw;
                vScale = gh / fh;
                offX = -fx0 * hScale;
                offY = -fy0 * vScale;
            } else {
                // Vue zoomée / région : reproduit fidèlement la portion visible à l'écran
                var viewRect = computeMapRect(vw, vh);
                var u0 = (0 - viewRect.x) / viewRect.w;
                var u1 = (vw - viewRect.x) / viewRect.w;
                var v0 = (0 - viewRect.y) / viewRect.h;
                var v1 = (vh - viewRect.y) / viewRect.h;
                var vueW = Math.max(0.01, u1 - u0);
                var vueH = Math.max(0.01, v1 - v0);
                gh = Math.round(gw * (vueH * 1640.0) / (vueW * 2200.0));
                hScale = gw / (vueW * 2200.0);
                vScale = gh / (vueH * 1640.0);
                offX = -u0 * 2200.0 * hScale;
                offY = -v0 * 1640.0 * vScale;
            }

            // Priorité villes pour la région choisie
            var prioritySet = null;
            try {
                var regionSelect = document.getElementById('select-region');
                var regionKey = regionSelect ? regionSelect.value : 'france';
                var REGION_KEY_MAP = {
                    france: 'france', hdf: 'hdf', normandie: 'normandie',
                    idf: 'ile-de-france', grandest: 'grand-est',
                    bretagne: 'bretagne', pdl: 'pdl', cvl: 'cvl',
                    bfc: 'bfc', naq: 'naq', ara: 'ara',
                    occitanie: 'occitanie', paca: 'paca', corse: 'corse'
                };
                var regDef = window.Europe1Regions &&
                    window.Europe1Regions[REGION_KEY_MAP[regionKey] || regionKey];
                if (regDef && regDef.cities && regDef.cities.length) {
                    prioritySet = new Set();
                    regDef.cities.forEach(function (city) {
                        var name = String(city.name || '').toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        if (name) prioritySet.add(name);
                    });
                }
            } catch (e) {}

            var gifOptions = {
                quality: 10,
                width: gw,
                height: gh,
                workers: 2,
                workerScript: 'js/gif.worker.js'
            };
            var gif = new window.GIF(gifOptions);
            var index = 0;

            function drawFrame(canvas, img, stepObj) {
                var ctx = canvas.getContext('2d');
                var leadHour = stepObj ? stepObj.lead_hour : 0;
                var validTime = stepObj ? stepObj.valid_time : null;

                // 1. Fond sombre & Fond de carte
                ctx.fillStyle = '#0b1220';
                ctx.fillRect(0, 0, gw, gh);
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, gw, gh);
                ctx.clip();
                if (fondImageElement && fondImageElement.complete && fondImageElement.naturalWidth) {
                    ctx.save();
                    ctx.transform(hScale, 0, 0, vScale, offX, offY);
                    ctx.drawImage(fondImageElement, 0, 0);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#a5a6b0';
                    ctx.fillRect(0, 0, gw, gh);
                }

                // 2. Dalle météo
                var weatherLayer = document.createElement('canvas');
                weatherLayer.width = gw;
                weatherLayer.height = gh;
                var wctx = weatherLayer.getContext('2d');
                wctx.save();
                wctx.transform(hScale, 0, 0, vScale, offX, offY);
                wctx.drawImage(img, 0, 0);
                wctx.restore();
                ctx.drawImage(weatherLayer, 0, 0);

                // 3. Frontières
                if (vectorDefinition && vectorDefinition.paths && vectorDefinition.paths.length) {
                    ctx.save();
                    ctx.transform(hScale, 0, 0, vScale, offX, offY);
                    vectorDefinition.paths.forEach(function (entry) {
                        var fade = 1;
                        if (entry.kind === 'department') {
                            fade = transform.scale <= 3 ? 1 :
                                Math.max(0.22, 1 - (transform.scale - 3) / 14);
                        } else if (entry.kind === 'region') {
                            fade = transform.scale <= 8 ? 1 :
                                Math.max(0.35, 1 - (transform.scale - 8) / 20);
                        }
                        ctx.strokeStyle = entry.colour;
                        ctx.globalAlpha = (entry.opacity || 1) * fade;
                        ctx.lineWidth = entry.width / hScale;
                        ctx.stroke(entry.path);
                    });
                    ctx.restore();
                }
                ctx.restore(); // Fin du clip

                // 4. Logo Météo-Climat Pro (calé en haut à droite à l'intérieur du cadre)
                var logoW = 95;
                var logoH = 28;
                if (logoImage && logoImage.complete && logoImage.naturalWidth) {
                    logoH = Math.round(logoW * logoImage.naturalHeight / logoImage.naturalWidth);
                    var lx = gw - 12 - logoW;
                    var ly = 12;
                    ctx.save();
                    ctx.fillStyle = 'rgba(7, 11, 20, 0.82)';
                    ctx.beginPath();
                    if (typeof ctx.roundRect === 'function') {
                        ctx.roundRect(lx - 6, ly - 4, logoW + 12, logoH + 8, 6);
                    } else {
                        ctx.rect(lx - 6, ly - 4, logoW + 12, logoH + 8);
                    }
                    ctx.fill();
                    ctx.drawImage(logoImage, lx, ly, logoW, logoH);
                    ctx.restore();
                }

                // 5. Cartouche Officiel (calé en haut à gauche à l'intérieur du cadre)
                var prettyLabel = layer ? layer.label : '';
                var prettyUnit = layer && layer.unit ? layer.unit : '';
                if (typeof window.getLayerPalette === 'function') {
                    try {
                        var prettyPal = window.getLayerPalette(currentLayer);
                        if (prettyPal) {
                            prettyLabel = prettyPal.label || prettyLabel;
                            prettyUnit = prettyPal.unit !== undefined ? prettyPal.unit : prettyUnit;
                        }
                    } catch (e) {}
                }
                var dateStr = '';
                if (validTime) {
                    try {
                        dateStr = validityFormat.format(new Date(validTime)).replace(':', 'h');
                    } catch (e) {
                        dateStr = new Date(validTime).toLocaleDateString('fr-FR');
                    }
                }
                var modelTitle = (manifest && manifest.model_name) ? manifest.model_name : 'AROME HD';
                var titleText = modelTitle + ' • ' + prettyLabel + (prettyUnit ? ' (' + prettyUnit + ')' : '');
                var dateText = dateStr + ' (H+' + String(leadHour).padStart(2, '0') + ')';

                var bMargin = 12;
                var bY = 12;
                var bH = 50;
                ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                var tW = ctx.measureText(titleText).width;
                ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                var dW = ctx.measureText(dateText).width;
                var bW = Math.min(gw - 120, Math.max(tW, dW) + 24);

                ctx.save();
                ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(bMargin, bY, bW, bH, 8);
                } else {
                    ctx.rect(bMargin, bY, bW, bH);
                }
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.fillText(titleText, bMargin + 10, bY + 20);

                ctx.fillStyle = '#00d2ff';
                ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.fillText(dateText + ' — Météo-Climat Pro', bMargin + 10, bY + 39);
                ctx.restore();

                // 6. Légende colorimétrique (calée en bas à l'intérieur du cadre)
                var legW = Math.min(340, gw - 40);
                var legH = 26;
                var legY = gh - 34;
                var legX = (gw - legW) / 2;
                if (layer && typeof window.getLayerPalette === 'function' && typeof window.paletteTicks === 'function') {
                    try {
                        ctx.save();
                        ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
                        ctx.beginPath();
                        if (typeof ctx.roundRect === 'function') {
                            ctx.roundRect(legX - 10, legY - 4, legW + 20, legH + 8, 8);
                        } else {
                            ctx.rect(legX - 10, legY - 4, legW + 20, legH + 8);
                        }
                        ctx.fill();

                        var pal = window.getLayerPalette(currentLayer);
                        var stops = pal && pal.stops ? pal.stops : [];
                        var low = (pal && pal.transparent_below !== null && pal.transparent_below !== undefined) ?
                            pal.transparent_below : (stops.length ? stops[0].value : 0);
                        var max = stops.length ? stops[stops.length - 1].value : 1;
                        var span = (max - low) || 1;
                        var grad = ctx.createLinearGradient(legX, 0, legX + legW, 0);
                        stops.forEach(function (s) {
                            var pos = Math.max(0, Math.min(1, (Number(s.value) - low) / span));
                            grad.addColorStop(pos, s.color);
                        });
                        ctx.fillStyle = grad;
                        ctx.fillRect(legX, legY + 2, legW, 9);
                        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(legX, legY + 2, legW, 9);

                        ctx.fillStyle = '#eaf1ff';
                        ctx.font = 'bold 9px sans-serif';
                        ctx.textAlign = 'center';
                        var ticks = window.paletteTicks(currentLayer);
                        ticks.forEach(function (tick, i) {
                            var tx = legX + (ticks.length > 1 ? i / (ticks.length - 1) : 0.5) * legW;
                            ctx.fillText(String(tick), tx, legY + 20);
                        });
                        ctx.restore();
                    } catch (e) {}
                }

                // 7. Villes sur chaque frame du GIF
                if (manifest && manifest.bounds && places && places.length && citiesVisible !== false) {
                    try {
                        var bounds = manifest.bounds;
                        var northY = mercator(Number(bounds.north));
                        var southY = mercator(Number(bounds.south));
                        var lonSpan = Number(bounds.east) - Number(bounds.west);
                        var latSpan = northY - southY;
                        if (lonSpan && latSpan) {
                            var expScale = hScale * (2200 / gw);
                            var popMin = expScale < 1.35 ? 200000 :
                                (expScale < 2.25 ? 80000 :
                                (expScale < 3.75 ? 30000 :
                                (expScale < 6 ? 8000 : 2000)));
                            var maxLabels = expScale < 1.35 ? 22 :
                                (expScale < 2.25 ? 32 : 45);

                            ctx.save();
                            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.strokeStyle = 'rgba(8, 19, 28, 0.94)';
                            ctx.fillStyle = '#ffffff';
                            ctx.lineWidth = 3;

                            var occupied = [];
                            occupied.push({ left: bMargin - 4, right: bMargin + bW + 4, top: bY - 4, bottom: bY + bH + 4 });
                            occupied.push({ left: gw - 12 - logoW - 6, right: gw, top: 4, bottom: 12 + logoH + 6 });
                            occupied.push({ left: legX - 12, right: legX + legW + 12, top: legY - 6, bottom: gh });

                            var orderedPlaces = places;
                            if (prioritySet && prioritySet.size) {
                                orderedPlaces = places.slice().sort(function (a, b) {
                                    var aP = prioritySet.has(String(a[0]).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
                                    var bP = prioritySet.has(String(b[0]).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
                                    if (aP !== bP) return aP ? -1 : 1;
                                    return Number(b[1]) - Number(a[1]);
                                });
                            }

                            var drawn = 0;
                            for (var pi = 0; pi < orderedPlaces.length; pi++) {
                                var pl = orderedPlaces[pi];
                                if (!Array.isArray(pl) || pl.length < 4) continue;
                                if (Number(pl[1]) < popMin) {
                                    var isP = prioritySet && prioritySet.has(String(pl[0]).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
                                    if (!isP) continue;
                                }
                                var u = (Number(pl[3]) - Number(bounds.west)) / lonSpan;
                                var v = (northY - mercator(Number(pl[2]))) / latSpan;
                                var sx = u * 2200 * hScale + offX;
                                var sy = v * 1640 * vScale + offY;
                                if (sx < 15 || sx > gw - 15 || sy < 15 || sy > gh - 15) continue;

                                var cityName = String(pl[0]);
                                var tw = ctx.measureText(cityName).width;
                                var rect = { left: sx - tw / 2 - 4, right: sx + tw / 2 + 4, top: sy - 8, bottom: sy + 8 };
                                var clash = false;
                                for (var oi = 0; oi < occupied.length; oi++) {
                                    var o = occupied[oi];
                                    if (rect.left < o.right && rect.right > o.left && rect.top < o.bottom && rect.bottom > o.top) {
                                        clash = true;
                                        break;
                                    }
                                }
                                if (clash) continue;
                                occupied.push(rect);
                                ctx.strokeText(cityName, sx, sy);
                                ctx.fillText(cityName, sx, sy);
                                drawn++;
                                if (drawn >= maxLabels) break;
                            }
                            ctx.restore();
                        }
                    } catch (e) {}
                }
            }

            function next() {
                if (index >= filteredSteps.length) {
                    if (gifStatusText) gifStatusText.innerHTML = '<i class="fa-solid fa-hourglass-half fa-spin"></i> Finalisation du fichier GIF…';
                    gif.render();
                    return;
                }
                var step = filteredSteps[index];
                var img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = gw;
                    canvas.height = gh;
                    drawFrame(canvas, img, step);
                    gif.addFrame(canvas, { copy: true, delay: frameDelay });
                    index += 1;
                    var pct = Math.round((index / filteredSteps.length) * 50);
                    if (gifProgressBar) gifProgressBar.style.width = pct + '%';
                    if (gifPercentText) gifPercentText.textContent = pct + '%';
                    if (captureGifButton) {
                        captureGifButton.innerHTML = '<i class="fa-solid fa-hourglass-half fa-spin"></i> <span>' + pct + '%</span>';
                    }
                    next();
                };
                img.onerror = function () {
                    index += 1;
                    next();
                };
                img.src = versioned(step.files[currentLayer]);
            }

            gif.on('progress', function (p) {
                var pct = 50 + Math.round(p * 50);
                if (gifProgressBar) gifProgressBar.style.width = pct + '%';
                if (gifPercentText) gifPercentText.textContent = pct + '%';
                if (captureGifButton) {
                    captureGifButton.innerHTML = '<i class="fa-solid fa-hourglass-half fa-spin"></i> <span>' + pct + '%</span>';
                }
            });
            gif.on('finished', function (blob) {
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                var slug = String(layer ? layer.label : 'animation').toLowerCase()
                    .normalize('NFD').replace(/[̀-ͯ]/g, '')
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                link.href = url;
                link.download = 'MeteoClimatPro_' + (manifest ? manifest.model_name.replace(/[^a-zA-Z0-9]/g, '_') : 'AROME') + '_' + (slug || 'animation') + '.gif';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);

                if (gifModal) gifModal.hidden = true;
                if (captureGifButton) {
                    captureGifButton.classList.remove('is-loading');
                    captureGifButton.innerHTML = '<i class="fa-solid fa-film"></i> <span>GIF</span>';
                }
                setToolHint('GIF généré avec succès !');
            });
            if (typeof gif.on === 'function') {
                gif.on('abort', function () {
                    if (captureGifButton) {
                        captureGifButton.classList.remove('is-loading');
                        captureGifButton.innerHTML = '<i class="fa-solid fa-film"></i> <span>GIF</span>';
                    }
                    setToolHint('Génération du GIF interrompue.');
                });
            }
            next();
        }

        function closeDiagram() {
            if (diagramPopup) {
                diagramPopup.hidden = true;
            }
            diagramLoadToken += 1;
        }

        function fetchDepartmentForDiagram(code) {
            if (departmentCache.has(code)) {
                return departmentCache.get(code);
            }
            var promise = fetchJson(baseUrl + '/departements/' + code + '.json')
                .catch(function (error) {
                    departmentCache.delete(code);
                    throw error;
                });
            departmentCache.set(code, promise);
            return promise;
        }

        function positionDiagramPopup(clientX, clientY) {
            if (!diagramPopup) {
                return;
            }
            var box = viewport.getBoundingClientRect();
            var left = clientX - box.left + 14;
            var top = clientY - box.top + 14;
            var width = diagramPopup.offsetWidth || 320;
            var height = diagramPopup.offsetHeight || 220;
            if (left + width > box.width - 8) {
                left = clientX - box.left - width - 14;
            }
            if (top + height > box.height - 8) {
                top = clientY - box.top - height - 14;
            }
            diagramPopup.style.left = Math.max(8, left) + 'px';
            diagramPopup.style.top = Math.max(8, top) + 'px';
        }

        function renderDiagramChart(name, forecastRows, columnIndex, pointIndex) {
            if (!diagramBody) {
                return;
            }
            diagramBody.replaceChildren();
            var temperatures = [];
            var rains = [];
            var hourLabels = [];
            forecastRows.slice(0, 30).forEach(function (row) {
                var values = row[1] && row[1][pointIndex];
                if (!values) {
                    return;
                }
                var date = new Date(row[0]);
                var tempIndex = columnIndex.temperature_c;
                var rainIndex = columnIndex.precipitation_mm;
                temperatures.push(typeof tempIndex === 'number' ? Number(values[tempIndex]) : null);
                rains.push(typeof rainIndex === 'number' ? Number(values[rainIndex]) : 0);
                hourLabels.push(String(date.getHours()).padStart(2, '0') + 'h');
            });
            var validTemps = temperatures.filter(function (value) { return Number.isFinite(value); });
            if (!validTemps.length) {
                diagramBody.appendChild(document.createTextNode('Aucune donnée exploitable pour ce point.'));
                return;
            }
            var width = 320;
            var height = 150;
            var margin = { left: 30, right: 10, top: 14, bottom: 20 };
            var innerWidth = width - margin.left - margin.right;
            var innerHeight = height - margin.top - margin.bottom;
            var minTemp = Math.min.apply(null, validTemps);
            var maxTemp = Math.max.apply(null, validTemps);
            if (minTemp === maxTemp) {
                minTemp -= 1;
                maxTemp += 1;
            }
            var maxRain = Math.max(1, Math.max.apply(null, rains.map(function (value) {
                return Number.isFinite(value) ? value : 0;
            })));
            var svgNs = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(svgNs, 'svg');
            svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
            svg.setAttribute('class', 'amfm-diagram-svg');
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', 'Diagramme AROME pour ' + name);
            var count = temperatures.length;
            var stepX = count > 1 ? innerWidth / (count - 1) : 0;

            rains.forEach(function (value, index) {
                if (!Number.isFinite(value) || value <= 0) {
                    return;
                }
                var barHeight = value / maxRain * innerHeight * 0.55;
                var rect = document.createElementNS(svgNs, 'rect');
                rect.setAttribute('x', (margin.left + index * stepX - stepX * 0.3).toFixed(1));
                rect.setAttribute('y', (margin.top + innerHeight - barHeight).toFixed(1));
                rect.setAttribute('width', Math.max(1.5, stepX * 0.6).toFixed(1));
                rect.setAttribute('height', barHeight.toFixed(1));
                rect.setAttribute('class', 'amfm-diagram-rain');
                svg.appendChild(rect);
            });

            var points = temperatures.map(function (value, index) {
                if (!Number.isFinite(value)) {
                    return null;
                }
                var x = margin.left + index * stepX;
                var y = margin.top + innerHeight * (maxTemp - value) / (maxTemp - minTemp);
                return x.toFixed(1) + ',' + y.toFixed(1);
            }).filter(Boolean);
            if (points.length > 1) {
                var polyline = document.createElementNS(svgNs, 'polyline');
                polyline.setAttribute('points', points.join(' '));
                polyline.setAttribute('class', 'amfm-diagram-temp');
                svg.appendChild(polyline);
            }

            [0, count - 1].forEach(function (index) {
                if (index < 0 || !hourLabels[index]) {
                    return;
                }
                var text = document.createElementNS(svgNs, 'text');
                text.setAttribute('x', (margin.left + index * stepX).toFixed(1));
                text.setAttribute('y', (height - 5).toFixed(1));
                text.setAttribute('text-anchor', index === 0 ? 'start' : 'end');
                text.setAttribute('class', 'amfm-diagram-axis');
                text.textContent = hourLabels[index];
                svg.appendChild(text);
            });

            [minTemp, maxTemp].forEach(function (value) {
                var y = margin.top + innerHeight * (maxTemp - value) / (maxTemp - minTemp);
                var text = document.createElementNS(svgNs, 'text');
                text.setAttribute('x', (margin.left - 4).toFixed(1));
                text.setAttribute('y', (y + 3).toFixed(1));
                text.setAttribute('text-anchor', 'end');
                text.setAttribute('class', 'amfm-diagram-axis');
                text.textContent = Math.round(value) + '°';
                svg.appendChild(text);
            });

            diagramBody.appendChild(svg);
            var caption = document.createElement('p');
            caption.className = 'amfm-diagram-caption';
            caption.textContent = 'Température (ligne) et précipitations horaires (barres) — prochaines échéances AROME.';
            diagramBody.appendChild(caption);
        }

        function openDiagramAt(clientX, clientY) {
            var point = screenToLatLon(clientX, clientY);
            if (!point || !diagramPopup) {
                return;
            }
            var place = nearestPlace(point.latitude, point.longitude);
            if (!place || place.length < 6) {
                setToolHint('Aucune commune identifiée à cet endroit — essayez un point plus proche d’une ville.');
                return;
            }
            setToolHint('Cliquez sur la carte pour afficher le diagramme AROME du point choisi.');
            var name = String(place[0]);
            var communeCode = String(place[4]);
            var departmentCode = String(place[5]);
            var token = ++diagramLoadToken;
            diagramTitle.textContent = name;
            diagramPopup.hidden = false;
            diagramBody.replaceChildren();
            if (diagramStatus) {
                diagramStatus.hidden = false;
                diagramStatus.textContent = 'Chargement du diagramme…';
                diagramBody.appendChild(diagramStatus);
            }
            positionDiagramPopup(clientX, clientY);
            fetchDepartmentForDiagram(departmentCode)
                .then(function (departmentData) {
                    if (token !== diagramLoadToken) {
                        return;
                    }
                    var communes = departmentData.communes || [];
                    var commune = null;
                    for (var index = 0; index < communes.length; index += 1) {
                        if (String(communes[index][0]) === communeCode) {
                            commune = communes[index];
                            break;
                        }
                    }
                    if (!commune) {
                        diagramBody.replaceChildren(document.createTextNode('Commune introuvable dans les données du département.'));
                        return;
                    }
                    var columns = departmentData.columns && Array.isArray(departmentData.columns.values)
                        ? departmentData.columns.values
                        : [];
                    var columnIndex = {};
                    columns.forEach(function (columnName, columnPosition) {
                        columnIndex[columnName] = columnPosition;
                    });
                    var pointIndex = Number(commune[6]);
                    var lowerTime = Date.now() - 3600000;
                    var forecastRows = (departmentData.forecast || []).filter(function (step) {
                        return Array.isArray(step) && new Date(step[0]).getTime() >= lowerTime;
                    });
                    renderDiagramChart(name, forecastRows, columnIndex, pointIndex);
                    positionDiagramPopup(clientX, clientY);
                })
                .catch(function () {
                    if (token !== diagramLoadToken) {
                        return;
                    }
                    diagramBody.replaceChildren(document.createTextNode('Impossible de charger ce diagramme pour le moment.'));
                });
        }

        function availableSteps() {
            if (!manifest || !Array.isArray(manifest.steps)) {
                return [];
            }
            return manifest.steps.filter(function (step) {
                return step && step.files && step.files[currentLayer] && Number(step.lead_hour) >= 1;
            });
        }

        function initialStep(steps) {
            var threshold = Date.now() - 60 * 60 * 1000;
            for (var index = 0; index < steps.length; index += 1) {
                if (new Date(steps[index].valid_time).getTime() >= threshold) {
                    return index;
                }
            }
            return 0;
        }

        function setMenuOpen(open) {
            layerMenu.hidden = !open;
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            app.classList.toggle('is-layer-menu-open', open);
        }

        function refreshLayerMenu() {
            if (!manifest || !manifest.layers) return;
            var current = manifest.layers[currentLayer];
            if (currentLayerText) {
                currentLayerText.textContent = current ? current.label : 'Choisir une carte';
            }
            if (layerGrid) {
                layerGrid.querySelectorAll('[data-amfm-layer-key]').forEach(function (button) {
                    var active = button.dataset.amfmLayerKey === currentLayer;
                    button.classList.toggle('is-active', active);
                    button.setAttribute('aria-pressed', active ? 'true' : 'false');
                });
            }
        }

        function buildLayerMenu() {
            if (!layerGrid || !manifest || !manifest.layers) return;
            var groupOrder = [
                'Températures',
                'Précipitations',
                'Vent',
                'Nuages et humidité',
                'Pression et géopotentiel',
                'Instabilité',
                'Relief',
                'Autres'
            ];
            var grouped = {};
            if (typeof layerGrid.replaceChildren === 'function') {
                layerGrid.replaceChildren();
            } else {
                layerGrid.innerHTML = '';
            }
            Object.keys(manifest.layers || {}).forEach(function (key) {
                var layer = manifest.layers[key];
                var group = layer.group || 'Autres';
                if (!grouped[group]) {
                    grouped[group] = [];
                }
                grouped[group].push({ key: key, layer: layer });
            });
            if (!manifest.layers[currentLayer]) {
                currentLayer = Object.keys(manifest.layers || {})[0] || '';
            }
            groupOrder.forEach(function (group) {
                if (!grouped[group] || !grouped[group].length) {
                    return;
                }
                var section = document.createElement('section');
                section.className = 'amfm-layer-group';
                var title = document.createElement('h3');
                title.textContent = group;
                section.appendChild(title);
                grouped[group].forEach(function (entry) {
                    var button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'amfm-layer-option';
                    button.dataset.amfmLayerKey = entry.key;
                    button.setAttribute('aria-pressed', 'false');
                    var label = document.createElement('span');
                    label.textContent = entry.layer.label || entry.key;
                    var dot = document.createElement('i');
                    dot.setAttribute('aria-hidden', 'true');
                    button.appendChild(label);
                    button.appendChild(dot);
                    button.addEventListener('click', function () {
                        setLayer(entry.key);
                        if (window.matchMedia && window.matchMedia('(max-width: 760px)').matches) {
                            setMenuOpen(false);
                        }
                    });
                    section.appendChild(button);
                });
                layerGrid.appendChild(section);
            });
            refreshLayerMenu();
        }

        function applyPaletteStops() {
            if (!manifest || !manifest.layers || typeof window.getLayerPalette !== 'function') {
                return;
            }
            Object.keys(manifest.layers).forEach(function (key) {
                var layer = manifest.layers[key];
                var pal = window.getLayerPalette(key);
                if (!layer.stops || !layer.stops.length) {
                    layer.stops = pal.stops;
                }
                if (layer.transparent_below === undefined || layer.transparent_below === null) {
                    layer.transparent_below = pal.transparent_below;
                }
                if (!layer.unit && pal.unit) {
                    layer.unit = pal.unit;
                }
                if (layer.decimals === undefined || layer.decimals === null) {
                    layer.decimals = pal.decimals;
                }
                if (!layer.label && pal.label) {
                    layer.label = pal.label;
                }
            });
        }

        function buildLegend() {
            if (!legend || !manifest || !manifest.layers) return;
            var layer = manifest.layers[currentLayer];
            var labelEl = app.querySelector('[data-amfm-legend-label]');
            var unitEl = app.querySelector('[data-amfm-legend-unit]');
            var barEl = app.querySelector('[data-amfm-legend-bar]');
            var ticksEl = app.querySelector('[data-amfm-legend-ticks]');

            if (labelEl && layer) labelEl.textContent = layer.label || 'Échelle';
            if (unitEl && layer) unitEl.textContent = layer.unit || '';

            if (barEl && typeof window.paletteGradientCSS === 'function') {
                barEl.style.background = window.paletteGradientCSS(currentLayer);
            }
            if (ticksEl && typeof window.paletteTicks === 'function') {
                ticksEl.innerHTML = window.paletteTicks(currentLayer).map(function (t) {
                    return '<span>' + t + '</span>';
                }).join('');
            }
        }

        function preloadNeighbour(steps, index) {
            var offsets = [-1, 1];
            if (index === steps.length - 1) offsets.push(-(steps.length - 1));
            if (index === 0) offsets.push(steps.length - 1);
            offsets.forEach(function (offset) {
                var targetIdx = (index + offset + steps.length) % steps.length;
                var neighbour = steps[targetIdx];
                if (!neighbour || !neighbour.files[currentLayer]) {
                    return;
                }
                var preload = new Image();
                preload.crossOrigin = 'anonymous';
                preload.src = versioned(neighbour.files[currentLayer]);
            });
        }

        function renderStep(index) {
            var steps = availableSteps();
            if (!steps.length) {
                showError('Aucune carte disponible pour ce paramètre.');
                return;
            }
            currentStep = clamp(index, 0, steps.length - 1);
            if (slider) {
                slider.max = String(steps.length - 1);
                slider.value = String(currentStep);
            }
            updateUrl();
            if (previousButton) previousButton.disabled = currentStep === 0;
            if (nextButton) nextButton.disabled = currentStep === steps.length - 1;

            var step = steps[currentStep];
            var date = new Date(step.valid_time);
            var dateFormatted = '';
            try {
                dateFormatted = validityFormat.format(date).replace(':', 'h');
            } catch (e) {
                dateFormatted = date.toLocaleTimeString('fr-FR');
            }
            if (validity) validity.textContent = dateFormatted;
            var leadStr = 'H+' + String(step.lead_hour).padStart(2, '0');
            var dayOffset = Math.floor(step.lead_hour / 24);
            if (dayOffset >= 1) {
                leadStr = 'J+' + dayOffset + ' (' + leadStr + ')';
            }
            if (lead) lead.textContent = leadStr;
            var layer = manifest.layers[currentLayer];
            if (viewport) {
                viewport.setAttribute(
                    'aria-label',
                    (layer ? layer.label : 'Carte météo') + ' — ' + dateFormatted
                );
            }
            if (mapTitle) {
                mapTitle.textContent = (layer ? layer.label : 'Carte Météo') +
                    (layer && layer.unit ? ' (' + layer.unit + ')' : '');
            }
            if (mapDate) {
                mapDate.textContent = dateFormatted + ' (' + leadStr + ')';
            }
            // Ligne d'en-tête en haut à gauche : paramètre + échéance (comme météociel)
            var headline = app.querySelector('[data-amfm-headline]');
            if (headline) {
                var layerName = layer ? layer.label : currentLayer;
                var runLabel = '';
                try {
                    runLabel = runFormat.format(new Date(step.valid_time)).replace(':', 'h');
                } catch (e) {
                    runLabel = dateFormatted;
                }
                headline.innerHTML = '';
                var layerSpan = document.createElement('span');
                layerSpan.className = 'amfm-headline-layer';
                layerSpan.textContent = layerName +
                    (layer && layer.unit ? ' (' + layer.unit + ')' : '') + ' — ';
                headline.appendChild(layerSpan);
                headline.appendChild(document.createTextNode(runLabel + ' ' + leadStr));
            }

            clearError();
            if (loading) loading.hidden = false;
            hideProbe();
            var token = ++loadToken;
            var nextSource = versioned(step.files[currentLayer]);
            loadProbe(step);
            var loader = new Image();
            loader.crossOrigin = 'anonymous';
            loader.onload = function () {
                if (token !== loadToken) {
                    return;
                }
                uploadWeatherImage(loader);
                prepareImageSampler(loader);
                if (loading) loading.hidden = true;
                preloadNeighbour(steps, currentStep);
            };
            loader.onerror = function () {
                if (token === loadToken) {
                    if (loading) loading.hidden = true;
                    showError('Cette carte n’est pas encore disponible. Réessayez dans quelques instants.');
                }
            };
            loader.src = nextSource;
        }

        
        window.addEventListener('layerchange', function (e) {
            if (e.detail && e.detail.layer) {
                setLayer(e.detail.layer);
            }
        });

        // Centre vertical du viewport — le header flotte par-dessus la carte
        // (translucide), donc tous les zooms/pans/focus s'expriment par
        // rapport au centre de l'écran.
        function mapCenterY(height) {
            return (height || viewport.clientHeight) / 2;
        }

        function focusOnPoint(u, v, scale) {
            var w = viewport.clientWidth;
            var h = viewport.clientHeight;
            var s = (w / h) > (2200.0 / 1640.0) ?
                (w / 2200.0) : (h / 1640.0);
            var targetScale = clamp(scale || 1, 1, maxScale);
            transform.scale = targetScale;
            // Projection UNIQUE (même base que computeMapRect) : le point
            // (u,v) du raster se retrouve au centre du viewport.
            transform.x = 2200.0 * s * targetScale * (0.5 - u);
            transform.y = 1640.0 * s * targetScale * (0.5 - v);
            applyTransform();
        }

        var regionSelect = app.querySelector('[data-amfm-region-select]');
        if (regionSelect) {
            // Configuration précise et calibrée de chaque région :
            // centres réels et niveaux de zoom optimaux pour afficher
            // la région ENTIÈRE dans le viewport sans excès de zoom.
            var REGION_CONFIG = {
                france: { reset: true },
                hdf: { latitude: 50.15, longitude: 2.80, scale: 2.15 },
                normandie: { latitude: 49.15, longitude: 0.20, scale: 2.25 },
                idf: { latitude: 48.70, longitude: 2.50, scale: 2.80 },
                grandest: { latitude: 48.70, longitude: 5.80, scale: 1.85 },
                bretagne: { latitude: 48.15, longitude: -2.80, scale: 2.25 },
                pdl: { latitude: 47.50, longitude: -0.60, scale: 2.10 },
                cvl: { latitude: 47.50, longitude: 1.80, scale: 2.10 },
                bfc: { latitude: 47.20, longitude: 5.00, scale: 1.95 },
                naq: { latitude: 45.30, longitude: 0.20, scale: 1.75 },
                ara: { latitude: 45.50, longitude: 4.80, scale: 1.75 },
                occitanie: { latitude: 43.60, longitude: 2.30, scale: 1.85 },
                paca: { latitude: 43.85, longitude: 6.10, scale: 2.15 },
                corse: { latitude: 42.15, longitude: 9.10, scale: 2.85 },
                belgique: { latitude: 50.50, longitude: 4.40, scale: 2.40 }
            };

            regionSelect.addEventListener('change', function (e) {
                var val = e.target.value || 'france';
                var cfg = REGION_CONFIG[val];
                if (val === 'france' || (cfg && cfg.reset)) {
                    resetView();
                    updateUrl();
                    return;
                }
                if (cfg && cfg.latitude !== undefined) {
                    focusLocation({
                        latitude: cfg.latitude,
                        longitude: cfg.longitude,
                        scale: cfg.scale
                    });
                } else {
                    resetView();
                }
                updateUrl();
            });
        }

        // Raccordement direct et robuste des menus déroulants
        var layerSelect = document.getElementById('direct-layer-select');
        if (layerSelect) {
            layerSelect.addEventListener('change', function(e) {
                setLayer(e.target.value);
            });
        }

        function switchModel(modelKey) {
            var modelMap = {
                arome: { path: 'output/arome', name: 'AROME HD', badge: '1,3 KM' },
                arpege: { path: 'output/arpege', name: 'ARPEGE Europe', badge: '5 KM' },
                icon: { path: 'output/icon', name: 'ICON-EU', badge: '7 KM' },
                gfs: { path: 'output/gfs', name: 'GFS Monde', badge: '13 KM' },
                ecmwf: { path: 'output/ecmwf', name: 'ECMWF IFS', badge: '9 KM' }
            };
            var target = modelMap[modelKey] || modelMap.arome;
            var prevBaseUrl = baseUrl;
            baseUrl = target.path;
            app.dataset.baseUrl = target.path;
            app.dataset.model = modelKey;

            var titleSpan = document.querySelector('.amfm-title span');
            if (titleSpan) {
                titleSpan.textContent = 'MODÈLE ' + target.name;
            }
            var badge = document.querySelector('.amfm-title .amfm-badge');
            if (badge) {
                badge.textContent = target.badge;
            }

            fetchJson(baseUrl + '/maps/index.json')
                .then(function(payload) {
                    if (!payload || !payload.layers || !Array.isArray(payload.steps)) {
                        throw new Error('manifeste invalide');
                    }
                    manifest = payload;
                    applyPaletteStops();
                    currentStep = 0;
                    if (!manifest.layers[currentLayer]) {
                        currentLayer = Object.keys(manifest.layers)[0] || 'temperature';
                        var dSel = document.getElementById('direct-layer-select');
                        if (dSel) dSel.value = currentLayer;
                    }
                    if (typeof buildLayerMenu === 'function') buildLayerMenu();
                    buildLegend();
                    currentModel = modelKey;
                    renderStep(0);
                    updateUrl();
                })
                .catch(function () {
                    // Revert — ne jamais afficher les images d'un autre modèle
                    // sous une baseUrl cassée.
                    baseUrl = prevBaseUrl;
                    app.dataset.baseUrl = prevBaseUrl;
                    app.dataset.model = 'arome';
                    if (titleSpan) titleSpan.textContent = 'MODÈLE AROME HD';
                    if (badge) badge.textContent = '1,3 KM';
                    var modelSel = document.getElementById('select-model');
                    if (modelSel) modelSel.value = 'arome';
                    showError('Modèle ' + target.name + ' non encore disponible — génération en cours.');
                    window.setTimeout(function() { clearError(); }, 4000);
                });
        }

        var modelSelect = document.getElementById('select-model');
        if (modelSelect) {
            modelSelect.addEventListener('change', function(e) {
                switchModel(e.target.value);
            });
        }

        // ponytail: duplicate regionSelect removed (handled above via focusOnPoint)

        function setLayer(layer) {
            if (!manifest || !manifest.layers[layer]) {
                return;
            }
            currentLayer = layer;
            var dSel = document.getElementById('direct-layer-select');
            if (dSel && dSel.value !== layer) {
                dSel.value = layer;
            }
            refreshLayerMenu();
            buildLegend();
            var steps = availableSteps();
            currentStep = clamp(currentStep, 0, Math.max(0, steps.length - 1));
            renderStep(currentStep);
        }

        // ── État dans l'URL (style meteo-npdc.fr) ─────────────────────────────
        function updateUrl() {
            if (!window.history || !window.history.replaceState) {
                return;
            }
            var params = new URLSearchParams();
            params.set('model', currentModel);
            params.set('parametre', currentLayer);
            var regSel = document.getElementById('select-region');
            if (regSel) params.set('region', regSel.value);
            params.set('heure', String(currentStep));
            window.history.replaceState(null, '', window.location.pathname + '?' + params.toString());
        }

        function applyUrlParams() {
            var params = new URLSearchParams(window.location.search);
            var p = params.get('parametre') || params.get('layer');
            if (p && manifest && manifest.layers[p]) {
                setLayer(p);
            }
            var reg = params.get('region');
            if (reg) {
                var regSel = document.getElementById('select-region');
                if (regSel && regSel.querySelector('option[value="' + reg + '"]')) {
                    regSel.value = reg;
                    regSel.dispatchEvent(new Event('change'));
                }
            }
            var heure = parseInt(params.get('heure'), 10);
            if (!isNaN(heure)) {
                var steps = availableSteps();
                if (heure >= 0 && heure < steps.length) {
                    renderStep(heure);
                }
            }
        }

        function stopAnimation() {
            if (timer !== null) {
                window.clearInterval(timer);
                timer = null;
            }
            playButton.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';
            playButton.setAttribute('aria-label', 'Lancer l’animation');
            playButton.title = 'Lancer l’animation';
            playButton.classList.remove('is-playing');
        }

        function toggleAnimation() {
            if (timer !== null) {
                stopAnimation();
                return;
            }
            var steps = availableSteps();
            if (steps.length < 2) {
                return;
            }
            playButton.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
            playButton.setAttribute('aria-label', 'Arrêter l’animation');
            playButton.title = 'Arrêter l’animation';
            playButton.classList.add('is-playing');
            timer = window.setInterval(function () {
                var next = currentStep + 1;
                if (next >= availableSteps().length) {
                    next = 0;
                }
                renderStep(next);
            }, 1050);
        }

        function resizeCanvas(canvas, width, height, pixelRatio) {
            if (!canvas) {
                return false;
            }
            var canvasWidth = Math.max(1, Math.round(width * pixelRatio));
            var canvasHeight = Math.max(1, Math.round(height * pixelRatio));
            if (canvas.width === canvasWidth && canvas.height === canvasHeight) {
                return false;
            }
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            return true;
        }

        function compileShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        function initialiseWebgl() {
            if (!weatherCanvas) {
                return null;
            }
            var gl = weatherCanvas.getContext('webgl', {
                alpha: false,
                antialias: false,
                depth: false,
                preserveDrawingBuffer: false
            });
            if (!gl) {
                return null;
            }
            var vertexShader = compileShader(gl, gl.VERTEX_SHADER,
                'attribute vec2 aPosition;\n' +
                'attribute vec2 aUv;\n' +
                'varying vec2 vUv;\n' +
                'void main(){vUv=aUv;gl_Position=vec4(aPosition,0.0,1.0);}'
            );
            var fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER,
                'precision mediump float;\n' +
                'varying vec2 vUv;\n' +
                'uniform sampler2D uWeather;\n' +
                'uniform sampler2D uMask;\n' +
                'uniform sampler2D uFond;\n' +
                'uniform vec2 uViewport;\n' +
                'uniform vec4 uRect;\n' +
                'uniform float uHasWeather;\n' +
                'uniform float uHasMask;\n' +
                'uniform float uHasFond;\n' +
                'void main(){\n' +
                ' vec3 frame=vec3(0.043,0.055,0.086);\n' +
                // Projection UNIQUE (identique aux vecteurs/probes/export) :
                // le raster 2200×1640 occupe le rectangle uRect (px écran).
                ' vec2 uv=(vUv*uViewport-uRect.xy)/uRect.zw;\n' +
                ' if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){\n' +
                '  gl_FragColor=vec4(frame,1.0);return;\n' +
                ' }\n' +
                // Masquage net du coin hors-domaine AROME (sud-est Adriatique / Balkans)
                ' if(uv.x>0.94 && uv.y>0.63 && (uv.x + 0.096*uv.y >= 1.052)){\n' +
                '  gl_FragColor=vec4(frame,1.0);return;\n' +
                ' }\n' +
                // Fond : carte des pays (fond.webp) si dispo, sinon gris neutre
                ' vec3 base=vec3(0.6471,0.6510,0.6902);\n' +
                ' if(uHasFond>0.5){\n' +
                '  base=texture2D(uFond,uv).rgb;\n' +
                ' } else if(uHasMask>0.5){\n' +
                '  base=mix(vec3(0.6471,0.6510,0.6902),vec3(0.76,0.78,0.81),texture2D(uMask,uv).r);\n' +
                ' }\n' +
                ' if(uHasWeather<0.5){\n' +
                '  gl_FragColor=vec4(base,1.0);return;\n' +
                ' }\n' +
                ' vec4 weather=texture2D(uWeather,uv);\n' +
                ' float alpha=weather.a;\n' +
                ' gl_FragColor=vec4(mix(base,weather.rgb,alpha),1.0);\n' +
                '}'
            );
            if (!vertexShader || !fragmentShader) {
                return null;
            }
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                return null;
            }
            gl.useProgram(program);
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, 1, 0, 0,
                -1, -1, 0, 1,
                1, 1, 1, 0,
                1, -1, 1, 1
            ]), gl.STATIC_DRAW);
            var position = gl.getAttribLocation(program, 'aPosition');
            var uv = gl.getAttribLocation(program, 'aUv');
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(uv);
            gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8);

            var texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.uniform1i(gl.getUniformLocation(program, 'uWeather'), 0);

            var maskTexture = gl.createTexture();
            var maskImage = new Image();
            maskImage.src = resolvePath('maps/mask_france.png');
            maskImage.onload = function() {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, maskTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskImage);
                webgl.maskReady = true;
                scheduleRender();
            };

            // Fond de carte (pays voisins inclus) — fond.webp
            var fondTexture = gl.createTexture();
            var fondImage = new Image();
            fondImage.crossOrigin = 'anonymous';
            fondImage.src = resolvePath('maps/fond.webp');
            fondImage.onload = function() {
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, fondTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, fondImage);
                webgl.fondReady = true;
                scheduleRender();
            };

            return {
                gl: gl,
                program: program,
                texture: texture,
                maskTexture: maskTexture,
                fondTexture: fondTexture,
                viewportSize: gl.getUniformLocation(program, 'uViewport'),
                mapRect: gl.getUniformLocation(program, 'uRect'),
                hasWeather: gl.getUniformLocation(program, 'uHasWeather'),
                maskSampler: gl.getUniformLocation(program, 'uMask'),
                useMask: gl.getUniformLocation(program, 'uUseMask'),
                fondSampler: gl.getUniformLocation(program, 'uFond'),
                useFond: gl.getUniformLocation(program, 'uHasFond'),
                ready: false,
                maskReady: false,
                fondReady: false
            };
        }

        function uploadWeatherImage(source) {
            currentWeatherImage = source;
            if (!webgl) {
                scheduleRender();
                return;
            }
            var gl = webgl.gl;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, webgl.texture);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                source
            );
            webgl.ready = true;
            scheduleRender();
        }

        function drawWeather(width, height, pixelRatio) {
            if (!weatherCanvas) {
                return;
            }
            resizeCanvas(weatherCanvas, width, height, pixelRatio);
            if (webgl) {
                var gl = webgl.gl;
                gl.viewport(0, 0, weatherCanvas.width, weatherCanvas.height);
                gl.useProgram(webgl.program);
                // Projection UNIQUE (computeMapRect) : identique aux vecteurs,
                // labels, probes, GIF et export → aucun désalignement possible.
                var mapRect = computeMapRect(width, height);
                gl.uniform2f(webgl.viewportSize, width, height);
                gl.uniform4f(webgl.mapRect, mapRect.x, mapRect.y, mapRect.w, mapRect.h);
                gl.uniform1f(webgl.hasWeather, webgl.ready ? 1 : 0);
                gl.uniform1i(webgl.maskSampler, 1);
                gl.uniform1f(webgl.useMask, webgl.maskReady ? 1 : 0);
                gl.uniform1i(webgl.fondSampler, 2);
                gl.uniform1f(webgl.useFond, webgl.fondReady ? 1 : 0);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                return;
            }
            if (!fallbackContext) {
                fallbackContext = weatherCanvas.getContext('2d');
            }
            if (!fallbackContext) {
                return;
            }
            fallbackContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            // Cadre sombre autour du domaine (le fond clair n'existe que dans la carte)
            fallbackContext.fillStyle = '#0b1220';
            fallbackContext.fillRect(0, 0, width, height);
            if (!currentWeatherImage) {
                return;
            }
            // Projection UNIQUE (computeMapRect) — mêmes coordonnées que le
            // WebGL, les vecteurs, les labels et les probes.
            var mapRect = computeMapRect(width, height);
            var mrx = mapRect.x;
            var mry = mapRect.y;
            var mrw = mapRect.w;
            var mrh = mapRect.h;
            fallbackContext.imageSmoothingEnabled = true;
            fallbackContext.imageSmoothingQuality = 'high';
            // Fond de carte (pays voisins inclus) si chargé, sinon gris neutre
            if (fondImageElement && fondImageElement.complete && fondImageElement.naturalWidth) {
                fallbackContext.drawImage(fondImageElement, mrx, mry, mrw, mrh);
            } else {
                fallbackContext.fillStyle = '#a5a6b0';
                fallbackContext.fillRect(mrx, mry, mrw, mrh);
            }
            // Dalle météo : maillage AROME alpha-composité sur le fond
            var weatherLayer = document.createElement('canvas');
            weatherLayer.width = width;
            weatherLayer.height = height;
            var weatherLayerCtx = weatherLayer.getContext('2d');
            weatherLayerCtx.drawImage(currentWeatherImage, mrx, mry, mrw, mrh);
            fallbackContext.drawImage(weatherLayer, 0, 0);
        }

        function loadVectorOverlay(path) {
            if (!path || !vectorContext || typeof window.Path2D !== 'function') {
                return Promise.resolve();
            }
            return fetchText(versioned(path)).then(function (source) {
                var documentSvg = new DOMParser().parseFromString(
                    source,
                    'image/svg+xml'
                );
                var svg = documentSvg.documentElement;
                var viewBox = String(svg.getAttribute('viewBox') || '')
                    .trim().split(/\s+/).map(Number);
                if (viewBox.length !== 4 || !viewBox[2] || !viewBox[3]) {
                    throw new Error('surcouche vectorielle invalide');
                }
                var paths = Array.from(svg.querySelectorAll('path')).map(
                    function (node) {
                        var width = Number(node.getAttribute('stroke-width') || 1);
                        // Classification par épaisseur : département (fin), région (moyen), pays/côte (épais)
                        var kind = width <= 1.0 ? 'department' : (width <= 1.6 ? 'region' : 'country');
                        return {
                            path: new Path2D(node.getAttribute('d') || ''),
                            colour: node.getAttribute('stroke') || '#101116',
                            opacity: Number(node.getAttribute('stroke-opacity') || 1),
                            width: width,
                            lineCap: node.getAttribute('stroke-linecap') || 'butt',
                            lineJoin: node.getAttribute('stroke-linejoin') || 'miter',
                            kind: kind
                        };
                    }
                );
                vectorDefinition = {
                    width: viewBox[2],
                    height: viewBox[3],
                    paths: paths
                };
                scheduleRender();
            }).catch(function () {
                vectorDefinition = null;
            });
        }

        function drawVectors(width, height, pixelRatio) {
            if (!vectorContext || !vectorDefinition) {
                return;
            }
            resizeCanvas(vectorCanvas, width, height, pixelRatio);
            vectorContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            vectorContext.clearRect(0, 0, width, height);
            // Projection UNIQUE (computeMapRect) : parfaitement alignée avec le
            // raster WebGL/2D — plus aucun décalage possible entre les deux.
            var mapRect = computeMapRect(width, height);
            var horizontalScale = mapRect.w / 2200.0;
            var verticalScale = mapRect.h / 1640.0;
            vectorContext.setTransform(
                pixelRatio * horizontalScale,
                0,
                0,
                pixelRatio * verticalScale,
                pixelRatio * mapRect.x,
                pixelRatio * mapRect.y
            );
            vectorDefinition.paths.forEach(function (entry) {
                // Comme météociel : les limites de département s'estompent en zoomant
                if (entry.kind === 'department' && transform.scale > 3.2) {
                    return;
                }
                if (entry.kind === 'region' && transform.scale > 10) {
                    return;
                }
                vectorContext.strokeStyle = entry.colour;
                vectorContext.globalAlpha = entry.opacity;
                vectorContext.lineCap = entry.lineCap;
                vectorContext.lineJoin = entry.lineJoin;
                vectorContext.lineWidth = entry.width / horizontalScale;
                vectorContext.stroke(entry.path);
            });
            vectorContext.globalAlpha = 1;
        }

        function scheduleRender() {
            if (renderFrame !== null) {
                return;
            }
            renderFrame = window.requestAnimationFrame(function () {
                renderFrame = null;
                var width = viewport.clientWidth;
                var height = viewport.clientHeight;
                if (!width || !height) {
                    return;
                }
                var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                drawWeather(width, height, pixelRatio);
                drawVectors(width, height, pixelRatio);
                drawLabels(width, height, pixelRatio);
            });
        }

        function mercator(latitude) {
            var radians = clamp(latitude, -85, 85) * Math.PI / 180;
            return Math.log(Math.tan(Math.PI / 4 + radians / 2));
        }

        function inverseMercator(value) {
            return (2 * Math.atan(Math.exp(value)) - Math.PI / 2) * 180 / Math.PI;
        }

        // ────────────────────────────────────────────────────────────────────
        // PROJECTION UNIQUE de la carte (raster 2200×1640) vers un viewport
        // de taille donnée. Tous les calques (WebGL, fallback 2D, vecteurs,
        // labels, probes, GIF, export) passent par cette fonction : ils sont
        // donc TOUJOURS parfaitement alignés, quel que soit le ratio écran.
        //
        //   - Mode « vue France » (scale ≤ 1.15) : cadrage intelligent sur le
        //     rectangle réellement couvert par le maillage (masque France).
        //     Les zones non maillées (Italie, mer, coins du trapèze AROME en
        //     Mercator) sont placées HORS du viewport : plus aucune grande
        //     zone « vide de maillage » à l'écran.
        //   - Mode zoomé (région/département) : le raster remplit le viewport
        //     en cover (le surplus est découpé, jamais de bandes, la France
        //     reste proportionnelle — jamais étirée), zoom/pan inclus.
        //
        // Retour : { x, y, w, h } en pixels CSS du viewport.
        // `t` (optionnel) : transformation à utiliser (défaut : transform
        // courant) — le GIF fige sa propre transformation pendant l'encodage.
        // Le header flotte AU-DESSUS de la carte (translucide) : la carte
        // remplit donc tout le viewport, sans zone réservée.
        // ────────────────────────────────────────────────────────────────────
        function computeMapRect(width, height, t) {
            t = t || transform;
            // Échelle de base UNIQUE : cover du viewport par le raster 2200×1640.
            // Tous les calculs (pan, zoom roue, pinch, focusLocation) utilisent
            // cette même valeur pour rester cohérents.
            var s = Math.max(width / 2200.0, height / 1640.0);
            if (t.scale <= 1.15) {
                // Vue France entière : englobe TOUTE la France métropolitaine ET la Corse
                // avec marge de respiration en haut (header) et en bas (timeline d'échéances)
                var FX0 = 260;  // Ouest Bretagne
                var FX1 = 1860; // Est Corse / Alsace
                var FY0 = 110;  // Nord Dunkerque
                var FY1 = 1530; // Sud Bonifacio (Corse entièrement dégagée)
                var fw = FX1 - FX0; // 1600
                var fh = FY1 - FY0; // 1420
                var availH = Math.max(180, height - 150); // 70px timeline + 60px header + 20px marge
                var availW = Math.max(260, width - 40);
                var sFrance = Math.min(availW / (fw * 1.04), availH / (fh * 1.04));
                var cx = (FX0 + FX1) / 2; // 1060
                var cy = (FY0 + FY1) / 2; // 820
                var bboxRect = {
                    x: width / 2 - cx * sFrance,
                    y: height / 2 - cy * sFrance,
                    w: 2200.0 * sFrance,
                    h: 1640.0 * sFrance
                };
                if (t.scale <= 1.001) {
                    return bboxRect;
                }
                // Interpolation fluide entre vue France et zoom libre
                var coverScale = s * t.scale;
                var coverRect = {
                    x: width / 2 + t.x - 1100.0 * coverScale,
                    y: height / 2 + t.y - 820.0 * coverScale,
                    w: 2200.0 * coverScale,
                    h: 1640.0 * coverScale
                };
                var f = Math.max(0, Math.min(1, (t.scale - 1.001) / 0.149));
                return {
                    x: bboxRect.x + (coverRect.x - bboxRect.x) * f,
                    y: bboxRect.y + (coverRect.y - bboxRect.y) * f,
                    w: bboxRect.w + (coverRect.w - bboxRect.w) * f,
                    h: bboxRect.h + (coverRect.h - bboxRect.h) * f
                };
            }
            // Mode zoom/pan libre : cohérent avec changeZoom, pan et pinch
            var scale = s * t.scale;
            return {
                x: width / 2 + t.x - 1100.0 * scale,
                y: height / 2 + t.y - 820.0 * scale,
                w: 2200.0 * scale,
                h: 1640.0 * scale
            };
        }

        function visiblePlaces(width, height, bounds, northY, mercatorSpan, density) {
            if (transform.scale < 1.35 || !placeBuckets.size) {
                return places;
            }
            // Projection UNIQUE (computeMapRect) : même fenêtre que le raster.
            var mapRect = computeMapRect(width, height);
            var mapLeft = (0 - mapRect.x) / mapRect.w;
            var mapRight = (width - mapRect.x) / mapRect.w;
            var mapTop = (0 - mapRect.y) / mapRect.h;
            var mapBottom = (height - mapRect.y) / mapRect.h;
            var longitudeSpan = Number(bounds.east) - Number(bounds.west);
            var west = Number(bounds.west) + mapLeft * longitudeSpan;
            var east = Number(bounds.west) + mapRight * longitudeSpan;
            var north = inverseMercator(northY - mapTop * mercatorSpan);
            var south = inverseMercator(northY - mapBottom * mercatorSpan);
            var candidates = [];
            for (var latitude = Math.floor(south) - 1;
                    latitude <= Math.ceil(north) + 1; latitude += 1) {
                for (var longitude = Math.floor(west) - 1;
                        longitude <= Math.ceil(east) + 1; longitude += 1) {
                    var bucket = placeBuckets.get(latitude + '|' + longitude) || [];
                    for (var index = 0; index < bucket.length; index += 1) {
                        if (Number(bucket[index][1]) < density.population) {
                            continue;
                        }
                        candidates.push(bucket[index]);
                    }
                }
            }
            candidates.sort(function (first, second) {
                return Number(second[1]) - Number(first[1]);
            });
            return candidates;
        }

        function labelDensity() {
            if (transform.scale < 1.35) {
                return { population: 200000, maximum: 20, size: 12 };
            }
            if (transform.scale < 2.25) {
                return { population: 80000, maximum: 30, size: 12 };
            }
            if (transform.scale < 3.75) {
                return { population: 30000, maximum: 45, size: 12 };
            }
            if (transform.scale < 6) {
                return { population: 8000, maximum: 70, size: 12 };
            }
            if (transform.scale < 8) {
                return { population: 2000, maximum: 100, size: 12 };
            }
            if (transform.scale < 16) {
                return { population: 300, maximum: 140, size: 13 };
            }
            if (transform.scale < 32) {
                return { population: 60, maximum: 130, size: 13 };
            }
            return { population: 5, maximum: 110, size: 13 };
        }

        function overlaps(rectangle, occupied) {
            for (var index = 0; index < occupied.length; index += 1) {
                var other = occupied[index];
                if (rectangle.left < other.right && rectangle.right > other.left &&
                        rectangle.top < other.bottom && rectangle.bottom > other.top) {
                    return true;
                }
            }
            return false;
        }

        function drawLabels(width, height, pixelRatio) {
            if (!labelsContext || !manifest) {
                return;
            }
            resizeCanvas(labelsCanvas, width, height, pixelRatio);
            labelsContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            labelsContext.clearRect(0, 0, width, height);
            if (!citiesVisible || !places.length || !manifest.bounds) {
                return;
            }

            var bounds = manifest.bounds;
            var northY = mercator(Number(bounds.north));
            var southY = mercator(Number(bounds.south));
            var longitudeSpan = Number(bounds.east) - Number(bounds.west);
            var mercatorSpan = northY - southY;
            if (!longitudeSpan || !mercatorSpan) {
                return;
            }

            var density = labelDensity();
            var candidates = visiblePlaces(
                width,
                height,
                bounds,
                northY,
                mercatorSpan,
                density
            );
            var occupied = [];
            var drawn = 0;
            // Projection UNIQUE (computeMapRect) : les villes sont
            // exactement au même endroit que le raster et les vecteurs.
            var labelRect = computeMapRect(width, height);
            labelsContext.font = '700 ' + density.size + 'px Arial, sans-serif';
            labelsContext.textAlign = 'center';
            labelsContext.textBaseline = 'middle';
            labelsContext.lineJoin = 'round';
            labelsContext.strokeStyle = 'rgba(8, 19, 28, .94)';
            labelsContext.fillStyle = '#ffffff';
            labelsContext.lineWidth = density.size >= 12 ? 3.5 : 3;

            for (var index = 0; index < candidates.length; index += 1) {
                var place = candidates[index];
                if (!Array.isArray(place) || place.length < 4) {
                    continue;
                }
                if (Number(place[1]) < density.population) {
                    break;
                }
                var u = (Number(place[3]) - Number(bounds.west)) / longitudeSpan;
                var v = (northY - mercator(Number(place[2]))) / mercatorSpan;
                var screenX = labelRect.x + u * labelRect.w;
                var screenY = labelRect.y + v * labelRect.h;
                if (screenX < -80 || screenX > width + 80 ||
                        screenY < -15 || screenY > height + 15) {
                    continue;
                }
                var text = String(place[0]);
                var textWidth = labelsContext.measureText(text).width;
                var rectangle = {
                    left: screenX - textWidth / 2 - 4,
                    right: screenX + textWidth / 2 + 4,
                    top: screenY - density.size / 2 - 3,
                    bottom: screenY + density.size / 2 + 3
                };
                if (overlaps(rectangle, occupied)) {
                    continue;
                }
                occupied.push(rectangle);
                labelsContext.strokeText(text, screenX, screenY);
                labelsContext.fillText(text, screenX, screenY);
                drawn += 1;
                if (drawn >= density.maximum) {
                    break;
                }
            }
        }

        function loadPlaces() {
            if (!manifest || !manifest.places) {
                return Promise.resolve();
            }
            return fetchJson(versioned(manifest.places))
                .then(function (payload) {
                    places = payload && Array.isArray(payload.places) ?
                        payload.places : [];
                    placeBuckets = new Map();
                    places.forEach(function (place) {
                        if (!Array.isArray(place) || place.length < 4) {
                            return;
                        }
                        var key = Math.floor(Number(place[2])) + '|' +
                            Math.floor(Number(place[3]));
                        if (!placeBuckets.has(key)) {
                            placeBuckets.set(key, []);
                        }
                        placeBuckets.get(key).push(place);
                    });
                    scheduleRender();
                })
                .catch(function (error) {
                    console.warn('Villes non chargées (' +
                        (manifest && manifest.places) + ') :', error);
                    places = [];
                    placeBuckets = new Map();
                });
        }

        function applyTransform() {
            if (!viewport) return;
            var w = viewport.clientWidth;
            var h = viewport.clientHeight;
            if (transform.scale > 1.001) {
                // Même base que computeMapRect : s = max(w/2200, h/1640)
                var s = Math.max(w / 2200.0, h / 1640.0);
                var totalScale = s * transform.scale;
                var rasterW = 2200.0 * totalScale;
                var rasterH = 1640.0 * totalScale;
                // On empêche de sortir du raster (au plus un demi-viewport de débord)
                var maxX = Math.max(0, (rasterW - w) / 2);
                var maxY = Math.max(0, (rasterH - h) / 2);
                transform.x = Math.max(-maxX, Math.min(maxX, transform.x));
                transform.y = Math.max(-maxY, Math.min(maxY, transform.y));
            } else {
                transform.x = 0;
                transform.y = 0;
            }
            if (zoomLevel) zoomLevel.textContent = Math.round(transform.scale * 100) + ' %';
            if (zoomOut) zoomOut.disabled = transform.scale <= 1.001;
            if (zoomIn) zoomIn.disabled = transform.scale >= maxScale - 0.001;
            if (viewport.classList) viewport.classList.toggle('is-zoomed', transform.scale > 1.001);
            scheduleRender();
            if (lastHover && typeof updateProbe === 'function') {
                updateProbe(lastHover.x, lastHover.y);
            }
            if (typeof positionPinned === 'function') {
                positionPinned();
            }
        }

        function changeZoom(nextScale, clientX, clientY) {
            var previousScale = transform.scale;
            nextScale = clamp(nextScale, 1, maxScale);
            var box = viewport.getBoundingClientRect();
            var px = (typeof clientX === 'number' ? clientX : box.left + box.width / 2) -
                box.left - box.width / 2;
            var py = (typeof clientY === 'number' ? clientY : box.top + mapCenterY(box.height)) -
                box.top - mapCenterY(box.height);
            var worldX = (px - transform.x) / previousScale;
            var worldY = (py - transform.y) / previousScale;
            transform.x = px - worldX * nextScale;
            transform.y = py - worldY * nextScale;
            transform.scale = nextScale;
            applyTransform();
        }

        function resetView() {
            // Vue initiale : cadrage automatique (computeMapRect) — la France
            // remplit le viewport sans zones vides, avec le léger décalage
            // qui compense le header flottant.
            transform = { scale: 1, x: 0, y: 0 };
            var regSel = document.getElementById('select-region');
            if (regSel) regSel.value = 'france';
            applyTransform();
        }

        if (viewport) {
            viewport.addEventListener('keydown', function (e) {
                var panStep = 60;
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    changeZoom(transform.scale * 1.3);
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    changeZoom(transform.scale / 1.3);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    transform.x += panStep;
                    applyTransform();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    transform.x -= panStep;
                    applyTransform();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    transform.y += panStep;
                    applyTransform();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    transform.y -= panStep;
                    applyTransform();
                } else if (e.key === 'Home' || e.key === '0') {
                    e.preventDefault();
                    resetView();
                } else if (e.key === ' ' || e.key === 'k') {
                    e.preventDefault();
                    toggleAnimation();
                }
            });
        }

        function focusLocation(detail) {
            pendingFocus = detail || null;
            if (!manifest || !pendingFocus || !manifest.bounds) {
                return;
            }
            var width = viewport.clientWidth;
            var height = viewport.clientHeight;
            var latitude = Number(pendingFocus.latitude);
            var longitude = Number(pendingFocus.longitude);
            if (!width || !height || !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)) {
                return;
            }
            var bounds = manifest.bounds;
            var west = Number(bounds.west);
            var east = Number(bounds.east);
            var northY = mercator(Number(bounds.north));
            var southY = mercator(Number(bounds.south));
            var u = (longitude - west) / (east - west);
            var v = (northY - mercator(latitude)) / (northY - southY);
            var scale = clamp(Number(pendingFocus.scale) || 2, 1.16, maxScale);
            // Même baseScale que computeMapRect et applyTransform pour cohérence totale
            var s = Math.max(width / 2200.0, height / 1640.0);
            transform.scale = scale;
            // Le raster est centré en (width/2 + tx, height/2 + ty) dans computeMapRect.
            // On veut que le point (u,v) soit au centre de l'écran :
            //   width/2 + tx + (u - 0.5) * 2200 * s * scale = width/2
            // → tx = (0.5 - u) * 2200 * s * scale
            transform.x = 2200.0 * s * scale * (0.5 - u);
            transform.y = 1640.0 * s * scale * (0.5 - v);
            pendingFocus = null;
            applyTransform();
        }

        app.addEventListener('amfm:focus-location', function (event) {
            focusLocation(event.detail);
        });

        if (menuToggle && layerMenu) {
            menuToggle.addEventListener('click', function () {
                setMenuOpen(layerMenu.hidden);
            });
        }
        if (menuClose && menuToggle) {
            menuClose.addEventListener('click', function () {
                setMenuOpen(false);
                menuToggle.focus();
            });
        }
        if (app) {
            app.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && layerMenu && !layerMenu.hidden) {
                    setMenuOpen(false);
                    if (menuToggle) menuToggle.focus();
                }
            });
        }
        if (previousButton) {
            previousButton.addEventListener('click', function () {
                stopAnimation();
                renderStep(currentStep - 1);
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                stopAnimation();
                renderStep(currentStep + 1);
            });
        }
        if (playButton) {
            playButton.addEventListener('click', toggleAnimation);
        }
        if (slider) {
            slider.addEventListener('input', function () {
                stopAnimation();
                renderStep(Number(slider.value));
            });
        }
        if (zoomIn) {
            zoomIn.addEventListener('click', function () {
                changeZoom(transform.scale * 1.5);
            });
        }
        if (zoomOut) {
            zoomOut.addEventListener('click', function () {
                changeZoom(transform.scale / 1.5);
            });
        }
        if (reset) {
            reset.addEventListener('click', resetView);
        } else if (resetButton) {
            resetButton.addEventListener('click', resetView);
        }
        if (fullscreen) {
            fullscreen.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (app.requestFullscreen) {
                    app.requestFullscreen();
                }
            });
        }
        document.addEventListener('fullscreenchange', function () {
            window.setTimeout(applyTransform, 50);
        });
        toolButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                setToolMode(button.dataset.amfmTool);
            });
        });
        if (captureButton) {
            captureButton.addEventListener('click', function () { captureImage('png'); });
        }
        if (captureJpegButton) {
            captureJpegButton.addEventListener('click', function () { captureImage('jpeg'); });
        }
        if (captureGifButton) {
            captureGifButton.addEventListener('click', openGifModal);
        }
        if (toggleCitiesButton) {
            toggleCitiesButton.addEventListener('click', function () {
                citiesVisible = !citiesVisible;
                toggleCitiesButton.classList.toggle('is-active', citiesVisible);
                toggleCitiesButton.setAttribute('aria-pressed', citiesVisible ? 'true' : 'false');
                scheduleRender();
            });
        }
        if (pinButton) {
            pinButton.addEventListener('click', function () {
                pinnedEnabled = !pinnedEnabled;
                pinButton.setAttribute('aria-pressed', pinnedEnabled ? 'true' : 'false');
                if (!pinnedEnabled) {
                    clearPinned();
                }
            });
        }
        if (diagramClose) {
            diagramClose.addEventListener('click', closeDiagram);
        }
        viewport.addEventListener('wheel', function (event) {
            event.preventDefault();
            changeZoom(
                transform.scale * Math.pow(1.0015, -event.deltaY),
                event.clientX,
                event.clientY
            );
        }, { passive: false });
        viewport.addEventListener('dblclick', function (event) {
            changeZoom(transform.scale * 1.65, event.clientX, event.clientY);
        });

        function pointerPair() {
            return Array.from(activePointers.values()).slice(0, 2);
        }

        function startGesture() {
            var points = pointerPair();
            if (!points.length) {
                gesture = null;
                return;
            }
            if (points.length === 1) {
                gesture = {
                    type: 'drag',
                    x: points[0].x,
                    y: points[0].y,
                    startX: transform.x,
                    startY: transform.y
                };
                return;
            }
            var centerX = (points[0].x + points[1].x) / 2;
            var centerY = (points[0].y + points[1].y) / 2;
            var distance = Math.hypot(
                points[1].x - points[0].x,
                points[1].y - points[0].y
            );
            var box = viewport.getBoundingClientRect();
            var px = centerX - box.left - box.width / 2;
            var py = centerY - box.top - box.height / 2;
            gesture = {
                type: 'pinch',
                distance: Math.max(distance, 1),
                scale: transform.scale,
                worldX: (px - transform.x) / transform.scale,
                worldY: (py - transform.y) / transform.scale
            };
        }

        viewport.addEventListener('pointermove', function (event) {
            if (event.pointerType && event.pointerType !== 'mouse') {
                return;
            }
            if (activePointers.size) {
                hideProbe();
                return;
            }
            var clientX = event.clientX;
            var clientY = event.clientY;
            lastHover = { x: clientX, y: clientY };
            if (hoverFrame !== null) {
                return;
            }
            hoverFrame = window.requestAnimationFrame(function () {
                hoverFrame = null;
                if (lastHover) {
                    updateProbe(lastHover.x, lastHover.y);
                }
            });
        });
        viewport.addEventListener('pointerleave', hideProbe);

        viewport.addEventListener('pointerdown', function (event) {
            if (event.target.closest('button, .amfm-diagram-popup, .amfm-probe-pinned')) {
                return;
            }
            hideProbe();
            tapStart = {
                x: event.clientX,
                y: event.clientY,
                time: Date.now(),
                pointerId: event.pointerId
            };
            activePointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });
            try { viewport.setPointerCapture(event.pointerId); } catch (e) {}
            startGesture();
            viewport.classList.add('is-dragging');
        });
        viewport.addEventListener('pointermove', function (event) {
            if (!activePointers.has(event.pointerId)) {
                return;
            }
            activePointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });
            var points = pointerPair();
            if (points.length >= 2) {
                if (!gesture || gesture.type !== 'pinch') {
                    startGesture();
                    return;
                }
                var centerX = (points[0].x + points[1].x) / 2;
                var centerY = (points[0].y + points[1].y) / 2;
                var distance = Math.hypot(
                    points[1].x - points[0].x,
                    points[1].y - points[0].y
                );
                var box = viewport.getBoundingClientRect();
                var px = centerX - box.left - box.width / 2;
                var py = centerY - box.top - box.height / 2;
                transform.scale = clamp(
                    gesture.scale * distance / gesture.distance,
                    1,
                    maxScale
                );
                transform.x = px - gesture.worldX * transform.scale;
                transform.y = py - gesture.worldY * transform.scale;
            } else if (gesture && gesture.type === 'drag') {
                transform.x = gesture.startX + points[0].x - gesture.x;
                transform.y = gesture.startY + points[0].y - gesture.y;
            }
            applyTransform();
        });
        function endPointer(event) {
            var wasMultiTouch = activePointers.size > 1;
            if (activePointers.has(event.pointerId)) {
                activePointers.delete(event.pointerId);
                if (activePointers.size) {
                    startGesture();
                } else {
                    gesture = null;
                }
            }
            if (!activePointers.size) {
                viewport.classList.remove('is-dragging');
            }
            if (tapStart && tapStart.pointerId === event.pointerId) {
                var dx = event.clientX - tapStart.x;
                var dy = event.clientY - tapStart.y;
                var dt = Date.now() - tapStart.time;
                tapStart = null;
                if (!wasMultiTouch && Math.hypot(dx, dy) < 8 && dt < 600) {
                    if (toolMode === 'diagram') {
                        openDiagramAt(event.clientX, event.clientY);
                    } else {
                        pinProbeAt(event.clientX, event.clientY);
                    }
                }
            }
        }
        viewport.addEventListener('pointerup', endPointer);
        viewport.addEventListener('pointercancel', endPointer);
        window.addEventListener('resize', applyTransform);

        if (!animationEnabled || reducedMotion) {
            playButton.hidden = true;
        }
        if (!baseUrl) {
            showError('Adresse des données AROME non configurée.');
            return;
        }
        webgl = initialiseWebgl();

        fetchJson(baseUrl + '/maps/index.json')
            .then(function (payload) {
                if (!payload || !payload.layers || !Array.isArray(payload.steps)) {
                    throw new Error('manifeste cartographique invalide');
                }
                manifest = payload;
                applyPaletteStops();
                if (typeof buildLayerMenu === 'function') buildLayerMenu();
                if (typeof buildLegend === 'function') buildLegend();
                if (payload.overlay && typeof loadVectorOverlay === 'function') loadVectorOverlay(payload.overlay);
                if (typeof loadPlaces === 'function') loadPlaces();

                if (run && payload.run_time) {
                    try {
                        run.textContent = 'Run du ' +
                            runFormat.format(new Date(payload.run_time)).replace(':', 'h') +
                            ' • résolution 1,3 km';
                    } catch (e) {}
                }
                if (mapRun && payload.run_time) {
                    try {
                        mapRun.textContent = 'Run AROME ' + runLabelUtc(payload.run_time);
                    } catch (e) {}
                }
                if (generated && payload.generated_at) {
                    try {
                        generated.textContent = 'Cartes mises à jour le ' +
                            runFormat.format(new Date(payload.generated_at)).replace(':', 'h') +
                            ' • Module v' + moduleVersion;
                    } catch (e) {}
                }
                if (stale && payload.generated_at) {
                    stale.hidden = (Date.now() - new Date(payload.generated_at).getTime()) <=
                        8 * 60 * 60 * 1000;
                }
                var steps = availableSteps();
                currentStep = initialStep(steps);
                if (typeof setLayerMenuOpen === 'function') {
                    setLayerMenuOpen(!window.matchMedia ||
                        !window.matchMedia('(max-width: 760px)').matches);
                }
                applyTransform();
                renderStep(currentStep);
                applyUrlParams();
                if (pendingFocus && typeof focusLocation === 'function') {
                    focusLocation(pendingFocus);
                }
            })
            .catch(function (error) {
                console.error('Erreur chargement manifeste:', error);
                if (typeof showError === 'function') {
                    showError('Chargement des cartes : ' + error.message);
                }
            });
    }

    whenReady(function () {
        document.querySelectorAll('[data-amfm-app]').forEach(initMap);
    });
}());
