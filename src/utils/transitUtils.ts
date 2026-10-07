import { TransitStop, TransitRoute, TransitVehicle, StopDeparture } from '../types/transit';

export function generateDeparturesForStop(
  stop: TransitStop,
  routes: TransitRoute[],
  vehicles: TransitVehicle[],
  isPeakHour: boolean
): StopDeparture[] {
  const departures: StopDeparture[] = [];

  stop.routesServing.forEach((routeId) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;

    // Check if there is an active vehicle approaching or on this line
    const approachingVehicle = vehicles.find((v) => v.routeId === routeId);

    // Baseline ETA in seconds
    const baseMins = approachingVehicle
      ? Math.max(1, Math.round(approachingVehicle.progressBetweenStops * 6))
      : Math.floor(Math.random() * 5) + 2;

    const delayMins = isPeakHour
      ? (route.delayMinutes || 0) + 3
      : (route.delayMinutes || 0);

    const isDelayed = delayMins > 0;
    const etaSeconds = baseMins * 60 + (isDelayed ? delayMins * 60 : 0);

    // Compute scheduled clock time (e.g., "14:22")
    const now = new Date();
    const schedDate = new Date(now.getTime() + baseMins * 60000);
    const scheduledTime = schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Generate first departure
    departures.push({
      id: `dep-${stop.id}-${route.id}-1`,
      routeId: route.id,
      vehicleId: approachingVehicle?.id,
      destination: route.headsignOutbound,
      via: route.type === 'Circulator' ? 'Clockwise Ring' : undefined,
      scheduledTime,
      etaSeconds,
      isLive: true,
      occupancy: isPeakHour ? 'full' : (approachingVehicle?.occupancy || 'moderate'),
      occupancyPercent: isPeakHour
        ? Math.min(96, (approachingVehicle?.occupancyPercent || 60) + 25)
        : (approachingVehicle?.occupancyPercent || 45),
      platform: `Bay ${route.number.charAt(0) || 'A'}`,
      isDelayed,
      delayMins,
      isAccessible: true,
      hasBikeRack: true,
    });

    // Generate a subsequent scheduled departure (e.g. + headway)
    const nextEtaSeconds = etaSeconds + route.frequencyMins * 60;
    const nextSchedDate = new Date(now.getTime() + (baseMins + route.frequencyMins) * 60000);

    departures.push({
      id: `dep-${stop.id}-${route.id}-2`,
      routeId: route.id,
      destination: route.headsignOutbound,
      scheduledTime: nextSchedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      etaSeconds: nextEtaSeconds,
      isLive: false,
      occupancy: 'low',
      occupancyPercent: 25,
      platform: `Bay ${route.number.charAt(0) || 'A'}`,
      isDelayed: false,
      delayMins: 0,
      isAccessible: true,
      hasBikeRack: true,
    });
  });

  // Sort by ETA ascending
  return departures.sort((a, b) => a.etaSeconds - b.etaSeconds);
}
