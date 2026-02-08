"use client";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme } = useTheme();
  const resolvedTheme = theme === "dark" ? "dark" : "light";

  return (
    (<Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
