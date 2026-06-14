import React from "react";
import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface CalloutProps {
  children: React.ReactNode;
  type?: "info" | "warning" | "error" | "success";
  title?: string;
}

export function Callout({ children, type = "info", title }: CalloutProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  };

  const styles = {
    info: "bg-stone-100/50 border-stone-200 text-neutral-800 dark:bg-neutral-900/30 dark:border-neutral-800 dark:text-neutral-200",
    warning: "bg-amber-50/40 border-amber-200/60 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-200",
    error: "bg-red-50/40 border-red-200/60 text-red-900 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-200",
    success: "bg-emerald-50/40 border-emerald-200/60 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-200",
  };

  return (
    <div className={`my-6 flex gap-4 p-4 border rounded-md ${styles[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 space-y-1">
        {title && <p className="font-semibold text-sm leading-none">{title}</p>}
        <div className="text-sm leading-relaxed prose-p:my-0">{children}</div>
      </div>
    </div>
  );
}
export default Callout;
