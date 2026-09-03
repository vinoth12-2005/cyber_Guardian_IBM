import { useRef, useState } from "react";
import { UploadCloud, UserRound, X } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "../../../lib/utils";

export interface StepThreeProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setPhotoFile: (file: File | null) => void;
}

export default function StepThree({ register, errors, setPhotoFile }: StepThreeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-text-secondary">
          Profile picture <span className="text-text-secondary/60">(optional)</span>
        </p>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          style={{
            background: "var(--surface-1)",
            borderColor: "var(--border-medium)",
          }}
          className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-5 transition-colors hover:border-accent/50"
        >
          <div
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-default)",
            }}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                }}
              />
            ) : (
              <UserRound className="h-7 w-7" style={{ color: "var(--text-secondary)" }} />
            )}
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              <UploadCloud className="h-4 w-4" />
              Click or drag an image to upload
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>PNG or JPG, up to 5MB</p>
          </div>
          {preview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearPhoto();
              }}
              style={{ color: "var(--text-secondary)" }}
              className="rounded-full p-1.5 hover:opacity-80"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-default)",
        }}
        className="space-y-3 rounded-2xl border p-4"
      >
        <label className="flex items-start gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            className={cn(
              "mt-0.5 h-4 w-4 rounded accent-primary",
              errors.acceptTerms && "ring-2 ring-danger/50"
            )}
            {...register("acceptTerms")}
          />
          <span>
            I agree to the{" "}
            <a href="#" className="underline" style={{ color: "var(--accent-primary)" }}>Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline" style={{ color: "var(--accent-primary)" }}>Privacy Policy</a>.
          </span>
        </label>
        {errors.acceptTerms?.message && (
          <p className="text-xs text-danger">{errors.acceptTerms.message as string}</p>
        )}

        <label className="flex items-start gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded accent-primary"
            {...register("newsletter")}
          />
          <span>Send me security tips and threat alerts by email.</span>
        </label>
      </div>
    </div>
  );
}
