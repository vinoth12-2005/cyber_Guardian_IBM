import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import AuthLayout from "../components/auth/AuthLayout";
import { forgotPasswordSchema } from "../schemas/authSchemas";
import type { ForgotPasswordFormData } from "../schemas/authSchemas";
import { resetPassword, friendlyAuthError } from "../lib/authService";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setSent(true);
      startCooldown();
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.code));
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await resetPassword(getValues("email"));
      toast.success("Reset link sent again");
      startCooldown();
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.code));
    }
  };

  return (
    <AuthLayout mode="login">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Reset your password
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Enter the email on your account and we'll send you a reset link.
            </p>

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
              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/30">
              <MailCheck className="h-8 w-8 text-success" />
            </div>
            <h2 className="mt-5 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Check your inbox</h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              We sent a password reset link to{" "}
              <span style={{ color: "var(--text-primary)" }}>{getValues("email")}</span>.
            </p>
            <div
              className="mt-3.5 max-w-sm rounded-xl p-3 text-left text-xs"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                Didn't see the email?
              </p>
              <ul className="mt-1.5 list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Check your <strong>Spam / Junk</strong> folder (sent from <code>noreply@ibmhack-c98c2.firebaseapp.com</code>).</li>
                <li>Make sure the email matches your registered account exactly.</li>
                <li>Check the <strong>Promotions</strong> or <strong>Updates</strong> tab if using Gmail.</li>
              </ul>
            </div>
            <button
              onClick={resend}
              disabled={cooldown > 0}
              className="mt-5 text-sm font-medium disabled:cursor-not-allowed transition-opacity"
              style={{ color: cooldown > 0 ? "var(--text-secondary)" : "var(--accent-primary)" }}
            >
              {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend link"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        to="/login"
        className="mt-7 flex items-center justify-center gap-1.5 text-sm transition-colors hover:opacity-80"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </AuthLayout>
  );
}
