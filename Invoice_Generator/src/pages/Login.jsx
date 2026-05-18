import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Hammer, Eye, EyeOff, Sun, Moon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const result = await login(email.trim(), password);

    if (result.ok) {
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-white flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Hammer className="w-5 h-5 text-white" strokeWidth={2.25} />
          </div>
          <span className="font-heading text-xl font-semibold">Invoice Forge</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Welcome back</h2>
          <p className="text-gray-400 text-lg">
            Sign in to manage your invoices, track payments, and grow your
            business with AI-powered tools.
          </p>
        </div>

        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} InvoiceAI
        </p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" strokeWidth={2.25} />
            </div>
            Invoice Forge
          </div>

          <h1 className="text-3xl font-semibold font-heading text-foreground mb-2">
            Sign in
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pr-12 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="rounded border-gray-300 accent-primary" />
                Remember me
              </label>
              <a href="#" className="text-primary font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
