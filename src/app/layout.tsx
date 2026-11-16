import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
