import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hammer, Eye, EyeOff, Sun, Moon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);

    const result = await signup(fullName.trim(), email.trim(), password);
    if (result.ok) {
      toast.success("Account created — welcome to InvoiceAI!");
      navigate("/dashboard", { replace: true });
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
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Start creating invoices in seconds
          </h2>
          <p className="text-gray-400 text-lg">
            Join thousands of freelancers and small businesses who use
            InvoiceAI to get paid faster.
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
            Create an account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-gray-400"
              />
            </div>

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
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pr-12 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating account…" : "Create account"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="underline">Terms of Service</a> and{" "}
              <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
