import type { Metadata } from "next";
import "./globals.css";
import { Libre_Baskerville } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["italic"],
  display: "swap",
  variable: "--font-baskerville",
});

export const metadata: Metadata = {
  title: "Forge Hyperloop — Network Simulation",
  description:
    "Interactive 3D globe visualizing the Forge Hyperloop network. Explore routes, travel times, energy savings, and CO₂ avoided across 30 global cities.",
  openGraph: {
    title: "Forge Hyperloop — Network Simulation",
    description:
      "Explore the Forge Hyperloop global network on an interactive 3D globe.",
    siteName: "Forge Hyperloop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forge Hyperloop — Network Simulation",
    description: "Interactive 3D globe showing hyperloop routes worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={libreBaskerville.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0E0E0C" />
      </head>
      <body className={libreBaskerville.className}>{children}</body>
    </html>
  );
}
