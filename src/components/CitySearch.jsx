import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import './CitySearch.css';

export default function CitySearch() {
    const { location, updateLocation } = useLocation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 3) {
                searchCities();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchCities = async () => {
        setLoading(true);
        try {
            // Using API Gouv for best French results
            const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}&type=municipality&limit=5`);
            const data = await res.json();

            const formatted = data.features.map(f => ({
                name: f.properties.city,
                postcode: f.properties.postcode,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                context: f.properties.context // e.g., "59, Nord, Hauts-de-France"
            }));
            setResults(formatted);
            setIsOpen(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (city) => {
        updateLocation(city);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="city-search-wrapper" ref={wrapperRef}>
            <div className="search-bar-input">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher une commune..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 3 && setIsOpen(true)}
                />
                {query && <X size={16} className="clear-icon" onClick={() => setQuery('')} />}
            </div>

            {/* Current Location Badge if not searching */}
            {!isOpen && !query && (
                <div className="current-loc-badge">
                    <MapPin size={14} />
                    <span>{location.name}</span>
                </div>
            )}

            {isOpen && (results.length > 0 || loading) && (
                <div className="search-results-dropdown">
                    {loading ? (
                        <div className="p-3 text-center text-muted">Recherche...</div>
                    ) : (
                        results.map((city, i) => (
                            <button key={i} className="search-result-item" onClick={() => handleSelect(city)}>
                                <div className="city-name">{city.name}</div>
                                <div className="city-context">{city.postcode} - {city.context}</div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
