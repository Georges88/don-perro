import { AlertCircle } from "lucide-react";

interface FormNoticeProps {
  message: string | null;
}

export default function FormNotice({ message }: FormNoticeProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 rounded-xl border border-error/25 bg-error-container/35 px-4 py-3 text-error shadow-sm animate-fade-in"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs font-semibold leading-relaxed">{message}</p>
    </div>
  );
}
