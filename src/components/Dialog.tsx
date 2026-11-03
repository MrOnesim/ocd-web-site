import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { getSmoothScroll } from "@/lib/hooks";

export function Dialog({ title, children, onClose, className }: {
  title: string; children: ReactNode; onClose: () => void; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    getSmoothScroll()?.stop();
    document.body.style.paddingRight = `${scrollbarGap}px`;
    document.body.style.setProperty("--scrollbar-gap", `${scrollbarGap}px`);
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      document.body.style.removeProperty("--scrollbar-gap");
      getSmoothScroll()?.start();
      previous?.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={ref} aria-label={title} className={cn("site-dialog", className)} data-lenis-prevent
    onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
        .filter((control) => !control.hasAttribute("disabled") && control.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="dialog-heading"><span className="eyebrow">{title}</span><button autoFocus type="button" onClick={onClose} className="round-button" aria-label="Fermer la fenêtre"><X size={20} /></button></div>
    {children}
  </dialog>;
}