export type VehicleType = "own" | "agency" | "oncall";
export type VehicleStatus = "available" | "assigned" | "running" | "idle" | "maintenance";
export type TripStatus = "planned" | "running" | "delayed" | "completed";
export type OrderSource = "manual" | "csv" | "api";
export type PlanningMode = "trip" | "direct";

export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export interface Vehicle {
  id: string;
  label: string;
  type: VehicleType;
  capacity: number;
  available_at: string;
  status: VehicleStatus;
  current_route?: string;
  last_known_location?: number;
}

export interface RouteDefinition {
  id: string;
  name: string;
  travel_time: number;
  load_time: number;
  unload_time: number;
  distance_km: number;
  base_capacity: number;
}

export interface Trip {
  id: string;
  route_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  used_capacity: number;
  status: TripStatus;
  vehicle_id: string | null;
  vehicle_type?: VehicleType | null;
  utilization: number;
  eta_variance_minutes: number;
}

export interface Order {
  id: string;
  route_id: string;
  weight: number;
  deadline: string;
  source: OrderSource;
  created_at: string;
  trip_id: string | null;
  vehicle_id?: string | null;
}

export interface TripOrder {
  trip_id: string;
  order_id: string;
}

export interface AlertItem {
  id: string;
  level: "warning" | "critical" | "info";
  title: string;
  description: string;
}

export interface KPI {
  label: string;
  value: string;
  delta: string;
}

export interface TrackingPoint {
  vehicleId: string;
  vehicleLabel: string;
  routeName: string;
  progress: number;
  status: TripStatus;
}

export interface FleetSnapshot {
  routes: RouteDefinition[];
  vehicles: Vehicle[];
  trips: Trip[];
  orders: Order[];
  alerts: AlertItem[];
}
