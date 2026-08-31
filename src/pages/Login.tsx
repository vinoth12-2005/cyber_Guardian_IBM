import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import AuthLayout from "../components/auth/AuthLayout";
import SocialButton from "../components/auth/SocialButton";
import { loginSchema } from "../schemas/authSchemas";
import type { LoginFormData } from "../schemas/authSchemas";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "../lib/authService";

export default function Login() {
  const navigate = useNavigate();
  const { user, login, loginProvider, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back to CyberGuardian AI");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.code));
    }
  };

  const handleSocial = async (name: string, providerKey: string) => {
    setSocialLoading(name);
    try {
      await loginProvider(providerKey);
      toast.success("Welcome back to CyberGuardian AI");
      navigate("/dashboard");
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(friendlyAuthError(err?.code));
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <AuthLayout mode="login">
      <AnimatePresence mode="wait">
        <motion.div
          key="login-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to continue protecting your digital world.
          </p>

          {/* Already logged in banner */}
          {user && (
            <div
              className="mt-4 rounded-xl p-3.5 text-xs"
              style={{ background: "var(--accent-success-faint)", border: "1px solid var(--accent-success-border)" }}
            >
              <div className="flex items-center justify-between" style={{ color: "var(--text-primary)" }}>
                <span>
                  Logged in as <strong style={{ color: "var(--accent-success)" }}>{user.displayName || user.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={async () => { await logout(); toast.success("Logged out"); }}
                  className="font-medium text-red-400 hover:text-red-300 underline ml-2"
                >
                  Sign Out
                </button>
              </div>
              <div className="mt-2.5">
                <Button type="button" size="sm" className="w-full" onClick={() => navigate("/dashboard")}>
                  Continue to Security Dashboard →
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="mb-1.5">Password</Label>
                <Link
                  to="/forgot-password"
                  className="mb-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ color: "var(--accent-primary)" }}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ color: "var(--text-secondary)" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
                {...register("password")}
              />
            </div>

            <label className="flex select-none items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ accentColor: "var(--accent-primary)" }}
                {...register("remember")}
              />
              Remember me
            </label>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Log in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or continue with</span>
            <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SocialButton provider="google" label="Google" disabled={!!socialLoading} onClick={() => handleSocial("google", "google")} />
            <SocialButton provider="microsoft" label="MS" disabled={!!socialLoading} onClick={() => handleSocial("microsoft", "microsoft")} />
            <SocialButton provider="github" label="GitHub" disabled={!!socialLoading} onClick={() => handleSocial("github", "github")} />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-6 w-full"
            onClick={() => navigate("/register")}
          >
            Create an account
          </Button>

          <p className="mt-7 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            By continuing, you agree to CyberGuardian AI's{" "}
            <a href="#" className="underline hover:opacity-80" style={{ color: "var(--text-secondary)" }}>Privacy Policy</a>
            {" "}and{" "}
            <a href="#" className="underline hover:opacity-80" style={{ color: "var(--text-secondary)" }}>Terms of Service</a>.
          </p>
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
