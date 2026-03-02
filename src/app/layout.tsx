import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoTwin Sentinal | AI-Powered Sustainability Digital Twin",
  description:
    "Real-time 3D digital twin dashboard for sustainability monitoring, ESG compliance verification, and What-If carbon simulations powered by Google Gemini AI.",
  keywords: [
    "sustainability",
    "digital twin",
    "ESG",
    "carbon emissions",
    "Gemini AI",
    "greenwashing detection",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
