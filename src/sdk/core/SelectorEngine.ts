import { SelectorResult } from '../types';

/**
 * Selector Engine - Generates stable, replayable selectors for DOM elements
 * Priority order:
 * 1. id attribute
 * 2. data-testid attribute
 * 3. Other data-* attributes (prefer semantic ones)
 * 4. ARIA role + accessible name
 * 5. DOM path with minimal depth
 * 6. Fallback: tag selector (POC only)
 */
export class SelectorEngine {
  /**
   * Generate a stable selector for an element
   */
  static generateSelector(element: Element): SelectorResult {
    // Priority 1: id attribute
    if (element.id) {
      return {
        selector: `#${this.escapeSelector(element.id)}`,
        confidence: 'high',
        method: 'id',
      };
    }

    // Priority 2: data-testid attribute
    if (element.hasAttribute('data-testid')) {
      const testId = element.getAttribute('data-testid');
      return {
        selector: `[data-testid="${this.escapeAttribute(testId!)}"]`,
        confidence: 'high',
        method: 'data-testid',
      };
    }

    // Priority 3: Other data-* attributes (prefer semantic ones)
    const dataAttrs = this.getSemanticDataAttributes(element);
    if (dataAttrs.length > 0) {
      const attr = dataAttrs[0];
      const value = element.getAttribute(attr);
      return {
        selector: `[${attr}="${this.escapeAttribute(value!)}"]`,
        confidence: 'high',
        method: 'data-attribute',
      };
    }

    // Priority 4: ARIA role + accessible name
    const ariaSelector = this.generateAriaSelector(element);
    if (ariaSelector) {
      return {
        selector: ariaSelector,
        confidence: 'medium',
        method: 'aria',
      };
    }

    // Priority 5: DOM path with minimal depth
    const pathSelector = this.generatePathSelector(element);
    if (pathSelector) {
      return {
        selector: pathSelector,
        confidence: 'medium',
        method: 'path',
      };
    }

    // Priority 6: Fallback - tag selector (POC only)
    return {
      selector: element.tagName.toLowerCase(),
      confidence: 'low',
      method: 'tag',
    };
  }

  /**
   * Find an element by selector
   */
  static findElement(selector: string): Element | null {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.error('Invalid selector:', selector, error);
      return null;
    }
  }

  /**
   * Validate that a selector is valid and finds an element
   */
  static validateSelector(selector: string): boolean {
    try {
      const element = document.querySelector(selector);
      return element !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get semantic data-* attributes (prefer common ones)
   */
  private static getSemanticDataAttributes(element: Element): string[] {
    const semanticAttrs = [
      'data-id',
      'data-name',
      'data-role',
      'data-component',
      'data-element',
    ];

    const found: string[] = [];
    for (const attr of semanticAttrs) {
      if (element.hasAttribute(attr)) {
        found.push(attr);
      }
    }

    // Also check for any other data-* attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name.startsWith('data-') && !found.includes(attr.name)) {
        found.push(attr.name);
      }
    }

    return found;
  }

  /**
   * Generate selector using ARIA attributes
   */
  private static generateAriaSelector(element: Element): string | null {
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');

    if (role) {
      let selector = `[role="${this.escapeAttribute(role)}"]`;

      if (ariaLabel) {
        selector += `[aria-label="${this.escapeAttribute(ariaLabel)}"]`;
        return selector;
      }

      if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) {
          const labelText = labelElement.textContent?.trim();
          if (labelText) {
            // Try to find by role and nearby text
            return selector;
          }
        }
      }

      // If we have role but no label, still return it
      return selector;
    }

    return null;
  }

  /**
   * Generate a DOM path selector with minimal depth
   */
  private static generatePathSelector(element: Element): string | null {
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();

      // Add id if available
      if (current.id) {
        selector += `#${this.escapeSelector(current.id)}`;
        path.unshift(selector);
        break; // Stop at id since it's unique
      }

      // Add class if available and unique enough
      if (current.className && typeof current.className === 'string') {
        const classes = current.className
          .split(/\s+/)
          .filter(c => c && !c.startsWith('designer-')) // Exclude SDK classes
          .slice(0, 2); // Limit to 2 classes
        
        if (classes.length > 0) {
          selector += '.' + classes.map(c => this.escapeSelector(c)).join('.');
        }
      }

      // Add nth-child if needed for uniqueness
      const nextParent: Element | null = current.parentElement;
      if (nextParent) {
        const currentTagName = current.tagName;
        const children = Array.from(nextParent.children) as Element[];
        const siblings = children.filter(
          (child: Element) => child.tagName === currentTagName
        );
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      path.unshift(selector);
      current = nextParent;

      // Limit depth to avoid overly long selectors
      if (path.length >= 5) {
        break;
      }
    }

    return path.length > 0 ? path.join(' > ') : null;
  }

  /**
   * Escape CSS selector special characters
   */
  private static escapeSelector(selector: string): string {
    // CSS.escape is available in modern browsers
    if (typeof CSS !== 'undefined' && CSS.escape) {
      return CSS.escape(selector);
    }

    // Fallback for older browsers
    return selector.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
  }

  /**
   * Escape attribute value for CSS selector
   */
  private static escapeAttribute(value: string): string {
    return value.replace(/"/g, '\\"').replace(/'/g, "\\'");
  }
}
