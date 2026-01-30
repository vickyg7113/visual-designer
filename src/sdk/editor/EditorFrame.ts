import { EditorMessage, ElementSelectedMessage, SaveGuideMessage } from '../types';

/**
 * Editor Frame - Manages isolated editor UI iframe
 */
export class EditorFrame {
  private iframe: HTMLIFrameElement | null = null;
  private dragHandle: HTMLElement | null = null;
  private messageCallback: ((message: EditorMessage) => void) | null = null;
  private isReady: boolean = false;
  private mode: string | null = null;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private dragThreshold: number = 3; // Reduced threshold for more responsive dragging
  private mouseDownX: number = 0;
  private mouseDownY: number = 0;
  private isMouseDown: boolean = false;

  /**
   * Create and show editor iframe
   */
  create(onMessage: (message: EditorMessage) => void, mode?: string | null): void {
    console.log('[Visual Designer] EditorFrame.create() called with mode:', mode);
    if (this.iframe) {
      console.warn('[Visual Designer] EditorFrame already created, skipping');
      return;
    }

    this.mode = mode || null;
    this.messageCallback = onMessage;
    console.log('[Visual Designer] Creating editor iframe with mode:', this.mode);
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'designer-editor-frame';
    this.iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 600px;
      height: 800px;
      max-height: 90vh;
      border: none;
      border-radius: 12px;
      background: white;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      display: none;
      overflow: hidden;
    `;

    // Create drag handle overlay
    this.createDragHandle();

    // Load editor HTML as blob URL for POC
    // In production, this would be a separate HTML file served statically
    this.loadEditorHtml();

    // Set up message listener
    window.addEventListener('message', this.handleMessage);

    // Ensure document.body exists before appending
    const appendIframe = () => {
      if (document.body) {
        document.body.appendChild(this.iframe!);
        if (this.dragHandle) {
          document.body.appendChild(this.dragHandle);
        }
        // Wait for iframe to load
        if (this.iframe) {
          this.iframe.onload = () => {
            this.isReady = true;
            this.sendMessage({ type: 'EDITOR_READY' });
            this.updateDragHandlePosition();
          };
        }
      } else {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', appendIframe);
        } else {
          setTimeout(appendIframe, 100);
        }
      }
    };

    appendIframe();
  }

  /**
   * Show editor frame
   */
  show(): void {
    console.log('[Visual Designer] EditorFrame.show() called');
    if (this.iframe) {
      console.log('[Visual Designer] Showing iframe');
      this.iframe.style.display = 'block';
      this.updateDragHandlePosition();
    } else {
      console.warn('[Visual Designer] Cannot show iframe - iframe is null');
    }
    if (this.dragHandle) {
      console.log('[Visual Designer] Showing drag handle');
      this.dragHandle.style.display = 'block';
    } else {
      console.warn('[Visual Designer] Cannot show drag handle - dragHandle is null');
    }
  }

  /**
   * Hide editor frame
   */
  hide(): void {
    if (this.iframe) {
      this.iframe.style.display = 'none';
    }
    if (this.dragHandle) {
      this.dragHandle.style.display = 'none';
    }
  }

  /**
   * Send message to editor iframe
   */
  sendElementSelected(message: ElementSelectedMessage): void {
    this.sendMessage(message);
    this.show();
  }

  /**
   * Destroy editor frame
   */
  destroy(): void {
    window.removeEventListener('message', this.handleMessage);
    // Remove all mouse event listeners (both document and window)
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    document.removeEventListener('mouseup', this.handleMouseUp, true);
    window.removeEventListener('mousemove', this.handleMouseMove, true);
    window.removeEventListener('mouseup', this.handleMouseUp, true);
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    if (this.dragHandle) {
      this.dragHandle.remove();
      this.dragHandle = null;
    }
    this.isReady = false;
    this.messageCallback = null;
    this.isDragging = false;
    this.isMouseDown = false;
    // Restore cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.documentElement.style.userSelect = '';
  }

  /**
   * Send message to iframe
   */
  private sendMessage(message: EditorMessage): void {
    if (!this.iframe || !this.isReady) {
      // Queue message if iframe not ready
      setTimeout(() => this.sendMessage(message), 100);
      return;
    }

    const iframeWindow = this.iframe.contentWindow;
    if (iframeWindow) {
      iframeWindow.postMessage(message, '*');
    }
  }

  /**
   * Load editor HTML content
   */
  private loadEditorHtml(): void {
    // For POC, use embedded HTML for reliability
    // In production, this would load from a CDN or static server
    this.loadEditorHtmlFallback();
  }

  /**
   * Fallback: Load editor HTML inline (embedded version)
   */
  private loadEditorHtmlFallback(): void {
    // Embedded editor HTML - this is a fallback if the file can't be loaded
    // In production, this would be loaded from a CDN or static server
    const htmlContent = this.getEditorHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    if (this.iframe) {
      this.iframe.src = url;
    }
  }

  /**
   * Get embedded editor HTML content
   * This is a fallback - in production, load from a static file
   */
  private getEditorHtmlContent(): string {
    // Return the editor HTML content based on mode
    if (this.mode === 'tag-feature') {
      return this.getTagFeatureHtmlContent();
    }
    // Default guide form
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Designer Editor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f8fafc; color: #111827; line-height: 1.5; height: 100%; overflow-y: auto; }
    .editor-container { display: flex; flex-direction: column; gap: 20px; max-width: 100%; min-height: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 2px solid #e2e8f0; margin-bottom: 4px; }
    .header h2 { font-size: 18px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
    .close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; }
    .close-btn:hover { color: #0f172a; background: #f1f5f9; }
    .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .form-group:last-of-type { margin-bottom: 0; }
    label { font-size: 13px; font-weight: 600; color: #475569; letter-spacing: 0.01em; }
    input[type="text"], textarea { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; background: #fff; }
    input[type="text"]:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
    textarea { resize: vertical; min-height: 88px; line-height: 1.5; }
    .selector-preview { padding: 10px 14px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-family: 'Monaco', 'Courier New', monospace; color: #475569; word-break: break-all; line-height: 1.4; }
    .element-info { padding: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 12px; }
    .element-info strong { display: block; margin-bottom: 6px; color: #1e40af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .placement-group { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .placement-btn { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .placement-btn:hover { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
    .placement-btn.active { border-color: #3b82f6; background: #3b82f6; color: white; }
    .actions { display: flex; gap: 10px; padding-top: 16px; margin-top: 16px; border-top: 1px solid #e2e8f0; }
    .btn { flex: 1; padding: 11px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35); }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-secondary:hover { background: #e2e8f0; color: #0f172a; }
    .empty-state { text-align: center; padding: 40px 20px; color: #64748b; font-size: 14px; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 12px; }
    .error { padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #b91c1c; font-size: 13px; display: none; margin-top: 12px; }
    .error.show { display: block; }
  </style>
</head>
<body>
  <div class="editor-container">
    <div class="header">
      <h2>Create Guide</h2>
      <button class="close-btn" id="closeBtn" aria-label="Close">×</button>
    </div>
    <div id="emptyState" class="empty-state">Click on an element in the page to create a guide</div>
    <div id="editorForm" style="display: none;">
      <div class="form-group">
        <label>Selector</label>
        <div class="selector-preview" id="selectorPreview">-</div>
      </div>
      <div class="element-info" id="elementInfo" style="display: none;">
        <strong>Element Info</strong>
        <div id="elementInfoContent"></div>
      </div>
      <div class="form-group">
        <label for="guideContent">Guide Content</label>
        <textarea id="guideContent" placeholder="Enter the guide text that will be shown to users..." required></textarea>
      </div>
      <div class="form-group">
        <label>Placement</label>
        <div class="placement-group">
          <button class="placement-btn" data-placement="top">Top</button>
          <button class="placement-btn" data-placement="right">Right</button>
          <button class="placement-btn" data-placement="bottom">Bottom</button>
          <button class="placement-btn" data-placement="left">Left</button>
        </div>
      </div>
      <div class="error" id="errorMessage"></div>
      <div class="actions">
        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
        <button class="btn btn-primary" id="saveBtn">Save Guide</button>
      </div>
    </div>
  </div>
  <script>
    let selectedPlacement = 'right';
    let currentSelector = '';
    let currentElementInfo = null;
    const placementButtons = document.querySelectorAll('.placement-btn');
    placementButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        placementButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPlacement = btn.dataset.placement;
      });
    });
    document.querySelector('[data-placement="right"]').classList.add('active');
    document.getElementById('closeBtn').addEventListener('click', () => sendMessage({ type: 'CANCEL' }));
    document.getElementById('cancelBtn').addEventListener('click', () => sendMessage({ type: 'CANCEL' }));
    document.getElementById('saveBtn').addEventListener('click', () => {
      const content = document.getElementById('guideContent').value.trim();
      if (!content) { showError('Please enter guide content'); return; }
      if (!currentSelector) { showError('No element selected'); return; }
      sendMessage({ type: 'SAVE_GUIDE', guide: { page: window.location.pathname || '/', selector: currentSelector, content: content, placement: selectedPlacement, status: 'active' } });
    });
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'ELEMENT_SELECTED') {
        currentSelector = message.selector;
        currentElementInfo = message.elementInfo;
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('editorForm').style.display = 'block';
        document.getElementById('selectorPreview').textContent = currentSelector;
        if (currentElementInfo) {
          const infoContent = document.getElementById('elementInfoContent');
          infoContent.innerHTML = '<div><strong>Tag:</strong> ' + currentElementInfo.tagName + '</div>' + (currentElementInfo.id ? '<div><strong>ID:</strong> ' + currentElementInfo.id + '</div>' : '') + (currentElementInfo.className ? '<div><strong>Class:</strong> ' + currentElementInfo.className + '</div>' : '') + (currentElementInfo.textContent ? '<div><strong>Text:</strong> ' + currentElementInfo.textContent + '</div>' : '');
          document.getElementById('elementInfo').style.display = 'block';
        }
        document.getElementById('guideContent').value = '';
        hideError();
      }
    });
    function sendMessage(message) { window.parent.postMessage(message, '*'); }
    function showError(message) { const errorEl = document.getElementById('errorMessage'); errorEl.textContent = message; errorEl.classList.add('show'); }
    function hideError() { const errorEl = document.getElementById('errorMessage'); errorEl.classList.remove('show'); }
    window.addEventListener('load', () => sendMessage({ type: 'EDITOR_READY' }));
  </script>
</body>
  </html>`;
  }

  /**
   * Get Tag Feature HTML content
   */
  private getTagFeatureHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tag Feature - Visual Designer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f8fafc; color: #111827; height: 100%; overflow-y: auto; display: flex; flex-direction: column; line-height: 1.5; }
    .editor-container { display: flex; flex-direction: column; min-height: 100%; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 2px solid #e2e8f0; background: #fff; }
    .header h2 { font-size: 18px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
    .close-icon { cursor: pointer; color: #64748b; font-size: 20px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; padding: 0; border-radius: 8px; transition: all 0.2s; }
    .close-icon:hover { color: #0f172a; background: #f1f5f9; }
    .tabs { display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; background: #fff; padding: 0 20px; }
    .tab { padding: 14px 20px; background: none; border: none; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; position: relative; transition: color 0.2s; font-family: inherit; }
    .tab:hover { color: #0f172a; }
    .tab.active { color: #0f172a; font-weight: 600; }
    .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: #3b82f6; border-radius: 3px 3px 0 0; }
    .content { flex: 1; overflow-y: auto; padding: 24px 20px; background: #f8fafc; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .section-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; margin-top: 20px; }
    .section-title:first-child { margin-top: 0; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
    .card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .card-content { display: flex; align-items: center; justify-content: space-between; }
    .card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
    .badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-size: 12px; font-weight: 600; min-width: 28px; height: 28px; padding: 0 10px; color: #fff; flex-shrink: 0; }
    .badge-orange { background: #f97316; }
    .badge-blue { background: #3b82f6; }
    .badge-purple { background: #8b5cf6; }
    .card-text { flex: 1; min-width: 0; }
    .card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
    .card-description { font-size: 13px; color: #64748b; line-height: 1.4; }
    .card-url { font-size: 12px; color: #64748b; margin-top: 4px; word-break: break-all; }
    .chevron { color: #94a3b8; font-size: 18px; flex-shrink: 0; }
    .heatmap-row { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; border-top: 1px solid #e2e8f0; margin-top: 24px; }
    .heatmap-label { font-size: 14px; font-weight: 500; color: #0f172a; }
    .heatmap-controls { display: flex; align-items: center; gap: 12px; }
    .toggle-switch { position: relative; width: 44px; height: 24px; background: #cbd5e1; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
    .toggle-switch.active { background: #10b981; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .toggle-switch.active::after { transform: translateX(20px); }
    .toggle-switch.active::before { content: '✓'; position: absolute; top: 50%; left: 8px; transform: translateY(-50%); color: #fff; font-size: 11px; font-weight: bold; z-index: 1; }
    .plus-icon { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; font-size: 18px; transition: all 0.2s; background: #fff; }
    .plus-icon:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
    .tag-feature-btn { width: 100%; padding: 12px 20px; background: #14b8a6; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; margin-top: 24px; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.25); }
    .tag-feature-btn:hover { background: #0d9488; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(20, 184, 166, 0.35); }
  </style>
</head>
<body>
  <div class="editor-container">
    <div class="header">
      <h2>Manage Pages, Features, and AI agents</h2>
      <button class="close-icon" id="closeBtn" aria-label="Close">□</button>
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="features">Features</button>
      <button class="tab" data-tab="pages">Pages</button>
      <button class="tab" data-tab="ai-agents">AI agents</button>
    </div>
    <div class="content">
      <div id="featuresTab" class="tab-content active">
        <div class="section-title">PAGE OVERVIEW</div>
        <div class="card">
          <div class="card-content">
            <div class="card-left">
              <span class="badge badge-orange">Untagged</span>
              <div class="card-text">
                <div class="card-title">Current URL</div>
                <div class="card-url" id="currentUrlDisplay">-</div>
              </div>
            </div>
            <span class="chevron">›</span>
          </div>
        </div>
        <div class="section-title">FEATURES OVERVIEW</div>
        <div class="card">
          <div class="card-content">
            <div class="card-left">
              <span class="badge badge-blue">5</span>
              <div class="card-text">
                <div class="card-title">Suggested Features</div>
                <div class="card-description">List of untagged elements on this page</div>
              </div>
            </div>
            <span class="chevron">›</span>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <div class="card-left">
              <span class="badge badge-purple">112</span>
              <div class="card-text">
                <div class="card-title">Tagged Features</div>
                <div class="card-description">List of tagged Features on this page</div>
              </div>
            </div>
            <span class="chevron">›</span>
          </div>
        </div>
        <div class="heatmap-row">
          <span class="heatmap-label">Heatmap</span>
          <div class="heatmap-controls">
            <div class="toggle-switch active" id="heatmapToggle"></div>
            <div class="plus-icon">+</div>
          </div>
        </div>
        <button class="tag-feature-btn" id="tagFeatureBtn">Tag Feature</button>
      </div>
      <div id="pagesTab" class="tab-content">
        <div class="section-title">PAGES OVERVIEW</div>
        <div class="card">
          <div class="card-content">
            <div class="card-left">
              <div class="card-text">
                <div class="card-title">Pages</div>
                <div class="card-description">Manage pages on your application</div>
              </div>
            </div>
            <span class="chevron">›</span>
          </div>
        </div>
      </div>
      <div id="aiAgentsTab" class="tab-content">
        <div class="section-title">AI AGENTS OVERVIEW</div>
        <div class="card">
          <div class="card-content">
            <div class="card-left">
              <div class="card-text">
                <div class="card-title">AI Agents</div>
                <div class="card-description">Manage AI agents for your application</div>
              </div>
            </div>
            <span class="chevron">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    // Update current URL display
    const currentUrl = window.location.href.replace(/^https?:\\/\\//, '').split('?')[0];
    document.getElementById('currentUrlDisplay').textContent = currentUrl;
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName + 'Tab').classList.add('active');
      });
    });
    // Heatmap toggle
    document.getElementById('heatmapToggle').addEventListener('click', function() {
      this.classList.toggle('active');
    });
    // Close button
    document.getElementById('closeBtn').addEventListener('click', () => {
      sendMessage({ type: 'CANCEL' });
    });
    // Tag Feature button
    document.getElementById('tagFeatureBtn').addEventListener('click', () => {
      sendMessage({ type: 'TAG_FEATURE_CLICKED' });
    });
    function sendMessage(message) {
      window.parent.postMessage(message, '*');
    }
    window.addEventListener('load', () => {
      sendMessage({ type: 'EDITOR_READY' });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Create drag handle overlay
   */
  private createDragHandle(): void {
    if (this.dragHandle) {
      return;
    }

    this.dragHandle = document.createElement('div');
    this.dragHandle.id = 'designer-editor-drag-handle';
    this.dragHandle.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 400px;
      height: 70px;
      background: transparent;
      cursor: default;
      z-index: 1000000;
      display: none;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    `;

    // Wrapper for grip icon - ONLY this area is draggable and shows move cursor
    const gripButton = document.createElement('div');
    gripButton.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: move;
      pointer-events: auto;
      padding: 4px;
      border-radius: 8px;
      z-index: 1;
    `;

    // Add grip icon (2x3 grid of blue dots)
    const gripIcon = document.createElement('div');
    gripIcon.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 6px);
      grid-template-rows: repeat(2, 6px);
      gap: 5px;
      padding: 8px 10px;
      border: 1px solid #000000;
      border-radius: 8px;
      pointer-events: none;
    `;
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        min-width: 6px;
        min-height: 6px;
        background: #000000;
        border-radius: 50%;
        display: block;
        flex-shrink: 0;
      `;
      gripIcon.appendChild(dot);
    }
    gripButton.appendChild(gripIcon);
    this.dragHandle.appendChild(gripButton);

    // Mouse event handlers - ONLY on grip icon (not entire header)
    // Use capture phase to ensure we catch all events
    gripButton.addEventListener('mousedown', this.handleMouseDown, true);
    document.addEventListener('mousemove', this.handleMouseMove, true);
    document.addEventListener('mouseup', this.handleMouseUp, true);
    // Also listen on window to catch events outside document
    window.addEventListener('mousemove', this.handleMouseMove, true);
    window.addEventListener('mouseup', this.handleMouseUp, true);
  }

  /**
   * Update drag handle position to match iframe
   */
  private updateDragHandlePosition(): void {
    if (!this.iframe || !this.dragHandle) {
      return;
    }

    const rect = this.iframe.getBoundingClientRect();
    this.dragHandle.style.top = `${rect.top}px`;
    this.dragHandle.style.left = `${rect.left}px`;
    this.dragHandle.style.width = `${rect.width}px`;
  }

  /**
   * Handle mouse down on drag handle
   */
  private handleMouseDown = (e: MouseEvent): void => {
    if (!this.iframe || !this.dragHandle) {
      return;
    }

    // Store initial mouse position
    this.mouseDownX = e.clientX;
    this.mouseDownY = e.clientY;
    this.isMouseDown = true;
    this.isDragging = false;

    const rect = this.iframe.getBoundingClientRect();
    this.dragStartX = e.clientX - rect.left;
    this.dragStartY = e.clientY - rect.top;
    this.currentX = rect.left;
    this.currentY = rect.top;

    // Prevent text selection immediately when clicking grip icon
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle mouse move during drag
   */
  private handleMouseMove = (e: MouseEvent): void => {
    // Must have started mousedown and have iframe/dragHandle
    if (!this.isMouseDown || !this.iframe || !this.dragHandle) {
      return;
    }

    // Check if mouse has moved enough to start dragging
    if (!this.isDragging) {
      const deltaX = Math.abs(e.clientX - this.mouseDownX);
      const deltaY = Math.abs(e.clientY - this.mouseDownY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.dragThreshold) {
        // Start dragging - once started, entire form becomes draggable
        this.isDragging = true;
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
        // Make entire document non-selectable during drag for better UX
        document.documentElement.style.userSelect = 'none';
      } else {
        // Not enough movement yet - wait for more movement
        return;
      }
    }

    // Once dragging has started, continue smoothly regardless of mouse position
    // This allows dragging to continue even if mouse moves outside the grip icon
    // Prevent default to avoid text selection and other unwanted behaviors
    e.preventDefault();
    e.stopPropagation();

    // Calculate new position based on current mouse position
    const newX = e.clientX - this.dragStartX;
    const newY = e.clientY - this.dragStartY;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const iframeWidth = this.iframe.offsetWidth;
    const iframeHeight = this.iframe.offsetHeight || 600; // Fallback height

    // Constrain to viewport bounds (allow some overflow for better UX)
    const constrainedX = Math.max(-iframeWidth + 50, Math.min(newX, viewportWidth - 50));
    const constrainedY = Math.max(0, Math.min(newY, viewportHeight - 100)); // Leave at least 100px visible

    this.currentX = constrainedX;
    this.currentY = constrainedY;

    // Update iframe position smoothly
    this.iframe.style.left = `${constrainedX}px`;
    this.iframe.style.top = `${constrainedY}px`;
    this.iframe.style.right = 'auto';
    this.iframe.style.bottom = 'auto';

    // Update drag handle position to match
    this.dragHandle.style.left = `${constrainedX}px`;
    this.dragHandle.style.top = `${constrainedY}px`;
  };

  /**
   * Handle mouse up to end drag
   */
  private handleMouseUp = (e: MouseEvent): void => {
    // Only process if we actually had a mousedown
    if (!this.isMouseDown) {
      return;
    }

    // End dragging - restore normal cursor and selection
    this.isDragging = false;
    this.isMouseDown = false;
    
    // Restore cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.documentElement.style.userSelect = '';

    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle messages from iframe
   */
  private handleMessage = (event: MessageEvent): void => {
    // In production, verify event.origin for security
    // For POC, we'll accept messages from any origin

    const message = event.data as EditorMessage;

    if (!message || !message.type) {
      return;
    }

    // Forward message to callback
    if (this.messageCallback) {
      this.messageCallback(message);
    }

    // Handle specific message types
    if (message.type === 'CANCEL' || message.type === 'GUIDE_SAVED') {
      this.hide();
    }
  };
}
