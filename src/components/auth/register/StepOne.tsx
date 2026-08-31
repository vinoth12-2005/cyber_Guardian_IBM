import { useState } from "react";
import { User, Mail, Globe } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import Input from "../../ui/Input";
import Label from "../../ui/Label";

const countries = [
  "United States", "United Kingdom", "Canada", "India", "Australia",
  "Germany", "France", "Singapore", "United Arab Emirates", "Other",
];

const countryCodes: Record<string, string> = {
  "United States": "+1",
  "United Kingdom": "+44",
  Canada: "+1",
  India: "+91",
  Australia: "+61",
  Germany: "+49",
  France: "+33",
  Singapore: "+65",
  "United Arab Emirates": "+971",
  Other: "",
};

export interface StepOneProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function StepOne({ register, errors }: StepOneProps) {
  const [countryCode, setCountryCode] = useState("+91");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            icon={User}
            placeholder="Ada"
            error={errors.firstName?.message as string}
            {...register("firstName")}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            placeholder="Lovelace"
            error={errors.lastName?.message as string}
            {...register("lastName")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          error={errors.email?.message as string}
          {...register("email")}
        />
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <div className="relative mb-3">
          <Globe className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <select
            id="country"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            className="h-12 w-full appearance-none rounded-2xl border pl-11 pr-4 text-sm outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/25"
            defaultValue=""
            {...register("country")}
            onChange={(e) => {
              setCountryCode(countryCodes[e.target.value] || "+1");
            }}
          >
            <option value="" disabled style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
              Select your country
            </option>
            {countries.map((c) => (
              <option key={c} value={c} style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="phone">Phone number</Label>

          <div className="flex gap-2">
            <select
              id="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              className="h-12 w-24 appearance-none rounded-2xl border px-3 text-sm outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/25"
            >
              <option value="+91" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+91</option>
              <option value="+1" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+1</option>
              <option value="+44" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+44</option>
              <option value="+61" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+61</option>
              <option value="+49" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+49</option>
              <option value="+33" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+33</option>
              <option value="+65" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+65</option>
              <option value="+971" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>+971</option>
            </select>

            <div className="flex-1">
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                error={errors.phone?.message as string}
                {...register("phone")}
              />
            </div>
          </div>
        </div>

        {errors.country?.message && (
          <p className="mt-1.5 text-xs text-danger">{errors.country.message as string}</p>
        )}
      </div>
    </div>
  );
}
