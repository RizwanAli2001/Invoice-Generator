import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AllInvoices from "./pages/Invoices/AllInvoices";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import InvoiceDetails from "./pages/Invoices/InvoiceDetails";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignUp />
                </PublicOnlyRoute>
              }
            />

            {/* Protected — share dashboard layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<AllInvoices />} />
              <Route path="/invoices/new" element={<CreateInvoice />} />
              <Route path="/invoices/:id/edit" element={<CreateInvoice />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/products" element={<Products />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        <Toaster
          position="top-right"
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
              borderRadius: "12px",
              background: "#111827",
              color: "#fff",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
