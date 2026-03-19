"use client";

import { useRef, type InputHTMLAttributes, type ReactNode } from "react";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightClick?: () => void;
  id?: string;
}

export function Field({ label, type = "text", icon, rightIcon, onRightClick, id: propId, className, ...props }: FieldProps) {
  const autoId = useRef(`field-${Math.random().toString(36).slice(2, 7)}`).current;
  const fieldId = propId || autoId;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-wider text-mm-text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 flex -translate-y-1/2 text-mm-text-muted" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={fieldId}
          type={type}
          aria-label={label || props.placeholder}
          {...props}
          className={[
            "w-full border border-mm-border bg-mm-bg-input px-3.5 py-3 font-sans text-sm text-mm-text outline-none transition-colors duration-200",
            "focus:border-mm-primary",
            icon ? "pl-[38px]" : "",
            rightIcon ? "pr-[38px]" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightClick}
            aria-label={type === "password" ? "Show password" : "Toggle visibility"}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-mm-text-muted"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
}
