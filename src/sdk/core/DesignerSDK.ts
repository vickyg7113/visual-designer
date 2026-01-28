import { EditorMode } from './EditorMode';
import { GuideRenderer } from './GuideRenderer';
import { EditorFrame } from '../editor/EditorFrame';
import { Storage } from '../utils/storage';
import { getCurrentPage, generateId } from '../utils/dom';
import {
  Guide,
  SDKConfig,
  EditorMessage,
  SaveGuideMessage,
  ElementSelectedMessage,
} from '../types';

/**
 * Visual Designer SDK - Main SDK class
 */
export class DesignerSDK {
  private config: SDKConfig;
  private storage: Storage;
  private editorMode: EditorMode;
  private guideRenderer: GuideRenderer;
  private editorFrame: EditorFrame;
  private isInitialized: boolean = false;
  private isEditorMode: boolean = false;
  private exitEditorButton: HTMLElement | null = null;

  constructor(config: SDKConfig = {}) {
    this.config = config;
    this.storage = new Storage(config.storageKey);
    this.editorMode = new EditorMode();
    this.guideRenderer = new GuideRenderer();
    this.editorFrame = new EditorFrame();
  }

  /**
   * Initialize the SDK
   */
  init(): void {
    if (this.isInitialized) {
      console.warn('SDK already initialized');
      return;
    }

    this.isInitialized = true;

    // Check if editor mode should be enabled
    const shouldEnableEditor = this.shouldEnableEditorMode();
    
    if (shouldEnableEditor) {
      this.enableEditor();
    } else {
      // Load and render guides for end users
      this.loadGuides();
    }

    // Set up scroll/resize listeners for guide positioning
    this.setupEventListeners();
  }

  /**
   * Enable editor mode
   */
  enableEditor(): void {
    if (this.isEditorMode) {
      return;
    }

    this.isEditorMode = true;
    
    // Create editor frame
    this.editorFrame.create((message) => this.handleEditorMessage(message));
    
    // Activate editor mode
    this.editorMode.activate((message) => this.handleEditorMessage(message));
    
    // Create exit editor button
    this.createExitEditorButton();
    
    // Store editor mode in localStorage
    localStorage.setItem('designerMode', 'true');
  }

  /**
   * Disable editor mode
   */
  disableEditor(): void {
    if (!this.isEditorMode) {
      return;
    }

    this.isEditorMode = false;
    this.editorMode.deactivate();
    this.editorFrame.destroy();
    
    // Remove exit editor button
    this.removeExitEditorButton();
    
    // Remove editor mode from localStorage
    localStorage.removeItem('designerMode');
    
    // Reload guides for end users
    this.loadGuides();
  }

  /**
   * Get all guides
   */
  getGuides(): Guide[] {
    return this.storage.getGuides();
  }

  /**
   * Get guides for current page
   */
  getGuidesForCurrentPage(): Guide[] {
    const page = getCurrentPage();
    return this.storage.getGuidesByPage(page);
  }

  /**
   * Save a guide
   */
  saveGuide(guideData: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>): Guide {
    const guide: Guide = {
      ...guideData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.storage.saveGuide(guide);

    // Reload guides if not in editor mode
    if (!this.isEditorMode) {
      this.loadGuides();
    }

    // Call callback if provided
    if (this.config.onGuideSaved) {
      this.config.onGuideSaved(guide);
    }

    return guide;
  }

  /**
   * Delete a guide
   */
  deleteGuide(guideId: string): void {
    this.storage.deleteGuide(guideId);
    this.guideRenderer.dismissGuide(guideId);
  }

  /**
   * Load and render guides for current page
   */
  loadGuides(): void {
    const guides = this.storage.getGuides();
    this.guideRenderer.renderGuides(guides);
  }

  /**
   * Check if editor mode should be enabled
   */
  private shouldEnableEditorMode(): boolean {
    // Check config override
    if (this.config.editorMode !== undefined) {
      return this.config.editorMode;
    }

    // Check query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('designer') === 'true') {
      return true;
    }

    // Check localStorage
    if (localStorage.getItem('designerMode') === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Handle messages from editor
   */
  private handleEditorMessage(message: EditorMessage): void {
    switch (message.type) {
      case 'ELEMENT_SELECTED':
        this.handleElementSelected(message);
        break;

      case 'SAVE_GUIDE':
        this.handleSaveGuide(message);
        break;

      case 'CANCEL':
        this.handleCancel();
        break;

      case 'EXIT_EDITOR_MODE':
        this.handleExitEditorMode();
        break;

      case 'EDITOR_READY':
        // Editor is ready, no action needed
        break;

      default:
        console.warn('Unknown message type:', message);
    }
  }

  /**
   * Handle element selection
   */
  private handleElementSelected(message: ElementSelectedMessage): void {
    this.editorFrame.sendElementSelected(message);
  }

  /**
   * Handle save guide
   */
  private handleSaveGuide(message: SaveGuideMessage): void {
    const guide = this.saveGuide({
      ...message.guide,
      page: getCurrentPage(),
    });

    // Notify editor that guide was saved
    // (This could trigger a success message in the editor UI)
    console.log('Guide saved:', guide);
  }

  /**
   * Handle cancel
   */
  private handleCancel(): void {
    // Just hide the editor frame, keep editor mode active
    this.editorFrame.hide();
  }

  /**
   * Handle exit editor mode
   */
  private handleExitEditorMode(): void {
    // Disable editor mode completely
    this.disableEditor();
  }

  /**
   * Set up event listeners for guide positioning
   */
  private setupEventListeners(): void {
    let resizeTimeout: number;
    let scrollTimeout: number;

    const updateGuides = () => {
      const guides = this.storage.getGuides();
      this.guideRenderer.updatePositions(guides);
    };

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateGuides, 100);
    });

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(updateGuides, 50);
    }, true);
  }

  /**
   * Check if editor mode is active
   */
  isEditorModeActive(): boolean {
    return this.isEditorMode;
  }

  /**
   * Create exit editor button
   */
  private createExitEditorButton(): void {
    if (this.exitEditorButton) {
      return;
    }

    // Ensure document.body exists
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createExitEditorButton());
        return;
      }
      setTimeout(() => this.createExitEditorButton(), 100);
      return;
    }

    this.exitEditorButton = document.createElement('button');
    this.exitEditorButton.id = 'designer-exit-editor-btn';
    this.exitEditorButton.textContent = 'Exit Editor';
    this.exitEditorButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #ffffff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      color: #3b82f6;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      cursor: pointer;
      z-index: 1000000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
      pointer-events: auto;
    `;

    // Hover effect
    this.exitEditorButton.onmouseenter = () => {
      if (this.exitEditorButton) {
        this.exitEditorButton.style.background = '#3b82f6';
        this.exitEditorButton.style.color = '#ffffff';
        this.exitEditorButton.style.transform = 'translateY(-2px)';
        this.exitEditorButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      }
    };

    this.exitEditorButton.onmouseleave = () => {
      if (this.exitEditorButton) {
        this.exitEditorButton.style.background = '#ffffff';
        this.exitEditorButton.style.color = '#3b82f6';
        this.exitEditorButton.style.transform = 'translateY(0)';
        this.exitEditorButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }
    };

    // Click handler
    this.exitEditorButton.onclick = () => {
      this.disableEditor();
    };

    document.body.appendChild(this.exitEditorButton);
  }

  /**
   * Remove exit editor button
   */
  private removeExitEditorButton(): void {
    if (this.exitEditorButton) {
      this.exitEditorButton.remove();
      this.exitEditorButton = null;
    }
  }
}
