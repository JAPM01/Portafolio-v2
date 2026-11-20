import { toast } from "sonner";
import { CONTACT } from "../../lib/projects";

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONTACT.email);
    toast.success("Email copiado", { description: CONTACT.email });
  } catch {
    toast(CONTACT.email, { description: "No se pudo copiar automáticamente. Selecciónalo y cópialo." });
  }
}
