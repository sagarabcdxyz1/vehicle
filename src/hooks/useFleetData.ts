import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  assignOrderDirectToVehicle,
  assignOrderToTrip,
  assignVehiclesToTrips,
  buildAlerts,
  createFutureTrips
} from "../lib/optimization";
import { randomId, toIso } from "../lib/utils";
import { supabase } from "../lib/supabase";
import type {
  AlertItem,
  FleetSnapshot,
  Order,
  OrderSource,
  PlanningMode,
  RouteDefinition,
  Trip,
  Vehicle
} from "../types/fleet";

interface ManualOrderInput {
  route_id: string;
  weight: number;
  deadline: string;
  source: OrderSource;
}

const syncDerivedState = (routes: RouteDefinition[], trips: Trip[], vehicles: Vehicle[]) => {
  const generatedTrips = createFutureTrips(routes, trips, vehicles);
  const allocation = assignVehiclesToTrips(generatedTrips, vehicles);

  return {
    trips: allocation.trips.map((trip) => ({
      ...trip,
      utilization: trip.capacity ? (trip.used_capacity / trip.capacity) * 100 : 0
    })),
    vehicles: allocation.vehicles,
    alerts: buildAlerts(allocation.trips, allocation.vehicles, routes)
  };
};

export const useFleetData = () => {
  const [routes, setRoutes] = useState<RouteDefinition[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [planningMode, setPlanningMode] = useState<PlanningMode>(() => {
    const stored = window.localStorage.getItem("fleet-planning-mode");
    return stored === "direct" ? "direct" : "trip";
  });

  useEffect(() => {
    const derived = syncDerivedState(routes, trips, vehicles);
    setTrips(derived.trips);
    setVehicles(derived.vehicles);
    setAlerts(derived.alerts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const gpsTimer = window.setInterval(() => {
      setVehicles((current) =>
        current.map((vehicle) => ({
          ...vehicle,
          last_known_location: Math.min(100, (vehicle.last_known_location ?? 0) + Math.random() * 12)
        }))
      );
    }, 5000);

    return () => window.clearInterval(gpsTimer);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;

    void (async () => {
      const [{ data: routesData }, { data: vehiclesData }, { data: tripsData }, { data: ordersData }] =
        await Promise.all([
          client.from("routes").select("*"),
          client.from("vehicles").select("*"),
          client.from("trips").select("*"),
          client.from("orders").select("*").order("created_at", { ascending: false })
        ]);

      if (routesData) {
        setRoutes(routesData as RouteDefinition[]);
      }

      if (vehiclesData) {
        setVehicles(vehiclesData as Vehicle[]);
      }

      if (tripsData) {
        setTrips(
          (tripsData as Trip[]).map((trip) => ({
            ...trip,
            utilization: trip.capacity ? (trip.used_capacity / trip.capacity) * 100 : 0
          }))
        );
      }

      if (ordersData) {
        setOrders(ordersData as Order[]);
      }
    })();

    const vehicleChannel = client
      .channel("vehicles-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, async () => {
        const { data } = await client.from("vehicles").select("*");
        if (data) {
          setVehicles(data as Vehicle[]);
          setMode("live");
        }
      })
      .subscribe();

    const tripChannel = client
      .channel("trips-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, async () => {
        const { data } = await client.from("trips").select("*");
        if (data) {
          setTrips(
            (data as Trip[]).map((trip) => ({
              ...trip,
              utilization: trip.capacity ? (trip.used_capacity / trip.capacity) * 100 : 0
            }))
          );
          setMode("live");
        }
      })
      .subscribe();

    return () => {
      void client.removeChannel(vehicleChannel);
      void client.removeChannel(tripChannel);
    };
  }, []);

  useEffect(() => {
    setAlerts(buildAlerts(trips, vehicles, routes));
  }, [routes, trips, vehicles]);

  useEffect(() => {
    window.localStorage.setItem("fleet-planning-mode", planningMode);
  }, [planningMode]);

  const persistOptimization = async (nextTrips: Trip[], nextVehicles: Vehicle[], nextOrder?: Order) => {
    if (!supabase) {
      return;
    }

    await Promise.all([
      supabase.from("trips").upsert(
        nextTrips.map((trip) => ({
          id: trip.id,
          route_id: trip.route_id,
          start_time: trip.start_time,
          end_time: trip.end_time,
          capacity: trip.capacity,
          used_capacity: trip.used_capacity,
          status: trip.status,
          vehicle_id: trip.vehicle_id
        }))
      ),
      supabase.from("vehicles").upsert(
        nextVehicles.map((vehicle) => ({
          id: vehicle.id,
          label: vehicle.label,
          type: vehicle.type,
          capacity: vehicle.capacity,
          available_at: vehicle.available_at,
          status: vehicle.status,
          current_route: vehicle.current_route,
          last_known_location: vehicle.last_known_location
        }))
      ),
      nextOrder
        ? supabase.from("orders").upsert({
            id: nextOrder.id,
            route_id: nextOrder.route_id,
            weight: nextOrder.weight,
            deadline: nextOrder.deadline,
            source: nextOrder.source,
            trip_id: nextOrder.trip_id,
            vehicle_id: nextOrder.vehicle_id
          })
        : Promise.resolve()
    ]);
  };

  const addOrder = async (input: ManualOrderInput) => {
    const order: Order = {
      id: randomId("order"),
      route_id: input.route_id,
      weight: input.weight,
      deadline: new Date(input.deadline).toISOString(),
      source: input.source,
      created_at: toIso(new Date()),
      trip_id: null,
      vehicle_id: null
    };

    const nextTrips = [...trips].map((trip) => ({ ...trip }));
    const nextVehicles = vehicles.map((vehicle) => ({ ...vehicle }));
    const result =
      planningMode === "trip"
        ? assignOrderToTrip(order, nextTrips, routes)
        : assignOrderDirectToVehicle(order, nextVehicles, routes);
    const allocation =
      planningMode === "trip"
        ? assignVehiclesToTrips(nextTrips, nextVehicles)
        : { trips: nextTrips, vehicles: nextVehicles };
    const nextOrders = [order, ...orders];

    setOrders(nextOrders);
    setTrips(
      allocation.trips.map((trip) => ({
        ...trip,
        utilization: trip.capacity ? (trip.used_capacity / trip.capacity) * 100 : 0
      }))
    );
    setVehicles(allocation.vehicles);
    setAlerts(buildAlerts(allocation.trips, allocation.vehicles, routes));

    await persistOptimization(allocation.trips, allocation.vehicles, order);

    return result.reason;
  };

  const uploadCsv = async (file: File) => {
    const parsed = await new Promise<Array<{ route: string; weight: string; deadline: string }>>(
      (resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data }) => resolve(data as Array<{ route: string; weight: string; deadline: string }>),
          error: reject
        });
      }
    );

    let processed = 0;

    for (const row of parsed) {
      const route = routes.find(
        (item) => item.name.toLowerCase() === row.route.toLowerCase() || item.id === row.route
      );

      if (!route || !row.weight || !row.deadline) {
        continue;
      }

      await addOrder({
        route_id: route.id,
        weight: Number(row.weight),
        deadline: row.deadline,
        source: "csv"
      });
      processed += 1;
    }

    return processed;
  };

  const reassignOrder = (orderId: string) => {
    const nextOrders = [...orders].map((item) => ({ ...item }));
    const target = nextOrders.find((item) => item.id === orderId);
    if (!target) {
      return "Order not found.";
    }

    const nextTrips = trips.map((trip) => ({ ...trip }));
    if (target.trip_id) {
      const currentTrip = nextTrips.find((trip) => trip.id === target.trip_id);
      if (currentTrip) {
        currentTrip.used_capacity = Math.max(0, currentTrip.used_capacity - target.weight);
      }
      target.trip_id = null;
    }
    target.vehicle_id = null;

    const nextVehicles = vehicles.map((vehicle) => ({ ...vehicle }));
    const result =
      planningMode === "trip"
        ? assignOrderToTrip(target, nextTrips, routes)
        : assignOrderDirectToVehicle(target, nextVehicles, routes);
    const allocation =
      planningMode === "trip"
        ? assignVehiclesToTrips(nextTrips, nextVehicles)
        : { trips: nextTrips, vehicles: nextVehicles };

    setOrders(nextOrders);
    setTrips(
      allocation.trips.map((trip) => ({
        ...trip,
        utilization: trip.capacity ? (trip.used_capacity / trip.capacity) * 100 : 0
      }))
    );
    setVehicles(allocation.vehicles);
    void persistOptimization(allocation.trips, allocation.vehicles, target);
    return result.reason;
  };

  const snapshot = useMemo<FleetSnapshot>(
    () => ({
      routes,
      vehicles,
      trips,
      orders,
      alerts
    }),
    [alerts, orders, routes, trips, vehicles]
  );

  return {
    ...snapshot,
    planningMode,
    setPlanningMode,
    addOrder,
    uploadCsv,
    reassignOrder
  };
};
