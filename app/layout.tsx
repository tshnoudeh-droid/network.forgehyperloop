import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
