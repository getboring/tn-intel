import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TN Intel - Tennessee County Intelligence",
  description: "Real-time weather and data for all 95 Tennessee counties",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
