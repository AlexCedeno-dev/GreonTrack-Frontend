import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { MascotWidget } from './components/MascotWidget';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';


// Cada pantalla se baja solo cuando hace falta (la primera carga es mucho más
// ligera) y, al quedar libre el navegador, el resto se precarga para que
// cambiar de pestaña sea instantáneo.
const cargarHome = () => import('./pages/Home');
const cargarMiCasa = () => import('./pages/MiCasa');
const cargarDevices = () => import('./pages/Devices');
const cargarDeviceForm = () => import('./pages/DeviceForm');
const cargarArmaCasa = () => import('./pages/ArmaCasa');
const cargarDeviceSniffer = () => import('./pages/DeviceSniffer');
const cargarUsage = () => import('./pages/Usage');
const cargarDashboard = () => import('./pages/Dashboard');
const cargarCarbonFootprint = () => import('./pages/CarbonFootprint');
const cargarRecommendations = () => import('./pages/Recommendations');
const cargarReports = () => import('./pages/Reports');
const cargarSettings = () => import('./pages/Settings');
const cargarGuide = () => import('./pages/Guide');
const cargarAvisoPrivacidad = () => import('./pages/AvisoPrivacidad');

const Home = lazy(() => cargarHome().then((m) => ({ default: m.Home })));
const MiCasa = lazy(() => cargarMiCasa().then((m) => ({ default: m.MiCasa })));
const Devices = lazy(() => cargarDevices().then((m) => ({ default: m.Devices })));
const DeviceForm = lazy(() => cargarDeviceForm().then((m) => ({ default: m.DeviceForm })));
const ArmaCasa = lazy(() => cargarArmaCasa().then((m) => ({ default: m.ArmaCasa })));
const DeviceSniffer = lazy(() => cargarDeviceSniffer().then((m) => ({ default: m.DeviceSniffer })));
const Usage = lazy(() => cargarUsage().then((m) => ({ default: m.Usage })));
const Dashboard = lazy(() => cargarDashboard().then((m) => ({ default: m.Dashboard })));
const CarbonFootprint = lazy(() => cargarCarbonFootprint().then((m) => ({ default: m.CarbonFootprint })));
const Recommendations = lazy(() => cargarRecommendations().then((m) => ({ default: m.Recommendations })));
const Reports = lazy(() => cargarReports().then((m) => ({ default: m.Reports })));
const Settings = lazy(() => cargarSettings().then((m) => ({ default: m.Settings })));
const Guide = lazy(() => cargarGuide().then((m) => ({ default: m.Guide })));
const AvisoPrivacidad = lazy(() => cargarAvisoPrivacidad().then((m) => ({ default: m.AvisoPrivacidad })));

function precargarPantallas() {
  const cargar = () => [cargarHome, cargarArmaCasa, cargarMiCasa, cargarDevices, cargarDeviceForm, cargarDeviceSniffer, cargarUsage, cargarDashboard, cargarCarbonFootprint, cargarRecommendations, cargarReports, cargarSettings, cargarGuide, cargarAvisoPrivacidad].forEach((f) => f().catch(() => undefined));
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (idle) idle(cargar);
  else window.setTimeout(cargar, 1500);
}

// Solo en la versión publicada y ya con sesión iniciada: así el login y el
// servidor de desarrollo no pelean con la descarga de las demás pantallas.
function PrecargaPantallas() {
  const { user } = useAuth();
  useEffect(() => {
    if (!import.meta.env.PROD || !user) return;
    const t = window.setTimeout(precargarPantallas, 3000);
    return () => window.clearTimeout(t);
  }, [user]);
  return null;
}

function CargandoPantalla() {
  return <div className="pantalla-cargando" role="status" aria-label="Cargando" />;
}

export default function App() {

  return (
    <ToastProvider>
    <AccessibilityProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <AppDataProvider>
            <PrecargaPantallas />
            <Suspense fallback={<CargandoPantalla />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/aviso-privacidad" element={<AvisoPrivacidad />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mi-casa"
                element={
                  <ProtectedRoute>
                    <MiCasa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dispositivos"
                element={
                  <ProtectedRoute>
                    <Devices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dispositivos/sniffer"
                element={
                  <ProtectedRoute>
                    <DeviceSniffer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dispositivos/rapido"
                element={
                  <ProtectedRoute>
                    <ArmaCasa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dispositivos/nuevo"
                element={
                  <ProtectedRoute>
                    <DeviceForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dispositivos/:id/editar"
                element={
                  <ProtectedRoute>
                    <DeviceForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registrar-uso"
                element={
                  <ProtectedRoute>
                    <Usage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estadisticas"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/huella-carbono"
                element={
                  <ProtectedRoute>
                    <CarbonFootprint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recomendaciones"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reportes"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guia"
                element={
                  <ProtectedRoute>
                    <Guide />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
            <MascotWidget />
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
      <AccessibilityWidget />
    </AccessibilityProvider>
    </ToastProvider>
  );
}
