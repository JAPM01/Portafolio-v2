import type { Metadata } from "next";
import RotatePrompt from "../components/RotatePrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jafet Pérez",
  description: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="dark" data-pointer="fine">
      <body>
        {/* Idioma guardado: se aplica antes del primer pintado para no
            mostrar un flash del idioma por defecto. El sitio queda
            fijo en oscuro (sin icono de tema): no se lee site-theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var l=localStorage.getItem("site-lang");if(l==="en"||l==="es")document.documentElement.lang=l;}catch(e){}})();',
          }}
        />
        {children}
        <RotatePrompt />
      </body>
    </html>
  );
}
