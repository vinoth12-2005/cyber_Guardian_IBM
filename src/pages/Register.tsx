import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import AuthLayout from "../components/auth/AuthLayout";
import SocialButton from "../components/auth/SocialButton";
import ProgressSteps from "../components/auth/register/ProgressSteps";
import StepOne from "../components/auth/register/StepOne";
import StepTwo from "../components/auth/register/StepTwo";
import StepThree from "../components/auth/register/StepThree";
import { registerSchema } from "../schemas/authSchemas";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "../lib/authService";

const stepFields: Record<number, string[]> = {
  1: ["firstName", "lastName", "email", "phone", "country"],
  2: ["organization", "role", "password", "confirmPassword"],
  3: ["acceptTerms"],
};

export default function Register() {
  const navigate = useNavigate();
  const { register: registerAuth, loginProvider } = useAuth();
  const [step, setStep] = useState(1);
  const [_photoFile, setPhotoFile] = useState<File | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "", country: "",
      organization: "", role: "", password: "", confirmPassword: "",
      acceptTerms: false as unknown as true, newsletter: true,
    },
  });

  const goNext = async () => {
    const valid = await trigger(stepFields[step] as any);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: any) => {
    try {
      await registerAuth({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        organization: data.organization,
        role: data.role,
      });

      setSuccess(true);
      toast.success("Account created — welcome to CyberGuardian AI");
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.code));
    }
  };

  const handleSocial = async (name: string, providerKey: string) => {
    setSocialLoading(name);
    try {
      await loginProvider(providerKey);
      toast.success("Welcome to CyberGuardian AI");
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
    <AuthLayout mode="register">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/30"
            >
              <PartyPopper className="h-9 w-9 text-success" />
            </motion.div>
            <h2 className="mt-6 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              You're all set!
            </h2>
            <p className="mt-2 max-w-xs text-sm" style={{ color: "var(--text-secondary)" }}>
              Account successfully created. Redirecting you to your Security Dashboard now…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="register-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Create your account
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Join CyberGuardian AI and start building your security awareness.
            </p>

            <div className="mt-7">
              <ProgressSteps current={step} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 1 && <StepOne register={register} errors={errors} />}
                  {step === 2 && (
                    <StepTwo
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  )}
                  {step === 3 && (
                    <StepThree
                      register={register}
                      errors={errors}
                      setPhotoFile={setPhotoFile}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center gap-3">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={goBack} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" className="flex-1 gap-1.5" onClick={goNext}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1" loading={isSubmitting}>
                    {isSubmitting ? "Creating account…" : "Finish registration"}
                  </Button>
                )}
              </div>
            </form>

            {step === 1 && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>or sign up with</span>
                  <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SocialButton
                    provider="google"
                    label="Google"
                    disabled={!!socialLoading}
                    onClick={() => handleSocial("google", "google")}
                  />
                  <SocialButton
                    provider="microsoft"
                    label="MS"
                    disabled={!!socialLoading}
                    onClick={() => handleSocial("microsoft", "microsoft")}
                  />
                  <SocialButton
                    provider="github"
                    label="GitHub"
                    disabled={!!socialLoading}
                    onClick={() => handleSocial("github", "github")}
                  />
                </div>
              </>
            )}

            <p className="mt-7 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-medium hover:opacity-80" style={{ color: "var(--accent-primary)" }}>
                Log in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
