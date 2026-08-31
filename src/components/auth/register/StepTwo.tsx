import { useState, useEffect } from "react";
import { Building2, Briefcase, Lock, Eye, EyeOff, Sparkles, ChevronDown } from "lucide-react";
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import Input from "../../ui/Input";
import Label from "../../ui/Label";
import PasswordStrengthMeter from "../PasswordStrengthMeter";
import { generateStrongPassword } from "../../../lib/utils";

const roles = [
  "Individual / Personal Use", "Student", "IT Professional",
  "Security Analyst", "Business Owner", "Manager", "Other",
];

const organizations = [
  "College / University",
  "School",
  "IT Company",
  "Other",
];

export interface StepTwoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export default function StepTwo({ register, errors, watch, setValue }: StepTwoProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const password = watch("password") || "";
  const role = watch("role") || "";
  const organizationOptions =
    role === "Student"
      ? ["College / University", "School"]
      : organizations;

  const handleGenerate = () => {
    const generated = generateStrongPassword();
    setValue("password", generated, { shouldValidate: true });
    setValue("confirmPassword", generated, { shouldValidate: true });
    setShowPassword(true);
    setShowConfirm(true);
  };

  useEffect(() => {
    if (role === "Student") {
      setValue("organization", "College / University");
    }
  }, [role, setValue]);

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="role">Role</Label>
        <div className="relative">
          <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <select
            id="role"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            className="h-12 w-full appearance-none rounded-2xl border pl-11 pr-10 text-sm outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/25"
            defaultValue=""
            {...register("role")}
          >
            <option value="" disabled style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
              Select your role
            </option>
            {roles.map((r) => (
              <option key={r} value={r} style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
        </div>
        {errors.role?.message && (
          <p className="mt-1.5 text-xs text-danger">{errors.role.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="organization">Organization Type</Label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <select
            id="organization"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            className="h-12 w-full appearance-none rounded-2xl border pl-11 pr-10 text-sm outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/25"
            defaultValue=""
            {...register("organization")}
          >
            <option value="" disabled style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
              Select organization
            </option>
            {organizationOptions.map((org) => (
              <option key={org} value={org} style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                {org}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
        </div>
        {errors.organization?.message && (
          <p className="mt-1.5 text-xs text-danger">{errors.organization.message as string}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="mb-1.5">Password</Label>
          <button
            type="button"
            onClick={handleGenerate}
            className="mb-1.5 flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate strong password
          </button>
        </div>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message as string}
          endAdornment={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="text-text-secondary hover:text-text"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          }
          {...register("password")}
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type={showConfirm ? "text" : "password"}
          icon={Lock}
          placeholder="••••••••"
          error={errors.confirmPassword?.message as string}
          endAdornment={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="text-text-secondary hover:text-text"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          }
          {...register("confirmPassword")}
        />
      </div>
    </div>
  );
}
