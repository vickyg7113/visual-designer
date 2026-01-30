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
  private redBorderOverlay: HTMLElement | null = null;
  private studioBadge: HTMLElement | null = null;
  private loadingOverlay: HTMLElement | null = null;

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
    // This checks localStorage for designerMode (set when ?designer=true was in URL)
    // In snippet mode, init() is called after login, so this will find the stored mode
    const shouldEnableEditor = this.shouldEnableEditorMode();
    
    // Debug logging
    console.log('[Visual Designer] init() called');
    console.log('[Visual Designer] shouldEnableEditor:', shouldEnableEditor);
    console.log('[Visual Designer] localStorage designerMode:', localStorage.getItem('designerMode'));
    console.log('[Visual Designer] localStorage designerModeType:', localStorage.getItem('designerModeType'));
    
    if (shouldEnableEditor) {
      // Show loading overlay while enabling editor (user just logged in)
      this.showLoadingOverlay();
      // Enable editor (will hide loading when ready)
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
      console.log('[Visual Designer] Editor already enabled, skipping');
      return;
    }

    console.log('[Visual Designer] enableEditor() called');
    this.isEditorMode = true;
    
    // Get mode from URL parameter (stored in global flag) or localStorage
    let mode = typeof window !== 'undefined' ? (window as any).__visualDesignerMode : null;
    if (!mode) {
      // Fallback to localStorage if mode wasn't in URL (e.g., page refresh)
      mode = localStorage.getItem('designerModeType') || null;
    }
    
    console.log('[Visual Designer] Mode:', mode);
    
    // Create editor frame with mode
    this.editorFrame.create((message) => this.handleEditorMessage(message), mode);
    
    // Activate editor mode
    this.editorMode.activate((message) => this.handleEditorMessage(message));
    
    // Create exit editor button
    this.createExitEditorButton();
    
    // Create red border overlay
    this.createRedBorderOverlay();
    
    // Create studio badge
    this.createStudioBadge();
    
    // Store editor mode and mode type in localStorage
    localStorage.setItem('designerMode', 'true');
    if (mode) {
      localStorage.setItem('designerModeType', mode);
    }
    
    // Show the editor frame for all modes
    // For Tag Feature mode, show immediately
    // For other modes, show after a short delay to ensure everything is initialized
    setTimeout(() => {
      this.editorFrame.show();
      // Hide loading after editor is shown
      this.hideLoadingOverlay();
    }, mode === 'tag-feature' ? 100 : 300);
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
    
    // Remove red border overlay
    this.removeRedBorderOverlay();
    
    // Remove studio badge
    this.removeStudioBadge();
    
    // Remove editor mode and mode type from localStorage
    localStorage.removeItem('designerMode');
    localStorage.removeItem('designerModeType');
    
    // Hide loading overlay if it's showing
    this.hideLoadingOverlay();
    
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
      console.log('[Visual Designer] shouldEnableEditorMode: true (config override)');
      return this.config.editorMode;
    }

    // If script saw ?designer=true at load time (cleaned in index.ts), respect that flag
    if (typeof window !== 'undefined' && (window as any).__visualDesignerWasLaunched) {
      console.log('[Visual Designer] shouldEnableEditorMode: true (wasLaunched flag)');
      return true;
    }

    // Check localStorage
    const designerMode = localStorage.getItem('designerMode');
    if (designerMode === 'true') {
      console.log('[Visual Designer] shouldEnableEditorMode: true (localStorage)');
      return true;
    }

    console.log('[Visual Designer] shouldEnableEditorMode: false');
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
        // Editor is ready, hide loading overlay
        this.hideLoadingOverlay();
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

  /**
   * Create red border overlay around the entire page
   */
  private createRedBorderOverlay(): void {
    if (this.redBorderOverlay) {
      return;
    }

    // Ensure document.body exists
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createRedBorderOverlay());
        return;
      }
      setTimeout(() => this.createRedBorderOverlay(), 100);
      return;
    }

    this.redBorderOverlay = document.createElement('div');
    this.redBorderOverlay.id = 'designer-red-border-overlay';
    this.redBorderOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 5px solid #3B82F6;
      pointer-events: none;
      z-index: 999997;
      box-sizing: border-box;
    `;
    document.body.appendChild(this.redBorderOverlay);
  }

  /**
   * Remove red border overlay
   */
  private removeRedBorderOverlay(): void {
    if (this.redBorderOverlay) {
      this.redBorderOverlay.remove();
      this.redBorderOverlay = null;
    }
  }

  /**
   * Create studio badge at the top center
   */
  private createStudioBadge(): void {
    if (this.studioBadge) {
      return;
    }

    // Ensure document.body exists
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createStudioBadge());
        return;
      }
      setTimeout(() => this.createStudioBadge(), 100);
      return;
    }

    this.studioBadge = document.createElement('div');
    this.studioBadge.id = 'designer-studio-badge';
    this.studioBadge.textContent = 'Revgain Visual Design Studio';
    this.studioBadge.style.cssText = `
      position: fixed;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0px 10px 3px;
      background: #3B82F6;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      border-radius: 0 0 6px 6px;
      border: 5px solid #3B82F6;
      border-top: none;
      z-index: 1000001;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      pointer-events: none;
      white-space: nowrap;
    `;
    document.body.appendChild(this.studioBadge);
  }

  /**
   * Remove studio badge
   */
  private removeStudioBadge(): void {
    if (this.studioBadge) {
      this.studioBadge.remove();
      this.studioBadge = null;
    }
  }

  /**
   * Show loading overlay while designer is initializing
   */
  private showLoadingOverlay(): void {
    if (this.loadingOverlay) {
      return;
    }

    // Ensure document.body exists
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.showLoadingOverlay());
        return;
      }
      setTimeout(() => this.showLoadingOverlay(), 100);
      return;
    }

    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.id = 'designer-loading-overlay';
    this.loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 1000002;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    // Create spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    `;

    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Loading Visual Designer...';
    loadingText.style.cssText = `
      color: #1e40af;
      font-size: 16px;
      font-weight: 500;
    `;

    this.loadingOverlay.appendChild(spinner);
    this.loadingOverlay.appendChild(loadingText);
    document.body.appendChild(this.loadingOverlay);
  }

  /**
   * Hide loading overlay
   */
  private hideLoadingOverlay(): void {
    if (this.loadingOverlay) {
      this.loadingOverlay.remove();
      this.loadingOverlay = null;
    }
  }
}
