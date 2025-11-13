import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { ROUTES } from './config/constants';
import { VerifyEmailPage } from './pages/auth/Verifyemailpage';
// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Main Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ItemsPage } from './pages/products/ItemsPage';
import { ItemVariantsPage } from './pages/products/ItemVariantsPage';
import { CategoriesPage } from './pages/products/CategoriesPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { LotsPage } from './pages/inventory/LotsPage';
import { SerialsPage } from './pages/inventory/SerialsPage';
import { MovementsPage } from './pages/movements/MovementsPage';
import { LocationsPage } from './pages/locations/LocationsPage';
import { SitesPage } from './pages/locations/SitesPage';
import { WarehousesPage } from './pages/locations/WarehousesPage';
import { QualityPage } from './pages/quality/QualityPage';
import { AlertsPage } from './pages/Alerts/AlertsPage';


function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          {/* Protected Routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCTS_ITEMS}
            element={
              <ProtectedRoute>
                <Layout>
                  <ItemsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCTS_ITEM_VARIANTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <ItemVariantsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CATEGORIES}
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVENTORY}
            element={
              <ProtectedRoute>
                <Layout>
                  <InventoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVENTORY_LOTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <LotsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVENTORY_SERIALS}
            element={
              <ProtectedRoute>
                <Layout>
                  <SerialsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.MOVEMENTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <MovementsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LOCATIONS}
            element={
              <ProtectedRoute>
                <Layout>
                  <LocationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LOCATIONS_SITES}
            element={
              <ProtectedRoute>
                <Layout>
                  <SitesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LOCATIONS_WAREHOUSES}
            element={
              <ProtectedRoute>
                <Layout>
                  <WarehousesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.QUALITY}
            element={
              <ProtectedRoute>
                <Layout>
                  <QualityPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALERTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <AlertsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              },
              success: {
                iconTheme: {
                  primary: '#4CAF50',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF5350',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

