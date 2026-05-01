import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOVA Admin",
  description: "Internal KOVA admin panel.",
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
