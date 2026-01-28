import { SelectorEngine } from './SelectorEngine';
import { getElementInfo, isElementVisible } from '../utils/dom';
import { ElementInfo, EditorMessage } from '../types';

/**
 * Editor Mode - Handles DOM instrumentation when editor is active
 */
export class EditorMode {
  private isActive: boolean = false;
  private highlightOverlay: HTMLElement | null = null;
  private selectedElement: Element | null = null;
  private messageCallback: ((message: EditorMessage) => void) | null = null;

  /**
   * Activate editor mode
   */
  activate(onMessage: (message: EditorMessage) => void): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.messageCallback = onMessage;
    this.createHighlightOverlay();
    this.attachEventListeners();
    this.addEditorStyles();
  }

  /**
   * Deactivate editor mode
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.removeEventListeners();
    this.removeHighlightOverlay();
    this.removeEditorStyles();
    this.selectedElement = null;
    this.messageCallback = null;
  }

  /**
   * Check if editor mode is active
   */
  getActive(): boolean {
    return this.isActive;
  }

  /**
   * Create highlight overlay element
   */
  private createHighlightOverlay(): void {
    // Ensure document.body exists
    if (!document.body) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createHighlightOverlay());
        return;
      }
      // Fallback: wait a bit
      setTimeout(() => this.createHighlightOverlay(), 100);
      return;
    }

    this.highlightOverlay = document.createElement('div');
    this.highlightOverlay.id = 'designer-highlight-overlay';
    this.highlightOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
      z-index: 999998;
      transition: all 0.1s ease;
      box-sizing: border-box;
      display: none;
    `;
    document.body.appendChild(this.highlightOverlay);
  }

  /**
   * Remove highlight overlay
   */
  private removeHighlightOverlay(): void {
    if (this.highlightOverlay) {
      this.highlightOverlay.remove();
      this.highlightOverlay = null;
    }
  }

  /**
   * Attach event listeners for element selection
   */
  private attachEventListeners(): void {
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
  }

  /**
   * Handle mouseover event - highlight element
   */
  private handleMouseOver = (event: MouseEvent): void => {
    if (!this.isActive || !this.highlightOverlay) {
      return;
    }

    const target = event.target as Element;
    if (!target || target === this.highlightOverlay) {
      return;
    }

    // Don't highlight SDK elements
    if (target.closest('#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn')) {
      this.hideHighlight();
      return;
    }

    // Only highlight visible elements
    if (!isElementVisible(target)) {
      this.hideHighlight();
      return;
    }

    this.highlightElement(target);
  };

  /**
   * Handle click event - select element
   */
  private handleClick = (event: MouseEvent): void => {
    if (!this.isActive) {
      return;
    }

    const target = event.target as Element;
    if (!target) {
      return;
    }

    // Don't capture clicks on SDK elements
    if (target.closest('#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn')) {
      return;
    }

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Only select visible elements
    if (!isElementVisible(target)) {
      return;
    }

    this.selectElement(target);
  };

  /**
   * Handle keydown - ESC to cancel
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive) {
      return;
    }

    if (event.key === 'Escape') {
      if (this.messageCallback) {
        this.messageCallback({ type: 'CANCEL' });
      }
      this.selectedElement = null;
      this.hideHighlight();
    }
  };

  /**
   * Highlight an element
   */
  private highlightElement(element: Element): void {
    if (!this.highlightOverlay) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    this.highlightOverlay.style.display = 'block';
    this.highlightOverlay.style.left = `${rect.left + scrollX}px`;
    this.highlightOverlay.style.top = `${rect.top + scrollY}px`;
    this.highlightOverlay.style.width = `${rect.width}px`;
    this.highlightOverlay.style.height = `${rect.height}px`;
  }

  /**
   * Hide highlight
   */
  private hideHighlight(): void {
    if (this.highlightOverlay) {
      this.highlightOverlay.style.display = 'none';
    }
  }

  /**
   * Select an element and send message to editor
   */
  private selectElement(element: Element): void {
    this.selectedElement = element;
    this.highlightElement(element);

    // Generate selector
    const selectorResult = SelectorEngine.generateSelector(element);
    const elementInfo = getElementInfo(element);

    // Send message to editor
    if (this.messageCallback) {
      this.messageCallback({
        type: 'ELEMENT_SELECTED',
        selector: selectorResult.selector,
        elementInfo,
      });
    }
  }

  /**
   * Add editor-specific styles
   */
  private addEditorStyles(): void {
    // Prevent text selection during editor mode
    const style = document.createElement('style');
    style.id = 'designer-editor-styles';
    style.textContent = `
      * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      a, button, input, textarea, select {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove editor-specific styles
   */
  private removeEditorStyles(): void {
    const style = document.getElementById('designer-editor-styles');
    if (style) {
      style.remove();
    }
  }
}
