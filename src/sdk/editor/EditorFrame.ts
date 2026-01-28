import { EditorMessage, ElementSelectedMessage, SaveGuideMessage } from '../types';

/**
 * Editor Frame - Manages isolated editor UI iframe
 */
export class EditorFrame {
  private iframe: HTMLIFrameElement | null = null;
  private messageCallback: ((message: EditorMessage) => void) | null = null;
  private isReady: boolean = false;

  /**
   * Create and show editor iframe
   */
  create(onMessage: (message: EditorMessage) => void): void {
    if (this.iframe) {
      return;
    }

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
    // Return the editor HTML content
    // For now, we'll try to load it dynamically, but this serves as fallback
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
