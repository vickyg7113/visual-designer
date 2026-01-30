class p {
  /**
   * Generate a stable selector for an element
   */
  static generateSelector(e) {
    if (e.id)
      return {
        selector: `#${this.escapeSelector(e.id)}`,
        confidence: "high",
        method: "id"
      };
    if (e.hasAttribute("data-testid")) {
      const o = e.getAttribute("data-testid");
      return {
        selector: `[data-testid="${this.escapeAttribute(o)}"]`,
        confidence: "high",
        method: "data-testid"
      };
    }
    const t = this.getSemanticDataAttributes(e);
    if (t.length > 0) {
      const o = t[0], s = e.getAttribute(o);
      return {
        selector: `[${o}="${this.escapeAttribute(s)}"]`,
        confidence: "high",
        method: "data-attribute"
      };
    }
    const i = this.generateAriaSelector(e);
    if (i)
      return {
        selector: i,
        confidence: "medium",
        method: "aria"
      };
    const n = this.generatePathSelector(e);
    return n ? {
      selector: n,
      confidence: "medium",
      method: "path"
    } : {
      selector: e.tagName.toLowerCase(),
      confidence: "low",
      method: "tag"
    };
  }
  /**
   * Find an element by selector
   */
  static findElement(e) {
    try {
      return document.querySelector(e);
    } catch (t) {
      return console.error("Invalid selector:", e, t), null;
    }
  }
  /**
   * Validate that a selector is valid and finds an element
   */
  static validateSelector(e) {
    try {
      return document.querySelector(e) !== null;
    } catch {
      return !1;
    }
  }
  /**
   * Get semantic data-* attributes (prefer common ones)
   */
  static getSemanticDataAttributes(e) {
    const t = [
      "data-id",
      "data-name",
      "data-role",
      "data-component",
      "data-element"
    ], i = [];
    for (const n of t)
      e.hasAttribute(n) && i.push(n);
    for (let n = 0; n < e.attributes.length; n++) {
      const o = e.attributes[n];
      o.name.startsWith("data-") && !i.includes(o.name) && i.push(o.name);
    }
    return i;
  }
  /**
   * Generate selector using ARIA attributes
   */
  static generateAriaSelector(e) {
    var o;
    const t = e.getAttribute("role"), i = e.getAttribute("aria-label"), n = e.getAttribute("aria-labelledby");
    if (t) {
      let s = `[role="${this.escapeAttribute(t)}"]`;
      if (i)
        return s += `[aria-label="${this.escapeAttribute(i)}"]`, s;
      if (n) {
        const a = document.getElementById(n);
        if (a && ((o = a.textContent) == null ? void 0 : o.trim()))
          return s;
      }
      return s;
    }
    return null;
  }
  /**
   * Generate a DOM path selector with minimal depth
   */
  static generatePathSelector(e) {
    const t = [];
    let i = e;
    for (; i && i !== document.body && i !== document.documentElement; ) {
      let n = i.tagName.toLowerCase();
      if (i.id) {
        n += `#${this.escapeSelector(i.id)}`, t.unshift(n);
        break;
      }
      if (i.className && typeof i.className == "string") {
        const s = i.className.split(/\s+/).filter((a) => a && !a.startsWith("designer-")).slice(0, 2);
        s.length > 0 && (n += "." + s.map((a) => this.escapeSelector(a)).join("."));
      }
      const o = i.parentElement;
      if (o) {
        const s = i.tagName, h = Array.from(o.children).filter(
          (d) => d.tagName === s
        );
        if (h.length > 1) {
          const d = h.indexOf(i) + 1;
          n += `:nth-of-type(${d})`;
        }
      }
      if (t.unshift(n), i = o, t.length >= 5)
        break;
    }
    return t.length > 0 ? t.join(" > ") : null;
  }
  /**
   * Escape CSS selector special characters
   */
  static escapeSelector(e) {
    return typeof CSS < "u" && CSS.escape ? CSS.escape(e) : e.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, "\\$1");
  }
  /**
   * Escape attribute value for CSS selector
   */
  static escapeAttribute(e) {
    return e.replace(/"/g, '\\"').replace(/'/g, "\\'");
  }
}
function w(r) {
  var i, n;
  const e = r.getBoundingClientRect(), t = {};
  for (let o = 0; o < r.attributes.length; o++) {
    const s = r.attributes[o];
    t[s.name] = s.value;
  }
  return {
    tagName: r.tagName.toLowerCase(),
    id: r.id || void 0,
    className: ((i = r.className) == null ? void 0 : i.toString()) || void 0,
    textContent: ((n = r.textContent) == null ? void 0 : n.trim().substring(0, 50)) || void 0,
    attributes: t,
    boundingRect: e
  };
}
function x(r) {
  const e = window.getComputedStyle(r);
  return e.display !== "none" && e.visibility !== "hidden" && e.opacity !== "0" && r.getBoundingClientRect().height > 0 && r.getBoundingClientRect().width > 0;
}
function f() {
  return window.location.pathname || "/";
}
function S() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function k(r) {
  const e = r.getBoundingClientRect();
  return e.top >= 0 && e.left >= 0 && e.bottom <= (window.innerHeight || document.documentElement.clientHeight) && e.right <= (window.innerWidth || document.documentElement.clientWidth);
}
function C(r) {
  k(r) || r.scrollIntoView({ behavior: "smooth", block: "center" });
}
class B {
  constructor() {
    this.isActive = !1, this.highlightOverlay = null, this.selectedElement = null, this.messageCallback = null, this.handleMouseOver = (e) => {
      if (!this.isActive || !this.highlightOverlay)
        return;
      const t = e.target;
      if (!(!t || t === this.highlightOverlay)) {
        if (t.closest("#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn, #designer-red-border-overlay, #designer-studio-badge")) {
          this.hideHighlight();
          return;
        }
        if (!x(t)) {
          this.hideHighlight();
          return;
        }
        this.highlightElement(t);
      }
    }, this.handleClick = (e) => {
      if (!this.isActive)
        return;
      const t = e.target;
      t && (t.closest("#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn, #designer-red-border-overlay, #designer-studio-badge") || (e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation(), x(t) && this.selectElement(t)));
    }, this.handleKeyDown = (e) => {
      this.isActive && e.key === "Escape" && (this.messageCallback && this.messageCallback({ type: "CANCEL" }), this.selectedElement = null, this.hideHighlight());
    };
  }
  /**
   * Activate editor mode
   */
  activate(e) {
    this.isActive || (this.isActive = !0, this.messageCallback = e, this.createHighlightOverlay(), this.attachEventListeners(), this.addEditorStyles());
  }
  /**
   * Deactivate editor mode
   */
  deactivate() {
    this.isActive && (this.isActive = !1, this.removeEventListeners(), this.removeHighlightOverlay(), this.removeEditorStyles(), this.selectedElement = null, this.messageCallback = null);
  }
  /**
   * Check if editor mode is active
   */
  getActive() {
    return this.isActive;
  }
  /**
   * Create highlight overlay element
   */
  createHighlightOverlay() {
    if (!document.body) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.createHighlightOverlay());
        return;
      }
      setTimeout(() => this.createHighlightOverlay(), 100);
      return;
    }
    this.highlightOverlay = document.createElement("div"), this.highlightOverlay.id = "designer-highlight-overlay", this.highlightOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
      z-index: 999998;
      transition: all 0.1s ease;
      box-sizing: border-box;
      display: none;
    `, document.body.appendChild(this.highlightOverlay);
  }
  /**
   * Remove highlight overlay
   */
  removeHighlightOverlay() {
    this.highlightOverlay && (this.highlightOverlay.remove(), this.highlightOverlay = null);
  }
  /**
   * Attach event listeners for element selection
   */
  attachEventListeners() {
    document.addEventListener("mouseover", this.handleMouseOver, !0), document.addEventListener("click", this.handleClick, !0), document.addEventListener("keydown", this.handleKeyDown, !0);
  }
  /**
   * Remove event listeners
   */
  removeEventListeners() {
    document.removeEventListener("mouseover", this.handleMouseOver, !0), document.removeEventListener("click", this.handleClick, !0), document.removeEventListener("keydown", this.handleKeyDown, !0);
  }
  /**
   * Highlight an element
   */
  highlightElement(e) {
    if (!this.highlightOverlay)
      return;
    const t = e.getBoundingClientRect(), i = window.pageXOffset || document.documentElement.scrollLeft, n = window.pageYOffset || document.documentElement.scrollTop;
    this.highlightOverlay.style.display = "block", this.highlightOverlay.style.left = `${t.left + i}px`, this.highlightOverlay.style.top = `${t.top + n}px`, this.highlightOverlay.style.width = `${t.width}px`, this.highlightOverlay.style.height = `${t.height}px`;
  }
  /**
   * Hide highlight
   */
  hideHighlight() {
    this.highlightOverlay && (this.highlightOverlay.style.display = "none");
  }
  /**
   * Select an element and send message to editor
   */
  selectElement(e) {
    this.selectedElement = e, this.highlightElement(e);
    const t = p.generateSelector(e), i = w(e);
    this.messageCallback && this.messageCallback({
      type: "ELEMENT_SELECTED",
      selector: t.selector,
      elementInfo: i
    });
  }
  /**
   * Add editor-specific styles
   */
  addEditorStyles() {
    const e = document.createElement("style");
    e.id = "designer-editor-styles", e.textContent = `
      * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      a, button, input, textarea, select {
        pointer-events: auto !important;
      }
    `, document.head.appendChild(e);
  }
  /**
   * Remove editor-specific styles
   */
  removeEditorStyles() {
    const e = document.getElementById("designer-editor-styles");
    e && e.remove();
  }
}
class M {
  constructor() {
    this.renderedGuides = /* @__PURE__ */ new Map(), this.container = null;
  }
  /**
   * Render all active guides for the current page
   */
  renderGuides(e) {
    this.clear();
    const t = f();
    e.filter(
      (n) => n.page === t && n.status === "active"
    ).forEach((n) => {
      this.renderGuide(n);
    });
  }
  /**
   * Render a single guide
   */
  renderGuide(e) {
    const t = p.findElement(e.selector);
    if (!t) {
      console.warn(`Guide "${e.id}" target not found: ${e.selector}`);
      return;
    }
    C(t);
    const i = this.createTooltip(e, t);
    this.renderedGuides.set(e.id, i), this.container || this.createContainer(), this.container && this.container.appendChild(i), this.positionTooltip(i, t, e.placement);
  }
  /**
   * Dismiss a guide
   */
  dismissGuide(e) {
    const t = this.renderedGuides.get(e);
    t && (t.remove(), this.renderedGuides.delete(e));
  }
  /**
   * Clear all rendered guides
   */
  clear() {
    this.renderedGuides.forEach((e) => e.remove()), this.renderedGuides.clear();
  }
  /**
   * Create tooltip element
   */
  createTooltip(e, t) {
    const i = document.createElement("div");
    i.className = "designer-guide-tooltip", i.dataset.guideId = e.id, i.style.cssText = `
      position: absolute;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 999997;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #111827;
    `;
    const n = document.createElement("div");
    n.style.cssText = "margin-bottom: 8px;", n.textContent = e.content, i.appendChild(n);
    const o = document.createElement("button");
    o.textContent = "Got it", o.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `, o.onmouseover = () => {
      o.style.background = "#2563eb";
    }, o.onmouseout = () => {
      o.style.background = "#3b82f6";
    }, o.onclick = () => {
      this.dismissGuide(e.id);
    }, i.appendChild(o);
    const s = document.createElement("div");
    return s.className = "designer-guide-arrow", s.style.cssText = `
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    `, i.appendChild(s), i;
  }
  /**
   * Position tooltip relative to target element
   */
  positionTooltip(e, t, i) {
    const n = t.getBoundingClientRect(), o = e.getBoundingClientRect(), s = window.pageXOffset || document.documentElement.scrollLeft, a = window.pageYOffset || document.documentElement.scrollTop, h = e.querySelector(".designer-guide-arrow");
    let d = 0, c = 0, u = "";
    switch (i) {
      case "top":
        d = n.top + a - o.height - 12, c = n.left + s + n.width / 2 - o.width / 2, u = `
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0 8px;
          border-color: #3b82f6 transparent transparent transparent;
        `;
        break;
      case "bottom":
        d = n.bottom + a + 12, c = n.left + s + n.width / 2 - o.width / 2, u = `
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-color: transparent transparent #3b82f6 transparent;
        `;
        break;
      case "left":
        d = n.top + a + n.height / 2 - o.height / 2, c = n.left + s - o.width - 12, u = `
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent #3b82f6;
        `;
        break;
      case "right":
        d = n.top + a + n.height / 2 - o.height / 2, c = n.right + s + 12, u = `
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 8px 8px 0;
          border-color: transparent #3b82f6 transparent transparent;
        `;
        break;
    }
    const b = window.innerWidth, v = window.innerHeight;
    c < s ? c = s + 10 : c + o.width > s + b && (c = s + b - o.width - 10), d < a ? d = a + 10 : d + o.height > a + v && (d = a + v - o.height - 10), e.style.top = `${d}px`, e.style.left = `${c}px`, h && (h.style.cssText += u);
  }
  /**
   * Create container for guides
   */
  createContainer() {
    this.container = document.createElement("div"), this.container.id = "designer-guides-container", this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999996;
    `, document.body.appendChild(this.container);
  }
  /**
   * Update positions on scroll/resize
   */
  updatePositions(e) {
    this.renderedGuides.forEach((t, i) => {
      const n = e.find((s) => s.id === i);
      if (!n)
        return;
      const o = p.findElement(n.selector);
      o && this.positionTooltip(t, o, n.placement);
    });
  }
}
class L {
  constructor() {
    this.iframe = null, this.dragHandle = null, this.messageCallback = null, this.isReady = !1, this.mode = null, this.isDragging = !1, this.dragStartX = 0, this.dragStartY = 0, this.currentX = 0, this.currentY = 0, this.dragThreshold = 3, this.mouseDownX = 0, this.mouseDownY = 0, this.isMouseDown = !1, this.handleMouseDown = (e) => {
      if (!this.iframe || !this.dragHandle)
        return;
      this.mouseDownX = e.clientX, this.mouseDownY = e.clientY, this.isMouseDown = !0, this.isDragging = !1;
      const t = this.iframe.getBoundingClientRect();
      this.dragStartX = e.clientX - t.left, this.dragStartY = e.clientY - t.top, this.currentX = t.left, this.currentY = t.top, e.preventDefault(), e.stopPropagation();
    }, this.handleMouseMove = (e) => {
      if (!this.isMouseDown || !this.iframe || !this.dragHandle)
        return;
      if (!this.isDragging) {
        const d = Math.abs(e.clientX - this.mouseDownX), c = Math.abs(e.clientY - this.mouseDownY);
        if (Math.sqrt(d * d + c * c) > this.dragThreshold)
          this.isDragging = !0, document.body.style.cursor = "move", document.body.style.userSelect = "none", document.documentElement.style.userSelect = "none";
        else
          return;
      }
      e.preventDefault(), e.stopPropagation();
      const t = e.clientX - this.dragStartX, i = e.clientY - this.dragStartY, n = window.innerWidth, o = window.innerHeight, s = this.iframe.offsetWidth;
      this.iframe.offsetHeight;
      const a = Math.max(-s + 50, Math.min(t, n - 50)), h = Math.max(0, Math.min(i, o - 100));
      this.currentX = a, this.currentY = h, this.iframe.style.left = `${a}px`, this.iframe.style.top = `${h}px`, this.iframe.style.right = "auto", this.iframe.style.bottom = "auto", this.dragHandle.style.left = `${a}px`, this.dragHandle.style.top = `${h}px`;
    }, this.handleMouseUp = (e) => {
      this.isMouseDown && (this.isDragging = !1, this.isMouseDown = !1, document.body.style.cursor = "", document.body.style.userSelect = "", document.documentElement.style.userSelect = "", e.preventDefault(), e.stopPropagation());
    }, this.handleMessage = (e) => {
      const t = e.data;
      !t || !t.type || (this.messageCallback && this.messageCallback(t), (t.type === "CANCEL" || t.type === "GUIDE_SAVED") && this.hide());
    };
  }
  /**
   * Create and show editor iframe
   */
  create(e, t) {
    if (this.iframe)
      return;
    this.mode = t || null, this.messageCallback = e, this.iframe = document.createElement("iframe"), this.iframe.id = "designer-editor-frame", this.iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 500px;
      height: 800px;
      max-height: 90vh;
      border: none;
      border-radius: 12px;
      background: white;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      display: none;
      overflow: hidden;
    `, this.createDragHandle(), this.loadEditorHtml(), window.addEventListener("message", this.handleMessage);
    const i = () => {
      document.body ? (document.body.appendChild(this.iframe), this.dragHandle && document.body.appendChild(this.dragHandle), this.iframe && (this.iframe.onload = () => {
        this.isReady = !0, this.sendMessage({ type: "EDITOR_READY" }), this.updateDragHandlePosition();
      })) : document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", i) : setTimeout(i, 100);
    };
    i();
  }
  /**
   * Show editor frame
   */
  show() {
    this.iframe && (this.iframe.style.display = "block", this.updateDragHandlePosition()), this.dragHandle && (this.dragHandle.style.display = "block");
  }
  /**
   * Hide editor frame
   */
  hide() {
    this.iframe && (this.iframe.style.display = "none"), this.dragHandle && (this.dragHandle.style.display = "none");
  }
  /**
   * Send message to editor iframe
   */
  sendElementSelected(e) {
    this.sendMessage(e), this.show();
  }
  /**
   * Destroy editor frame
   */
  destroy() {
    window.removeEventListener("message", this.handleMessage), document.removeEventListener("mousemove", this.handleMouseMove, !0), document.removeEventListener("mouseup", this.handleMouseUp, !0), window.removeEventListener("mousemove", this.handleMouseMove, !0), window.removeEventListener("mouseup", this.handleMouseUp, !0), this.iframe && (this.iframe.remove(), this.iframe = null), this.dragHandle && (this.dragHandle.remove(), this.dragHandle = null), this.isReady = !1, this.messageCallback = null, this.isDragging = !1, this.isMouseDown = !1, document.body.style.cursor = "", document.body.style.userSelect = "", document.documentElement.style.userSelect = "";
  }
  /**
   * Send message to iframe
   */
  sendMessage(e) {
    if (!this.iframe || !this.isReady) {
      setTimeout(() => this.sendMessage(e), 100);
      return;
    }
    const t = this.iframe.contentWindow;
    t && t.postMessage(e, "*");
  }
  /**
   * Load editor HTML content
   */
  loadEditorHtml() {
    this.loadEditorHtmlFallback();
  }
  /**
   * Fallback: Load editor HTML inline (embedded version)
   */
  loadEditorHtmlFallback() {
    const e = this.getEditorHtmlContent(), t = new Blob([e], { type: "text/html" }), i = URL.createObjectURL(t);
    this.iframe && (this.iframe.src = i);
  }
  /**
   * Get embedded editor HTML content
   * This is a fallback - in production, load from a static file
   */
  getEditorHtmlContent() {
    return this.mode === "tag-feature" ? this.getTagFeatureHtmlContent() : `<!DOCTYPE html>
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
  <\/script>
</body>
  </html>`;
  }
  /**
   * Get Tag Feature HTML content
   */
  getTagFeatureHtmlContent() {
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
  <\/script>
</body>
</html>`;
  }
  /**
   * Create drag handle overlay
   */
  createDragHandle() {
    if (this.dragHandle)
      return;
    this.dragHandle = document.createElement("div"), this.dragHandle.id = "designer-editor-drag-handle", this.dragHandle.style.cssText = `
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
    const e = document.createElement("div");
    e.style.cssText = `
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
    const t = document.createElement("div");
    t.style.cssText = `
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
      const n = document.createElement("div");
      n.style.cssText = `
        width: 6px;
        height: 6px;
        min-width: 6px;
        min-height: 6px;
        background: #000000;
        border-radius: 50%;
        display: block;
        flex-shrink: 0;
      `, t.appendChild(n);
    }
    e.appendChild(t), this.dragHandle.appendChild(e), e.addEventListener("mousedown", this.handleMouseDown, !0), document.addEventListener("mousemove", this.handleMouseMove, !0), document.addEventListener("mouseup", this.handleMouseUp, !0), window.addEventListener("mousemove", this.handleMouseMove, !0), window.addEventListener("mouseup", this.handleMouseUp, !0);
  }
  /**
   * Update drag handle position to match iframe
   */
  updateDragHandlePosition() {
    if (!this.iframe || !this.dragHandle)
      return;
    const e = this.iframe.getBoundingClientRect();
    this.dragHandle.style.top = `${e.top}px`, this.dragHandle.style.left = `${e.left}px`, this.dragHandle.style.width = `${e.width}px`;
  }
}
const O = "visual-designer-guides", y = "1.0.0";
class I {
  constructor(e = O) {
    this.storageKey = e;
  }
  /**
   * Get all guides from storage
   */
  getGuides() {
    try {
      const e = localStorage.getItem(this.storageKey);
      if (!e)
        return [];
      const t = JSON.parse(e);
      return t.version !== y ? (console.warn("Storage version mismatch, clearing old data"), this.clear(), []) : t.guides || [];
    } catch (e) {
      return console.error("Error reading guides from storage:", e), [];
    }
  }
  /**
   * Get guides for a specific page
   */
  getGuidesByPage(e) {
    return this.getGuides().filter((i) => i.page === e && i.status === "active");
  }
  /**
   * Save a guide
   */
  saveGuide(e) {
    try {
      const t = this.getGuides(), i = t.findIndex((o) => o.id === e.id), n = {
        ...e,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: e.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      i >= 0 ? t[i] = n : t.push(n), this.saveGuides(t);
    } catch (t) {
      throw console.error("Error saving guide:", t), t;
    }
  }
  /**
   * Delete a guide
   */
  deleteGuide(e) {
    try {
      const i = this.getGuides().filter((n) => n.id !== e);
      this.saveGuides(i);
    } catch (t) {
      throw console.error("Error deleting guide:", t), t;
    }
  }
  /**
   * Save all guides to storage
   */
  saveGuides(e) {
    const t = {
      guides: e,
      version: y
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(t));
    } catch (i) {
      throw console.error("Error writing to storage:", i), i;
    }
  }
  /**
   * Clear all guides
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
  }
  /**
   * Get a specific guide by ID
   */
  getGuide(e) {
    return this.getGuides().find((i) => i.id === e) || null;
  }
}
class E {
  constructor(e = {}) {
    this.isInitialized = !1, this.isEditorMode = !1, this.exitEditorButton = null, this.redBorderOverlay = null, this.studioBadge = null, this.loadingOverlay = null, this.config = e, this.storage = new I(e.storageKey), this.editorMode = new B(), this.guideRenderer = new M(), this.editorFrame = new L();
  }
  /**
   * Initialize the SDK
   */
  init() {
    if (this.isInitialized) {
      console.warn("SDK already initialized");
      return;
    }
    this.isInitialized = !0, this.shouldEnableEditorMode() ? (this.showLoadingOverlay(), this.enableEditor()) : this.loadGuides(), this.setupEventListeners();
  }
  /**
   * Enable editor mode
   */
  enableEditor() {
    if (this.isEditorMode)
      return;
    this.isEditorMode = !0;
    let e = typeof window < "u" ? window.__visualDesignerMode : null;
    e || (e = localStorage.getItem("designerModeType") || null), this.editorFrame.create((t) => this.handleEditorMessage(t), e), this.editorMode.activate((t) => this.handleEditorMessage(t)), this.createExitEditorButton(), this.createRedBorderOverlay(), this.createStudioBadge(), localStorage.setItem("designerMode", "true"), e && localStorage.setItem("designerModeType", e), e === "tag-feature" ? setTimeout(() => {
      this.editorFrame.show(), this.hideLoadingOverlay();
    }, 100) : setTimeout(() => {
      this.hideLoadingOverlay();
    }, 300);
  }
  /**
   * Disable editor mode
   */
  disableEditor() {
    this.isEditorMode && (this.isEditorMode = !1, this.editorMode.deactivate(), this.editorFrame.destroy(), this.removeExitEditorButton(), this.removeRedBorderOverlay(), this.removeStudioBadge(), localStorage.removeItem("designerMode"), localStorage.removeItem("designerModeType"), this.hideLoadingOverlay(), this.loadGuides());
  }
  /**
   * Get all guides
   */
  getGuides() {
    return this.storage.getGuides();
  }
  /**
   * Get guides for current page
   */
  getGuidesForCurrentPage() {
    const e = f();
    return this.storage.getGuidesByPage(e);
  }
  /**
   * Save a guide
   */
  saveGuide(e) {
    const t = {
      ...e,
      id: S(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return this.storage.saveGuide(t), this.isEditorMode || this.loadGuides(), this.config.onGuideSaved && this.config.onGuideSaved(t), t;
  }
  /**
   * Delete a guide
   */
  deleteGuide(e) {
    this.storage.deleteGuide(e), this.guideRenderer.dismissGuide(e);
  }
  /**
   * Load and render guides for current page
   */
  loadGuides() {
    const e = this.storage.getGuides();
    this.guideRenderer.renderGuides(e);
  }
  /**
   * Check if editor mode should be enabled
   */
  shouldEnableEditorMode() {
    return this.config.editorMode !== void 0 ? this.config.editorMode : !!(typeof window < "u" && window.__visualDesignerWasLaunched || localStorage.getItem("designerMode") === "true");
  }
  /**
   * Handle messages from editor
   */
  handleEditorMessage(e) {
    switch (e.type) {
      case "ELEMENT_SELECTED":
        this.handleElementSelected(e);
        break;
      case "SAVE_GUIDE":
        this.handleSaveGuide(e);
        break;
      case "CANCEL":
        this.handleCancel();
        break;
      case "EXIT_EDITOR_MODE":
        this.handleExitEditorMode();
        break;
      case "EDITOR_READY":
        this.hideLoadingOverlay();
        break;
      default:
        console.warn("Unknown message type:", e);
    }
  }
  /**
   * Handle element selection
   */
  handleElementSelected(e) {
    this.editorFrame.sendElementSelected(e);
  }
  /**
   * Handle save guide
   */
  handleSaveGuide(e) {
    const t = this.saveGuide({
      ...e.guide,
      page: f()
    });
    console.log("Guide saved:", t);
  }
  /**
   * Handle cancel
   */
  handleCancel() {
    this.editorFrame.hide();
  }
  /**
   * Handle exit editor mode
   */
  handleExitEditorMode() {
    this.disableEditor();
  }
  /**
   * Set up event listeners for guide positioning
   */
  setupEventListeners() {
    let e, t;
    const i = () => {
      const n = this.storage.getGuides();
      this.guideRenderer.updatePositions(n);
    };
    window.addEventListener("resize", () => {
      clearTimeout(e), e = window.setTimeout(i, 100);
    }), window.addEventListener("scroll", () => {
      clearTimeout(t), t = window.setTimeout(i, 50);
    }, !0);
  }
  /**
   * Check if editor mode is active
   */
  isEditorModeActive() {
    return this.isEditorMode;
  }
  /**
   * Create exit editor button
   */
  createExitEditorButton() {
    if (!this.exitEditorButton) {
      if (!document.body) {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.createExitEditorButton());
          return;
        }
        setTimeout(() => this.createExitEditorButton(), 100);
        return;
      }
      this.exitEditorButton = document.createElement("button"), this.exitEditorButton.id = "designer-exit-editor-btn", this.exitEditorButton.textContent = "Exit Editor", this.exitEditorButton.style.cssText = `
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
    `, this.exitEditorButton.onmouseenter = () => {
        this.exitEditorButton && (this.exitEditorButton.style.background = "#3b82f6", this.exitEditorButton.style.color = "#ffffff", this.exitEditorButton.style.transform = "translateY(-2px)", this.exitEditorButton.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)");
      }, this.exitEditorButton.onmouseleave = () => {
        this.exitEditorButton && (this.exitEditorButton.style.background = "#ffffff", this.exitEditorButton.style.color = "#3b82f6", this.exitEditorButton.style.transform = "translateY(0)", this.exitEditorButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)");
      }, this.exitEditorButton.onclick = () => {
        this.disableEditor();
      }, document.body.appendChild(this.exitEditorButton);
    }
  }
  /**
   * Remove exit editor button
   */
  removeExitEditorButton() {
    this.exitEditorButton && (this.exitEditorButton.remove(), this.exitEditorButton = null);
  }
  /**
   * Create red border overlay around the entire page
   */
  createRedBorderOverlay() {
    if (!this.redBorderOverlay) {
      if (!document.body) {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.createRedBorderOverlay());
          return;
        }
        setTimeout(() => this.createRedBorderOverlay(), 100);
        return;
      }
      this.redBorderOverlay = document.createElement("div"), this.redBorderOverlay.id = "designer-red-border-overlay", this.redBorderOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 5px solid #3B82F6;
      pointer-events: none;
      z-index: 999997;
      box-sizing: border-box;
    `, document.body.appendChild(this.redBorderOverlay);
    }
  }
  /**
   * Remove red border overlay
   */
  removeRedBorderOverlay() {
    this.redBorderOverlay && (this.redBorderOverlay.remove(), this.redBorderOverlay = null);
  }
  /**
   * Create studio badge at the top center
   */
  createStudioBadge() {
    if (!this.studioBadge) {
      if (!document.body) {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.createStudioBadge());
          return;
        }
        setTimeout(() => this.createStudioBadge(), 100);
        return;
      }
      this.studioBadge = document.createElement("div"), this.studioBadge.id = "designer-studio-badge", this.studioBadge.textContent = "Revgain Visual Design Studio", this.studioBadge.style.cssText = `
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
    `, document.body.appendChild(this.studioBadge);
    }
  }
  /**
   * Remove studio badge
   */
  removeStudioBadge() {
    this.studioBadge && (this.studioBadge.remove(), this.studioBadge = null);
  }
  /**
   * Show loading overlay while designer is initializing
   */
  showLoadingOverlay() {
    if (this.loadingOverlay)
      return;
    if (!document.body) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.showLoadingOverlay());
        return;
      }
      setTimeout(() => this.showLoadingOverlay(), 100);
      return;
    }
    this.loadingOverlay = document.createElement("div"), this.loadingOverlay.id = "designer-loading-overlay", this.loadingOverlay.style.cssText = `
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
    const e = document.createElement("div");
    e.style.cssText = `
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    `;
    const t = document.createElement("style");
    t.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `, document.head.appendChild(t);
    const i = document.createElement("div");
    i.textContent = "Loading Visual Designer...", i.style.cssText = `
      color: #1e40af;
      font-size: 16px;
      font-weight: 500;
    `, this.loadingOverlay.appendChild(e), this.loadingOverlay.appendChild(i), document.body.appendChild(this.loadingOverlay);
  }
  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    this.loadingOverlay && (this.loadingOverlay.remove(), this.loadingOverlay = null);
  }
}
let l = null, m = !1;
function g(r) {
  return l || (l = new E(r), l.init(), l);
}
function T() {
  return l;
}
function D(r) {
  !r || !Array.isArray(r) || r.forEach((e) => {
    if (!e || !Array.isArray(e) || e.length === 0)
      return;
    const t = e[0], i = e.slice(1);
    try {
      switch (t) {
        case "initialize": {
          const n = i[0];
          g(n);
          break;
        }
        case "identify": {
          const n = i[0];
          n && console.log("[Visual Designer] identify (snippet) called with:", n);
          break;
        }
        case "enableEditor": {
          (l ?? g()).enableEditor();
          break;
        }
        case "disableEditor": {
          l && l.disableEditor();
          break;
        }
        case "loadGuides": {
          l && l.loadGuides();
          break;
        }
        case "getGuides": {
          if (l)
            return l.getGuides();
          break;
        }
        default:
          console.warn("[Visual Designer] Unknown snippet method:", t);
      }
    } catch (n) {
      console.error("[Visual Designer] Error processing queued call:", t, n);
    }
  });
}
if (typeof window < "u") {
  const r = window.visualDesigner;
  r && Array.isArray(r._q) && (m = !0);
  try {
    const e = new URL(window.location.href), t = e.searchParams.get("designer"), i = e.searchParams.get("mode");
    if (t === "true") {
      i && (window.__visualDesignerMode = i, localStorage.setItem("designerModeType", i)), localStorage.setItem("designerMode", "true"), e.searchParams.delete("designer"), e.searchParams.delete("mode");
      const n = e.toString();
      window.history.replaceState({}, "", n), window.__visualDesignerWasLaunched = !0;
    }
  } catch {
  }
}
if (typeof window < "u" && !l) {
  const r = window.__visualDesignerWasLaunched === !0;
  if (!m || r) {
    const e = () => {
      !l && (!m || r) && g();
    };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", e) : e();
  }
}
typeof window < "u" && (window.VisualDesigner = {
  init: g,
  getInstance: T,
  DesignerSDK: E,
  _processQueue: D
});
export {
  E as DesignerSDK,
  D as _processQueue,
  T as getInstance,
  g as init
};
