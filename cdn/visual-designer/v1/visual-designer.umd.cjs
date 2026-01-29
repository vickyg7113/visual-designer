(function(c,u){typeof exports=="object"&&typeof module<"u"?u(exports):typeof define=="function"&&define.amd?define(["exports"],u):(c=typeof globalThis<"u"?globalThis:c||self,u(c.VisualDesigner={}))})(this,function(c){"use strict";class u{static generateSelector(e){if(e.id)return{selector:`#${this.escapeSelector(e.id)}`,confidence:"high",method:"id"};if(e.hasAttribute("data-testid")){const n=e.getAttribute("data-testid");return{selector:`[data-testid="${this.escapeAttribute(n)}"]`,confidence:"high",method:"data-testid"}}const t=this.getSemanticDataAttributes(e);if(t.length>0){const n=t[0],s=e.getAttribute(n);return{selector:`[${n}="${this.escapeAttribute(s)}"]`,confidence:"high",method:"data-attribute"}}const i=this.generateAriaSelector(e);if(i)return{selector:i,confidence:"medium",method:"aria"};const r=this.generatePathSelector(e);return r?{selector:r,confidence:"medium",method:"path"}:{selector:e.tagName.toLowerCase(),confidence:"low",method:"tag"}}static findElement(e){try{return document.querySelector(e)}catch(t){return console.error("Invalid selector:",e,t),null}}static validateSelector(e){try{return document.querySelector(e)!==null}catch{return!1}}static getSemanticDataAttributes(e){const t=["data-id","data-name","data-role","data-component","data-element"],i=[];for(const r of t)e.hasAttribute(r)&&i.push(r);for(let r=0;r<e.attributes.length;r++){const n=e.attributes[r];n.name.startsWith("data-")&&!i.includes(n.name)&&i.push(n.name)}return i}static generateAriaSelector(e){var n;const t=e.getAttribute("role"),i=e.getAttribute("aria-label"),r=e.getAttribute("aria-labelledby");if(t){let s=`[role="${this.escapeAttribute(t)}"]`;if(i)return s+=`[aria-label="${this.escapeAttribute(i)}"]`,s;if(r){const a=document.getElementById(r);if(a&&((n=a.textContent)==null?void 0:n.trim()))return s}return s}return null}static generatePathSelector(e){const t=[];let i=e;for(;i&&i!==document.body&&i!==document.documentElement;){let r=i.tagName.toLowerCase();if(i.id){r+=`#${this.escapeSelector(i.id)}`,t.unshift(r);break}if(i.className&&typeof i.className=="string"){const s=i.className.split(/\s+/).filter(a=>a&&!a.startsWith("designer-")).slice(0,2);s.length>0&&(r+="."+s.map(a=>this.escapeSelector(a)).join("."))}const n=i.parentElement;if(n){const s=i.tagName,g=Array.from(n.children).filter(l=>l.tagName===s);if(g.length>1){const l=g.indexOf(i)+1;r+=`:nth-of-type(${l})`}}if(t.unshift(r),i=n,t.length>=5)break}return t.length>0?t.join(" > "):null}static escapeSelector(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):e.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g,"\\$1")}static escapeAttribute(e){return e.replace(/"/g,'\\"').replace(/'/g,"\\'")}}function C(o){var i,r;const e=o.getBoundingClientRect(),t={};for(let n=0;n<o.attributes.length;n++){const s=o.attributes[n];t[s.name]=s.value}return{tagName:o.tagName.toLowerCase(),id:o.id||void 0,className:((i=o.className)==null?void 0:i.toString())||void 0,textContent:((r=o.textContent)==null?void 0:r.trim().substring(0,50))||void 0,attributes:t,boundingRect:e}}function E(o){const e=window.getComputedStyle(o);return e.display!=="none"&&e.visibility!=="hidden"&&e.opacity!=="0"&&o.getBoundingClientRect().height>0&&o.getBoundingClientRect().width>0}function m(){return window.location.pathname||"/"}function k(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function I(o){const e=o.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)}function O(o){I(o)||o.scrollIntoView({behavior:"smooth",block:"center"})}class L{constructor(){this.isActive=!1,this.highlightOverlay=null,this.selectedElement=null,this.messageCallback=null,this.handleMouseOver=e=>{if(!this.isActive||!this.highlightOverlay)return;const t=e.target;if(!(!t||t===this.highlightOverlay)){if(t.closest("#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn, #designer-red-border-overlay, #designer-studio-badge")){this.hideHighlight();return}if(!E(t)){this.hideHighlight();return}this.highlightElement(t)}},this.handleClick=e=>{if(!this.isActive)return;const t=e.target;t&&(t.closest("#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn, #designer-red-border-overlay, #designer-studio-badge")||(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),E(t)&&this.selectElement(t)))},this.handleKeyDown=e=>{this.isActive&&e.key==="Escape"&&(this.messageCallback&&this.messageCallback({type:"CANCEL"}),this.selectedElement=null,this.hideHighlight())}}activate(e){this.isActive||(this.isActive=!0,this.messageCallback=e,this.createHighlightOverlay(),this.attachEventListeners(),this.addEditorStyles())}deactivate(){this.isActive&&(this.isActive=!1,this.removeEventListeners(),this.removeHighlightOverlay(),this.removeEditorStyles(),this.selectedElement=null,this.messageCallback=null)}getActive(){return this.isActive}createHighlightOverlay(){if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.createHighlightOverlay());return}setTimeout(()=>this.createHighlightOverlay(),100);return}this.highlightOverlay=document.createElement("div"),this.highlightOverlay.id="designer-highlight-overlay",this.highlightOverlay.style.cssText=`
      position: absolute;
      pointer-events: none;
      border: 2px solid #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
      z-index: 999998;
      transition: all 0.1s ease;
      box-sizing: border-box;
      display: none;
    `,document.body.appendChild(this.highlightOverlay)}removeHighlightOverlay(){this.highlightOverlay&&(this.highlightOverlay.remove(),this.highlightOverlay=null)}attachEventListeners(){document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}removeEventListeners(){document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0)}highlightElement(e){if(!this.highlightOverlay)return;const t=e.getBoundingClientRect(),i=window.pageXOffset||document.documentElement.scrollLeft,r=window.pageYOffset||document.documentElement.scrollTop;this.highlightOverlay.style.display="block",this.highlightOverlay.style.left=`${t.left+i}px`,this.highlightOverlay.style.top=`${t.top+r}px`,this.highlightOverlay.style.width=`${t.width}px`,this.highlightOverlay.style.height=`${t.height}px`}hideHighlight(){this.highlightOverlay&&(this.highlightOverlay.style.display="none")}selectElement(e){this.selectedElement=e,this.highlightElement(e);const t=u.generateSelector(e),i=C(e);this.messageCallback&&this.messageCallback({type:"ELEMENT_SELECTED",selector:t.selector,elementInfo:i})}addEditorStyles(){const e=document.createElement("style");e.id="designer-editor-styles",e.textContent=`
      * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      a, button, input, textarea, select {
        pointer-events: auto !important;
      }
    `,document.head.appendChild(e)}removeEditorStyles(){const e=document.getElementById("designer-editor-styles");e&&e.remove()}}class G{constructor(){this.renderedGuides=new Map,this.container=null}renderGuides(e){this.clear();const t=m();e.filter(r=>r.page===t&&r.status==="active").forEach(r=>{this.renderGuide(r)})}renderGuide(e){const t=u.findElement(e.selector);if(!t){console.warn(`Guide "${e.id}" target not found: ${e.selector}`);return}O(t);const i=this.createTooltip(e,t);this.renderedGuides.set(e.id,i),this.container||this.createContainer(),this.container&&this.container.appendChild(i),this.positionTooltip(i,t,e.placement)}dismissGuide(e){const t=this.renderedGuides.get(e);t&&(t.remove(),this.renderedGuides.delete(e))}clear(){this.renderedGuides.forEach(e=>e.remove()),this.renderedGuides.clear()}createTooltip(e,t){const i=document.createElement("div");i.className="designer-guide-tooltip",i.dataset.guideId=e.id,i.style.cssText=`
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
    `;const r=document.createElement("div");r.style.cssText="margin-bottom: 8px;",r.textContent=e.content,i.appendChild(r);const n=document.createElement("button");n.textContent="Got it",n.style.cssText=`
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `,n.onmouseover=()=>{n.style.background="#2563eb"},n.onmouseout=()=>{n.style.background="#3b82f6"},n.onclick=()=>{this.dismissGuide(e.id)},i.appendChild(n);const s=document.createElement("div");return s.className="designer-guide-arrow",s.style.cssText=`
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    `,i.appendChild(s),i}positionTooltip(e,t,i){const r=t.getBoundingClientRect(),n=e.getBoundingClientRect(),s=window.pageXOffset||document.documentElement.scrollLeft,a=window.pageYOffset||document.documentElement.scrollTop,g=e.querySelector(".designer-guide-arrow");let l=0,h=0,p="";switch(i){case"top":l=r.top+a-n.height-12,h=r.left+s+r.width/2-n.width/2,p=`
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0 8px;
          border-color: #3b82f6 transparent transparent transparent;
        `;break;case"bottom":l=r.bottom+a+12,h=r.left+s+r.width/2-n.width/2,p=`
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-color: transparent transparent #3b82f6 transparent;
        `;break;case"left":l=r.top+a+r.height/2-n.height/2,h=r.left+s-n.width-12,p=`
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent #3b82f6;
        `;break;case"right":l=r.top+a+r.height/2-n.height/2,h=r.right+s+12,p=`
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 8px 8px 0;
          border-color: transparent #3b82f6 transparent transparent;
        `;break}const S=window.innerWidth,B=window.innerHeight;h<s?h=s+10:h+n.width>s+S&&(h=s+S-n.width-10),l<a?l=a+10:l+n.height>a+B&&(l=a+B-n.height-10),e.style.top=`${l}px`,e.style.left=`${h}px`,g&&(g.style.cssText+=p)}createContainer(){this.container=document.createElement("div"),this.container.id="designer-guides-container",this.container.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999996;
    `,document.body.appendChild(this.container)}updatePositions(e){this.renderedGuides.forEach((t,i)=>{const r=e.find(s=>s.id===i);if(!r)return;const n=u.findElement(r.selector);n&&this.positionTooltip(t,n,r.placement)})}}class M{constructor(){this.iframe=null,this.messageCallback=null,this.isReady=!1,this.handleMessage=e=>{const t=e.data;!t||!t.type||(this.messageCallback&&this.messageCallback(t),(t.type==="CANCEL"||t.type==="GUIDE_SAVED")&&this.hide())}}create(e){if(this.iframe)return;this.messageCallback=e,this.iframe=document.createElement("iframe"),this.iframe.id="designer-editor-frame",this.iframe.style.cssText=`
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
    `,this.loadEditorHtml(),window.addEventListener("message",this.handleMessage);const t=()=>{document.body?(document.body.appendChild(this.iframe),this.iframe&&(this.iframe.onload=()=>{this.isReady=!0,this.sendMessage({type:"EDITOR_READY"})})):document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):setTimeout(t,100)};t()}show(){this.iframe&&(this.iframe.style.display="block")}hide(){this.iframe&&(this.iframe.style.display="none")}sendElementSelected(e){this.sendMessage(e),this.show()}destroy(){window.removeEventListener("message",this.handleMessage),this.iframe&&(this.iframe.remove(),this.iframe=null),this.isReady=!1,this.messageCallback=null}sendMessage(e){if(!this.iframe||!this.isReady){setTimeout(()=>this.sendMessage(e),100);return}const t=this.iframe.contentWindow;t&&t.postMessage(e,"*")}loadEditorHtml(){this.loadEditorHtmlFallback()}loadEditorHtmlFallback(){const e=this.getEditorHtmlContent(),t=new Blob([e],{type:"text/html"}),i=URL.createObjectURL(t);this.iframe&&(this.iframe.src=i)}getEditorHtmlContent(){return`<!DOCTYPE html>
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
  <\/script>
</body>
</html>`}}const A="visual-designer-guides",v="1.0.0";class T{constructor(e=A){this.storageKey=e}getGuides(){try{const e=localStorage.getItem(this.storageKey);if(!e)return[];const t=JSON.parse(e);return t.version!==v?(console.warn("Storage version mismatch, clearing old data"),this.clear(),[]):t.guides||[]}catch(e){return console.error("Error reading guides from storage:",e),[]}}getGuidesByPage(e){return this.getGuides().filter(i=>i.page===e&&i.status==="active")}saveGuide(e){try{const t=this.getGuides(),i=t.findIndex(n=>n.id===e.id),r={...e,updatedAt:new Date().toISOString(),createdAt:e.createdAt||new Date().toISOString()};i>=0?t[i]=r:t.push(r),this.saveGuides(t)}catch(t){throw console.error("Error saving guide:",t),t}}deleteGuide(e){try{const i=this.getGuides().filter(r=>r.id!==e);this.saveGuides(i)}catch(t){throw console.error("Error deleting guide:",t),t}}saveGuides(e){const t={guides:e,version:v};try{localStorage.setItem(this.storageKey,JSON.stringify(t))}catch(i){throw console.error("Error writing to storage:",i),i}}clear(){try{localStorage.removeItem(this.storageKey)}catch(e){console.error("Error clearing storage:",e)}}getGuide(e){return this.getGuides().find(i=>i.id===e)||null}}class b{constructor(e={}){this.isInitialized=!1,this.isEditorMode=!1,this.exitEditorButton=null,this.redBorderOverlay=null,this.studioBadge=null,this.config=e,this.storage=new T(e.storageKey),this.editorMode=new L,this.guideRenderer=new G,this.editorFrame=new M}init(){if(this.isInitialized){console.warn("SDK already initialized");return}this.isInitialized=!0,this.shouldEnableEditorMode()?this.enableEditor():this.loadGuides(),this.setupEventListeners()}enableEditor(){this.isEditorMode||(this.isEditorMode=!0,this.editorFrame.create(e=>this.handleEditorMessage(e)),this.editorMode.activate(e=>this.handleEditorMessage(e)),this.createExitEditorButton(),this.createRedBorderOverlay(),this.createStudioBadge(),localStorage.setItem("designerMode","true"))}disableEditor(){this.isEditorMode&&(this.isEditorMode=!1,this.editorMode.deactivate(),this.editorFrame.destroy(),this.removeExitEditorButton(),this.removeRedBorderOverlay(),this.removeStudioBadge(),localStorage.removeItem("designerMode"),this.loadGuides())}getGuides(){return this.storage.getGuides()}getGuidesForCurrentPage(){const e=m();return this.storage.getGuidesByPage(e)}saveGuide(e){const t={...e,id:k(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return this.storage.saveGuide(t),this.isEditorMode||this.loadGuides(),this.config.onGuideSaved&&this.config.onGuideSaved(t),t}deleteGuide(e){this.storage.deleteGuide(e),this.guideRenderer.dismissGuide(e)}loadGuides(){const e=this.storage.getGuides();this.guideRenderer.renderGuides(e)}shouldEnableEditorMode(){return this.config.editorMode!==void 0?this.config.editorMode:!!(typeof window<"u"&&window.__visualDesignerWasLaunched||localStorage.getItem("designerMode")==="true")}handleEditorMessage(e){switch(e.type){case"ELEMENT_SELECTED":this.handleElementSelected(e);break;case"SAVE_GUIDE":this.handleSaveGuide(e);break;case"CANCEL":this.handleCancel();break;case"EXIT_EDITOR_MODE":this.handleExitEditorMode();break;case"EDITOR_READY":break;default:console.warn("Unknown message type:",e)}}handleElementSelected(e){this.editorFrame.sendElementSelected(e)}handleSaveGuide(e){const t=this.saveGuide({...e.guide,page:m()});console.log("Guide saved:",t)}handleCancel(){this.editorFrame.hide()}handleExitEditorMode(){this.disableEditor()}setupEventListeners(){let e,t;const i=()=>{const r=this.storage.getGuides();this.guideRenderer.updatePositions(r)};window.addEventListener("resize",()=>{clearTimeout(e),e=window.setTimeout(i,100)}),window.addEventListener("scroll",()=>{clearTimeout(t),t=window.setTimeout(i,50)},!0)}isEditorModeActive(){return this.isEditorMode}createExitEditorButton(){if(!this.exitEditorButton){if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.createExitEditorButton());return}setTimeout(()=>this.createExitEditorButton(),100);return}this.exitEditorButton=document.createElement("button"),this.exitEditorButton.id="designer-exit-editor-btn",this.exitEditorButton.textContent="Exit Editor",this.exitEditorButton.style.cssText=`
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
    `,this.exitEditorButton.onmouseenter=()=>{this.exitEditorButton&&(this.exitEditorButton.style.background="#3b82f6",this.exitEditorButton.style.color="#ffffff",this.exitEditorButton.style.transform="translateY(-2px)",this.exitEditorButton.style.boxShadow="0 6px 16px rgba(0, 0, 0, 0.2)")},this.exitEditorButton.onmouseleave=()=>{this.exitEditorButton&&(this.exitEditorButton.style.background="#ffffff",this.exitEditorButton.style.color="#3b82f6",this.exitEditorButton.style.transform="translateY(0)",this.exitEditorButton.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)")},this.exitEditorButton.onclick=()=>{this.disableEditor()},document.body.appendChild(this.exitEditorButton)}}removeExitEditorButton(){this.exitEditorButton&&(this.exitEditorButton.remove(),this.exitEditorButton=null)}createRedBorderOverlay(){if(!this.redBorderOverlay){if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.createRedBorderOverlay());return}setTimeout(()=>this.createRedBorderOverlay(),100);return}this.redBorderOverlay=document.createElement("div"),this.redBorderOverlay.id="designer-red-border-overlay",this.redBorderOverlay.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 5px solid #3B82F6;
      pointer-events: none;
      z-index: 999997;
      box-sizing: border-box;
    `,document.body.appendChild(this.redBorderOverlay)}}removeRedBorderOverlay(){this.redBorderOverlay&&(this.redBorderOverlay.remove(),this.redBorderOverlay=null)}createStudioBadge(){if(!this.studioBadge){if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.createStudioBadge());return}setTimeout(()=>this.createStudioBadge(),100);return}this.studioBadge=document.createElement("div"),this.studioBadge.id="designer-studio-badge",this.studioBadge.textContent="Revgain Visual Design Studio",this.studioBadge.style.cssText=`
      position: fixed;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 20px;
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
    `,document.body.appendChild(this.studioBadge)}}removeStudioBadge(){this.studioBadge&&(this.studioBadge.remove(),this.studioBadge=null)}}let d=null,y=!1;function f(o){return d||(d=new b(o),d.init(),d)}function x(){return d}function w(o){!o||!Array.isArray(o)||o.forEach(e=>{if(!e||!Array.isArray(e)||e.length===0)return;const t=e[0],i=e.slice(1);try{switch(t){case"initialize":{const r=i[0];f(r);break}case"identify":{const r=i[0];r&&console.log("[Visual Designer] identify (snippet) called with:",r);break}case"enableEditor":{(d??f()).enableEditor();break}case"disableEditor":{d&&d.disableEditor();break}case"loadGuides":{d&&d.loadGuides();break}case"getGuides":{if(d)return d.getGuides();break}default:console.warn("[Visual Designer] Unknown snippet method:",t)}}catch(r){console.error("[Visual Designer] Error processing queued call:",t,r)}})}if(typeof window<"u"){const o=window.visualDesigner;o&&Array.isArray(o._q)&&(y=!0);try{const e=new URL(window.location.href);if(e.searchParams.get("designer")==="true"){e.searchParams.delete("designer");const i=e.toString();window.history.replaceState({},"",i),window.__visualDesignerWasLaunched=!0}}catch{}}if(typeof window<"u"&&!d){const o=window.__visualDesignerWasLaunched===!0;if(!y||o){const e=()=>{!d&&(!y||o)&&f()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}}typeof window<"u"&&(window.VisualDesigner={init:f,getInstance:x,DesignerSDK:b,_processQueue:w}),c.DesignerSDK=b,c._processQueue=w,c.getInstance=x,c.init=f,Object.defineProperty(c,Symbol.toStringTag,{value:"Module"})});
