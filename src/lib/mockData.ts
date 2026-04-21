import { addMinutes, randomId, toIso } from "./utils";
import type { FleetSnapshot, Order, RouteDefinition, Trip, Vehicle } from "../types/fleet";

const now = new Date();

export const mockRoutes: RouteDefinition[] = [
  {
    id: "route-mumbai-pune",
    name: "Mumbai -> Pune",
    travel_time: 220,
    load_time: 35,
    unload_time: 30,
    distance_km: 154,
    base_capacity: 18
  },
  {
    id: "route-delhi-jaipur",
    name: "Delhi -> Jaipur",
    travel_time: 290,
    load_time: 40,
    unload_time: 35,
    distance_km: 281,
    base_capacity: 22
  },
  {
    id: "route-bengaluru-chennai",
    name: "Bengaluru -> Chennai",
    travel_time: 360,
    load_time: 45,
    unload_time: 40,
    distance_km: 347,
    base_capacity: 24
  }
];

export const mockVehicles: Vehicle[] = [
  { id: "veh-101", label: "OWN-101", type: "own", capacity: 18, available_at: toIso(now), status: "available", last_known_location: 18 },
  { id: "veh-102", label: "OWN-102", type: "own", capacity: 22, available_at: toIso(now), status: "running", current_route: "Delhi -> Jaipur", last_known_location: 58 },
  { id: "veh-201", label: "AGY-201", type: "agency", capacity: 24, available_at: toIso(addMinutes(now, 120)), status: "assigned", last_known_location: 40 },
  { id: "veh-301", label: "ONC-301", type: "oncall", capacity: 28, available_at: toIso(addMinutes(now, 45)), status: "idle", last_known_location: 12 }
];

export const mockTrips: Trip[] = [
  {
    id: "trip-1001",
    route_id: "route-mumbai-pune",
    start_time: toIso(addMinutes(now, -50)),
    end_time: toIso(addMinutes(now, 235)),
    capacity: 18,
    used_capacity: 15,
    status: "running",
    vehicle_id: "veh-101",
    vehicle_type: "own",
    utilization: 83,
    eta_variance_minutes: 0
  },
  {
    id: "trip-1002",
    route_id: "route-delhi-jaipur",
    start_time: toIso(addMinutes(now, 25)),
    end_time: toIso(addMinutes(now, 390)),
    capacity: 22,
    used_capacity: 12,
    status: "planned",
    vehicle_id: "veh-201",
    vehicle_type: "agency",
    utilization: 55,
    eta_variance_minutes: 12
  },
  {
    id: "trip-1003",
    route_id: "route-bengaluru-chennai",
    start_time: toIso(addMinutes(now, 75)),
    end_time: toIso(addMinutes(now, 520)),
    capacity: 24,
    used_capacity: 20,
    status: "planned",
    vehicle_id: null,
    vehicle_type: null,
    utilization: 83,
    eta_variance_minutes: 0
  }
];

export const mockOrders: Order[] = [
  {
    id: randomId("order"),
    route_id: "route-mumbai-pune",
    weight: 8,
    deadline: toIso(addMinutes(now, 210)),
    source: "manual",
    created_at: toIso(addMinutes(now, -80)),
    trip_id: "trip-1001",
    vehicle_id: "veh-101"
  },
  {
    id: randomId("order"),
    route_id: "route-delhi-jaipur",
    weight: 12,
    deadline: toIso(addMinutes(now, 380)),
    source: "csv",
    created_at: toIso(addMinutes(now, -25)),
    trip_id: "trip-1002",
    vehicle_id: "veh-201"
  },
  {
    id: randomId("order"),
    route_id: "route-bengaluru-chennai",
    weight: 14,
    deadline: toIso(addMinutes(now, 600)),
    source: "manual",
    created_at: toIso(addMinutes(now, -10)),
    trip_id: "trip-1003",
    vehicle_id: null
  }
];

export const mockSnapshot: FleetSnapshot = {
  routes: mockRoutes,
  vehicles: mockVehicles,
  trips: mockTrips,
  orders: mockOrders,
  alerts: []
};
