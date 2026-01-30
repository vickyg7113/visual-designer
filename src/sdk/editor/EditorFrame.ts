import { EditorMessage, ElementSelectedMessage, SaveGuideMessage } from '../types';

/**
 * Editor Frame - Manages isolated editor UI iframe
 */
export class EditorFrame {
  private iframe: HTMLIFrameElement | null = null;
  private messageCallback: ((message: EditorMessage) => void) | null = null;
  private isReady: boolean = false;
  private mode: string | null = null;

  /**
   * Create and show editor iframe
   */
  create(onMessage: (message: EditorMessage) => void, mode?: string | null): void {
    if (this.iframe) {
      return;
    }

    this.mode = mode || null;
    this.messageCallback = onMessage;
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'designer-editor-frame';
    this.iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 400px;
      height: 100vh;
      border: none;
      border-right: 1px solid #e5e7eb;
      background: white;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      display: none;
    `;

    // Load editor HTML as blob URL for POC
    // In production, this would be a separate HTML file served statically
    this.loadEditorHtml();

    // Set up message listener
    window.addEventListener('message', this.handleMessage);

    // Ensure document.body exists before appending
    const appendIframe = () => {
      if (document.body) {
        document.body.appendChild(this.iframe!);
        // Wait for iframe to load
        if (this.iframe) {
          this.iframe.onload = () => {
            this.isReady = true;
            this.sendMessage({ type: 'EDITOR_READY' });
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
    if (this.iframe) {
      this.iframe.style.display = 'block';
    }
  }

  /**
   * Hide editor frame
   */
  hide(): void {
    if (this.iframe) {
      this.iframe.style.display = 'none';
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
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isReady = false;
    this.messageCallback = null;
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; background: #f9fafb; color: #111827; }
    .editor-container { display: flex; flex-direction: column; gap: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
    .header h2 { font-size: 18px; font-weight: 600; color: #111827; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { color: #111827; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 14px; font-weight: 500; color: #374151; }
    input[type="text"], textarea { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit; transition: border-color 0.2s; }
    input[type="text"]:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    textarea { resize: vertical; min-height: 80px; }
    .selector-preview { padding: 8px 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-family: 'Monaco', 'Courier New', monospace; color: #6b7280; word-break: break-all; }
    .element-info { padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 12px; }
    .element-info strong { display: block; margin-bottom: 4px; color: #1e40af; }
    .placement-group { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .placement-btn { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .placement-btn:hover { border-color: #3b82f6; background: #eff6ff; }
    .placement-btn.active { border-color: #3b82f6; background: #3b82f6; color: white; }
    .actions { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
    .btn { flex: 1; padding: 10px 16px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    .empty-state { text-align: center; padding: 32px 16px; color: #6b7280; font-size: 14px; }
    .error { padding: 8px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-size: 12px; display: none; }
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #ffffff; color: #111827; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
    .editor-container { display: flex; flex-direction: column; height: 100%; background: #ffffff; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #ffffff; }
    .header h2 { font-size: 20px; font-weight: 600; color: #111827; }
    .close-icon { cursor: pointer; color: #6b7280; font-size: 18px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: none; border: none; padding: 0; }
    .close-icon:hover { color: #111827; }
    .tabs { display: flex; gap: 0; border-bottom: 1px solid #e5e7eb; background: #ffffff; padding: 0 20px; }
    .tab { padding: 12px 20px; background: none; border: none; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; position: relative; transition: color 0.2s; font-family: inherit; }
    .tab:hover { color: #111827; }
    .tab.active { color: #111827; font-weight: 600; }
    .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #3B82F6; }
    .content { flex: 1; overflow-y: auto; padding: 24px 20px; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
    .card:hover { border-color: #d1d5db; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .card-content { display: flex; align-items: center; justify-content: space-between; }
    .card-left { display: flex; align-items: center; gap: 12px; flex: 1; }
    .badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-size: 12px; font-weight: 600; min-width: 24px; height: 24px; padding: 0 8px; color: #ffffff; }
    .badge-orange { background: #f97316; }
    .badge-blue { background: #3b82f6; }
    .badge-purple { background: #a855f7; }
    .card-text { flex: 1; }
    .card-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px; }
    .card-description { font-size: 13px; color: #6b7280; }
    .card-url { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .chevron { color: #9ca3af; font-size: 18px; }
    .heatmap-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-top: 1px solid #e5e7eb; margin-top: 24px; }
    .heatmap-label { font-size: 14px; font-weight: 500; color: #111827; }
    .heatmap-controls { display: flex; align-items: center; gap: 12px; }
    .toggle-switch { position: relative; width: 44px; height: 24px; background: #d1d5db; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
    .toggle-switch.active { background: #10b981; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #ffffff; border-radius: 50%; transition: transform 0.2s; }
    .toggle-switch.active::after { transform: translateX(20px); }
    .toggle-switch.active::before { content: '✓'; position: absolute; top: 50%; left: 8px; transform: translateY(-50%); color: #ffffff; font-size: 12px; font-weight: bold; z-index: 1; }
    .plus-icon { width: 24px; height: 24px; border-radius: 6px; border: 1px solid #d1d5db; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; font-size: 18px; transition: all 0.2s; }
    .plus-icon:hover { border-color: #6366f1; color: #6366f1; }
    .tag-feature-btn { width: 100%; padding: 12px 20px; background: #14b8a6; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; margin-top: 20px; }
    .tag-feature-btn:hover { background: #0d9488; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3); }
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
