import React from 'react';
import { geoConicConformal, geoPath } from "d3-geo";
import { ShieldAlert, Info } from 'lucide-react';

const OFFICIAL_COLORS = {
    1: '#22c55e', // Vert plus lisible
    2: '#ffeb3b', // Jaune plus saturé
    3: '#ff9800', // Orange plus saturé
    4: '#d32f2f', // Rouge plus profond
};

// Liste des régions pour le filtrage
const REGIONS = [
    { id: 'ARA', name: 'Auvergne-Rhône-Alpes', deps: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'] },
    { id: 'BFC', name: 'Bourgogne-Franche-Comté', deps: ['21', '25', '39', '58', '70', '71', '89', '90'] },
    { id: 'BRE', name: 'Bretagne', deps: ['22', '29', '35', '56'] },
    { id: 'CVL', name: 'Centre-Val de Loire', deps: ['18', '28', '36', '37', '41', '45'] },
    { id: 'COR', name: 'Corse', deps: ['2A', '2B'] },
    { id: 'GES', name: 'Grand Est', deps: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'] },
    { id: 'HDF', name: 'Hauts-de-France', deps: ['02', '59', '60', '62', '80'] },
    { id: 'IDF', name: 'Île-de-France', deps: ['75', '77', '78', '91', '92', '93', '94', '95'] },
    { id: 'NOR', name: 'Normandie', deps: ['14', '27', '50', '61', '76'] },
    { id: 'NAQ', name: 'Nouvelle-Aquitaine', deps: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'] },
    { id: 'OCC', name: 'Occitanie', deps: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'] },
    { id: 'PDL', name: 'Pays de la Loire', deps: ['44', '49', '53', '72', '85'] },
    { id: 'PAC', name: 'Provence-Alpes-Côte d\'Azur', deps: ['04', '05', '06', '13', '83', '84'] },
];

const VigilanceSocialCard = ({ geoData, vigilanceData, period, lastUpdate, phenoms, regionId = null, selectedPhenom = null }) => {
    console.log(`[SocialCard] Rendering for regionId: ${regionId}, selectedPhenom: ${selectedPhenom}`);
    const regionConfig = regionId ? REGIONS.find(r => r.id === regionId) : null;
    if (regionId && !regionConfig) console.warn(`[SocialCard] ⚠️ Region ${regionId} not found in config!`);


    // 1. Dédoublonnage des données
    const activeVigilanceMap = new Map();
    vigilanceData.forEach(d => {
        const depCode = d.dep_code?.toString().trim();
        if (d.period === period && depCode && !['FRA', '99', 'METRO', '00'].includes(depCode)) {
            // Si on est en mode région, on ne garde que les départements de la région
            if (regionConfig && !regionConfig.deps.includes(depCode)) return;

            const existing = activeVigilanceMap.get(depCode);
            if (!existing || new Date(d.last_update) > new Date(existing.last_update)) {
                activeVigilanceMap.set(depCode, d);
            }
        }
    });
    const activeVigilance = Array.from(activeVigilanceMap.values());
    const maxLevel = Math.max(...activeVigilance.map(d => {
        if (selectedPhenom) {
            const risk = d.risks?.find(r => r.id.toString() === selectedPhenom.toString());
            return risk ? parseInt(risk.level) : 1;
        }
        return d.level || 1;
    }), 1);

    // 2. Calcul des phénomènes par niveau PRÉCIS
    const activePhenomsList = [];
    phenoms.forEach(p => {
        [4, 3, 2].forEach(lvl => {
            const count = activeVigilance.filter(d => {
                const risk = d.risks?.find(r => r.id.toString() === p.id.toString());
                return risk && parseInt(risk.level) === lvl;
            }).length;

            if (count > 0) {
                activePhenomsList.push({
                    ...p,
                    maxLvl: lvl,
                    count: count,
                    uniqueKey: `${p.id}-${lvl}`
                });
            }
        });
    });

    activePhenomsList.sort((a, b) => b.maxLvl - a.maxLvl);
    const mainPhenomName = activePhenomsList.length > 0 ? activePhenomsList[0].name.toUpperCase() : "MÉTÉOROLOGIQUE";

    // 3. Filtrage des GeoData pour le zoom régional
    const filteredFeatures = React.useMemo(() => {
        if (!geoData) return [];
        if (!regionConfig) return geoData.features;
        return geoData.features.filter(f => regionConfig.deps.includes(f.properties.code));
    }, [geoData, regionConfig]);

    // Projection optimisée (Zoome si région sélectionnée)
    const projection = React.useMemo(() => {
        if (!geoData || filteredFeatures.length === 0) return null;
        return geoConicConformal().fitSize([1100, 1100], {
            type: 'FeatureCollection',
            features: filteredFeatures
        });
    }, [geoData, filteredFeatures]);

    const pathGenerator = React.useMemo(() => projection ? geoPath().projection(projection) : null, [projection]);

    const mapData = {};
    activeVigilance.forEach(d => {
        let displayLevel = d.level;
        if (selectedPhenom) {
            const risk = d.risks?.find(r => r.id.toString() === selectedPhenom.toString());
            displayLevel = risk ? risk.level : 1;
        }
        mapData[d.dep_code] = displayLevel;
    });

    const getParisDate = (date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/Paris'
        }).format(date);
    };

    const now = new Date();
    const fallbackDate = new Date(now);
    if (period === 1) fallbackDate.setDate(now.getDate() + 1);

    const periodData = activeVigilance.length > 0 ? activeVigilance[0] : null;
    const effectiveDate = periodData?.start_time ? new Date(periodData.start_time) : fallbackDate;

    const targetDateFullStr = getParisDate(effectiveDate);

    const headerClass = maxLevel === 4 ? 'bg-red-deep' : maxLevel === 3 ? 'bg-orange-vibrant' : maxLevel === 2 ? 'bg-yellow-bright' : 'bg-green-safe';

    const isReady = geoData && filteredFeatures.length > 0 && projection && vigilanceData && vigilanceData.length > 0;

    let titleStr = `⚠️ VIGILANCE ${regionConfig ? regionConfig.name.toUpperCase() : 'NATIONALE'}`;
    if (selectedPhenom === "100") {
        titleStr = `🔥 MÉTÉO DES FORÊTS ${regionConfig ? regionConfig.name.toUpperCase() : 'NATIONALE'}`;
    } else if (selectedPhenom) {
        const pObj = phenoms.find(p => p.id.toString() === selectedPhenom.toString());
        if (pObj) {
            titleStr = `⚠️ VIGILANCE ${pObj.name.toUpperCase()} - ${regionConfig ? regionConfig.name.toUpperCase() : 'NATIONALE'}`;
        }
    }

    const isForest = selectedPhenom === "100" || (!selectedPhenom && activePhenomsList[0]?.id?.toString() === "100");

    return (
        <div className="social-fb-container" data-ready={isReady ? "true" : "false"}>
            <div id="vigilance-social-card" className="social-fb-card">
                {!isReady && <div className="loading-overlay-capture">Chargement de la carte...</div>}
                <div className={`social-fb-header ${headerClass}`}>
                    <div className="header-top-line">
                        <ShieldAlert size={40} className="header-icon" />
                        <h1>{titleStr} - {targetDateFullStr.toUpperCase()}</h1>
                    </div>
                    <div className="header-bottom-line">
                        <span>{selectedPhenom === "100" ? "RISQUE DE DÉPART D'INCENDIE DE VÉGÉTATION" : (activePhenomsList.length > 0 ? `RISQUE PRINCIPAL : ${mainPhenomName}` : 'SITUATION CALME')}</span>
                    </div>
                </div>

                <div className="social-fb-body">
                    <div className="social-fb-map-area">
                        <svg viewBox="0 0 1100 1100" className="fb-svg-map">
                            <filter id="shadow-deep" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="15" />
                                <feOffset dx="0" dy="12" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.3" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <g filter="url(#shadow-deep)">
                                {filteredFeatures.map(f => {
                                    const code = f.properties.code;
                                    const level = mapData[code] || 1;
                                    return (
                                        <path
                                            key={code}
                                            d={pathGenerator(f)}
                                            fill={OFFICIAL_COLORS[level]}
                                            stroke="#1e293b"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                    );
                                })}
                            </g>
                        </svg>

                        <div className="fb-legend-minimal">
                            {isForest && (
                                <div className="legend-title" style={{ 
                                    fontWeight: 'bold', 
                                    marginBottom: '8px', 
                                    fontSize: '18px', 
                                    color: '#334155',
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                                    Danger Feux
                                </div>
                            )}
                            {[1, 2, 3, 4].map(lvl => {
                                let label = lvl === 1 ? 'Vert' : lvl === 2 ? 'Jaune' : lvl === 3 ? 'Orange' : 'Rouge';
                                if (isForest) {
                                    label = lvl === 1 ? 'Faible' : lvl === 2 ? 'Modéré' : lvl === 3 ? 'Elevé' : 'Très élevé';
                                }
                                return (
                                    <div key={lvl} className="legend-item">
                                        <span className="dot" style={{ backgroundColor: OFFICIAL_COLORS[lvl] }}></span>
                                        <span>{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VigilanceSocialCard;

