import { Guide } from '../types';
import { SelectorEngine } from './SelectorEngine';
import { getCurrentPage, scrollIntoViewIfNeeded, generateId } from '../utils/dom';

/**
 * Guide Renderer - Renders guides for end users
 */
export class GuideRenderer {
  private renderedGuides: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;

  /**
   * Render all active guides for the current page
   */
  renderGuides(guides: Guide[]): void {
    // Clear existing guides
    this.clear();

    const currentPage = getCurrentPage();
    const pageGuides = guides.filter(
      guide => guide.page === currentPage && guide.status === 'active'
    );

    pageGuides.forEach(guide => {
      this.renderGuide(guide);
    });
  }

  /**
   * Render a single guide
   */
  renderGuide(guide: Guide): void {
    // Find target element
    const targetElement = SelectorEngine.findElement(guide.selector);
    if (!targetElement) {
      console.warn(`Guide "${guide.id}" target not found: ${guide.selector}`);
      return;
    }

    // Scroll element into view if needed
    scrollIntoViewIfNeeded(targetElement);

    // Create guide tooltip
    const tooltip = this.createTooltip(guide, targetElement);
    this.renderedGuides.set(guide.id, tooltip);

    // Add to container
    if (!this.container) {
      this.createContainer();
    }
    if (this.container) {
      this.container.appendChild(tooltip);
    }

    // Position tooltip
    this.positionTooltip(tooltip, targetElement, guide.placement);
  }

  /**
   * Dismiss a guide
   */
  dismissGuide(guideId: string): void {
    const tooltip = this.renderedGuides.get(guideId);
    if (tooltip) {
      tooltip.remove();
      this.renderedGuides.delete(guideId);
    }
  }

  /**
   * Clear all rendered guides
   */
  clear(): void {
    this.renderedGuides.forEach(tooltip => tooltip.remove());
    this.renderedGuides.clear();
  }

  /**
   * Create tooltip element
   */
  private createTooltip(guide: Guide, targetElement: Element): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'designer-guide-tooltip';
    tooltip.dataset.guideId = guide.id;
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 999997;
      max-width: 300px;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #111827;
    `;

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'margin-bottom: 8px;';
    content.textContent = guide.content;
    tooltip.appendChild(content);

    // Dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.textContent = 'Got it';
    dismissBtn.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `;
    dismissBtn.onmouseover = () => {
      dismissBtn.style.background = '#2563eb';
    };
    dismissBtn.onmouseout = () => {
      dismissBtn.style.background = '#3b82f6';
    };
    dismissBtn.onclick = () => {
      this.dismissGuide(guide.id);
    };
    tooltip.appendChild(dismissBtn);

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'designer-guide-arrow';
    arrow.style.cssText = `
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    `;
    tooltip.appendChild(arrow);

    return tooltip;
  }

  /**
   * Position tooltip relative to target element
   */
  private positionTooltip(
    tooltip: HTMLElement,
    targetElement: Element,
    placement: Guide['placement']
  ): void {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const arrow = tooltip.querySelector('.designer-guide-arrow') as HTMLElement;

    let top = 0;
    let left = 0;
    let arrowStyle = '';

    switch (placement) {
      case 'top':
        top = targetRect.top + scrollY - tooltipRect.height - 12;
        left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
        arrowStyle = `
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0 8px;
          border-color: #3b82f6 transparent transparent transparent;
        `;
        break;

      case 'bottom':
        top = targetRect.bottom + scrollY + 12;
        left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
        arrowStyle = `
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-color: transparent transparent #3b82f6 transparent;
        `;
        break;

      case 'left':
        top = targetRect.top + scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left + scrollX - tooltipRect.width - 12;
        arrowStyle = `
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent #3b82f6;
        `;
        break;

      case 'right':
        top = targetRect.top + scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + scrollX + 12;
        arrowStyle = `
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 8px 8px 0;
          border-color: transparent #3b82f6 transparent transparent;
        `;
        break;
    }

    // Adjust if tooltip goes off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal adjustment
    if (left < scrollX) {
      left = scrollX + 10;
    } else if (left + tooltipRect.width > scrollX + viewportWidth) {
      left = scrollX + viewportWidth - tooltipRect.width - 10;
    }

    // Vertical adjustment
    if (top < scrollY) {
      top = scrollY + 10;
    } else if (top + tooltipRect.height > scrollY + viewportHeight) {
      top = scrollY + viewportHeight - tooltipRect.height - 10;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    if (arrow) {
      arrow.style.cssText += arrowStyle;
    }
  }

  /**
   * Create container for guides
   */
  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'designer-guides-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999996;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Update positions on scroll/resize
   */
  updatePositions(guides: Guide[]): void {
    this.renderedGuides.forEach((tooltip, guideId) => {
      const guide = guides.find(g => g.id === guideId);
      if (!guide) {
        return;
      }

      const targetElement = SelectorEngine.findElement(guide.selector);
      if (targetElement) {
        this.positionTooltip(tooltip, targetElement, guide.placement);
      }
    });
  }
}
