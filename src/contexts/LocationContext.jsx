import React, { createContext, useContext, useState, useEffect } from 'react';

// Default to Douai
const DEFAULT_LOCATION = {
    name: "Douai",
    lat: 50.3667,
    lon: 3.0667,
    admin1: "Hauts-de-France"
};

const LocationContext = createContext();

export function useLocation() {
    return useContext(LocationContext);
}

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(DEFAULT_LOCATION);

    // Persist selection
    useEffect(() => {
        const saved = localStorage.getItem('user_location');
        if (saved) {
            try {
                setLocation(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved location");
            }
        }
    }, []);

    const updateLocation = (newLoc) => {
        setLocation(newLoc);
        localStorage.setItem('user_location', JSON.stringify(newLoc));
    };

    return (
        <LocationContext.Provider value={{ location, updateLocation }}>
            {children}
        </LocationContext.Provider>
    );
}
