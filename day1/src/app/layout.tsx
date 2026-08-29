import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maritime Intelligence & Domain Awareness | Arabian Sea Command",
  description: "Next-generation tactical maritime intelligence and vessel traffic tracking dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-maritime-dark text-slate-100 antialiased overflow-hidden select-none h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
