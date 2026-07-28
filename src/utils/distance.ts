const R = 6371; // Earth radius in km

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Returns true if the alert should be shown to a user at (userLat, userLng). */
export function isAlertNearby(
    alert: { latitudes?: number[]; longitudes?: number[]; locations?: string[]; broadcastRadiusKm?: number | null },
    userLat: number,
    userLng: number,
): boolean {
    const lats = alert.latitudes ?? [];
    const lngs = alert.longitudes ?? [];
    const locations = alert.locations ?? [];

    // Only explicitly marked "All Island" alerts broadcast to everyone
    if (locations.includes('All Island')) return true;

    // Alerts with no coordinates and no explicit All-Island tag — hide until coords are set
    if (lats.length === 0) return false;

    // Conservative default: 10km if the backend didn't specify a radius
    const radius = alert.broadcastRadiusKm ?? 10;
    for (let i = 0; i < lats.length; i++) {
        if (haversineKm(userLat, userLng, lats[i], lngs[i]) <= radius) return true;
    }
    return false;
}

/** Returns true if a point (itemLat, itemLng) is within radiusKm of the user. */
export function isWithinRadius(
    itemLat: number | null | undefined,
    itemLng: number | null | undefined,
    userLat: number,
    userLng: number,
    radiusKm: number,
): boolean {
    if (itemLat == null || itemLng == null) return true; // no location → show it
    return haversineKm(userLat, userLng, itemLat, itemLng) <= radiusKm;
}
