import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDN AI Traffic Manager — Intelligent Network Routing",
  description: "AI-Driven Predictive Network Traffic Management and Intelligent Routing in Software Defined Networks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
