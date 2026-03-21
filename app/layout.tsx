import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Almanac — Your Competitive Edge",
  description: "Stop reacting. Start anticipating. Almanac tracks your competitors in real-time — surfacing signals, anomalies, and predictions before they become your problems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
