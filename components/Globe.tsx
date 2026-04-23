"use client";

/**
 * Globe.tsx — SSR-safe wrapper.
 * Dynamically imports GlobeInner with ssr:false so globe.gl never touches Node.
 */

import dynamic from "next/dynamic";
import type { Route } from "@/lib/routes";
import type { City } from "@/lib/cities";

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
        background: "#000",
        color: "rgba(255,215,0,0.4)",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: "0.75rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Initialising Network Globe…
    </div>
  ),
});

interface GlobeProps {
  routes: Route[];
  onArcSelect: (route: Route | null) => void;
  onCityHover: (city: City | null) => void;
}

export default function Globe({ routes, onArcSelect, onCityHover }: GlobeProps) {
  return (
    <GlobeInner
      routes={routes}
      onArcSelect={onArcSelect}
      onCityHover={onCityHover}
    />
  );
}
