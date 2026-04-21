import { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./contexts/AuthContext";
import { useFleetData } from "./hooks/useFleetData";
import { LoginPage } from "./pages/LoginPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then((module) => ({ default: module.OrdersPage })));
const TrackingPage = lazy(() => import("./pages/TrackingPage").then((module) => ({ default: module.TrackingPage })));
const TripsPage = lazy(() => import("./pages/TripsPage").then((module) => ({ default: module.TripsPage })));
const VehiclesPage = lazy(() => import("./pages/VehiclesPage").then((module) => ({ default: module.VehiclesPage })));

const ProtectedRoutes = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { signOut } = useAuth();
  const fleet = useFleetData();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const routedContent = (
    <Routes>
      <Route
        element={
          <AppShell
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((current) => !current)}
            onSignOut={() => void signOut()}
            planningMode={fleet.planningMode}
            onPlanningModeChange={fleet.setPlanningMode}
          />
        }
      >
        <Route index element={<DashboardPage trips={fleet.trips} vehicles={fleet.vehicles} alerts={fleet.alerts} />} />
        <Route path="/trips" element={<TripsPage trips={fleet.trips} routes={fleet.routes} />} />
        <Route
          path="/orders"
          element={
            <OrdersPage
              orders={fleet.orders}
              routes={fleet.routes}
              vehicles={fleet.vehicles}
              planningMode={fleet.planningMode}
              onAddOrder={fleet.addOrder}
              onUploadCsv={fleet.uploadCsv}
              onReassign={fleet.reassignOrder}
            />
          }
        />
        <Route path="/vehicles" element={<VehiclesPage vehicles={fleet.vehicles} />} />
        <Route path="/tracking" element={<TrackingPage vehicles={fleet.vehicles} trips={fleet.trips} routes={fleet.routes} />} />
      </Route>
    </Routes>
  );

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-600">
          Loading operations workspace...
        </div>
      }
    >
      {routedContent}
    </Suspense>
  );
};

export default function App() {
  const { isAuthenticated, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading FleetFlow...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={signInWithGoogle} />;
  }

  return <ProtectedRoutes />;
}
