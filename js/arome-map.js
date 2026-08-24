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
            var mapAspect = 2200.0 / 1640.0;
            var viewAspect = box.width / (box.height || 1);
            var ax = viewAspect > mapAspect ? viewAspect / mapAspect : 1.0;
            var ay = viewAspect < mapAspect ? mapAspect / viewAspect : 1.0;
            var uScale = viewAspect > mapAspect ? (box.height / 1640.0) : (box.width / 2200.0);
            var mapW = 2200.0 * uScale * transform.scale;
            var mapH = 1640.0 * uScale * transform.scale;
            var u = (screenX - (box.width / 2 + transform.x)) / mapW + 0.5;
            var v = (screenY - (box.height / 2 + transform.y)) / mapH + 0.5;
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
            var mapAspect = 2200.0 / 1640.0;
            var viewAspect = box.width / (box.height || 1);
            var uScale = viewAspect > mapAspect ? (box.height / 1640.0) : (box.width / 2200.0);
            var mapW = 2200.0 * uScale * transform.scale;
            var mapH = 1640.0 * uScale * transform.scale;
            var screenX = (pinnedPoint.u - 0.5) * mapW + box.width / 2 + transform.x;
            var screenY = (pinnedPoint.v - 0.5) * mapH + box.height / 2 + transform.y;
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

        function composeCaptureCanvas() {
            if (!currentWeatherImage) {
                return null;
            }
            var vw = viewport.clientWidth;
            var vh = viewport.clientHeight;
            if (!vw || !vh) {
                return null;
            }
            // Export à la résolution NATIVE de la carte (2200×1640), en capturant
            // la vue courante (zoom/pan/région) sans sous-échantillonnage.
            var output = document.createElement('canvas');
            output.width = 2200;
            output.height = 1640;
            var context = output.getContext('2d');

            // Cadre sombre autour du domaine (masque carré : on ne voit que la carte)
            context.fillStyle = '#0b1220';
            context.fillRect(0, 0, output.width, output.height);

            // Transformation courante, en coordonnées carte (même logique que drawVectors)
            var mapAspect = 2200.0 / 1640.0;
            var viewAspect = vw / vh;
            var uScale = viewAspect > mapAspect ? (vh / 1640.0) : (vw / 2200.0);
            var hScale = transform.scale;
            var vScale = transform.scale;
            var offX = 1100 + transform.x / uScale - hScale * 1100.0;
            var offY = 820 + transform.y / uScale - vScale * 820.0;

            // Fond de carte (pays voisins inclus) dans le rectangle du domaine
            // (effet « contour carré » : tout le reste reste sombre)
            context.save();
            context.beginPath();
            context.rect(offX, offY, 2200 * hScale, 1640 * vScale);
            context.clip();
            if (fondImageElement && fondImageElement.complete && fondImageElement.naturalWidth) {
                context.save();
                context.transform(hScale, 0, 0, vScale, offX, offY);
                context.drawImage(fondImageElement, 0, 0);
                context.restore();
            } else {
                context.fillStyle = '#a5a6b0';
                context.fillRect(0, 0, output.width, output.height);
            }

            // Dalle météo masquée à la France (contour propre, pas de maillage dehors)
            // → rendu sur un canvas temporaire pour ne pas effacer le fond.
            var weatherMasked = document.createElement('canvas');
            weatherMasked.width = output.width;
            weatherMasked.height = output.height;
            var weatherCtx = weatherMasked.getContext('2d');
            weatherCtx.save();
            weatherCtx.transform(hScale, 0, 0, vScale, offX, offY);
            weatherCtx.drawImage(currentWeatherImage, 0, 0);
            weatherCtx.restore();
            if (franceMaskImage && franceMaskImage.complete && franceMaskImage.naturalWidth) {
                weatherCtx.save();
                weatherCtx.globalCompositeOperation = 'destination-in';
                weatherCtx.transform(hScale, 0, 0, vScale, offX, offY);
                weatherCtx.drawImage(franceMaskImage, 0, 0);
                weatherCtx.restore();
            }
            context.drawImage(weatherMasked, 0, 0);

            // Frontières à la transformation courante (départements estompés en zoom)
            if (vectorDefinition && vectorDefinition.paths && vectorDefinition.paths.length) {
                context.save();
                context.transform(hScale, 0, 0, vScale, offX, offY);
                vectorDefinition.paths.forEach(function (entry) {
                    // Estompage progressif comme météociel : les contours restent
                    // visibles mais s'atténuent quand on zoome (jamais disparition brutale).
                    var fade = 1;
                    if (entry.kind === 'department') {
                        fade = transform.scale <= 3 ? 1 :
                            Math.max(0.22, 1 - (transform.scale - 3) / 14);
                    } else if (entry.kind === 'region') {
                        fade = transform.scale <= 8 ? 1 :
                            Math.max(0.35, 1 - (transform.scale - 8) / 20);
                    }
                    context.strokeStyle = entry.colour;
                    context.globalAlpha = (entry.opacity || 1) * fade;
                    context.lineCap = entry.lineCap;
                    context.lineJoin = entry.lineJoin;
                    context.lineWidth = entry.width / hScale;
                    context.stroke(entry.path);
                });
                context.restore();
                context.globalAlpha = 1;
            }
            // Fin du clip « contour carré » : le reste (logo, cartouche, légende)
            // se dessine hors du cadre sombre.
            context.restore();

            // Logo Météo-Climat Pro (en haut à droite de la carte)
            if (logoImage && logoImage.complete && logoImage.naturalWidth) {
                var logoW = 240;
                var logoH = Math.round(logoW * logoImage.naturalHeight / logoImage.naturalWidth);
                var pad = 24;
                var lx = output.width - pad - logoW;
                var ly = pad;
                context.save();
                context.fillStyle = 'rgba(7, 11, 20, 0.72)';
                context.beginPath();
                if (typeof context.roundRect === 'function') {
                    context.roundRect(lx - 12, ly - 8, logoW + 24, logoH + 16, 12);
                } else {
                    context.rect(lx - 12, ly - 8, logoW + 24, logoH + 16);
                }
                context.fill();
                context.drawImage(logoImage, lx, ly, logoW, logoH);
                context.restore();
            }

            // Cartouche d'antenne (Modèle • Paramètre • Validité) — en haut à
            // gauche comme météociel. Placé sous le header HTML (≈80 px).
            var layer = manifest && manifest.layers && manifest.layers[currentLayer];
            var step = availableSteps()[currentStep];
            var dateStr = '';
            if (step) {
                try {
                    dateStr = validityFormat.format(new Date(step.valid_time)).replace(':', 'h');
                } catch (e) {
                    dateStr = new Date(step.valid_time).toLocaleDateString('fr-FR');
                }
            }

            var margin = 24;
            var bannerH = 130;
            var bannerY = 84;
            // Largeur du cartouche adaptée au contenu (titre + échéance)
            context.font = '700 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            var modelTitle = (manifest && manifest.model_name) ? manifest.model_name : 'AROME HD';
            var titleText = modelTitle + ' • ' + (layer ? layer.label : '') +
                (layer && layer.unit ? ' (' + layer.unit + ')' : '');
            var dateText = dateStr + (step ? ' (H+' + String(step.lead_hour).padStart(2, '0') + ')' : '') +
                ' — Météo-Climat Pro';
            var titleW = context.measureText(titleText).width;
            var dateW = context.measureText(dateText).width;
            var bannerW = Math.min(output.width - margin * 2,
                Math.max(titleW, dateW) + 44);
            context.fillStyle = 'rgba(7, 11, 20, 0.94)';
            context.beginPath();
            if (typeof context.roundRect === 'function') {
                context.roundRect(margin, bannerY, bannerW, bannerH, 16);
            } else {
                context.rect(margin, bannerY, bannerW, bannerH);
            }
            context.fill();
            context.strokeStyle = 'rgba(0, 210, 255, 0.75)';
            context.lineWidth = 3;
            context.stroke();

            // Ligne 1 : modèle + paramètre (gros, blanc)
            context.fillStyle = '#ffffff';
            context.font = '700 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            context.fillText(titleText, margin + 18, bannerY + 52);

            // Ligne 2 : échéance (gros, cyan) + run
            context.fillStyle = '#00d2ff';
            context.font = '700 27px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            var runLabel = '';
            if (manifest && manifest.run_time) {
                try {
                    runLabel = ' • run ' + String(manifest.run_time).slice(11, 16) + 'Z';
                } catch (e) {}
            }
            context.fillText(
                dateStr + (step ? ' (H+' + String(step.lead_hour).padStart(2, '0') + ')' : '') +
                runLabel + ' — Météo-Climat Pro',
                margin + 18, bannerY + 92
            );

            // Légende colorimétrique centrée en bas (comme météociel)
            if (layer && typeof window.getLayerPalette === 'function' &&
                    typeof window.paletteTicks === 'function') {
                try {
                    var legendW = 900;
                    var legendH = 92;
                    var legendX = (output.width - legendW) / 2;
                    var legendY = output.height - legendH - 20;
                    context.fillStyle = 'rgba(7, 11, 20, 0.94)';
                    context.beginPath();
                    if (typeof context.roundRect === 'function') {
                        context.roundRect(legendX - 20, legendY - 10,
                            legendW + 40, legendH + 32, 16);
                    } else {
                        context.rect(legendX - 20, legendY - 10,
                            legendW + 40, legendH + 32);
                    }
                    context.fill();
                    context.strokeStyle = 'rgba(0, 210, 255, 0.6)';
                    context.lineWidth = 2;
                    context.stroke();

                    // Étiquette + unité (centrées au-dessus de la barre)
                    context.fillStyle = '#ffffff';
                    context.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                    context.textAlign = 'center';
                    context.textBaseline = 'alphabetic';
                    var legendLabel = (layer.label || 'Échelle') +
                        (layer.unit ? ' (' + layer.unit + ')' : '');
                    context.fillText(legendLabel, output.width / 2, legendY + 26);

                    // Barre dégradée depuis les stops structurés de la palette
                    var pal = window.getLayerPalette(currentLayer);
                    var stops = pal && pal.stops ? pal.stops : [];
                    var low = (pal && pal.transparent_below !== null &&
                        pal.transparent_below !== undefined) ?
                        pal.transparent_below : (stops.length ? stops[0].value : 0);
                    var max = stops.length ? stops[stops.length - 1].value : 1;
                    var span = (max - low) || 1;
                    var barY = legendY + 44;
                    var gradient = context.createLinearGradient(legendX, 0,
                        legendX + legendW, 0);
                    var gradientBuilt = false;
                    if (pal && pal.transparent_below !== null &&
                            pal.transparent_below !== undefined) {
                        gradient.addColorStop(0, 'rgba(0,0,0,0)');
                        gradientBuilt = true;
                    }
                    stops.forEach(function (s) {
                        var position = Math.max(0, Math.min(1,
                            (Number(s.value) - low) / span));
                        gradient.addColorStop(position, s.color);
                        gradientBuilt = true;
                    });
                    context.fillStyle = gradientBuilt ? gradient : '#3478c5';
                    context.beginPath();
                    if (typeof context.roundRect === 'function') {
                        context.roundRect(legendX, barY, legendW, 22, 10);
                    } else {
                        context.rect(legendX, barY, legendW, 22);
                    }
                    context.fill();
                    context.strokeStyle = 'rgba(255,255,255,0.5)';
                    context.lineWidth = 1.5;
                    context.stroke();

                    // Ticks de valeurs
                    context.fillStyle = '#e6eeff';
                    context.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                    var ticks = window.paletteTicks(currentLayer);
                    ticks.forEach(function (tick, i) {
                        var x = legendX + (ticks.length > 1 ? i / (ticks.length - 1) : 0.5) * legendW;
                        context.fillText(String(tick), x, barY + 46);
                    });
                    context.textAlign = 'left';
                } catch (legendError) {
                    console.warn('Légende export ignorée :', legendError);
                }
            }

            // Villes sur l'export (comme l'affichage écran)
            if (manifest && manifest.bounds && places.length) {
                try {
                    var bounds = manifest.bounds;
                    var northY = mercator(Number(bounds.north));
                    var southY = mercator(Number(bounds.south));
                    var longitudeSpan = Number(bounds.east) - Number(bounds.west);
                    var mercatorSpan = northY - southY;
                    if (longitudeSpan && mercatorSpan) {
                        var exportScale = hScale;   // zoom courant
                        var popMin = exportScale < 1.35 ? 90000 :
                            (exportScale < 2.25 ? 35000 :
                            (exportScale < 3.75 ? 12000 :
                            (exportScale < 6 ? 3000 :
                            (exportScale < 8 ? 700 : 120))));
                        var maxLabels = exportScale < 1.35 ? 40 :
                            (exportScale < 2.25 ? 60 :
                            (exportScale < 3.75 ? 90 :
                            (exportScale < 6 ? 130 :
                            (exportScale < 8 ? 190 : 250))));
                        context.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
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
                            if (Number(place[1]) < popMin) { break; }
                            var u = (Number(place[3]) - Number(bounds.west)) / longitudeSpan;
                            var v = (northY - mercator(Number(place[2]))) / mercatorSpan;
                            var sx = (u - 0.5) * (2200 * exportScale) + 1100 + transform.x / uScale;
                            var sy = (v - 0.5) * (1640 * exportScale) + 820 + transform.y / uScale;
                            if (sx < -60 || sx > output.width + 60 || sy < -20 || sy > output.height + 20) {
                                continue;
                            }
                            var text = String(place[0]);
                            var tw = context.measureText(text).width;
                            var rect = { left: sx - tw / 2 - 5, right: sx + tw / 2 + 5,
                                         top: sy - 16, bottom: sy + 16 };
                            var clash = false;
                            for (var oi = 0; oi < occupied.length; oi += 1) {
                                var other = occupied[oi];
                                if (rect.left < other.right && rect.right > other.left &&
                                        rect.top < other.bottom && rect.bottom > other.top) {
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
                        context.textAlign = 'left';
                        context.textBaseline = 'alphabetic';
                    }
                } catch (labelError) {
                    console.warn('Villes export ignorées :', labelError);
                }
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

        function captureGif() {
            var steps = availableSteps();
            if (!steps.length) {
                setToolHint('Aucune carte disponible pour générer le GIF.');
                return;
            }
            if (typeof window.GIF !== 'function') {
                setToolHint('Encodage GIF indisponible (bibliothèque gif.js non chargée — vérifiez le CDN).');
                return;
            }
            var gw = 550;
            var gh = Math.round(gw * 1640 / 2200);
            var layer = manifest && manifest.layers && manifest.layers[currentLayer];
            // Vue courante (zoom/pan/région) appliquée à chaque frame
            var frameTransform = {
                scale: transform.scale,
                x: transform.x,
                y: transform.y
            };
            var mapAspect = 2200.0 / 1640.0;
            var viewAspect = gw / gh;
            var uScale = viewAspect > mapAspect ? (gh / 1640.0) : (gw / 2200.0);
            var hScale = frameTransform.scale;
            var vScale = frameTransform.scale;
            var offX = gw / 2 + frameTransform.x / uScale - hScale * gw / 2;
            var offY = gh / 2 + frameTransform.y / uScale - vScale * gh / 2;

            // Workers : désactivés si indisponibles (évite un échec silencieux)
            var gifOptions = { quality: 10, width: gw, height: gh };
            if (typeof Worker === 'function' && typeof Blob === 'function') {
                gifOptions.workers = 2;
            }
            var gif = new window.GIF(gifOptions);
            var index = 0;

            function drawFrame(canvas, img, leadHour) {
                var ctx = canvas.getContext('2d');
                // Cadre sombre (contour carré) puis fond de carte dans le domaine
                ctx.fillStyle = '#0b1220';
                ctx.fillRect(0, 0, gw, gh);
                ctx.save();
                ctx.beginPath();
                ctx.rect(offX, offY, 2200 * hScale, 1640 * vScale);
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
                // Dalle météo masquée à la France (canvas temporaire)
                var weatherLayer = document.createElement('canvas');
                weatherLayer.width = gw;
                weatherLayer.height = gh;
                var wctx = weatherLayer.getContext('2d');
                wctx.save();
                wctx.transform(hScale, 0, 0, vScale, offX, offY);
                wctx.drawImage(img, 0, 0);
                wctx.restore();
                if (franceMaskImage && franceMaskImage.complete && franceMaskImage.naturalWidth) {
                    wctx.save();
                    wctx.globalCompositeOperation = 'destination-in';
                    wctx.transform(hScale, 0, 0, vScale, offX, offY);
                    wctx.drawImage(franceMaskImage, 0, 0);
                    wctx.restore();
                }
                ctx.drawImage(weatherLayer, 0, 0);
                // Frontières (avec estompage progressif)
                if (vectorDefinition && vectorDefinition.paths && vectorDefinition.paths.length) {
                    ctx.save();
                    ctx.transform(hScale, 0, 0, vScale, offX, offY);
                    vectorDefinition.paths.forEach(function (entry) {
                        var fade = 1;
                        if (entry.kind === 'department') {
                            fade = frameTransform.scale <= 3 ? 1 :
                                Math.max(0.22, 1 - (frameTransform.scale - 3) / 14);
                        } else if (entry.kind === 'region') {
                            fade = frameTransform.scale <= 8 ? 1 :
                                Math.max(0.35, 1 - (frameTransform.scale - 8) / 20);
                        }
                        ctx.strokeStyle = entry.colour;
                        ctx.globalAlpha = (entry.opacity || 1) * fade;
                        ctx.lineWidth = entry.width / hScale;
                        ctx.stroke(entry.path);
                    });
                    ctx.restore();
                }
                ctx.restore(); // fin du clip
                // Cartouche bas : paramètre + échéance
                ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
                ctx.fillRect(0, gh - 26, gw, 26);
                ctx.fillStyle = '#00d2ff';
                ctx.font = 'bold 15px sans-serif';
                ctx.fillText((layer ? layer.label : '') + '  H+' + String(leadHour).padStart(2, '0'), 8, gh - 8);
            }

            function next() {
                if (index >= steps.length) {
                    setToolHint('Génération du GIF… finalisation');
                    gif.render();
                    return;
                }
                var step = steps[index];
                var img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = gw;
                    canvas.height = gh;
                    drawFrame(canvas, img, step.lead_hour);
                    gif.addFrame(canvas, { copy: true, delay: 350 });
                    index += 1;
                    next();
                };
                img.onerror = function () {
                    index += 1;
                    next();
                };
                img.src = versioned(step.files[currentLayer]);
            }

            setToolHint('Génération du GIF…');
            gif.on('progress', function (p) {
                setToolHint('Génération du GIF… ' + Math.round(p * 100) + ' %');
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
                setToolHint('');
            });
            if (typeof gif.on === 'function') {
                gif.on('abort', function () {
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
                return step && step.files && step.files[currentLayer];
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

        function focusOnPoint(u, v, scale) {
            var w = viewport.clientWidth;
            var h = viewport.clientHeight;
            transform.scale = clamp(scale || 1, 1, maxScale);
            transform.x = w * transform.scale * (0.5 - u);
            transform.y = h * transform.scale * (0.5 - v);
            applyTransform();
        }

        var regionSelect = app.querySelector('[data-amfm-region-select]');
        if (regionSelect) {
            // Correspondance ids du menu déroulant → clés de Europe1Regions (regions.js)
            var REGION_KEYS = {
                france: 'france',
                hdf: 'hdf',
                normandie: 'normandie',
                idf: 'ile-de-france',
                grandest: 'grand-est',
                bretagne: 'bretagne',
                pdl: 'pdl',
                cvl: 'cvl',
                bfc: 'bfc',
                naq: 'naq',
                ara: 'ara',
                occitanie: 'occitanie',
                paca: 'paca',
                corse: 'corse'
            };
            var fallbackCoords = {
                france: { scale: 1, u: 0.5, v: 0.5 },
                hdf: { scale: 2.8, u: 0.53, v: 0.28 },
                normandie: { scale: 3.0, u: 0.42, v: 0.32 },
                idf: { scale: 3.8, u: 0.52, v: 0.38 },
                grandest: { scale: 2.6, u: 0.68, v: 0.35 },
                bretagne: { scale: 3.0, u: 0.28, v: 0.38 },
                pdl: { scale: 2.6, u: 0.38, v: 0.39 },
                cvl: { scale: 2.8, u: 0.50, v: 0.34 },
                bfc: { scale: 2.6, u: 0.61, v: 0.38 },
                naq: { scale: 2.4, u: 0.38, v: 0.58 },
                ara: { scale: 2.6, u: 0.64, v: 0.58 },
                occitanie: { scale: 2.6, u: 0.48, v: 0.70 },
                paca: { scale: 3.0, u: 0.68, v: 0.72 },
                corse: { scale: 4.2, u: 0.78, v: 0.82 }
            };
            regionSelect.addEventListener('change', function (e) {
                var val = e.target.value || 'france';
                // Zones hors France (Belgique…) : coordonnées directes
                var externalZones = {
                    belgique: { latitude: 50.5, longitude: 4.5, scale: 6 }
                };
                if (externalZones[val]) {
                    focusLocation(externalZones[val]);
                    updateUrl();
                    return;
                }
                var regionData = null;
                var key = REGION_KEYS[val];
                if (key && typeof window.Europe1Regions === 'object' &&
                        window.Europe1Regions && window.Europe1Regions[key]) {
                    regionData = window.Europe1Regions[key];
                }
                if (regionData && Array.isArray(regionData.center) &&
                        regionData.center.length >= 2) {
                    // Zoom précis sur le centre de la région (coordonnées réelles).
                    // scale = 2^(zoom−6)×1.6 : France (6) → 1×, région (7-8) → 3-6×,
                    // département/IDF (9) → 13×, commune (12) → 38× (max 30).
                    var regionScale = val === 'france' ? 1 :
                        Math.min(30, Math.max(2.2, Math.pow(2, (regionData.zoom || 7) - 6) * 1.6));
                    focusLocation({
                        latitude: Number(regionData.center[0]),
                        longitude: Number(regionData.center[1]),
                        scale: regionScale
                    });
                } else {
                    var target = fallbackCoords[val] || fallbackCoords.france;
                    focusOnPoint(target.u, target.v, target.scale);
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
                'uniform float uScale;\n' +
                'uniform vec2 uTranslation;\n' +
                'uniform vec2 uAspect;\n' +
                'uniform float uHasWeather;\n' +
                'uniform float uHasMask;\n' +
                'uniform float uHasFond;\n' +
                'void main(){\n' +
                ' vec3 frame=vec3(0.043,0.055,0.086);\n' +
                ' vec2 uv=((vUv-vec2(0.5))*uAspect-uTranslation)/uScale+vec2(0.5);\n' +
                ' if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){\n' +
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
                // Données météo masquées à la France : alpha × masque France
                ' float france=1.0;\n' +
                ' if(uHasMask>0.5){france=texture2D(uMask,uv).r;}\n' +
                ' float alpha=weather.a*france;\n' +
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
                scale: gl.getUniformLocation(program, 'uScale'),
                translation: gl.getUniformLocation(program, 'uTranslation'),
                aspect: gl.getUniformLocation(program, 'uAspect'),
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
                gl.uniform1f(webgl.scale, transform.scale);
                var mapAspect = 2200.0 / 1640.0;
                var viewAspect = width / (height || 1);
                var ax = viewAspect > mapAspect ? viewAspect / mapAspect : 1.0;
                var ay = viewAspect < mapAspect ? mapAspect / viewAspect : 1.0;
                gl.uniform2f(webgl.aspect, ax, ay);
                gl.uniform2f(
                    webgl.translation,
                    (transform.x / width) * ax,
                    (transform.y / height) * ay
                );
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
            fallbackContext.save();
            fallbackContext.translate(
                width / 2 + transform.x,
                height / 2 + transform.y
            );
            fallbackContext.scale(transform.scale, transform.scale);
            fallbackContext.translate(-width / 2, -height / 2);
            fallbackContext.imageSmoothingEnabled = true;
            fallbackContext.imageSmoothingQuality = 'high';
            // Fond de carte (pays voisins inclus) si chargé, sinon gris neutre
            if (fondImageElement && fondImageElement.complete && fondImageElement.naturalWidth) {
                fallbackContext.drawImage(fondImageElement, 0, 0, width, height);
            } else {
                fallbackContext.fillStyle = '#a5a6b0';
                fallbackContext.fillRect(0, 0, width, height);
            }
            // Données météo masquées à la France (contour propre, pas de maillage dehors)
            // → canvas temporaire pour ne pas effacer le fond déjà dessiné.
            var weatherLayer = document.createElement('canvas');
            weatherLayer.width = width;
            weatherLayer.height = height;
            var weatherLayerCtx = weatherLayer.getContext('2d');
            weatherLayerCtx.drawImage(currentWeatherImage, 0, 0, width, height);
            if (franceMaskImage && franceMaskImage.complete && franceMaskImage.naturalWidth) {
                weatherLayerCtx.save();
                weatherLayerCtx.globalCompositeOperation = 'destination-in';
                weatherLayerCtx.drawImage(franceMaskImage, 0, 0, width, height);
                weatherLayerCtx.restore();
            }
            fallbackContext.drawImage(weatherLayer, 0, 0);
            fallbackContext.restore();
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
            var mapAspect = 2200.0 / 1640.0;
            var viewAspect = width / (height || 1);
            var uScale = viewAspect > mapAspect ? (height / 1640.0) : (width / 2200.0);
            var horizontalScale = transform.scale * uScale;
            var verticalScale = transform.scale * uScale;
            var offsetX = width / 2 + transform.x - horizontalScale * 1100.0;
            var offsetY = height / 2 + transform.y - verticalScale * 820.0;
            vectorContext.setTransform(
                pixelRatio * horizontalScale,
                0,
                0,
                pixelRatio * verticalScale,
                pixelRatio * offsetX,
                pixelRatio * offsetY
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

        function visiblePlaces(width, height, bounds, northY, mercatorSpan, density) {
            if (transform.scale < 1.35 || !placeBuckets.size) {
                return places;
            }
            var mapLeft = (0 - width / 2 - transform.x) / transform.scale + width / 2;
            var mapRight = (width - width / 2 - transform.x) /
                transform.scale + width / 2;
            var mapTop = (0 - height / 2 - transform.y) / transform.scale + height / 2;
            var mapBottom = (height - height / 2 - transform.y) /
                transform.scale + height / 2;
            var longitudeSpan = Number(bounds.east) - Number(bounds.west);
            var west = Number(bounds.west) + mapLeft / width * longitudeSpan;
            var east = Number(bounds.west) + mapRight / width * longitudeSpan;
            var north = inverseMercator(northY - mapTop / height * mercatorSpan);
            var south = inverseMercator(northY - mapBottom / height * mercatorSpan);
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
                return { population: 90000, maximum: 40, size: 11 };
            }
            if (transform.scale < 2.25) {
                return { population: 35000, maximum: 60, size: 11 };
            }
            if (transform.scale < 3.75) {
                return { population: 12000, maximum: 90, size: 11 };
            }
            if (transform.scale < 6) {
                return { population: 3000, maximum: 130, size: 11 };
            }
            if (transform.scale < 8) {
                return { population: 700, maximum: 190, size: 12 };
            }
            if (transform.scale < 16) {
                return { population: 120, maximum: 250, size: 12 };
            }
            if (transform.scale < 32) {
                return { population: 20, maximum: 220, size: 12 };
            }
            return { population: 1, maximum: 190, size: 12 };
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
                var mapAspect = 2200.0 / 1640.0;
                var viewAspect = width / (height || 1);
                var uScale = viewAspect > mapAspect ? (height / 1640.0) : (width / 2200.0);
                var mapW = 2200.0 * uScale;
                var mapH = 1640.0 * uScale;
                var u = (Number(place[3]) - Number(bounds.west)) / longitudeSpan;
                var v = (northY - mercator(Number(place[2]))) / mercatorSpan;
                var screenX = (u - 0.5) * (mapW * transform.scale) + width / 2 + transform.x;
                var screenY = (v - 0.5) * (mapH * transform.scale) + height / 2 + transform.y;
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
            var maxX = viewport.clientWidth * (transform.scale - 1) / 2;
            var maxY = viewport.clientHeight * (transform.scale - 1) / 2;
            transform.x = clamp(transform.x, -maxX, maxX);
            transform.y = clamp(transform.y, -maxY, maxY);
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
            var py = (typeof clientY === 'number' ? clientY : box.top + box.height / 2) -
                box.top - box.height / 2;
            var worldX = (px - transform.x) / previousScale;
            var worldY = (py - transform.y) / previousScale;
            transform.x = px - worldX * nextScale;
            transform.y = py - worldY * nextScale;
            transform.scale = nextScale;
            applyTransform();
        }

        function resetView() {
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
            var scale = clamp(Number(pendingFocus.scale) || 32, 1, maxScale);
            transform.scale = scale;
            transform.x = width * scale * (0.5 - u);
            transform.y = height * scale * (0.5 - v);
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
            captureGifButton.addEventListener('click', captureGif);
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
