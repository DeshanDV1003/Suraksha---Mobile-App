import React, { createContext, useContext } from 'react';

export interface UserLocation {
    lat: number;
    lng: number;
}

interface LocationContextValue {
    userLocation: UserLocation | null;
    userDistrict: string | null; // e.g. "Galle", "Colombo"
}

const LocationContext = createContext<LocationContextValue>({ userLocation: null, userDistrict: null });

export const LocationProvider = LocationContext.Provider;

export function useUserLocation(): UserLocation | null {
    return useContext(LocationContext).userLocation;
}

export function useUserDistrict(): string | null {
    return useContext(LocationContext).userDistrict;
}

/** Returns true if an item's text location overlaps with the user's district/city. */
export function matchesDistrict(itemLocation: string | null | undefined, userDistrict: string | null): boolean {
    if (!itemLocation || !userDistrict) return true; // no info → show it
    const loc = itemLocation.toLowerCase();
    const district = userDistrict.toLowerCase();
    return loc.includes(district) || district.includes(loc.split(',')[0].trim());
}
