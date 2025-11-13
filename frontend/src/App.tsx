import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import { Navbar } from '@/components/Layout/Sidebar';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/Verifyemailpage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Products Pages
import { ItemsPage } from '@/pages/products/ItemsPage';
import { ItemVariantsPage } from '@/pages/products/ItemVariantsPage';
import { CategoriesPage } from '@/pages/products/CategoriesPage';

// Inventory Pages
import { LotsPage } from '@/pages/inventory/LotsPage';
import { SerialsPage } from '@/pages/inventory/SerialsPage';

// Locations Pages
import { SitesPage } from '@/pages/locations/SitesPage';
import { WarehousesPage } from '@/pages/locations/WarehousesPage';
import { LocationsPage } from '@/pages/locations/LocationsPage';

// Movements Pages
import { MovementsPage } from '@/pages/movements/MovementsPage';

// Quality Pages
import { QualityControlsPage } from '@/pages/quality/QualityPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout Component (without Sidebar)
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes (Auth Pages) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Products Routes */}
        <Route
          path="/products/items"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ItemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/products/variants"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ItemVariantsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/products/categories"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CategoriesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory/lots"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LotsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/inventory/serials"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SerialsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Locations Routes */}
        <Route
          path="/locations/sites"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SitesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/locations/warehouses"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WarehousesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/locations/locations"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LocationsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Movements Routes */}
        <Route
          path="/movements"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MovementsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Quality Routes */}
        <Route
          path="/quality"
          element={
            <ProtectedRoute>
              <MainLayout>
                <QualityControlsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;