import WorkerServiceZone from '../models/WorkerServiceZone.js';

class ZoneMatchingService {
  static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const clampedA = Math.min(1, Math.max(0, a));
    const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
    return R * c;
  }

  static async createZone(workerId, zoneData) {
    const zone = new WorkerServiceZone({
      workerId,
      ...zoneData,
    });
    return await zone.save();
  }

  static async getWorkerZones(workerId) {
    return await WorkerServiceZone.find({ workerId, isActiveZone: true });
  }

  static async isLocationCoveredByWorker(workerId, targetLat, targetLon) {
    const zones = await this.getWorkerZones(workerId);
    for (const zone of zones) {
      const dist = this.calculateHaversineDistance(
        zone.centerCoordinates.latitude,
        zone.centerCoordinates.longitude,
        targetLat,
        targetLon
      );
      if (dist <= zone.serviceRadiusKm) {
        return { isCovered: true, zone, distanceKm: dist, surcharge: zone.travelSurcharge };
      }
    }
    return { isCovered: false, zone: null, distanceKm: null, surcharge: 0 };
  }
}

export default ZoneMatchingService;
