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
        {/* Tema e idioma guardados: se aplican antes del primer pintado
            para no mostrar un flash del tema/idioma por defecto. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("site-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;var l=localStorage.getItem("site-lang");if(l==="en"||l==="es")document.documentElement.lang=l;}catch(e){}})();',
          }}
        />
        {children}
        <RotatePrompt />
      </body>
    </html>
  );
}
