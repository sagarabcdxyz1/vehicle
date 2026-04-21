import type { AlertItem, Order, RouteDefinition, Trip, Vehicle } from "../types/fleet";
import { addMinutes, randomId, toIso } from "./utils";

const vehiclePriority: Array<Vehicle["type"]> = ["own", "agency", "oncall"];

export const calculateTripEndTime = (route: RouteDefinition, startTime: string) =>
  toIso(addMinutes(startTime, route.travel_time + route.load_time + route.unload_time));

export const createFutureTrips = (
  routes: RouteDefinition[],
  existingTrips: Trip[],
  vehicles: Vehicle[],
  anchor = new Date()
) => {
  const trips = [...existingTrips];

  routes.forEach((route, index) => {
    const spacing = route.travel_time + route.load_time + route.unload_time + 30;

    for (let slot = 0; slot < 3; slot += 1) {
      const start = addMinutes(anchor, index * 40 + slot * spacing);
      const startIso = toIso(start);
      const alreadyExists = trips.some(
        (trip) =>
          trip.route_id === route.id &&
          Math.abs(new Date(trip.start_time).getTime() - start.getTime()) < 5 * 60 * 1000
      );

      if (alreadyExists) {
        continue;
      }

      const matchingVehicle = vehicles.find((vehicle) => vehicle.capacity >= route.base_capacity);

      trips.push({
        id: randomId("trip"),
        route_id: route.id,
        start_time: startIso,
        end_time: calculateTripEndTime(route, startIso),
        capacity: matchingVehicle?.capacity ?? route.base_capacity,
        used_capacity: 0,
        status: "planned",
        vehicle_id: null,
        vehicle_type: null,
        utilization: 0,
        eta_variance_minutes: 0
      });
    }
  });

  return trips.sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time));
};

export const allocateVehicleForTrip = (trip: Trip, vehicles: Vehicle[]) => {
  for (const type of vehiclePriority) {
    const vehicle = vehicles
      .filter((candidate) => candidate.type === type && candidate.capacity >= trip.capacity)
      .sort((a, b) => +new Date(a.available_at) - +new Date(b.available_at))
      .find((candidate) => new Date(candidate.available_at) <= new Date(trip.start_time));

    if (vehicle) {
      return vehicle;
    }
  }

  return null;
};

export const assignVehiclesToTrips = (trips: Trip[], vehicles: Vehicle[]) => {
  const nextVehicles = [...vehicles].map((vehicle) => ({ ...vehicle }));
  const nextTrips = trips.map((trip) => ({ ...trip }));

  nextTrips.forEach((trip) => {
    if (trip.vehicle_id) {
      return;
    }

    const vehicle = allocateVehicleForTrip(trip, nextVehicles);

    if (!vehicle) {
      trip.status = "delayed";
      trip.eta_variance_minutes = 20;
      return;
    }

    vehicle.status = new Date(trip.start_time) <= new Date() ? "running" : "assigned";
    vehicle.available_at = trip.end_time;
    vehicle.current_route = trip.route_id;
    trip.vehicle_id = vehicle.id;
    trip.vehicle_type = vehicle.type;
  });

  return { trips: nextTrips, vehicles: nextVehicles };
};

export const assignOrderToTrip = (
  order: Order,
  trips: Trip[],
  routes: RouteDefinition[]
) => {
  const matchingTrips = trips
    .filter((trip) => trip.route_id === order.route_id)
    .filter((trip) => trip.capacity - trip.used_capacity >= order.weight)
    .filter((trip) => new Date(trip.end_time) <= new Date(order.deadline))
    .sort((a, b) => {
      const utilizationA = (a.used_capacity + order.weight) / a.capacity;
      const utilizationB = (b.used_capacity + order.weight) / b.capacity;
      const seventyDeltaA = Math.abs(utilizationA - 0.7);
      const seventyDeltaB = Math.abs(utilizationB - 0.7);
      return seventyDeltaA - seventyDeltaB || +new Date(a.start_time) - +new Date(b.start_time);
    });

  const bestTrip = matchingTrips[0];
  if (bestTrip) {
    bestTrip.used_capacity += order.weight;
    bestTrip.utilization = Math.min(100, (bestTrip.used_capacity / bestTrip.capacity) * 100);
    order.trip_id = bestTrip.id;
    order.vehicle_id = bestTrip.vehicle_id;
    return { trip: bestTrip, reason: "Assigned to best-fit trip by route, capacity, and deadline." };
  }

  const route = routes.find((item) => item.id === order.route_id);
  if (!route) {
    return { trip: null, reason: "Route not found." };
  }

  const start = toIso(addMinutes(new Date(), 30));
  const newTrip: Trip = {
    id: randomId("trip"),
    route_id: route.id,
    start_time: start,
    end_time: calculateTripEndTime(route, start),
    capacity: Math.max(route.base_capacity, order.weight),
    used_capacity: order.weight,
    status: "planned",
    vehicle_id: null,
    vehicle_type: null,
    utilization: Math.min(100, (order.weight / Math.max(route.base_capacity, order.weight)) * 100),
    eta_variance_minutes: 0
  };

  order.trip_id = newTrip.id;
  order.vehicle_id = null;
  trips.push(newTrip);
  return { trip: newTrip, reason: "No suitable trip found, so a new trip slot was created." };
};

export const assignOrderDirectToVehicle = (
  order: Order,
  vehicles: Vehicle[],
  routes: RouteDefinition[]
) => {
  const route = routes.find((item) => item.id === order.route_id);

  if (!route) {
    return { vehicle: null, reason: "Route not found." };
  }

  const durationMinutes = route.travel_time + route.load_time + route.unload_time;

  for (const type of vehiclePriority) {
    const vehicle = vehicles
      .filter((candidate) => candidate.type === type && candidate.capacity >= order.weight)
      .sort((a, b) => +new Date(a.available_at) - +new Date(b.available_at))
      .find((candidate) => {
        const dispatchStart = new Date(candidate.available_at);
        const finishAt = addMinutes(dispatchStart, durationMinutes);
        return finishAt <= new Date(order.deadline);
      });

    if (vehicle) {
      const dispatchStart = new Date(vehicle.available_at);
      vehicle.available_at = toIso(addMinutes(dispatchStart, durationMinutes));
      vehicle.status = new Date(dispatchStart) <= new Date() ? "running" : "assigned";
      vehicle.current_route = route.id;
      order.vehicle_id = vehicle.id;
      order.trip_id = null;
      return {
        vehicle,
        reason: `Assigned directly to ${vehicle.label} using ${type} vehicle priority.`
      };
    }
  }

  return { vehicle: null, reason: "No direct vehicle is available before the delivery deadline." };
};

export const buildAlerts = (trips: Trip[], vehicles: Vehicle[], routes: RouteDefinition[]): AlertItem[] => {
  const alerts: AlertItem[] = [];

  trips.forEach((trip) => {
    const route = routes.find((item) => item.id === trip.route_id);

    if (trip.status === "delayed") {
      alerts.push({
        id: randomId("alert"),
        level: "critical",
        title: `Delayed trip on ${route?.name ?? trip.route_id}`,
        description: `Trip ${trip.id} needs intervention before departure.`
      });
    }

    if (trip.utilization < 70 && trip.status !== "completed") {
      alerts.push({
        id: randomId("alert"),
        level: "warning",
        title: `Underutilized trip ${trip.id}`,
        description: `Load is at ${Math.round(trip.utilization)}%. Consider consolidating more orders.`
      });
    }
  });

  vehicles
    .filter((vehicle) => vehicle.status === "idle" || vehicle.status === "available")
    .forEach((vehicle) => {
      alerts.push({
        id: randomId("alert"),
        level: "info",
        title: `Idle vehicle ${vehicle.label}`,
        description: `Available since ${new Intl.DateTimeFormat("en-IN", {
          timeStyle: "short",
          dateStyle: "medium"
        }).format(new Date(vehicle.available_at))}`
      });
    });

  return alerts.slice(0, 6);
};

export const getRouteName = (routeId: string, routes: RouteDefinition[]) =>
  routes.find((route) => route.id === routeId)?.name ?? routeId;
