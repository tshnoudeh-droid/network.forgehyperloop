"use client";

type Theme = "dark" | "light";
export type PhaseFilter = "all" | 1 | 2 | 3 | 4 | 5;

interface PhaseToggleProps {
  selected: PhaseFilter;
  onSelect: (p: PhaseFilter) => void;
  theme: Theme;
}

const PHASES: { label: string; value: PhaseFilter }[] = [
  { label: "All", value: "all" },
  { label: "Phase 1", value: 1 },
  { label: "Phase 2", value: 2 },
  { label: "Phase 3", value: 3 },
  { label: "Phase 4", value: 4 },
  { label: "Phase 5", value: 5 },
];

const PHASE_DESCRIPTIONS: Partial<Record<string, string>> = {
  "1": "Asian Spine · 2030–2040 · Shanghai to Singapore — world's highest-volume manufacturing corridor",
  "2": "South & West Asia · 2035–2045 · Singapore to Dubai via Mumbai — Indian Ocean manufacturing belt",
  "3": "Europe & Africa · 2040–2050 · Dubai to Johannesburg via Cairo and Lagos — opens Sub-Saharan Africa",
  "4": "Transatlantic · 2048–2060 · New York to London via Azores SFT — first fixed Atlantic crossing",
  "5": "Transpacific & Completion · 2055–2070 · Los Angeles to Tokyo to Sydney — global loop closes",
};

export default function PhaseToggle({ selected, onSelect, theme }: PhaseToggleProps) {
  const isDark = theme === "dark";
  const description = selected !== "all" ? PHASE_DESCRIPTIONS[String(selected)] : null;

  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Button row */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {PHASES.map(({ label, value }) => {
          const isActive = selected === value;
          return (
            <button
              key={String(value)}
              onClick={() => onSelect(value)}
              style={{
                background: "none",
                border: `1px solid ${
                  isActive
                    ? "rgba(195,169,132,0.6)"
                    : isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.12)"
                }`,
                borderRight: "none",
                cursor: "pointer",
                padding: "5px 12px",
                fontSize: "0.52rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isActive
                  ? "#C3A984"
                  : isDark
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(0,0,0,0.35)",
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                transition: "color 0.2s ease, border-color 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
        {/* Close right border on last button */}
        <div
          style={{
            width: 1,
            alignSelf: "stretch",
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
          }}
        />
      </div>

      {/* Phase description */}
      {description && (
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isDark ? "rgba(195,169,132,0.7)" : "rgba(195,169,132,0.85)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
