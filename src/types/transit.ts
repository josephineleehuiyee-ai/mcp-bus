export type RouteType = 'BRT' | 'Express' | 'Circulator' | 'Night' | 'Local';

export type OccupancyLevel = 'empty' | 'low' | 'moderate' | 'full';

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  zone: string;
  x: number; // Coordinate on 1000x800 map canvas
  y: number;
  routesServing: string[];
  isTransferHub?: boolean;
  wheelchairAccessible: boolean;
  hasShelter: boolean;
  hasBikes: boolean;
}

export interface TransitRoute {
  id: string;
  number: string;
  name: string;
  type: RouteType;
  color: string;
  textColor: string;
  headsignOutbound: string;
  headsignInbound: string;
  frequencyMins: number;
  fare: number;
  stopsOutbound: string[]; // Stop IDs in order
  stopsInbound: string[];
  pathD: string; // SVG path data for route line on map
  description: string;
  status: 'normal' | 'delay' | 'detour';
  delayMinutes?: number;
}

export interface TransitVehicle {
  id: string;
  routeId: string;
  vehicleNumber: string;
  model: string; // e.g. "Nova Bus LFSe+ EV"
  heading: number; // degrees 0-360
  speedMph: number;
  occupancy: OccupancyLevel;
  occupancyPercent: number;
  currentStopId: string;
  nextStopId: string;
  progressBetweenStops: number; // 0 to 1
  x: number;
  y: number;
  direction: 'outbound' | 'inbound';
  lastPingSecondsAgo: number;
  isDelayed: boolean;
  delayMins: number;
  driverId: string;
}

export interface StopDeparture {
  id: string;
  routeId: string;
  vehicleId?: string;
  destination: string;
  via?: string;
  scheduledTime: string;
  etaSeconds: number; // countdown in seconds
  isLive: boolean;
  occupancy: OccupancyLevel;
  occupancyPercent: number;
  platform: string;
  isDelayed: boolean;
  delayMins: number;
  isAccessible: boolean;
  hasBikeRack: boolean;
}

export interface ServiceAlert {
  id: string;
  routeIds: string[];
  severity: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  updatedAt: string;
  activeUntil: string;
  actionRequired?: string;
}

export interface TripPlanResult {
  originStop: TransitStop;
  destinationStop: TransitStop;
  totalDurationMins: number;
  totalFare: number;
  walkDistanceMiles: number;
  legs: {
    type: 'walk' | 'transit';
    route?: TransitRoute;
    fromName: string;
    toName: string;
    durationMins: number;
    departureTime: string;
    arrivalTime: string;
    numStops?: number;
  }[];
}
