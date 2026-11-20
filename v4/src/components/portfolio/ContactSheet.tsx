import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Copy, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { supabase } from "../../integrations/supabase/client";
import { CONTACT } from "../../lib/projects";
import { copyEmail } from "./copy-email";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre").max(100, "Máximo 100 caracteres"),
  email: z.string().trim().email("Email no válido").max(255, "Máximo 255 caracteres"),
  project_type: z.enum(["product", "uxui", "branding", "other"]),
  message: z.string().trim().min(10, "Cuéntame un poco más (mín. 10 caracteres)").max(2000, "Máximo 2000 caracteres"),
});
type Form = z.infer<typeof contactSchema>;
const TYPES: { v: Form["project_type"]; l: string }[] = [
  { v: "product", l: "Product" }, { v: "uxui", l: "UX/UI" }, { v: "branding", l: "Branding" }, { v: "other", l: "Otro" },
];
const empty: Form = { name: "", email: "", project_type: "product", message: "" };

export function ContactSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Form, string>> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as keyof Form] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    if (error) {
      setStatus("idle");
      toast.error("No se pudo enviar", { description: `Inténtalo de nuevo o escribe a ${CONTACT.email}` });
      return;
    }
    setStatus("sent");
    setForm(empty);
  };

  const field = "mt-2 w-full rounded-md border bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-highlight";
  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStatus("idle"); }}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l bg-background p-0 sm:max-w-[560px] [&>button]:hidden" data-lenis-prevent>
        <div className="flex items-center justify-between border-b px-6 py-3 font-mono text-[11px]">
          <span className="flex items-center gap-2 text-status"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-status" />AVAILABLE 2027 · OPEN Q1</span>
          <button onClick={() => onOpenChange(false)} className="grid h-9 w-9 place-items-center rounded-md border hover:bg-surface-2" aria-label="Cerrar"><X size={16} /></button>
        </div>
        <div className="px-6 py-8">
          <SheetTitle className="text-[56px] font-medium uppercase leading-[0.85] tracking-[-0.06em]">Hablemos</SheetTitle>
          <SheetDescription className="mt-4 text-[15px] text-muted-foreground">Cuéntame qué estás construyendo. Respondo personalmente.</SheetDescription>
          <button onClick={copyEmail} className="mt-6 flex w-full items-center justify-between rounded-md border bg-surface px-4 py-3 font-mono text-[13px] hover:border-highlight">
            {CONTACT.email}<span className="flex items-center gap-2 text-muted-foreground"><Copy size={14} />Copiar</span>
          </button>

          {status === "sent" ? (
            <div className="kit-bevel mt-8 rounded-lg p-8 text-center" role="status">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check size={20} /></div>
              <h3 className="mt-5 text-[28px] font-semibold tracking-tight">Mensaje recibido</h3>
              <p className="mt-2 text-[14px] text-muted-foreground">Gracias. Te escribiré a tu email en cuanto lo lea.</p>
              <button onClick={() => setStatus("idle")} className="mt-6 font-mono text-[11px] uppercase text-highlight hover:underline">Enviar otro mensaje</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 space-y-5">
              <div className="font-mono text-[11px] text-muted-foreground">// O ESCRÍBEME AQUÍ</div>
              <label className="block font-mono text-[11px] uppercase">Nombre
                <input className={field} value={form.name} maxLength={100} autoComplete="name" aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <span className="mt-1 block normal-case text-destructive">{errors.name}</span>}
              </label>
              <label className="block font-mono text-[11px] uppercase">Email
                <input type="email" className={field} value={form.email} maxLength={255} autoComplete="email" aria-invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors.email && <span className="mt-1 block normal-case text-destructive">{errors.email}</span>}
              </label>
              <fieldset>
                <legend className="font-mono text-[11px] uppercase">Tipo de proyecto</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button type="button" key={t.v} aria-pressed={form.project_type === t.v} onClick={() => setForm({ ...form, project_type: t.v })}
                      className={`h-9 rounded-sm border px-4 font-mono text-[11px] uppercase transition ${form.project_type === t.v ? "border-foreground bg-foreground text-background" : "bg-surface hover:border-foreground/40"}`}>{t.l}</button>
                  ))}
                </div>
              </fieldset>
              <label className="block font-mono text-[11px] uppercase">Mensaje
                <textarea rows={5} className={`${field} resize-none font-display`} value={form.message} maxLength={2000} aria-invalid={!!errors.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <span className="mt-1 flex justify-between normal-case">
                  <span className="text-destructive">{errors.message}</span>
                  <span className="text-muted-foreground">{form.message.length}/2000</span>
                </span>
              </label>
              <button type="submit" disabled={status === "sending"} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-primary-foreground transition hover:bg-foreground hover:text-background disabled:opacity-60">
                {status === "sending" ? <><Loader2 size={16} className="animate-spin" />Enviando…</> : "Enviar mensaje"}
              </button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
