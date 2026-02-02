import { TaggedFeature } from '../types';
import { SelectorEngine } from './SelectorEngine';

/** Heatmap colors with opacity (yellow-orange, green, red-orange like reference image) */
const HEATMAP_COLORS = [
  'rgba(251, 191, 36, 0.35)',   // yellow-amber
  'rgba(34, 197, 94, 0.35)',     // green
  'rgba(249, 115, 22, 0.35)',   // orange
];

/**
 * Feature Heatmap Renderer - Renders colored overlays on tagged feature elements
 */
export class FeatureHeatmapRenderer {
  private overlays: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;

  /**
   * Render heatmap overlays for tagged features on the current page
   */
  render(features: TaggedFeature[], enabled: boolean): void {
    this.clear();

    if (!enabled || features.length === 0) {
      return;
    }

    const currentUrl = this.getCurrentUrl();
    const normalizedCurrent = this.normalizeUrl(currentUrl);
    const pageFeatures = features.filter(
      (f) => f.url && this.normalizeUrl(f.url) === normalizedCurrent
    );

    pageFeatures.forEach((feature, index) => {
      const element = SelectorEngine.findElement(feature.selector);
      if (!element) {
        return;
      }

      const color = HEATMAP_COLORS[index % HEATMAP_COLORS.length];
      const overlay = this.createOverlay(element, color, feature.featureName);
      this.overlays.set(feature.id, overlay);

      if (!this.container) {
        this.createContainer();
      }
      if (this.container) {
        this.container.appendChild(overlay);
      }
    });

    this.updatePositions(features);
  }

  /**
   * Update overlay positions (on scroll/resize)
   */
  updatePositions(features: TaggedFeature[]): void {
    this.overlays.forEach((overlay, featureId) => {
      const feature = features.find((f) => f.id === featureId);
      if (!feature) return;

      const element = SelectorEngine.findElement(feature.selector);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      overlay.style.left = `${rect.left + scrollX}px`;
      overlay.style.top = `${rect.top + scrollY}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    });
  }

  /**
   * Clear all overlays
   */
  clear(): void {
    this.overlays.forEach((el) => el.remove());
    this.overlays.clear();
  }

  /**
   * Destroy container and overlays
   */
  destroy(): void {
    this.clear();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  private createOverlay(
    targetElement: Element,
    color: string,
    featureName: string
  ): HTMLElement {
    const rect = targetElement.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    const overlay = document.createElement('div');
    overlay.className = 'designer-feature-heatmap-overlay';
    overlay.title = featureName;
    overlay.style.cssText = `
      position: absolute;
      left: ${rect.left + scrollX}px;
      top: ${rect.top + scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background-color: ${color};
      pointer-events: none;
      z-index: 999995;
      box-sizing: border-box;
      border-radius: 4px;
      border: 2px solid ${color};
    `;

    return overlay;
  }

  private createContainer(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'designer-feature-heatmap-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999994;
    `;
    document.body.appendChild(this.container);
  }

  private getCurrentUrl(): string {
    try {
      return window.location.href || '';
    } catch {
      return '';
    }
  }

  private normalizeUrl(url: string): string {
    return (url || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '')
      .trim() || '';
  }
}
