/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

type InputProps<T extends React.ElementType> = {
  as?: T
  label?: string
} & React.ComponentPropsWithoutRef<T>

const Input = React.forwardRef(
  <T extends React.ElementType = "input">(
    { as, label, id, className, ...props }: InputProps<T>,
    ref: React.Ref<any>
  ) => {
    const Component = as || "input"
    const getId = React.useId()
    const inputId = id || getId

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <Label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </Label>
        )}
        <Component
          id={inputId}
          data-slot="input"
          ref={ref}
          className={cn(
            "file:text-neutral-950 placeholder:text-neutral-500 selection:bg-neutral-900 selection:text-neutral-50 dark:bg-neutral-200/30 border-neutral-200 flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:selection:bg-neutral-50 dark:selection:text-neutral-900 dark:bg-neutral-800/30 dark:border-neutral-800 focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 focus-visible:ring-[3px] dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 dark:aria-invalid:ring-red-900/20 dark:aria-invalid:border-red-900",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
