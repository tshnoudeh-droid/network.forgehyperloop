"use client";

import dynamic from "next/dynamic";
import type { Route } from "@/lib/routes";
import type { City } from "@/lib/cities";

type Theme = "dark" | "light";

const GlobeInner = dynamic(() => import("./GlobeInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,215,0,0.35)",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      Initialising Network Globe…
    </div>
  ),
});

interface GlobeProps {
  routes: Route[];
  theme: Theme;
  onArcSelect: (route: Route | null) => void;
  onCityHover: (city: City | null) => void;
}

export default function Globe({ routes, theme, onArcSelect, onCityHover }: GlobeProps) {
  return (
    <GlobeInner
      routes={routes}
      theme={theme}
      onArcSelect={onArcSelect}
      onCityHover={onCityHover}
    />
  );
}
