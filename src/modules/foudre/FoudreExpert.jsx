import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { geoConicConformal, geoPath } from "d3-geo";
import { createClient } from '@supabase/supabase-js';
import { REGIONS, DEPARTMENTS } from "../../data/departments";
import { MAIN_CITIES } from "../../data/mainCities";
import { Download, RefreshCw, Zap, Calendar, Search, Maximize, Palette, LayoutGrid, X, MapPin, Target } from "lucide-react";
import { LIGHTNING_DESIGNS } from './LightningStyles';
import html2canvas from "html2canvas";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import './FoudreFrance.css';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GEO_CACHE = new Map();

const HOUR_COLORS = [
    // 0h - 4h
    "#0055ff", "#0055ff", "#0055ff", "#0055ff",
    // 4h - 8h
    "#00aaff", "#00aaff", "#00aaff", "#00aaff",
    // 8h - 12h
    "#00ffaa", "#00ffaa", "#00ffaa", "#00ffaa",
    // 12h - 16h
    "#22c55e", "#22c55e", "#22c55e", "#22c55e",
    // 16h - 20h
    "#eab308", "#eab308", "#eab308", "#eab308",
    // 20h - 24h
    "#ef4444", "#ef4444", "#ef4444", "#ef4444"
];

const MAP_PALETTES = {
    default: { name: "Classique", fill: "#eef2f7", stroke: "#000", bg: "#ffffff" },
    blue:    { name: "Océan",     fill: "#dbeafe", stroke: "#000", bg: "#f0f9ff" }
};

const ALL_DEPTS = [...DEPARTMENTS.map(d => d.code), '2A', '2B'].filter((v,i,a) => a.indexOf(v) === i);
const RADII_KM    = [1, 3, 5, 10, 20];
const RADII_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];

// Dimensions
const STD_W = 960, STD_H = 720;     // Mode standard
const COM_PANEL = 252;               // Largeur panneau gauche commune
const COM_MAP   = 728;               // Largeur SVG carte commune (carré)
const COM_H     = 728;               // Hauteur totale en mode commune

const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export default function FoudreExpert() {
    // ── Géo ──────────────────────────────────────────────
    const [geoMode, setGeoMode]               = useState("france");
    const [selectedRegion, setSelectedRegion] = useState("Hauts-de-France");
    const [selectedDept, setSelectedDept]     = useState("59");
    const [geoData, setGeoData]               = useState(null);

    // ── Commune ───────────────────────────────────────────
    const [communeQuery, setCommuneQuery]           = useState('');
    const [communeSuggestions, setCommuneSuggestions] = useState([]);
    const [selectedCommune, setSelectedCommune]     = useState(null);
    const [showSuggestions, setShowSuggestions]     = useState(false);
    const [communeZoomRange, setCommuneZoomRange]   = useState(20); // 20 ou 2
    const [searchMode, setSearchMode]               = useState('commune'); // 'commune' ou 'adresse'
    const inputRef   = useRef(null);
    const suggestRef = useRef(null);

    // ── Données ───────────────────────────────────────────
    const [strikes, setStrikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const todayLocal = new Date().toLocaleDateString('sv-SE');
    const [startDate, setStartDate] = useState(todayLocal);
    const [endDate, setEndDate]     = useState(todayLocal);
    const [isRange, setIsRange]     = useState(false);

    // ── Style ─────────────────────────────────────────────
    const [mapPalette, setMapPalette]     = useState("default");
    const [showCities, setShowCities]     = useState(true);
    const [showLogo, setShowLogo]         = useState(true);
    const [strikeSize, setStrikeSize]     = useState(4);
    const [foudreDesign, setFoudreDesign] = useState("Classic");

    // ── Chargement GeoJSON ────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const depts = (geoMode === "france" || geoMode === "commune")
                ? ALL_DEPTS
                : geoMode === "dept" ? [selectedDept] : (REGIONS[selectedRegion] || []);
            const key = (geoMode === "france" || geoMode === "commune") ? "geo-france"
                : `geo-${geoMode}-${geoMode==='region'?selectedRegion:selectedDept}`;
            if (GEO_CACHE.has(key)) { setGeoData(GEO_CACHE.get(key)); return; }
            if (!GEO_CACHE.has('base-fr')) {
                const res = await fetch("/data/departements-version-simplifiee.geojson");
                GEO_CACHE.set('base-fr', await res.json());
            }
            const filtered = { type:"FeatureCollection", features: GEO_CACHE.get('base-fr').features.filter(f => depts.includes(f.properties.code)) };
            GEO_CACHE.set(key, filtered);
            setGeoData(filtered);
        };
        load();
    }, [geoMode, selectedRegion, selectedDept]);

    // ── Recherche commune / adresse ────────────────────────
    const searchCommune = useCallback(async (q) => {
        if (q.length < 2) { setCommuneSuggestions([]); setShowSuggestions(false); return; }
        try {
            if (searchMode === 'commune') {
                const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&limit=8&fields=nom,code,codesPostaux,centre,codeDepartement&boost=population`);
                if (!res.ok) return;
                const data = await res.json();
                const list = data.map(c => ({ name:c.nom, cp:c.codesPostaux?.[0]||'', dept:c.codeDepartement, lat:c.centre?.coordinates?.[1], lon:c.centre?.coordinates?.[0] })).filter(c=>c.lat&&c.lon);
                setCommuneSuggestions(list);
                setShowSuggestions(list.length > 0);
            } else {
                // Recherche d'adresse via l'API nationale geo.api.gouv.fr
                const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=6`);
                if (!res.ok) return;
                const data = await res.json();
                const list = (data.features || []).map(f => ({
                    name: f.properties.name,
                    cp: `${f.properties.postcode} ${f.properties.city}`,
                    dept: f.properties.postcode?.substring(0, 2) || '',
                    lat: f.geometry?.coordinates?.[1],
                    lon: f.geometry?.coordinates?.[0],
                    isAddress: true,
                    label: f.properties.label
                })).filter(c => c.lat && c.lon);
                setCommuneSuggestions(list);
                setShowSuggestions(list.length > 0);
            }
        } catch(e) {}
    }, [searchMode]);
    useEffect(() => { const t = setTimeout(()=>searchCommune(communeQuery), 300); return ()=>clearTimeout(t); }, [communeQuery, searchCommune]);
    useEffect(() => {
        const h = e => { if (suggestRef.current&&!suggestRef.current.contains(e.target)&&inputRef.current&&!inputRef.current.contains(e.target)) setShowSuggestions(false); };
        document.addEventListener('mousedown', h);
        return ()=>document.removeEventListener('mousedown', h);
    }, []);

    // ── Fetch impacts ─────────────────────────────────────
    const fetchStrikes = async () => {
        setLoading(true);
        try {
            const sDate=new Date(startDate), eDate=isRange?new Date(endDate):sDate;
            if (!isValid(sDate)||!isValid(eDate)) return;
            const getDays=(s,e)=>{const a=[];let c=new Date(s),lim=0;while(c<=e&&lim<31){a.push(c.toISOString().split('T')[0]);c.setDate(c.getDate()+1);lim++;}return a;};
            const todayStr=format(new Date(),"yyyy-MM-dd");
            let allAcc=[];
            if (startDate===todayStr&&!isRange) {
                const res = await fetch('https://meteo-npdc.fr/api/v2/lightning/get_latest?minutes=1440', {
                    referrerPolicy: "no-referrer"
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && Array.isArray(json.data)) {
                        allAcc = json.data.map((s, i) => {
                            const d = new Date(s.unix_timestamp * 1000);
                            return {
                                lat: s.latitude,
                                lon: s.longitude,
                                time: d.getTime(),
                                h: d.getUTCHours(),
                                raw: d.toISOString().substring(11, 19),
                                date: d.toISOString().substring(0, 10),
                                id: `live-${s.unix_timestamp}-${i}`,
                                isRecent: (Date.now() - d.getTime()) / 60000 < 30
                            };
                        }).sort((a, b) => b.time - a.time);
                    }
                }
            } else {
                const days=isRange?getDays(startDate,endDate):[startDate];
                let all=[];
                for(const dStr of days){let from=0;while(true){const{data,error}=await supabase.from('lightning_strikes').select('lat,lon,strike_time').gte('strike_time',`${dStr}T00:00:00Z`).lte('strike_time',`${dStr}T23:59:59Z`).range(from,from+999);if(error||!data||data.length===0)break;all.push(...data);if(data.length<1000)break;from+=1000;}}
                allAcc=all.map((s,i)=>{const d=new Date(s.strike_time);return{lat:s.lat,lon:s.lon,time:d.getTime(),h:d.getHours(),raw:d.toLocaleTimeString('fr-FR'),date:d.toLocaleDateString('fr-FR'),id:`arch-${i}`};}).sort((a,b)=>b.time-a.time);
            }
            setStrikes(allAcc);
        } catch(e){console.error(e);}
        finally{setLoading(false);}
    };
    useEffect(()=>{fetchStrikes();},[startDate,endDate,isRange]);

    // ── Projection standard ───────────────────────────────
    const projection = useMemo(()=>{
        if (!geoData) return null;
        return geoConicConformal().fitExtent([[50,80],[STD_W-50,STD_H-50]],geoData);
    },[geoData]);
    const pathGenerator = useMemo(()=>projection?geoPath().projection(projection):null,[projection]);

    // activeRadii : s'adapte selon le zoom sélectionné (20 km ou 2 km)
    const activeRadii = useMemo(() => {
        return communeZoomRange === 2 ? [0.1, 0.5, 1.0, 1.5, 2.0] : RADII_KM;
    }, [communeZoomRange]);

    // ── Zoom commune : projection France + transform SVG ──
    // La carte commune est un carré COM_MAP × COM_MAP
    const communeZoom = useMemo(()=>{
        if (!selectedCommune||!projection||geoMode!=='commune') return null;
        const [cx,cy]=projection([selectedCommune.lon,selectedCommune.lat]);
        const [,cy2]=projection([selectedCommune.lon,selectedCommune.lat+1/111.32]);
        const pxPerKm=Math.abs(cy-cy2);
        // On veut que le rayon ciblé tienne dans (COM_MAP/2 - 50px)
        const scale=(COM_MAP/2-50)/(communeZoomRange*pxPerKm);
        const tx=COM_MAP/2-cx*scale;
        const ty=COM_H/2-cy*scale;
        return{cx,cy,scale,pxPerKm,tx,ty,svgTransform:`translate(${tx},${ty}) scale(${scale})`};
    },[selectedCommune,projection,geoMode,communeZoomRange]);

    // ── Impacts par rayon ──────────────────────────────────
    const impactsByRadius = useMemo(()=>{
        if (!selectedCommune) return {};
        return activeRadii.reduce((acc,r)=>{ acc[r]=strikes.filter(s=>haversineKm(selectedCommune.lat,selectedCommune.lon,s.lat,s.lon)<=r).length; return acc; },{});
    },[strikes,selectedCommune,activeRadii]);

    const closestStrike = useMemo(()=>{
        if (!selectedCommune||strikes.length===0) return null;
        let minDist=Infinity,best=null;
        for(const s of strikes){const d=haversineKm(selectedCommune.lat,selectedCommune.lon,s.lat,s.lon);if(d<minDist){minDist=d;best=s;}}
        return best&&minDist<=20?{...best,distance:minDist}:null;
    },[strikes,selectedCommune]);

    const visibleStrikes = useMemo(()=>{
        if (geoMode==='commune'&&selectedCommune) return strikes.filter(s=>haversineKm(selectedCommune.lat,selectedCommune.lon,s.lat,s.lon)<=communeZoomRange);
        if (!projection) return [];
        return strikes.filter(s=>{const c=projection([s.lon,s.lat]);return c&&c[0]>=0&&c[0]<=STD_W&&c[1]>=0&&c[1]<=STD_H;});
    },[strikes,geoMode,selectedCommune,projection,communeZoomRange]);

    const exportMap = ()=>{
        html2canvas(document.getElementById("export-foudre"),{scale:2}).then(canvas=>{
            const a=document.createElement("a");
            a.download=`foudre-${geoMode==='commune'&&selectedCommune?selectedCommune.name:geoMode}-${startDate}.png`;
            a.href=canvas.toDataURL();a.click();
        });
    };

    // ── Rendu d'un impact ──────────────────────────────────────────────────────
    // scale : facteur de zoom SVG appliqué (pour corriger les épaisseurs de trait)
    // colorOverride : couleur optionnelle passée par le parent (ex. en mode commune pour colorer par rayon)
    const renderStrike = (s, proj, sz, scale, colorOverride) => {
        const coords = proj([s.lon, s.lat]);
        if (!coords) return null;
        const sw = scale ? 1 / scale : 1; // strokeWidth en espace projection
        const color = colorOverride || HOUR_COLORS[s.h] || '#ff0000';
        if (foudreDesign==='Glow')    return <g key={s.id}><circle cx={coords[0]} cy={coords[1]} r={sz*3} fill={color} fillOpacity={0.25}/><circle cx={coords[0]} cy={coords[1]} r={sz} fill={color}/></g>;
        if (foudreDesign==='Cross')   return <g key={s.id} stroke={color} strokeWidth={sw*1.5}><line x1={coords[0]-sz*1.5} y1={coords[1]} x2={coords[0]+sz*1.5} y2={coords[1]}/><line x1={coords[0]} y1={coords[1]-sz*1.5} x2={coords[0]} y2={coords[1]+sz*1.5}/></g>;
        if (foudreDesign==='Ring')    return <g key={s.id}><circle cx={coords[0]} cy={coords[1]} r={sz*1.5} fill="none" stroke={color} strokeWidth={sw*2}/><circle cx={coords[0]} cy={coords[1]} r={sz*0.5} fill={color}/></g>;
        if (foudreDesign==='Diamond') return <path key={s.id} d={`M${coords[0]} ${coords[1]-sz*1.5}L${coords[0]+sz*1.5} ${coords[1]}L${coords[0]} ${coords[1]+sz*1.5}L${coords[0]-sz*1.5} ${coords[1]}Z`} fill={color} strokeWidth={0}/>;
        if (foudreDesign==='Bolt')    return <path key={s.id} d={`M${coords[0]} ${coords[1]-sz*2}L${coords[0]-sz} ${coords[1]+sz*.5}L${coords[0]} ${coords[1]+sz*.5}L${coords[0]-sz*.5} ${coords[1]+sz*2}L${coords[0]+sz} ${coords[1]-sz*.5}L${coords[0]} ${coords[1]-sz*.5}Z`} fill={color}/>;
        // Classic (default)
        return <circle key={s.id} cx={coords[0]} cy={coords[1]} r={s.isRecent?sz*1.3:sz} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={sw*0.8}/>;
    };

    // Rendu d'un impact directement en coordonnées écran (évite les bugs de précision SVG/Browser sous zoom fort)
    const renderStrikeScreen = (s, colorOverride) => {
        const pCoord = projection([s.lon, s.lat]);
        if (!pCoord || !communeZoom) return null;
        const sx = COM_MAP/2 + (pCoord[0] - communeZoom.cx) * communeZoom.scale;
        const sy = COM_H/2 + (pCoord[1] - communeZoom.cy) * communeZoom.scale;
        const sz = strikeSize;
        const color = colorOverride || HOUR_COLORS[s.h] || '#ff0000';
        
        if (foudreDesign==='Glow')    return <g key={s.id}><circle cx={sx} cy={sy} r={sz*3} fill={color} fillOpacity={0.25}/><circle cx={sx} cy={sy} r={sz} fill={color}/></g>;
        if (foudreDesign==='Cross')   return <g key={s.id} stroke={color} strokeWidth={1.5}><line x1={sx-sz*1.5} y1={sy} x2={sx+sz*1.5} y2={sy}/><line x1={sx} y1={sy-sz*1.5} x2={sx} y2={sy+sz*1.5}/></g>;
        if (foudreDesign==='Ring')    return <g key={s.id}><circle cx={sx} cy={sy} r={sz*1.5} fill="none" stroke={color} strokeWidth={2}/><circle cx={sx} cy={sy} r={sz*0.5} fill={color}/></g>;
        if (foudreDesign==='Diamond') return <path key={s.id} d={`M${sx} ${sy-sz*1.5}L${sx+sz*1.5} ${sy}L${sx} ${sy+sz*1.5}L${sx-sz*1.5} ${sy}Z`} fill={color} strokeWidth={0}/>;
        if (foudreDesign==='Bolt')    return <path key={s.id} d={`M${sx} ${sy-sz*2}L${sx-sz} ${sy+sz*.5}L${sx} ${sy+sz*.5}L${sx-sz*.5} ${sy+sz*2}L${sx+sz} ${sy-sz*.5}L${sx} ${sy-sz*.5}Z`} fill={color}/>;
        
        return <circle key={s.id} cx={sx} cy={sy} r={s.isRecent?sz*1.3:sz} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={0.8}/>;
    };

    const mp = MAP_PALETTES[mapPalette];
    const dateLabel = isValid(new Date(startDate))
        ? (isRange&&endDate&&isValid(new Date(endDate))
            ? `Du ${format(new Date(startDate),"dd/MM")} au ${format(new Date(endDate),"dd/MM/yy")}`
            : format(new Date(startDate),"d MMMM yyyy",{locale:fr}))
        : "Date invalide";

    return (
        <div style={{padding:'20px',background:'#f1f5f9',minHeight:'100vh',fontFamily:'system-ui,sans-serif'}}>

            {/* ── BARRE CONTRÔLE ── */}
            <header style={{maxWidth:'1220px',margin:'0 auto 15px',display:'flex',flexDirection:'column',gap:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                        <div style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',padding:'9px',borderRadius:'12px',color:'white',display:'flex',boxShadow:'0 4px 12px rgba(239,68,68,0.4)'}}>
                            <Zap fill="white" size={22}/>
                        </div>
                        <div>
                            <h1 style={{margin:0,fontSize:'1.5rem',fontWeight:900,color:'#0f172a',letterSpacing:'-0.5px'}}>Générateur Foudre Expert</h1>
                            <p style={{margin:0,fontSize:'0.78rem',color:'#64748b'}}>
                                {strikes.length.toLocaleString()} impacts · {visibleStrikes.length.toLocaleString()} sur zone
                                {geoMode==='commune'&&closestStrike&&` · ⚡ Plus proche : ${closestStrike.distance.toFixed(1)} km`}
                            </p>
                        </div>
                    </div>
                    <div style={{display:'flex',gap:'8px'}}>
                        <button onClick={fetchStrikes} disabled={loading} style={{padding:'9px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'white',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',fontWeight:700,fontSize:'0.8rem',color:'#374151'}}>
                            <RefreshCw size={16} className={loading?"animate-spin":""}/>
                        </button>
                        <button onClick={exportMap} style={{padding:'9px 18px',borderRadius:'10px',background:'#0f172a',color:'white',border:'none',cursor:'pointer',fontWeight:800,display:'flex',alignItems:'center',gap:'8px',fontSize:'0.82rem'}}>
                            <Download size={16}/> EXPORTER PNG
                        </button>
                    </div>
                </div>

                <div style={{display:'flex',flexWrap:'wrap',gap:'10px',background:'white',padding:'12px 16px',borderRadius:'14px',border:'1px solid #e2e8f0',alignItems:'center',boxShadow:'0 2px 4px rgba(0,0,0,0.04)'}}>
                    {/* Modes */}
                    <div style={{display:'flex',gap:'3px',background:'#f1f5f9',padding:'3px',borderRadius:'9px'}}>
                        {[['france','France'],['region','Région'],['dept','Dépt']].map(([m,l])=>(
                            <button key={m} onClick={()=>setGeoMode(m)} style={{padding:'5px 12px',border:'none',borderRadius:'7px',cursor:'pointer',fontWeight:800,fontSize:'0.78rem',background:geoMode===m?'white':'transparent',color:geoMode===m?'#ef4444':'#64748b',transition:'all .15s'}}>{l}</button>
                        ))}
                        <button onClick={()=>setGeoMode('commune')} style={{padding:'5px 12px',border:'none',borderRadius:'7px',cursor:'pointer',fontWeight:800,fontSize:'0.78rem',background:geoMode==='commune'?'white':'transparent',color:geoMode==='commune'?'#ef4444':'#64748b',display:'flex',alignItems:'center',gap:'4px'}}>
                            <Target size={12}/> Commune
                        </button>
                    </div>

                    {geoMode==='region'&&<select value={selectedRegion} onChange={e=>setSelectedRegion(e.target.value)} style={{padding:'7px',borderRadius:'9px',border:'1px solid #cbd5e1',fontWeight:700,outline:'none',fontSize:'0.82rem'}}>{Object.keys(REGIONS).sort().map(r=><option key={r} value={r}>{r}</option>)}</select>}
                    {geoMode==='dept'&&<select value={selectedDept} onChange={e=>setSelectedDept(e.target.value)} style={{padding:'7px',borderRadius:'9px',border:'1px solid #cbd5e1',fontWeight:700,outline:'none',fontSize:'0.82rem'}}>{DEPARTMENTS.map(d=><option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}</select>}

                    {/* Recherche commune ou adresse précise */}
                    {geoMode==='commune'&&(
                        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                            {/* Sélecteur de mode de recherche */}
                            <div style={{display:'flex',gap:'2px',background:'#f1f5f9',padding:'2px',borderRadius:'7px'}}>
                                <button onClick={()=>{setSearchMode('commune');setCommuneQuery('');setSelectedCommune(null);}}
                                    style={{padding:'4px 9px',border:'none',borderRadius:'5px',cursor:'pointer',fontSize:'0.72rem',fontWeight:850,background:searchMode==='commune'?'white':'transparent',color:searchMode==='commune'?'#00b4d8':'#64748b',transition:'all .15s'}}>
                                    Commune
                                </button>
                                <button onClick={()=>{setSearchMode('adresse');setCommuneQuery('');setSelectedCommune(null);}}
                                    style={{padding:'4px 9px',border:'none',borderRadius:'5px',cursor:'pointer',fontSize:'0.72rem',fontWeight:850,background:searchMode==='adresse'?'white':'transparent',color:searchMode==='adresse'?'#00b4d8':'#64748b',transition:'all .15s'}}>
                                    Adresse
                                </button>
                            </div>

                            <div style={{position:'relative'}}>
                                <div style={{display:'flex',alignItems:'center',gap:'7px',background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'9px',padding:'5px 11px'}}>
                                    <Search size={15} color="#64748b"/>
                                    <input ref={inputRef} type="text"
                                        placeholder={searchMode==='commune'?"Rechercher une commune...":"8 rue de la Gare, 75000..."}
                                        value={communeQuery}
                                        onChange={e=>setCommuneQuery(e.target.value)} onFocus={()=>communeSuggestions.length>0&&setShowSuggestions(true)}
                                        style={{border:'none',background:'transparent',outline:'none',fontWeight:700,fontSize:'0.83rem',width:'220px',color:'#0f172a'}}/>
                                    {communeQuery&&<button onClick={()=>{setCommuneQuery('');setSelectedCommune(null);setCommuneSuggestions([]);}} style={{border:'none',background:'none',cursor:'pointer',padding:0,display:'flex'}}><X size={13} color="#94a3b8"/></button>}
                                </div>
                                {showSuggestions&&communeSuggestions.length>0&&(
                                    <div ref={suggestRef} style={{position:'absolute',top:'100%',left:0,marginTop:'4px',background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',boxShadow:'0 10px 25px rgba(0,0,0,0.12)',zIndex:1000,minWidth:'280px',overflow:'hidden'}}>
                                        {communeSuggestions.map((c,i)=>(
                                            <button key={i} onClick={()=>{setSelectedCommune(c);setCommuneQuery(c.isAddress ? `${c.name}, ${c.cp}` : `${c.name} (${c.cp})`);setShowSuggestions(false);}}
                                                style={{display:'flex',alignItems:'center',gap:'9px',width:'100%',padding:'9px 13px',border:'none',borderBottom:i<communeSuggestions.length-1?'1px solid #f1f5f9':'none',background:'white',cursor:'pointer',textAlign:'left'}}
                                                onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                                                <MapPin size={13} color={c.isAddress ? "#00b4d8" : "#ef4444"}/>
                                                <div style={{flex:1}}>
                                                    <div style={{fontWeight:800,fontSize:'0.83rem',color:'#0f172a'}}>{c.isAddress ? c.name : c.name}</div>
                                                    <div style={{fontSize:'0.7rem',color:'#64748b'}}>{c.isAddress ? c.label : `${c.cp} — Dép. ${c.dept}`}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{width:'1px',height:'28px',background:'#e2e8f0'}}/>

                    {/* Date */}
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <Calendar size={16} color="#64748b"/>
                        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{padding:'6px 8px',borderRadius:'9px',border:'1px solid #cbd5e1',fontWeight:800,fontSize:'0.82rem'}}/>
                        {isRange&&<><span style={{fontWeight:700,fontSize:'0.82rem'}}>au</span><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{padding:'6px 8px',borderRadius:'9px',border:'1px solid #cbd5e1',fontWeight:800,fontSize:'0.82rem'}}/></>}
                        <label style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.78rem',fontWeight:700,color:'#475569',cursor:'pointer'}}><input type="checkbox" checked={isRange} onChange={e=>setIsRange(e.target.checked)}/> Période</label>
                    </div>

                    <div style={{width:'1px',height:'28px',background:'#e2e8f0'}}/>

                    {/* Style */}
                    <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
                        <Palette size={16} color="#64748b"/>
                        <select value={mapPalette} onChange={e=>setMapPalette(e.target.value)} style={{padding:'6px',borderRadius:'9px',border:'1px solid #cbd5e1',fontWeight:700,outline:'none',fontSize:'0.82rem'}}>
                            {Object.entries(MAP_PALETTES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                        </select>
                        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                            <Maximize size={14} color="#64748b"/>
                            <input type="range" min="2" max="15" value={strikeSize} onChange={e=>setStrikeSize(parseInt(e.target.value))} style={{width:'70px'}}/>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                            <LayoutGrid size={14} color="#64748b"/>
                            <select value={foudreDesign} onChange={e=>setFoudreDesign(e.target.value)} style={{padding:'6px',borderRadius:'9px',border:'1px solid #cbd5e1',fontWeight:700,outline:'none',fontSize:'0.82rem'}}>
                                {Object.entries(LIGHTNING_DESIGNS).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                            </select>
                        </div>
                        <div style={{width:'1px',height:'28px',background:'#e2e8f0'}}/>
                        <label style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.78rem',fontWeight:700,color:'#475569',cursor:'pointer'}}><input type="checkbox" checked={showCities} onChange={e=>setShowCities(e.target.checked)}/> Villes</label>
                        <label style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.78rem',fontWeight:700,color:'#475569',cursor:'pointer'}}><input type="checkbox" checked={showLogo} onChange={e=>setShowLogo(e.target.checked)}/> Logo</label>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════
                MODE COMMUNE — layout splitté premium
            ══════════════════════════════════════════════════════ */}
            {geoMode==='commune'&&(
                <main style={{display:'flex',justifyContent:'center'}}>
                    <div id="export-foudre" style={{display:'flex',width:COM_PANEL+COM_MAP,height:COM_H,borderRadius:'20px',overflow:'hidden',boxShadow:'0 24px 48px rgba(0,0,0,0.18)',border:'1px solid rgba(255,255,255,0.1)'}}>

                        {/* ── PANNEAU GAUCHE ── */}
                        <div style={{width:COM_PANEL,minWidth:COM_PANEL,height:COM_H,background:'linear-gradient(180deg,#0d1b2a 0%,#0f172a 60%,#0d1b2a 100%)',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
                            {/* Dégradé déco */}
                            <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6)'}}/>

                            {/* En-tête commune */}
                            <div style={{padding:'12px 16px 8px'}}>
                                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'2px'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                        <div style={{background:'rgba(239,68,68,0.15)',borderRadius:'6px',padding:'4px',display:'flex'}}>
                                            <Target size={12} color="#ef4444"/>
                                        </div>
                                        <div>
                                            <div style={{fontWeight:900,fontSize:'1rem',color:'white',lineHeight:1.1}}>{selectedCommune?.name||'—'}</div>
                                            {selectedCommune&&<div style={{fontSize:'0.65rem',color:'#64748b',fontWeight:600}}>{selectedCommune.cp}</div>}
                                        </div>
                                    </div>
                                    {selectedCommune&&(
                                        <button onClick={()=>{setSelectedCommune(null);setCommuneQuery('');}} style={{border:'none',background:'rgba(255,255,255,0.08)',borderRadius:'5px',color:'#94a3b8',cursor:'pointer',padding:'2px 5px',fontSize:'0.68rem',lineHeight:1}}>✕</button>
                                    )}
                                </div>
                                <div style={{fontSize:'0.62rem',color:'#475569',fontWeight:700,marginTop:'5px',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'8px'}}>{dateLabel}</div>
                                
                                {/* Sélecteur de Zoom (20km ou 2km) */}
                                {selectedCommune&&(
                                    <div style={{display:'flex',gap:'3px',background:'rgba(255,255,255,0.06)',padding:'2px',borderRadius:'7px',marginTop:'4px'}}>
                                        {[20, 2].map(r => (
                                            <button key={r} onClick={()=>setCommuneZoomRange(r)} style={{
                                                flex:1,padding:'4.5px 0',border:'none',borderRadius:'5px',cursor:'pointer',fontSize:'0.7rem',fontWeight:850,
                                                background:communeZoomRange===r?'#38bdf8':'transparent',
                                                color:communeZoomRange===r?'#0f172a':'#94a3b8',
                                                transition:'all .1s'
                                            }}>
                                                {r === 2 ? 'Zoom 2 km' : 'Radar 20 km'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ligne séparatrice */}
                            <div style={{height:'1px',background:'rgba(255,255,255,0.06)',margin:'0 12px'}}/>

                            {/* Titre section */}
                            <div style={{padding:'8px 16px 4px',display:'flex',alignItems:'center',gap:'6px'}}>
                                <Zap size={12} color="#fbbf24" fill="#fbbf24"/>
                                <span style={{fontSize:'0.62rem',fontWeight:900,color:'#fbbf24',textTransform:'uppercase',letterSpacing:'1px'}}>Impacts foudre par rayon</span>
                            </div>

                            {/* Rayons */}
                            <div style={{padding:'0 12px',flex:'0 0 auto'}}>
                                {activeRadii.map((r,idx)=>{
                                    const count=selectedCommune?(impactsByRadius[r]||0):0;
                                    const prev=idx>0?(impactsByRadius[activeRadii[idx-1]]||0):0;
                                    const ring=count-prev;
                                    const label = r >= 1 ? `≤ ${r} km` : `≤ ${r*1000} m`;
                                    const ringLabel = r >= 1 ? `dans l'anneau` : `dans la zone`;
                                    const circleLabel = r >= 1 ? `${r}k` : `${r*1000}`;
                                    return (
                                        <div key={r} style={{display:'flex',alignItems:'center',gap:'8px',padding:'5px 10px',borderRadius:'8px',background:count>0?'rgba(255,255,255,0.04)':'transparent',marginBottom:'2px',border:'1px solid',borderColor:count>0?'rgba(255,255,255,0.07)':'transparent'}}>
                                            {/* Indicateur couleur */}
                                            <div style={{width:'22px',height:'22px',borderRadius:'50%',border:`1.5px dashed ${RADII_COLORS[idx]}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:`${RADII_COLORS[idx]}10`}}>
                                                <span style={{fontSize:'0.48rem',fontWeight:900,color:RADII_COLORS[idx]}}>{circleLabel}</span>
                                            </div>
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'0.76rem',fontWeight:700,color:'#cbd5e1'}}>{label}</div>
                                                {idx>0&&ring>0&&<div style={{fontSize:'0.58rem',color:'#475569'}}>+{ring} {ringLabel}</div>}
                                            </div>
                                            <div style={{fontSize:'0.92rem',fontWeight:900,color:count>0?RADII_COLORS[idx]:'#334155',minWidth:'28px',textAlign:'right'}}>{count}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Plus proche */}
                            {closestStrike?(
                                <div style={{margin:'6px 12px',padding:'6px 10px',borderRadius:'8px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)'}}>
                                    <div style={{fontSize:'0.58rem',fontWeight:900,color:'#ef4444',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'2px'}}>⚡ Impact le plus proche</div>
                                    <div style={{fontSize:'0.95rem',fontWeight:900,color:'white'}}>{closestStrike.distance.toFixed(1)} km</div>
                                    <div style={{fontSize:'0.65rem',color:'#94a3b8'}}>{closestStrike.raw}</div>
                                </div>
                            ):(
                                <div style={{margin:'6px 12px',padding:'6px 10px',borderRadius:'8px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                                    <div style={{fontSize:'0.58rem',color:'#334155',fontWeight:700}}>{selectedCommune?'Aucun impact dans les 20 km':'Sélectionnez une commune'}</div>
                                </div>
                            )}

                            {/* Ligne séparatrice */}
                            <div style={{height:'1px',background:'rgba(255,255,255,0.06)',margin:'0 12px'}}/>

                            {/* Titre section */}
                            <div style={{padding:'8px 16px 4px',display:'flex',alignItems:'center',gap:'6px'}}>
                                <Target size={12} color="#38bdf8"/>
                                <span style={{fontSize:'0.62rem',fontWeight:900,color:'#38bdf8',textTransform:'uppercase',letterSpacing:'1px'}}>Chronologie des impacts</span>
                            </div>

                            <div style={{padding:'0 12px',flex:'0 0 auto',display:'flex',flexDirection:'column',gap:'3px'}}>
                                {[0,4,8,12,16,20].map(hBase=>{
                                    const count=visibleStrikes.filter(s=>s.h>=hBase&&s.h<hBase+4).length;
                                    return (
                                        <div key={hBase} style={{display:'flex',alignItems:'center',gap:'6px',padding:'2px 6px',borderRadius:'5px',background:count>0?'rgba(255,255,255,0.02)':'transparent',border:'1px solid',borderColor:count>0?'rgba(255,255,255,0.04)':'transparent'}}>
                                            {/* Badge heure neutre sans couleur */}
                                            <div style={{
                                                background:'rgba(255,255,255,0.08)',
                                                color:'#e2e8f0',
                                                fontWeight:800,fontSize:'0.62rem',padding:'2px 4px',borderRadius:'4px',minWidth:'52px',textAlign:'center',
                                                border:'1px solid rgba(255,255,255,0.1)',
                                                boxShadow:'0 1.5px 3px rgba(0,0,0,0.2)'
                                            }}>
                                                {hBase}h - {hBase+4}h
                                            </div>
                                            {/* Mini-barre de proportion neutre (bleu ciel) */}
                                            <div style={{flex:1,height:'4px',background:'rgba(255,255,255,0.04)',borderRadius:'2px',overflow:'hidden'}}>
                                                <div style={{width:`${Math.min(100,(count/Math.max(1,visibleStrikes.length))*100)}%`,height:'100%',background:'#38bdf8'}}/>
                                            </div>
                                            {/* Nombre */}
                                            <span style={{fontSize:'0.68rem',fontWeight:900,color:count>0?'#38bdf8':'#475569',minWidth:'20px',textAlign:'right'}}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* TOTAL */}
                            <div style={{margin:'8px 12px 4px',padding:'8px 10px',borderRadius:'8px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',textAlign:'center'}}>
                                <div style={{fontSize:'0.55rem',fontWeight:900,color:'#475569',textTransform:'uppercase',letterSpacing:'0.8px'}}>Total (≤20 km)</div>
                                <div style={{fontSize:'1.5rem',fontWeight:900,color:'white',lineHeight:1.1}}>{visibleStrikes.length.toLocaleString()}</div>
                                <div style={{fontSize:'0.58rem',color:'#64748b'}}>impacts détectés</div>
                            </div>

                            {/* Bouton de téléchargement & Logo côte à côte */}
                            <div style={{padding:'8px 12px 12px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',marginTop:'auto',width:'100%'}}>
                                {showLogo && (
                                    <div style={{background:'white',padding:'3px 6px',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 4px rgba(0,0,0,0.15)',height:'30px'}}>
                                        <img src="/logo.jpg" style={{height:'20px',display:'block'}}/>
                                    </div>
                                )}
                                <button data-html2canvas-ignore="true" onClick={exportMap} style={{flex:1,padding:'8px 10px',border:'none',borderRadius:'8px',background:'#00b4d8',color:'#07131e',cursor:'pointer',fontWeight:900,fontSize:'0.7rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',letterSpacing:'0.2px',boxShadow:'0 2px 8px rgba(0,180,216,0.35)',transition:'all .15s'}}
                                    onMouseEnter={e=>{e.currentTarget.style.background='#00c4f8';e.currentTarget.style.transform='scale(1.02)';}}
                                    onMouseLeave={e=>{e.currentTarget.style.background='#00b4d8';e.currentTarget.style.transform='scale(1)';}}>
                                    <Download size={12}/> VUE
                                </button>
                            </div>
                        </div>

                        {/* ── CARTE SVG COMMUNE (carrée) ── */}
                        <div style={{flex:1,background:mp.bg,position:'relative',overflow:'hidden'}}>
                            <svg width={COM_MAP} height={COM_H}>
                                {/* Groupe zoomé contenant les cartes de fond uniquement */}
                                <g transform={communeZoom?.svgTransform||''}>
                                    {/* Fond départements */}
                                    {geoData?.features.map((f,i)=>(
                                        <path key={i} d={pathGenerator?.(f)} fill={mp.fill} stroke="#999" strokeWidth={communeZoom?0.6/communeZoom.scale:0.6}/>
                                    ))}
                                </g>

                                {/* Cercles concentriques rendus en coordonnées écran (évite le flou/disparition sous zoom fort) */}
                                {selectedCommune&&communeZoom&&(
                                    communeZoomRange === 20 ? (
                                        RADII_KM.map((r,idx)=>{
                                            const rScreen = r * communeZoom.pxPerKm * communeZoom.scale;
                                            return (
                                                <circle key={r} cx={COM_MAP/2} cy={COM_H/2}
                                                    r={rScreen}
                                                    fill={`${RADII_COLORS[idx]}08`}
                                                    stroke={RADII_COLORS[idx]}
                                                    strokeWidth={2}
                                                    strokeDasharray="10 5"/>
                                            );
                                        })
                                    ) : (
                                        // Mode 2km : cercles tous les 100m (0.1 à 2.0)
                                        Array.from({length: 20}, (_, i) => parseFloat(((i + 1) * 0.1).toFixed(1))).map(r => {
                                            const isMain = [0.1, 0.5, 1.0, 1.5, 2.0].includes(r);
                                            const mainIdx = isMain ? [0.1, 0.5, 1.0, 1.5, 2.0].indexOf(r) : -1;
                                            const color = isMain ? RADII_COLORS[mainIdx] : 'rgba(255,255,255,0.25)';
                                            const rScreen = r * communeZoom.pxPerKm * communeZoom.scale;
                                            return (
                                                <circle key={r} cx={COM_MAP/2} cy={COM_H/2}
                                                    r={rScreen}
                                                    fill={isMain ? `${color}05` : 'none'}
                                                    stroke={color}
                                                    strokeWidth={isMain ? 1.5 : 0.6}
                                                    strokeDasharray={isMain ? "8 4" : "3 3"}
                                                    opacity={isMain ? 0.8 : 0.3}/>
                                            );
                                        })
                                    )
                                )}

                                {/* Impacts de foudre dessinés en coordonnées écran */}
                                {projection&&strikes
                                    .filter(s=>selectedCommune?haversineKm(selectedCommune.lat,selectedCommune.lon,s.lat,s.lon)<=(communeZoomRange+0.2):true)
                                    .map(s=>{
                                        let color = '#ff0000';
                                        if (selectedCommune) {
                                            const d = haversineKm(selectedCommune.lat, selectedCommune.lon, s.lat, s.lon);
                                            if (communeZoomRange === 2) {
                                                if (d <= 0.1) color = RADII_COLORS[0];
                                                else if (d <= 0.5) color = RADII_COLORS[1];
                                                else if (d <= 1.0) color = RADII_COLORS[2];
                                                else if (d <= 1.5) color = RADII_COLORS[3];
                                                else color = RADII_COLORS[4];
                                            } else {
                                                if (d <= 1) color = RADII_COLORS[0];
                                                else if (d <= 3) color = RADII_COLORS[1];
                                                else if (d <= 5) color = RADII_COLORS[2];
                                                else if (d <= 10) color = RADII_COLORS[3];
                                                else color = RADII_COLORS[4];
                                            }
                                        }
                                        return renderStrikeScreen(s, color);
                                    })
                                }

                                {/* Marqueur commune / adresse dessiné au centre écran en taille pixel fixe */}
                                {selectedCommune&&communeZoom&&(
                                    <g transform={`translate(${COM_MAP/2}, ${COM_H/2})`}>
                                        {selectedCommune.isAddress ? (
                                            // Icone Maison premium pour l'adresse
                                            <g>
                                                <circle cx={0} cy={0} r={14} fill="rgba(56,189,248,0.15)" stroke="none"/>
                                                {/* Toit et murs de la maison */}
                                                <path d="M -6 2 L -6 8 L 6 8 L 6 2 L 0 -4 Z" fill="#00b4d8" stroke="white" strokeWidth={1.5}/>
                                                {/* Porte */}
                                                <rect x={-2} y={4} width={4} height={4} fill="white"/>
                                            </g>
                                        ) : (
                                            // Cercle classique pour la commune
                                            <g>
                                                <circle cx={0} cy={0} r={12} fill="rgba(204,0,0,0.15)" stroke="none"/>
                                                <circle cx={0} cy={0} r={6} fill="#cc0000" stroke="white" strokeWidth={2}/>
                                                <circle cx={0} cy={0} r={2} fill="white"/>
                                            </g>
                                        )}
                                    </g>
                                )}

                                {/* Labels cercles (hors groupe zoomé = taille écran fixe) */}
                                {selectedCommune&&communeZoom&&activeRadii.map((r,idx)=>{
                                    const rScreen=r*communeZoom.pxPerKm*communeZoom.scale;
                                    const label = r >= 1 ? `${r} km` : `${r*1000} m`;
                                    return (
                                        <text key={r} x={COM_MAP/2} y={COM_H/2-rScreen+14}
                                            textAnchor="middle"
                                            style={{fontSize:'11px',fontWeight:800,fill:RADII_COLORS[idx],stroke:'rgba(255,255,255,0.95)',strokeWidth:'3px',paintOrder:'stroke'}}>
                                            {label}
                                        </text>
                                    );
                                })}

                                {/* Nom commune */}
                                {selectedCommune&&communeZoom&&(
                                    <text x={COM_MAP/2} y={COM_H/2+20} textAnchor="middle"
                                        style={{fontSize:'14px',fontWeight:900,fill:'#0f172a',stroke:'rgba(255,255,255,0.95)',strokeWidth:'4px',paintOrder:'stroke'}}>
                                        {selectedCommune.name}
                                    </text>
                                )}

                                {/* Message si pas de commune */}
                                {!selectedCommune&&(
                                    <text x={COM_MAP/2} y={COM_H/2} textAnchor="middle" style={{fontSize:'16px',fontWeight:700,fill:'#94a3b8'}}>
                                        Recherchez une commune ci-dessus
                                    </text>
                                )}

                                {/* Watermark date en bas de carte */}
                                {selectedCommune&&(
                                    <text x={COM_MAP-12} y={COM_H-12} textAnchor="end"
                                        style={{fontSize:'10px',fontWeight:700,fill:'rgba(0,0,0,0.2)',fontFamily:'monospace'}}>
                                        {dateLabel} · météo-climat-pro.fr
                                    </text>
                                )}
                            </svg>
                        </div>
                    </div>
                </main>
            )}

            {/* ══════════════════════════════════════════════════════
                MODE STANDARD (France / Région / Dépt)
            ══════════════════════════════════════════════════════ */}
            {geoMode!=='commune'&&(
                <main style={{display:'flex',justifyContent:'center'}}>
                    <div id="export-foudre" style={{width:STD_W,height:STD_H,background:mp.bg,borderRadius:'20px',boxShadow:'0 20px 40px rgba(0,0,0,0.1)',overflow:'hidden',position:'relative',border:`6px solid ${mp.stroke}18`}}>
                        <svg width={STD_W} height={STD_H}>
                            <defs><clipPath id="map-clip">{geoData?.features.map((f,i)=><path key={i} d={pathGenerator?.(f)}/>)}</clipPath></defs>
                            <g>{geoData?.features.map((f,i)=><path key={i} d={pathGenerator?.(f)} fill={mp.fill} stroke="#000" strokeWidth={1.5}/>)}</g>
                            <g clipPath="url(#map-clip)">{projection&&strikes.map(s=>renderStrike(s,projection,strikeSize))}</g>
                            {showCities&&<g>{projection&&MAIN_CITIES.map((city,i)=>{
                                const c=projection([city.lon,city.lat]);
                                if(!c||c[0]<0||c[0]>STD_W||c[1]<0||c[1]>STD_H) return null;
                                return <g key={i} transform={`translate(${c[0]},${c[1]})`}><circle r="3.5" fill="#000"/><text y="-10" textAnchor="middle" style={{fontSize:'14px',fontWeight:'1000',fill:'#000',stroke:'#fff',strokeWidth:'3.5px',paintOrder:'stroke'}}>{city.name}</text></g>;
                            })}</g>}
                        </svg>

                        {/* Légende chronologie */}
                        <div style={{position:'absolute',top:'20px',left:geoMode==='dept'?'auto':'20px',right:geoMode==='dept'?'20px':'auto',background:'rgba(15,23,42,0.88)',backdropFilter:'blur(10px)',padding:'12px 15px',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.1)',width:'230px',zIndex:10}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                                <Zap size={14} color="#fbbf24" fill="#fbbf24"/>
                                <div>
                                    <div style={{fontSize:'0.7rem',fontWeight:900,color:'white',textTransform:'uppercase',letterSpacing:'0.5px'}}>Chronologie</div>
                                    <div style={{fontSize:'0.62rem',color:'#64748b',fontWeight:700}}>{dateLabel}</div>
                                </div>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'4px'}}>
                                {[0,4,8,12,16,20].map(h=><div key={h} style={{display:'flex',flexDirection:'column',gap:'2px'}}><div style={{width:'100%',height:'6px',background:HOUR_COLORS[h],borderRadius:'2px'}}/><span style={{fontSize:'0.48rem',fontWeight:800,color:'#94a3b8',textAlign:'center'}}>{h}h</span></div>)}
                            </div>
                            <div style={{marginTop:'8px',paddingTop:'7px',borderTop:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                <div style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#ef4444',animation:'simple-pulse 1s infinite'}}/><span style={{fontSize:'0.58rem',fontWeight:800,color:'#ef4444'}}>DIRECT</span></div>
                                <span style={{fontSize:'0.6rem',fontWeight:800,color:'#94a3b8'}}>{visibleStrikes.length.toLocaleString()} impacts</span>
                            </div>
                        </div>

                        {showLogo&&<img src="/logo.jpg" style={{position:'absolute',bottom:'20px',left:'20px',height:'50px',borderRadius:'9px',opacity:0.9,filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'}}/>}
                    </div>
                </main>
            )}
        </div>
    );
}
