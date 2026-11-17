import type { Metadata } from "next";
import Script from "next/script";
import RotatePrompt from "../components/RotatePrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jafet Pérez",
  description: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" data-pointer="fine">
      <body>
        {children}
        <RotatePrompt />
        {/* Runtime del efecto fluted-glass del hero (aidesigner.ai), una vez por app. */}
        <Script
          src="https://cdn.aidesigner.ai/effects/runtime/v1.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
