import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "shadow-sm transition-all duration-200 ease-in-out outline-none",
              "border-gray-200 dark:border-gray-700",
              "hover:border-gray-300 dark:hover:border-gray-600",
              "focus:border-teal-500 dark:focus:border-teal-400",
              "focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-400/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error &&
                "border-red-400 dark:border-red-500 hover:border-red-400 dark:hover:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z" />
            </svg>
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex">
          {leftIcon && (
            <span className="absolute left-3.5 top-3 flex items-start pointer-events-none text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              "w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "shadow-sm transition-all duration-200 ease-in-out outline-none resize-y min-h-[100px]",
              "border-gray-200 dark:border-gray-700",
              "hover:border-gray-300 dark:hover:border-gray-600",
              "focus:border-teal-500 dark:focus:border-teal-400",
              "focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-400/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error &&
                "border-red-400 dark:border-red-500 hover:border-red-400 dark:hover:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : hint
                ? `${textareaId}-hint`
                : undefined
            }
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3.5 top-3 flex items-start pointer-events-none text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z" />
            </svg>
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${textareaId}-hint`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Input;
export { Textarea };
