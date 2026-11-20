import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jafet Pérez — Senior Product Designer & Brand Architect",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
