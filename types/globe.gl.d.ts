declare module "globe.gl" {
  interface GlobeInstance {
    // Initialization
    (element: HTMLElement): GlobeInstance;

    // Globe appearance
    globeImageUrl(url: string): GlobeInstance;
    backgroundImageUrl(url: string | null): GlobeInstance;
    backgroundColor(color: string): GlobeInstance;
    atmosphereColor(color: string): GlobeInstance;
    atmosphereAltitude(alt: number): GlobeInstance;
    showAtmosphere(show: boolean): GlobeInstance;

    // Points
    pointsData(data: object[]): GlobeInstance;
    pointLat(fn: ((d: object) => number) | string): GlobeInstance;
    pointLng(fn: ((d: object) => number) | string): GlobeInstance;
    pointColor(fn: ((d: object) => string) | string): GlobeInstance;
    pointAltitude(fn: ((d: object) => number) | number): GlobeInstance;
    pointRadius(fn: ((d: object) => number) | number): GlobeInstance;
    pointLabel(fn: ((d: object) => string) | string): GlobeInstance;
    onPointClick(fn: (point: object) => void): GlobeInstance;
    onPointHover(fn: (point: object | null) => void): GlobeInstance;

    // Arcs
    arcsData(data: object[]): GlobeInstance;
    arcStartLat(fn: ((d: object) => number) | string): GlobeInstance;
    arcStartLng(fn: ((d: object) => number) | string): GlobeInstance;
    arcEndLat(fn: ((d: object) => number) | string): GlobeInstance;
    arcEndLng(fn: ((d: object) => number) | string): GlobeInstance;
    arcColor(fn: ((d: object) => string | string[]) | string): GlobeInstance;
    arcAltitude(fn: ((d: object) => number) | number | null): GlobeInstance;
    arcAltitudeAutoScale(scale: number): GlobeInstance;
    arcStroke(fn: ((d: object) => number) | number | null): GlobeInstance;
    arcDashLength(fn: ((d: object) => number) | number): GlobeInstance;
    arcDashGap(fn: ((d: object) => number) | number): GlobeInstance;
    arcDashAnimateTime(fn: ((d: object) => number) | number): GlobeInstance;
    arcDashInitialGap(fn: ((d: object) => number) | number): GlobeInstance;
    onArcClick(fn: (arc: object) => void): GlobeInstance;
    onArcHover(fn: (arc: object | null) => void): GlobeInstance;
    arcLabel(fn: ((d: object) => string) | string): GlobeInstance;

    // Labels
    labelsData(data: object[]): GlobeInstance;
    labelLat(fn: ((d: object) => number) | string): GlobeInstance;
    labelLng(fn: ((d: object) => number) | string): GlobeInstance;
    labelText(fn: ((d: object) => string) | string): GlobeInstance;
    labelColor(fn: ((d: object) => string) | string): GlobeInstance;
    labelSize(fn: ((d: object) => number) | number): GlobeInstance;
    labelDotRadius(fn: ((d: object) => number) | number): GlobeInstance;
    labelAltitude(fn: ((d: object) => number) | number): GlobeInstance;
    labelResolution(res: number): GlobeInstance;
    labelLabel(fn: ((d: object) => string) | string): GlobeInstance;
    onLabelClick(fn: (label: object) => void): GlobeInstance;
    onLabelHover(fn: (label: object | null) => void): GlobeInstance;

    // Controls
    controls(): { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean };
    pointOfView(pov: { lat?: number; lng?: number; altitude?: number }, ms?: number): GlobeInstance;
    width(w: number): GlobeInstance;
    height(h: number): GlobeInstance;

    // Renderer
    renderer(): { domElement: HTMLCanvasElement };
    scene(): object;
    camera(): object;
  }

  function Globe(): GlobeInstance;
  export = Globe;
}
