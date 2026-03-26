import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E = mc\u00B2 \u2014 Mass-Energy Conversion Engine",
  description: "Interactive mass-energy conversion simulator with 3D particle visualization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
