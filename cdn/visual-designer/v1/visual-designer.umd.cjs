(function(u,p){typeof exports=="object"&&typeof module<"u"?p(exports):typeof define=="function"&&define.amd?define(["exports"],p):(u=typeof globalThis<"u"?globalThis:u||self,p(u.VisualDesigner={}))})(this,function(u){"use strict";class p{static generateSelector(e){if(e.id)return{selector:`#${this.escapeSelector(e.id)}`,confidence:"high",method:"id"};if(e.hasAttribute("data-testid")){const o=e.getAttribute("data-testid");return{selector:`[data-testid="${this.escapeAttribute(o)}"]`,confidence:"high",method:"data-testid"}}const t=this.getSemanticDataAttributes(e);if(t.length>0){const o=t[0],a=e.getAttribute(o);return{selector:`[${o}="${this.escapeAttribute(a)}"]`,confidence:"high",method:"data-attribute"}}const i=this.generateAriaSelector(e);if(i)return{selector:i,confidence:"medium",method:"aria"};const n=this.generatePathSelector(e);return n?{selector:n,confidence:"medium",method:"path"}:{selector:e.tagName.toLowerCase(),confidence:"low",method:"tag"}}static findElement(e){try{return document.querySelector(e)}catch(t){return console.error("Invalid selector:",e,t),null}}static validateSelector(e){try{return document.querySelector(e)!==null}catch{return!1}}static getSemanticDataAttributes(e){const t=["data-id","data-name","data-role","data-component","data-element"],i=[];for(const n of t)e.hasAttribute(n)&&i.push(n);for(let n=0;n<e.attributes.length;n++){const o=e.attributes[n];o.name.startsWith("data-")&&!i.includes(o.name)&&i.push(o.name)}return i}static generateAriaSelector(e){var o;const t=e.getAttribute("role"),i=e.getAttribute("aria-label"),n=e.getAttribute("aria-labelledby");if(t){let a=`[role="${this.escapeAttribute(t)}"]`;if(i)return a+=`[aria-label="${this.escapeAttribute(i)}"]`,a;if(n){const s=document.getElementById(n);if(s&&((o=s.textContent)==null?void 0:o.trim()))return a}return a}return null}static generatePathSelector(e){const t=[];let i=e;for(;i&&i!==document.body&&i!==document.documentElement;){let n=i.tagName.toLowerCase();if(i.id){n+=`#${this.escapeSelector(i.id)}`,t.unshift(n);break}if(i.className&&typeof i.className=="string"){const a=i.className.split(/\s+/).filter(s=>s&&!s.startsWith("designer-")).slice(0,2);a.length>0&&(n+="."+a.map(s=>this.escapeSelector(s)).join("."))}const o=i.parentElement;if(o){const a=i.tagName,c=Array.from(o.children).filter(l=>l.tagName===a);if(c.length>1){const l=c.indexOf(i)+1;n+=`:nth-of-type(${l})`}}if(t.unshift(n),i=o,t.length>=5)break}return t.length>0?t.join(" > "):null}static escapeSelector(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):e.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g,"\\$1")}static escapeAttribute(e){return e.replace(/"/g,'\\"').replace(/'/g,"\\'")}}function M(r){var i,n;const e=r.getBoundingClientRect(),t={};for(let o=0;o<r.attributes.length;o++){const a=r.attributes[o];t[a.name]=a.value}return{tagName:r.tagName.toLowerCase(),id:r.id||void 0,className:((i=r.className)==null?void 0:i.toString())||void 0,textContent:((n=r.textContent)==null?void 0:n.trim().substring(0,50))||void 0,attributes:t,boundingRect:e}}function w(r){const e=window.getComputedStyle(r);return e.display!=="none"&&e.visibility!=="hidden"&&e.opacity!=="0"&&r.getBoundingClientRect().height>0&&r.getBoundingClientRect().width>0}function b(){return window.location.pathname||"/"}function S(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function A(r){const e=r.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)}function D(r){A(r)||r.scrollIntoView({behavior:"smooth",block:"center"})}class O{constructor(){this.isActive=!1,this.highlightOverlay=null,this.selectedElement=null,this.messageCallback=null,this.handleMouseOver=e=>{if(!this.isActive||!this.highlightOverlay)return;const t=e.target;if(!(!t||t===this.highlightOverlay)){if(t.closest("#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn, #designer-red-border-overlay, #designer-studio-badge")){this.hideHighlight();return}if(!w(t)){this.hideHighlight();return}this.highlightElement(t)}},this.handleClick=e=>{if(!this.isActive)return;const t=e.target;t&&(t.closest("#designer-editor-frame, #designer-highlight-overlay, #designer-exit-editor-btn, #designer-red-border-overlay, #designer-studio-badge")||(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),w(t)&&this.selectElement(t)))},this.handleKeyDown=e=>{this.isActive&&e.key==="Escape"&&(this.messageCallback&&this.messageCallback({type:"CANCEL"}),this.selectedElement=null,this.hideHighlight())}}activate(e){this.isActive||(this.isActive=!0,this.messageCallback=e,this.createHighlightOverlay(),this.attachEventListeners(),this.addEditorStyles())}deactivate(){this.isActive&&(this.isActive=!1,this.removeEventListeners(),this.removeHighlightOverlay(),this.removeEditorStyles(),this.selectedElement=null,this.messageCallback=null)}getActive(){return this.isActive}createHighlightOverlay(){if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.createHighlightOverlay());return}setTimeout(()=>this.createHighlightOverlay(),100);return}this.highlightOverlay=document.createElement("div"),this.highlightOverlay.id="designer-highlight-overlay",this.highlightOverlay.style.cssText=`
      position: absolute;
      pointer-events: none;
      border: 2px solid #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
      z-index: 999998;
      transition: all 0.1s ease;
      box-sizing: border-box;
      display: none;
    `,document.body.appendChild(this.highlightOverlay)}removeHighlightOverlay(){this.highlightOverlay&&(this.highlightOverlay.remove(),this.highlightOverlay=null)}attachEventListeners(){document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}removeEventListeners(){document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0)}highlightElement(e){if(!this.highlightOverlay)return;const t=e.getBoundingClientRect(),i=window.pageXOffset||document.documentElement.scrollLeft,n=window.pageYOffset||document.documentElement.scrollTop;this.highlightOverlay.style.display="block",this.highlightOverlay.style.left=`${t.left+i}px`,this.highlightOverlay.style.top=`${t.top+n}px`,this.highlightOverlay.style.width=`${t.width}px`,this.highlightOverlay.style.height=`${t.height}px`}hideHighlight(){this.highlightOverlay&&(this.highlightOverlay.style.display="none")}selectElement(e){this.selectedElement=e,this.highlightElement(e);const t=p.generateSelector(e),i=M(e);this.messageCallback&&this.messageCallback({type:"ELEMENT_SELECTED",selector:t.selector,elementInfo:i})}addEditorStyles(){const e=document.createElement("style");e.id="designer-editor-styles",e.textContent=`
      * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      a, button, input, textarea, select {
        pointer-events: auto !important;
      }
    `,document.head.appendChild(e)}removeEditorStyles(){const e=document.getElementById("designer-editor-styles");e&&e.remove()}}class P{constructor(){this.renderedGuides=new Map,this.container=null}renderGuides(e){this.clear();const t=b();e.filter(n=>n.page===t&&n.status==="active").forEach(n=>{this.renderGuide(n)})}renderGuide(e){const t=p.findElement(e.selector);if(!t){console.warn(`Guide "${e.id}" target not found: ${e.selector}`);return}D(t);const i=this.createTooltip(e,t);this.renderedGuides.set(e.id,i),this.container||this.createContainer(),this.container&&this.container.appendChild(i),this.positionTooltip(i,t,e.placement)}dismissGuide(e){const t=this.renderedGuides.get(e);t&&(t.remove(),this.renderedGuides.delete(e))}clear(){this.renderedGuides.forEach(e=>e.remove()),this.renderedGuides.clear()}createTooltip(e,t){const i=document.createElement("div");i.className="designer-guide-tooltip",i.dataset.guideId=e.id,i.style.cssText=`
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
    `;const n=document.createElement("div");n.style.cssText="margin-bottom: 8px;",n.textContent=e.content,i.appendChild(n);const o=document.createElement("button");o.textContent="Got it",o.style.cssText=`
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `,o.onmouseover=()=>{o.style.background="#2563eb"},o.onmouseout=()=>{o.style.background="#3b82f6"},o.onclick=()=>{this.dismissGuide(e.id)},i.appendChild(o);const a=document.createElement("div");return a.className="designer-guide-arrow",a.style.cssText=`
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    `,i.appendChild(a),i}positionTooltip(e,t,i){const n=t.getBoundingClientRect(),o=e.getBoundingClientRect(),a=window.pageXOffset||document.documentElement.scrollLeft,s=window.pageYOffset||document.documentElement.scrollTop,c=e.querySelector(".designer-guide-arrow");let l=0,g=0,f="";switch(i){case"top":l=n.top+s-o.height-12,g=n.left+a+n.width/2-o.width/2,f=`
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0 8px;
          border-color: #3b82f6 transparent transparent transparent;
        `;break;case"bottom":l=n.bottom+s+12,g=n.left+a+n.width/2-o.width/2,f=`
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-color: transparent transparent #3b82f6 transparent;
        `;break;case"left":l=n.top+s+n.height/2-o.height/2,g=n.left+a-o.width-12,f=`
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent #3b82f6;
        `;break;case"right":l=n.top+s+n.height/2-o.height/2,g=n.right+a+12,f=`
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 8px 8px 0;
          border-color: transparent #3b82f6 transparent transparent;
        `;break}const I=window.innerWidth,L=window.innerHeight;g<a?g=a+10:g+o.width>a+I&&(g=a+I-o.width-10),l<s?l=s+10:l+o.height>s+L&&(l=s+L-o.height-10),e.style.top=`${l}px`,e.style.left=`${g}px`,c&&(c.style.cssText+=f)}createContainer(){this.container=document.createElement("div"),this.container.id="designer-guides-container",this.container.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999996;
    `,document.body.appendChild(this.container)}updatePositions(e){this.renderedGuides.forEach((t,i)=>{const n=e.find(a=>a.id===i);if(!n)return;const o=p.findElement(n.selector);o&&this.positionTooltip(t,o,n.placement)})}}const k=["rgba(251, 191, 36, 0.35)","rgba(34, 197, 94, 0.35)","rgba(249, 115, 22, 0.35)"];class z{constructor(){this.overlays=new Map,this.container=null}render(e,t){if(this.clear(),!t||e.length===0)return;const i=this.getCurrentUrl(),n=this.normalizeUrl(i);e.filter(a=>a.url&&this.normalizeUrl(a.url)===n).forEach((a,s)=>{const c=p.findElement(a.selector);if(!c)return;const l=k[s%k.length],g=this.createOverlay(c,l,a.featureName);this.overlays.set(a.id,g),this.container||this.createContainer(),this.container&&this.container.appendChild(g)}),this.updatePositions(e)}updatePositions(e){this.overlays.forEach((t,i)=>{const n=e.find(l=>l.id===i);if(!n)return;const o=p.findElement(n.selector);if(!o)return;const a=o.getBoundingClientRect(),s=window.pageXOffset||document.documentElement.scrollLeft,c=window.pageYOffset||document.documentElement.scrollTop;t.style.left=`${a.left+s}px`,t.style.top=`${a.top+c}px`,t.style.width=`${a.width}px`,t.style.height=`${a.height}px`})}clear(){this.overlays.forEach(e=>e.remove()),this.overlays.clear()}destroy(){this.clear(),this.container&&(this.container.remove(),this.container=null)}createOverlay(e,t,i){const n=e.getBoundingClientRect(),o=window.pageXOffset||document.documentElement.scrollLeft,a=window.pageYOffset||document.documentElement.scrollTop,s=document.createElement("div");return s.className="designer-feature-heatmap-overlay",s.title=i,s.style.cssText=`
      position: absolute;
      left: ${n.left+o}px;
      top: ${n.top+a}px;
      width: ${n.width}px;
      height: ${n.height}px;
      background-color: ${t};
      pointer-events: none;
      z-index: 999995;
      box-sizing: border-box;
      border-radius: 4px;
      border: 2px solid ${t};
    `,s}createContainer(){this.container||(this.container=document.createElement("div"),this.container.id="designer-feature-heatmap-container",this.container.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999994;
    `,document.body.appendChild(this.container))}getCurrentUrl(){try{return window.location.href||""}catch{return""}}normalizeUrl(e){return(e||"").replace(/^https?:\/\//i,"").replace(/\/$/,"").trim()||""}}class F{constructor(){this.iframe=null,this.dragHandle=null,this.gripButton=null,this.messageCallback=null,this.isReady=!1,this.mode=null,this.isDragging=!1,this.dragStartX=0,this.dragStartY=0,this.currentX=0,this.currentY=0,this.dragThreshold=3,this.mouseDownX=0,this.mouseDownY=0,this.isMouseDown=!1,this.handleMouseDown=e=>{if(!this.iframe||!this.dragHandle)return;this.mouseDownX=e.clientX,this.mouseDownY=e.clientY,this.isMouseDown=!0,this.isDragging=!1;const t=this.iframe.getBoundingClientRect();this.dragStartX=e.clientX-t.left,this.dragStartY=e.clientY-t.top,this.currentX=t.left,this.currentY=t.top,e.preventDefault(),e.stopPropagation()},this.handleMouseMove=e=>{if(!this.isMouseDown||!this.iframe||!this.dragHandle)return;if(!this.isDragging){const l=Math.abs(e.clientX-this.mouseDownX),g=Math.abs(e.clientY-this.mouseDownY);if(Math.sqrt(l*l+g*g)>this.dragThreshold)this.isDragging=!0,document.body.style.cursor="grabbing",document.documentElement.style.cursor="grabbing",document.body.style.userSelect="none",document.documentElement.style.userSelect="none",this.iframe&&(this.iframe.style.pointerEvents="none"),this.gripButton&&(this.gripButton.style.cursor="grabbing");else return}e.preventDefault(),e.stopPropagation();const t=e.clientX-this.dragStartX,i=e.clientY-this.dragStartY,n=window.innerWidth,o=window.innerHeight,a=this.iframe.offsetWidth;this.iframe.offsetHeight;const s=Math.max(-a+50,Math.min(t,n-50)),c=Math.max(0,Math.min(i,o-100));this.currentX=s,this.currentY=c,this.iframe.style.left=`${s}px`,this.iframe.style.top=`${c}px`,this.iframe.style.right="auto",this.iframe.style.bottom="auto",this.dragHandle.style.left=`${s}px`,this.dragHandle.style.top=`${c}px`},this.handleMouseUp=e=>{this.isMouseDown&&(this.isDragging=!1,this.isMouseDown=!1,document.body.style.cursor="",document.documentElement.style.cursor="",document.body.style.userSelect="",document.documentElement.style.userSelect="",this.iframe&&(this.iframe.style.pointerEvents=""),this.gripButton&&(this.gripButton.style.cursor="grab"),e.preventDefault(),e.stopPropagation())},this.handleMessage=e=>{const t=e.data;!t||!t.type||(this.messageCallback&&this.messageCallback(t),(t.type==="CANCEL"||t.type==="GUIDE_SAVED")&&this.hide())}}create(e,t){if(console.log("[Visual Designer] EditorFrame.create() called with mode:",t),this.iframe){console.warn("[Visual Designer] EditorFrame already created, skipping");return}this.mode=t||null,this.messageCallback=e,console.log("[Visual Designer] Creating editor iframe with mode:",this.mode),this.iframe=document.createElement("iframe"),this.iframe.id="designer-editor-frame",this.iframe.style.cssText=`
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
    `,this.createDragHandle(),this.loadEditorHtml(),window.addEventListener("message",this.handleMessage);const i=()=>{document.body?(document.body.appendChild(this.iframe),this.dragHandle&&document.body.appendChild(this.dragHandle),this.iframe&&(this.iframe.onload=()=>{this.isReady=!0,this.sendMessage({type:"EDITOR_READY"}),this.updateDragHandlePosition()})):document.readyState==="loading"?document.addEventListener("DOMContentLoaded",i):setTimeout(i,100)};i()}show(){console.log("[Visual Designer] EditorFrame.show() called"),this.iframe?(console.log("[Visual Designer] Showing iframe"),this.iframe.style.display="block",this.updateDragHandlePosition()):console.warn("[Visual Designer] Cannot show iframe - iframe is null"),this.dragHandle?(console.log("[Visual Designer] Showing drag handle"),this.dragHandle.style.display="block"):console.warn("[Visual Designer] Cannot show drag handle - dragHandle is null")}hide(){this.iframe&&(this.iframe.style.display="none"),this.dragHandle&&(this.dragHandle.style.display="none")}sendElementSelected(e){this.sendMessage(e),this.show()}sendClearSelectionAck(){this.sendMessage({type:"CLEAR_SELECTION_ACK"})}sendTagPageSavedAck(){this.sendMessage({type:"TAG_PAGE_SAVED_ACK"})}sendTagFeatureSavedAck(){this.sendMessage({type:"TAG_FEATURE_SAVED_ACK"})}destroy(){window.removeEventListener("message",this.handleMessage),document.removeEventListener("mousemove",this.handleMouseMove,!0),document.removeEventListener("mouseup",this.handleMouseUp,!0),window.removeEventListener("mousemove",this.handleMouseMove,!0),window.removeEventListener("mouseup",this.handleMouseUp,!0),this.iframe&&(this.iframe.remove(),this.iframe=null),this.dragHandle&&(this.dragHandle.remove(),this.dragHandle=null),this.gripButton=null,this.isReady=!1,this.messageCallback=null,this.isDragging=!1,this.isMouseDown=!1,document.body.style.cursor="",document.documentElement.style.cursor="",document.body.style.userSelect="",document.documentElement.style.userSelect=""}sendMessage(e){if(!this.iframe||!this.isReady){setTimeout(()=>this.sendMessage(e),100);return}const t=this.iframe.contentWindow;t&&t.postMessage(e,"*")}loadEditorHtml(){this.loadEditorHtmlFallback()}loadEditorHtmlFallback(){const e=this.getEditorHtmlContent(),t=new Blob([e],{type:"text/html"}),i=URL.createObjectURL(t);this.iframe&&(this.iframe.src=i)}getEditorHtmlContent(){return this.mode==="tag-page"?this.getTagPageHtmlContent():this.mode==="tag-feature"?this.getTagFeatureHtmlContent():`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Designer Editor</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js"><\/script>
  <style>
    iconify-icon { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background: #f8fafc; color: #111827; line-height: 1.5; height: 100%; overflow-y: auto; }
    .editor-container { display: flex; flex-direction: column; gap: 20px; max-width: 100%; min-height: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 2px solid #e2e8f0; margin-bottom: 4px; }
    .header h2 { font-size: 18px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
    .close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; }
    .close-btn:hover { color: #0f172a; background: #f1f5f9; }
    .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .form-group:last-of-type { margin-bottom: 0; }
    label { font-size: 13px; font-weight: 600; color: #475569; letter-spacing: 0.01em; }
    input[type="text"], textarea { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Montserrat', inherit; transition: border-color 0.2s, box-shadow 0.2s; background: #fff; }
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
    .empty-state .select-element-btn { margin-top: 16px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', inherit; }
    .empty-state .select-element-btn:hover { background: #2563eb; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35); }
    .error { padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #b91c1c; font-size: 13px; display: none; margin-top: 12px; }
    .error.show { display: block; }
  </style>
</head>
<body>
  <div class="editor-container">
    <div class="header">
      <h2>Create Guide</h2>
      <button class="close-btn" id="closeBtn" aria-label="Close"><iconify-icon icon="mdi:close"></iconify-icon></button>
    </div>
    <div id="emptyState" class="empty-state">
      <div>Click on an element in the page to create a guide</div>
      <button type="button" class="select-element-btn" id="selectElementBtn">Select element</button>
    </div>
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
        <button class="btn btn-secondary" id="clearSelectionBtn">Clear Selection</button>
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
    document.getElementById('selectElementBtn').addEventListener('click', () => sendMessage({ type: 'ACTIVATE_SELECTOR' }));
    document.getElementById('clearSelectionBtn').addEventListener('click', () => sendMessage({ type: 'CLEAR_SELECTION_CLICKED' }));
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
      if (message.type === 'CLEAR_SELECTION_ACK') {
        currentSelector = '';
        currentElementInfo = null;
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('editorForm').style.display = 'none';
        document.getElementById('selectorPreview').textContent = '-';
        document.getElementById('elementInfo').style.display = 'none';
        hideError();
      }
    });
    function sendMessage(message) { window.parent.postMessage(message, '*'); }
    function showError(message) { const errorEl = document.getElementById('errorMessage'); errorEl.textContent = message; errorEl.classList.add('show'); }
    function hideError() { const errorEl = document.getElementById('errorMessage'); errorEl.classList.remove('show'); }
    window.addEventListener('load', () => sendMessage({ type: 'EDITOR_READY' }));
  <\/script>
</body>
  </html>`}getTagPageHtmlContent(){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tag Page - Visual Designer</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js"><\/script>
  <style>
    iconify-icon { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; color: #111827; height: 100%; overflow-y: auto; line-height: 1.5; }
    .tag-page-container { display: flex; flex-direction: column; min-height: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
    .header h2 { font-size: 17px; font-weight: 600; color: #0f172a; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .header-actions span { cursor: pointer; color: #64748b; font-size: 18px; padding: 4px 8px; border-radius: 6px; }
    .header-actions span:hover { background: #f1f5f9; color: #0f172a; }
    .content { flex: 1; padding: 20px; overflow-y: auto; }
    .tag-page-view { display: none; }
    .tag-page-view.active { display: flex; flex-direction: column; flex: 1; }
    .section-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .overview-tagged .current-url-card {
      display: flex; align-items: center; justify-content: space-between;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;
      margin-bottom: 16px; cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s;
    }
    .overview-tagged .current-url-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .current-url-card .left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .pill { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; flex-shrink: 0; }
    .pill-tagged { background: #10b981; color: #fff; }
    .pill-untagged { background: #f59e0b; color: #fff; }
    .current-url-card .label { font-size: 14px; font-weight: 600; color: #0f172a; }
    .current-url-card .url { font-size: 13px; color: #64748b; margin-top: 4px; word-break: break-all; }
    .current-url-card .chevron { color: #94a3b8; font-size: 18px; flex-shrink: 0; }
    .overview-untagged { text-align: center; padding: 32px 24px; }
    .overview-untagged .illustration {
      width: 120px; height: 100px; margin: 0 auto 24px; background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 50%, #fef3c7 100%);
      border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 48px;
    }
    .overview-untagged h3 { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
    .overview-untagged p { font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
    .tag-page-btn { width: 100%; padding: 12px 20px; background: #14b8a6; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', inherit; margin-top: 8px; }
    .tag-page-btn:hover { background: #0d9488; box-shadow: 0 4px 12px rgba(20,184,166,0.35); }
    .tagged-detail .back-link { display: block; color: #3b82f6; font-size: 13px; margin-bottom: 16px; text-decoration: none; }
    .tagged-detail .back-link:hover { text-decoration: underline; }
    .tagged-detail .current-url-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .tagged-detail .current-url-header .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; padding: 0 8px; border-radius: 999px; background: #8b5cf6; color: #fff; font-size: 12px; font-weight: 600; }
    .tagged-detail .current-url-header h3 { font-size: 16px; font-weight: 600; color: #0f172a; }
    .tagged-detail .current-url-subtitle { font-size: 13px; color: #64748b; margin-bottom: 16px; }
    .tagged-detail .search-wrap { position: relative; margin-bottom: 16px; }
    .tagged-detail .search-wrap input { width: 100%; padding: 10px 36px 10px 36px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Montserrat', inherit; }
    .tagged-detail .search-wrap .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; pointer-events: none; }
    .tagged-detail .search-wrap .clear-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); padding: 4px 8px; background: none; border: none; color: #64748b; font-size: 12px; cursor: pointer; }
    .tagged-detail .search-wrap .clear-btn:hover { color: #0f172a; }
    .tagged-detail .page-list-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; background: #fff; cursor: pointer; transition: border-color 0.2s; }
    .tagged-detail .page-list-item:hover { border-color: #cbd5e1; }
    .tagged-detail .page-list-item .name { font-size: 14px; font-weight: 500; color: #0f172a; flex: 1; }
    .tagged-detail .page-list-item .actions { display: flex; gap: 8px; }
    .tagged-detail .page-list-item .actions span { padding: 4px; cursor: pointer; color: #64748b; font-size: 14px; border-radius: 4px; }
    .tagged-detail .page-list-item .actions span:hover { color: #0f172a; background: #f1f5f9; }
    .tagged-detail .page-list-item .actions .delete:hover { color: #dc2626; background: #fef2f2; }
    .tag-page-form .section { margin-bottom: 24px; }
    .radio-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .radio-item { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .radio-item input { width: 16px; height: 16px; accent-color: #3b82f6; }
    .radio-item label { font-size: 14px; color: #0f172a; cursor: pointer; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-group label .required { color: #dc2626; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Montserrat', inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .form-group textarea { resize: vertical; min-height: 80px; }
    .rule-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .rule-header span { font-size: 13px; font-weight: 600; color: #0f172a; }
    .rule-delete { cursor: pointer; color: #64748b; padding: 4px; border-radius: 4px; }
    .rule-delete:hover { color: #dc2626; background: #fef2f2; }
    .info-icon { color: #64748b; font-size: 14px; margin-left: 4px; cursor: help; }
    .error { font-size: 13px; color: #dc2626; margin-top: 6px; display: none; }
    .error.show { display: block; }
    .actions { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid #e2e8f0; background: #fff; margin-top: auto; }
    .btn { flex: 1; padding: 12px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', inherit; transition: all 0.2s; }
    .btn-cancel { background: #f1f5f9; color: #475569; }
    .btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
    .btn-save { background: #14b8a6; color: #fff; }
    .btn-save:hover { background: #0d9488; box-shadow: 0 4px 12px rgba(20,184,166,0.35); }
  </style>
</head>
<body>
  <div class="tag-page-container">
    <div class="header">
      <h2>Tag Page</h2>
      <div class="header-actions">
        <span title="Menu"><iconify-icon icon="mdi:dots-horizontal"></iconify-icon></span>
        <span class="minimize-btn" id="minimizeBtn" title="Minimize"><iconify-icon icon="mdi:window-minimize"></iconify-icon></span>
      </div>
    </div>
    <div class="content">
      <!-- Overview: current URL already tagged -->
      <div id="overviewTagged" class="tag-page-view overview-tagged">
        <div class="section-title">PAGES OVERVIEW</div>
        <div class="current-url-card" id="currentUrlCardTagged">
          <div class="left">
            <span class="pill pill-tagged">Tagged</span>
            <div>
              <div class="label">Current URL</div>
              <div class="url" id="currentUrlDisplayTagged">-</div>
            </div>
          </div>
          <span class="chevron"><iconify-icon icon="mdi:chevron-right"></iconify-icon></span>
        </div>
        <button type="button" class="tag-page-btn" id="tagPageBtnFromTagged">Tag Page</button>
      </div>
      <!-- Tagged URL detail: list of tagged pages for current URL -->
      <div id="taggedPagesDetailView" class="tag-page-view tagged-detail">
        <a href="#" class="back-link" id="backFromTaggedDetail"><iconify-icon icon="mdi:arrow-left"></iconify-icon> Back to overview</a>
        <div class="current-url-header">
          <span class="badge" id="taggedCountBadge">0</span>
          <h3>Current URL</h3>
        </div>
        <div class="current-url-subtitle">List of tagged Pages on this URL</div>
        <div class="search-wrap">
          <span class="search-icon"><iconify-icon icon="mdi:magnify"></iconify-icon></span>
          <input type="text" id="searchPagesInput" placeholder="Search Pages" />
          <button type="button" class="clear-btn" id="clearSearchBtn" style="display:none;">Clear</button>
        </div>
        <div id="taggedPagesList"></div>
        <button type="button" class="tag-page-btn" id="tagPageBtnFromDetail" style="margin-top:16px;">Tag Page</button>
      </div>
      <!-- Overview: current URL not tagged -->
      <div id="overviewUntagged" class="tag-page-view overview-untagged">
        <div class="illustration" aria-hidden="true"><iconify-icon icon="mdi:calendar" style="font-size:48px;"></iconify-icon></div>
        <h3>Let's start tagging!</h3>
        <p>Start by first tagging this page and then features to get going.</p>
        <button type="button" class="tag-page-btn" id="tagPageBtnFromUntagged">Tag Page</button>
      </div>
      <!-- Form: create/edit page -->
      <div id="tagPageFormView" class="tag-page-view tag-page-form">
        <a href="#" class="back-link" id="backFromTagPageForm" style="display:block;color:#3b82f6;font-size:13px;margin-bottom:16px;"><iconify-icon icon="mdi:arrow-left"></iconify-icon> Back</a>
        <div class="section">
          <div class="section-title">PAGE SETUP</div>
          <div class="radio-group">
            <div class="radio-item">
              <input type="radio" id="createNew" name="pageSetup" value="create" checked>
              <label for="createNew">Create New Page</label>
            </div>
            <div class="radio-item">
              <input type="radio" id="mergeExisting" name="pageSetup" value="merge">
              <label for="mergeExisting">Merge with Existing</label>
            </div>
          </div>
          <div class="form-group">
            <label>Page Name <span class="required">*</span></label>
            <input type="text" id="pageName" placeholder="Enter page name" required>
            <div class="error" id="pageNameError">This page name is already in use. Try another?</div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="pageDescription" placeholder="Click to add description"></textarea>
          </div>
        </div>
        <div class="section">
          <div class="section-title">INCLUDE PAGE RULES <span class="info-icon" title="Define how this page is identified"><iconify-icon icon="mdi:information-outline"></iconify-icon></span></div>
          <div class="rule-header">
            <span>Include Rule 1</span>
            <span class="rule-delete" id="deleteRule1" title="Delete rule"><iconify-icon icon="mdi:delete-outline"></iconify-icon></span>
          </div>
          <div class="radio-group">
            <div class="radio-item">
              <input type="radio" id="suggestedMatch" name="ruleType" value="suggested" checked>
              <label for="suggestedMatch">Suggested Match</label>
            </div>
            <div class="radio-item">
              <input type="radio" id="exactMatch" name="ruleType" value="exact">
              <label for="exactMatch">Exact Match</label>
            </div>
            <div class="radio-item">
              <input type="radio" id="ruleBuilder" name="ruleType" value="builder">
              <label for="ruleBuilder">Rule Builder</label>
            </div>
          </div>
          <div class="form-group">
            <label>Selection URL</label>
            <input type="text" id="selectionUrl" placeholder="e.g. //*/path/to/page">
          </div>
        </div>
      </div>
    </div>
    <div class="actions" id="tagPageFormActions" style="display: none;">
      <button class="btn btn-cancel" id="cancelBtn">Cancel</button>
      <button class="btn btn-save" id="saveBtn">Save</button>
    </div>
  </div>
  <script>
    function sendMessage(m) { window.parent.postMessage(m, '*'); }
    var STORAGE_KEY = 'designerTaggedPages';
    function getCurrentUrl() {
      try {
        var p = window.parent.location;
        return (p.host || p.hostname || '') + (p.pathname || '/') + (p.search || '') + (p.hash || '');
      } catch (e) { return window.location.href || ''; }
    }
    function normalizeUrl(u) {
      u = (u || '').replace(/^https?:\\/\\//i, '').replace(/\\/$/, '');
      return u || '';
    }
    function getTaggedPages() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY) || '[]';
        return JSON.parse(raw);
      } catch (e) { return []; }
    }
    function isCurrentUrlTagged() {
      var current = normalizeUrl(getCurrentUrl());
      var list = getTaggedPages();
      return list.some(function(p) { return p && normalizeUrl(p.url) === current; });
    }
    function showView(viewId) {
      document.querySelectorAll('.tag-page-view').forEach(function(el) { el.classList.remove('active'); });
      var el = document.getElementById(viewId);
      if (el) el.classList.add('active');
      document.getElementById('tagPageFormActions').style.display = viewId === 'tagPageFormView' ? 'flex' : 'none';
    }
    function refreshOverview() {
      var tagged = isCurrentUrlTagged();
      showView(tagged ? 'overviewTagged' : 'overviewUntagged');
      document.getElementById('currentUrlDisplayTagged').textContent = getCurrentUrl() || '(current page)';
    }
    function getPagesForCurrentUrl() {
      var current = normalizeUrl(getCurrentUrl());
      return getTaggedPages().filter(function(p) { return p && normalizeUrl(p.url) === current; });
    }
    function renderTaggedPagesList(filter) {
      var pages = getPagesForCurrentUrl();
      var q = (filter || '').toLowerCase().trim();
      if (q) pages = pages.filter(function(p) { return (p.pageName || '').toLowerCase().indexOf(q) !== -1; });
      var list = document.getElementById('taggedPagesList');
      list.innerHTML = '';
      pages.forEach(function(p) {
        var name = p.pageName || 'Unnamed';
        var item = document.createElement('div');
        item.className = 'page-list-item';
        item.innerHTML = '<span class="name">' + escapeHtml(name) + '</span>' +
          '<div class="actions">' +
          '<span class="edit" title="Edit" data-page-name="' + escapeHtml(name) + '"><iconify-icon icon="mdi:pencil"></iconify-icon></span>' +
          '<span class="delete" title="Delete" data-page-name="' + escapeHtml(name) + '"><iconify-icon icon="mdi:delete-outline"></iconify-icon></span>' +
          '</div>';
        list.appendChild(item);
      });
    }
    function escapeHtml(s) {
      var div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }
    function showTaggedDetailView() {
      var pages = getPagesForCurrentUrl();
      showView('taggedPagesDetailView');
      document.getElementById('taggedCountBadge').textContent = String(pages.length);
      document.getElementById('searchPagesInput').value = '';
      document.getElementById('clearSearchBtn').style.display = 'none';
      renderTaggedPagesList('');
    }
    document.getElementById('minimizeBtn').addEventListener('click', function() { sendMessage({ type: 'CANCEL' }); });
    function getSuggestedSelectionUrl() {
      try {
        var p = window.parent.location;
        var path = (p.pathname || '/').replace(/^\\//, '');
        var search = p.search || '';
        var hash = p.hash || '';
        return '//*/' + path + search + hash;
      } catch (e) { return '//*/'; }
    }
    function showTagPageForm() {
      showView('tagPageFormView');
      document.getElementById('tagPageFormActions').style.display = 'flex';
      document.getElementById('selectionUrl').value = getSuggestedSelectionUrl();
    }
    document.getElementById('currentUrlCardTagged').addEventListener('click', showTaggedDetailView);
    document.getElementById('searchPagesInput').addEventListener('input', function() {
      var val = this.value;
      document.getElementById('clearSearchBtn').style.display = val ? 'block' : 'none';
      renderTaggedPagesList(val);
    });
    document.getElementById('clearSearchBtn').addEventListener('click', function() {
      document.getElementById('searchPagesInput').value = '';
      this.style.display = 'none';
      renderTaggedPagesList('');
    });
    document.getElementById('taggedPagesList').addEventListener('click', function(e) {
      var target = e.target;
      if (!target || !target.closest) return;
      var editBtn = target.closest('.edit');
      var deleteBtn = target.closest('.delete');
      if (editBtn) {
        var pageName = editBtn.getAttribute('data-page-name');
        if (pageName) sendMessage({ type: 'EDIT_TAG_PAGE', payload: { pageName: pageName } });
      }
      if (deleteBtn) {
        var pageName = deleteBtn.getAttribute('data-page-name');
        if (pageName && window.confirm('Delete page "' + pageName + '"?')) {
          var current = normalizeUrl(getCurrentUrl());
          var list = getTaggedPages().filter(function(p) {
            return !(p && p.pageName === pageName && normalizeUrl(p.url) === current);
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            var remaining = getPagesForCurrentUrl();
            if (remaining.length === 0) {
              refreshOverview();
            } else {
              document.getElementById('taggedCountBadge').textContent = String(remaining.length);
              renderTaggedPagesList(document.getElementById('searchPagesInput').value);
            }
          } catch (err) {}
        }
      }
    });
    document.getElementById('tagPageBtnFromTagged').addEventListener('click', showTagPageForm);
    document.getElementById('tagPageBtnFromUntagged').addEventListener('click', showTagPageForm);
    document.getElementById('tagPageBtnFromDetail').addEventListener('click', showTagPageForm);
    document.getElementById('backFromTaggedDetail').addEventListener('click', function(e) { e.preventDefault(); refreshOverview(); });
    document.getElementById('backFromTagPageForm').addEventListener('click', function(e) { e.preventDefault(); refreshOverview(); document.getElementById('tagPageFormActions').style.display = 'none'; });
    document.getElementById('cancelBtn').addEventListener('click', function() { refreshOverview(); });
    document.getElementById('saveBtn').addEventListener('click', function() {
      var pageName = document.getElementById('pageName').value.trim();
      var pageNameError = document.getElementById('pageNameError');
      if (!pageName) { pageNameError.classList.add('show'); return; }
      pageNameError.classList.remove('show');
      var pageSetup = document.querySelector('input[name="pageSetup"]:checked').value;
      var description = document.getElementById('pageDescription').value.trim();
      var ruleType = document.querySelector('input[name="ruleType"]:checked').value;
      var selectionUrl = document.getElementById('selectionUrl').value.trim();
      sendMessage({
        type: 'SAVE_TAG_PAGE',
        payload: {
          pageSetup: pageSetup,
          pageName: pageName,
          description: description || undefined,
          includeRules: [{ ruleType: ruleType, selectionUrl: selectionUrl || '' }]
        }
      });
    });
    window.addEventListener('message', function(event) {
      var d = event.data;
      if (d && d.type === 'TAG_PAGE_SAVED_ACK') { refreshOverview(); }
    });
    var lastKnownUrl = '';
    function checkUrlChange() {
      var current = getCurrentUrl();
      if (current !== lastKnownUrl) {
        lastKnownUrl = current;
        refreshOverview();
      }
    }
    function startUrlChangeDetection() {
      lastKnownUrl = getCurrentUrl();
      try {
        window.parent.addEventListener('hashchange', checkUrlChange);
        window.parent.addEventListener('popstate', checkUrlChange);
      } catch (e) {}
      setInterval(checkUrlChange, 1500);
    }
    window.addEventListener('load', function() {
      refreshOverview();
      lastKnownUrl = getCurrentUrl();
      startUrlChangeDetection();
      sendMessage({ type: 'EDITOR_READY' });
    });
  <\/script>
</body>
</html>`}getTagFeatureHtmlContent(){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tag Feature - Visual Designer</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js"><\/script>
  <style>
    iconify-icon { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #111827; height: 100%; overflow-y: auto; line-height: 1.5; }
    .tag-feature-container { display: flex; flex-direction: column; min-height: 100%; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
    .header h2 { font-size: 17px; font-weight: 600; color: #0f172a; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .header-actions span { cursor: pointer; color: #64748b; font-size: 18px; padding: 4px 8px; border-radius: 6px; }
    .header-actions span:hover { background: #f1f5f9; color: #0f172a; }
    .tabs { display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; padding: 0 20px; }
    .tab { padding: 14px 20px; background: none; border: none; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; position: relative; font-family: 'Montserrat', inherit; }
    .tab:hover { color: #0f172a; }
    .tab.active { color: #0f172a; font-weight: 600; }
    .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: #14b8a6; border-radius: 3px 3px 0 0; }
    .content { flex: 1; overflow-y: auto; padding: 24px 20px; background: #f8fafc; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .section-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; margin-top: 20px; }
    .section-title:first-child { margin-top: 0; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
    .card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .card-content { display: flex; align-items: center; justify-content: space-between; }
    .card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
    .badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-size: 12px; font-weight: 600; min-width: 28px; height: 28px; padding: 0 10px; color: #fff; flex-shrink: 0; }
    .badge-teal { background: #14b8a6; }
    .badge-purple { background: #8b5cf6; }
    .card-text { flex: 1; min-width: 0; }
    .card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
    .card-description { font-size: 13px; color: #64748b; line-height: 1.4; }
    .chevron { color: #94a3b8; font-size: 18px; flex-shrink: 0; }
    .heatmap-row { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; border-top: 1px solid #e2e8f0; margin-top: 24px; }
    .heatmap-label { font-size: 14px; font-weight: 500; color: #0f172a; }
    .heatmap-controls { display: flex; align-items: center; gap: 12px; }
    .toggle-switch { position: relative; width: 44px; height: 24px; background: #cbd5e1; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
    .toggle-switch.active { background: #10b981; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .toggle-switch.active::after { transform: translateX(20px); }
    .plus-icon { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; font-size: 18px; transition: all 0.2s; background: #fff; }
    .plus-icon:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
    .tag-feature-btn { width: 100%; padding: 12px 20px; background: #14b8a6; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', inherit; margin-top: 24px; box-shadow: 0 2px 8px rgba(20,184,166,0.25); }
    .tag-feature-btn:hover { background: #0d9488; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(20,184,166,0.35); }
    .overview-actions { display: flex; gap: 12px; margin-top: 24px; }
    .overview-actions .tag-feature-btn { margin-top: 0; flex: 1; }
    .clear-selection-btn { padding: 12px 20px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', inherit; transition: all 0.2s; }
    .clear-selection-btn:hover { background: #e2e8f0; color: #0f172a; }
    .view { display: none; }
    .view.active { display: flex; flex-direction: column; min-height: 100%; }
    .selector-form .form-group { margin-bottom: 16px; }
    .selector-form label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .selector-form label .required { color: #dc2626; }
    .selector-form input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Montserrat', inherit; }
    .selector-preview { padding: 10px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-family: monospace; color: #475569; word-break: break-all; }
    .element-info { padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 12px; color: #1e40af; margin-top: 8px; }
    .error { font-size: 13px; color: #dc2626; margin-top: 6px; display: none; }
    .error.show { display: block; }
    .form-actions { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid #e2e8f0; margin-top: auto; }
    .btn { flex: 1; padding: 12px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
    .btn-cancel { background: #f1f5f9; color: #475569; }
    .btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
    .btn-save { background: #14b8a6; color: #fff; }
    .btn-save:hover { background: #0d9488; box-shadow: 0 4px 12px rgba(20,184,166,0.35); }
    .back-link { color: #3b82f6; font-size: 13px; cursor: pointer; margin-bottom: 16px; }
    .back-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="tag-feature-container">
    <div class="header">
      <h2>Manage Pages, Features, and AI agents</h2>
      <div class="header-actions">
        <span title="Menu"><iconify-icon icon="mdi:dots-horizontal"></iconify-icon></span>
        <span id="minimizeBtn" title="Minimize"><iconify-icon icon="mdi:window-minimize"></iconify-icon></span>
      </div>
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="features">Features</button>
      <button class="tab" data-tab="pages">Pages</button>
      <button class="tab" data-tab="ai-agents">AI agents</button>
    </div>
    <div class="content">
      <div id="overviewView" class="view active" style="display: block;">
        <div id="featuresTab" class="tab-content active">
          <div class="section-title">FEATURES OVERVIEW</div>
          <div class="card">
            <div class="card-content">
              <div class="card-left">
                <span class="badge badge-teal" id="suggestedCount">7</span>
                <div class="card-text">
                  <div class="card-title">Suggested Features</div>
                  <div class="card-description">List of untagged elements on this page</div>
                </div>
              </div>
              <span class="chevron"><iconify-icon icon="mdi:chevron-right"></iconify-icon></span>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <div class="card-left">
                <span class="badge badge-purple" id="taggedCount">111</span>
                <div class="card-text">
                  <div class="card-title">Tagged Features</div>
                  <div class="card-description">List of tagged Features on this page</div>
                </div>
              </div>
              <span class="chevron"><iconify-icon icon="mdi:chevron-right"></iconify-icon></span>
            </div>
          </div>
          <div class="heatmap-row">
            <span class="heatmap-label">Heatmap</span>
            <div class="heatmap-controls">
              <div class="toggle-switch" id="heatmapToggle"></div>
              <div class="plus-icon"><iconify-icon icon="mdi:plus"></iconify-icon></div>
            </div>
          </div>
          <div class="overview-actions">
            <button class="tag-feature-btn" id="tagFeatureBtn">Tag Feature</button>
            <button class="clear-selection-btn" id="overviewClearSelectionBtn">Clear Selection</button>
          </div>
        </div>
      </div>
      <div id="selectorFormView" class="view" style="display: none;">
        <div style="padding: 20px; flex: 1;">
          <a class="back-link" id="backFromForm"><iconify-icon icon="mdi:arrow-left"></iconify-icon> Back to overview</a>
          <h3 style="margin-bottom: 16px; font-size: 16px;">Tag Feature</h3>
          <div class="selector-form">
            <div class="form-group">
              <label>Selector</label>
              <div class="selector-preview" id="selectorPreview">-</div>
            </div>
            <div class="form-group" id="elementInfoGroup" style="display: none;">
              <label>Element info</label>
              <div class="element-info" id="elementInfoContent"></div>
            </div>
            <div class="form-group">
              <label>Feature Name <span class="required">*</span></label>
              <input type="text" id="featureNameInput" placeholder="Enter feature name">
              <div class="error" id="featureNameError">Please enter a feature name.</div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-cancel" id="formCancelBtn">Cancel</button>
          <button class="btn btn-cancel" id="clearSelectionBtn">Clear Selection</button>
          <button class="btn btn-save" id="formSaveBtn">Save</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    function sendMessage(m) { window.parent.postMessage(m, '*'); }
    var FEATURES_STORAGE_KEY = 'designerTaggedFeatures';
    var HEATMAP_STORAGE_KEY = 'designerHeatmapEnabled';
    var currentSelector = '';
    var currentElementInfo = null;
    function getCurrentUrl() {
      try {
        var p = window.parent.location;
        return (p.host || p.hostname || '') + (p.pathname || '/') + (p.search || '') + (p.hash || '');
      } catch (e) { return window.location.href || ''; }
    }
    function normalizeUrl(u) {
      u = (u || '').replace(/^https?:\\/\\//i, '').replace(/\\/$/, '');
      return u || '';
    }
    function getTaggedFeatures() {
      try {
        var raw = localStorage.getItem(FEATURES_STORAGE_KEY) || '[]';
        return JSON.parse(raw);
      } catch (e) { return []; }
    }
    function getFeaturesForCurrentUrl() {
      var current = normalizeUrl(getCurrentUrl());
      return getTaggedFeatures().filter(function(f) { return f && normalizeUrl(f.url) === current; });
    }
    function refreshTaggedCount() {
      var count = getFeaturesForCurrentUrl().length;
      document.getElementById('taggedCount').textContent = String(count);
    }
    function showOverview() {
      document.getElementById('overviewView').style.display = 'block';
      document.getElementById('selectorFormView').style.display = 'none';
      currentSelector = '';
      currentElementInfo = null;
      document.getElementById('selectorPreview').textContent = '-';
      document.getElementById('elementInfoGroup').style.display = 'none';
      document.getElementById('featureNameInput').value = '';
      document.getElementById('featureNameError').classList.remove('show');
      refreshTaggedCount();
    }
    document.getElementById('minimizeBtn').addEventListener('click', function() { sendMessage({ type: 'CANCEL' }); });
    document.getElementById('tagFeatureBtn').addEventListener('click', function() {
      sendMessage({ type: 'TAG_FEATURE_CLICKED' });
    });
    document.getElementById('overviewClearSelectionBtn').addEventListener('click', function() {
      sendMessage({ type: 'CLEAR_SELECTION_CLICKED' });
    });
    document.getElementById('clearSelectionBtn').addEventListener('click', function() {
      sendMessage({ type: 'CLEAR_SELECTION_CLICKED' });
    });
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var t = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(function(x) { x.classList.remove('active'); });
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
        var panel = document.getElementById(t + 'Tab');
        if (panel) panel.classList.add('active');
      });
    });
    document.getElementById('heatmapToggle').addEventListener('click', function() {
      this.classList.toggle('active');
      var enabled = this.classList.contains('active');
      try { localStorage.setItem(HEATMAP_STORAGE_KEY, String(enabled)); } catch (e) {}
      sendMessage({ type: 'HEATMAP_TOGGLE', enabled: enabled });
    });
    document.getElementById('backFromForm').addEventListener('click', function() { showOverview(); });
    document.getElementById('formCancelBtn').addEventListener('click', function() { showOverview(); });
    document.getElementById('formSaveBtn').addEventListener('click', function() {
      var name = (document.getElementById('featureNameInput').value || '').trim();
      var err = document.getElementById('featureNameError');
      if (!name) { err.classList.add('show'); return; }
      err.classList.remove('show');
      sendMessage({
        type: 'SAVE_TAG_FEATURE',
        payload: {
          featureName: name,
          selector: currentSelector,
          elementInfo: currentElementInfo
        }
      });
    });
    window.addEventListener('message', function(event) {
      var d = event.data;
      if (!d) return;
      if (d.type === 'ELEMENT_SELECTED') {
        currentSelector = d.selector || '';
        currentElementInfo = d.elementInfo || null;
        document.getElementById('selectorPreview').textContent = currentSelector || '-';
        var infoEl = document.getElementById('elementInfoContent');
        var infoGroup = document.getElementById('elementInfoGroup');
        if (currentElementInfo) {
          var tag = currentElementInfo.tagName || '';
          var id = currentElementInfo.id || '';
          var cls = (currentElementInfo.className || (currentElementInfo.attributes && currentElementInfo.attributes.class)) || '';
          var text = (currentElementInfo.textContent || '').slice(0, 80);
          infoEl.innerHTML = 'Tag: ' + tag + (id ? ' | ID: ' + id : '') + (cls ? ' | Class: ' + cls : '') + (text ? ' | Text: ' + text : '');
          infoGroup.style.display = 'block';
        } else {
          infoGroup.style.display = 'none';
        }
        document.getElementById('featureNameInput').value = '';
        document.getElementById('featureNameError').classList.remove('show');
        document.getElementById('overviewView').style.display = 'none';
        document.getElementById('selectorFormView').style.display = 'flex';
      }
      if (d.type === 'CLEAR_SELECTION_ACK') {
        showOverview();
      }
      if (d.type === 'TAG_FEATURE_SAVED_ACK') {
        showOverview();
      }
    });
    window.addEventListener('load', function() {
      refreshTaggedCount();
      var heatmapEnabled = localStorage.getItem(HEATMAP_STORAGE_KEY) === 'true';
      var toggleEl = document.getElementById('heatmapToggle');
      if (heatmapEnabled && toggleEl) toggleEl.classList.add('active');
      sendMessage({ type: 'EDITOR_READY' });
    });
  <\/script>
</body>
</html>`}createDragHandle(){if(this.dragHandle)return;this.dragHandle=document.createElement("div"),this.dragHandle.id="designer-editor-drag-handle",this.dragHandle.style.cssText=`
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
    `;const e=document.createElement("div");e.style.cssText=`
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: grab;
      pointer-events: auto;
      padding: 6px 8px;
      border-radius: 6px;
      background: transparent;
      border: none;
      z-index: 1;
      transition: background 0.2s, border-color 0.2s;
    `,e.onmouseenter=()=>{e.style.background="transparent",e.style.border="none"},e.onmouseleave=()=>{e.style.background="transparent",e.style.border="none"};const t=document.createElement("iconify-icon");t.setAttribute("icon","pepicons-print:dots-x"),t.style.cssText="font-size: 18px; color: #64748b; pointer-events: none;",e.appendChild(t),this.dragHandle.appendChild(e),this.gripButton=e,e.addEventListener("mousedown",this.handleMouseDown,!0),document.addEventListener("mousemove",this.handleMouseMove,!0),document.addEventListener("mouseup",this.handleMouseUp,!0),window.addEventListener("mousemove",this.handleMouseMove,!0),window.addEventListener("mouseup",this.handleMouseUp,!0)}updateDragHandlePosition(){if(!this.iframe||!this.dragHandle)return;const e=this.iframe.getBoundingClientRect();this.dragHandle.style.top=`${e.top}px`,this.dragHandle.style.left=`${e.left}px`,this.dragHandle.style.width=`${e.width}px`}}const U="visual-designer-guides",C="1.0.0";class G{constructor(e=U){this.storageKey=e}getGuides(){try{const e=localStorage.getItem(this.storageKey);if(!e)return[];const t=JSON.parse(e);return t.version!==C?(console.warn("Storage version mismatch, clearing old data"),this.clear(),[]):t.guides||[]}catch(e){return console.error("Error reading guides from storage:",e),[]}}getGuidesByPage(e){return this.getGuides().filter(i=>i.page===e&&i.status==="active")}saveGuide(e){try{const t=this.getGuides(),i=t.findIndex(o=>o.id===e.id),n={...e,updatedAt:new Date().toISOString(),createdAt:e.createdAt||new Date().toISOString()};i>=0?t[i]=n:t.push(n),this.saveGuides(t)}catch(t){throw console.error("Error saving guide:",t),t}}deleteGuide(e){try{const i=this.getGuides().filter(n=>n.id!==e);this.saveGuides(i)}catch(t){throw console.error("Error deleting guide:",t),t}}saveGuides(e){const t={guides:e,version:C};try{localStorage.setItem(this.storageKey,JSON.stringify(t))}catch(i){throw console.error("Error writing to storage:",i),i}}clear(){try{localStorage.removeItem(this.storageKey)}catch(e){console.error("Error clearing storage:",e)}}getGuide(e){return this.getGuides().find(i=>i.id===e)||null}}const N="https://devgw.revgain.ai/rg-pex",T="designerIud";function R(){if(typeof window>"u")return null;try{return localStorage.getItem(T)}catch{return null}}function m(r){const e={"Content-Type":"application/json",...r},t=R();return t&&(e.iud=t),e}const v={baseUrl:N,async get(r,e){const t=r.startsWith("http")?r:`${this.baseUrl}${r.startsWith("/")?"":"/"}${r}`,i=await fetch(t,{...e,headers:{...m(),...e==null?void 0:e.headers}});if(!i.ok)throw new Error(`API error: ${i.status} ${i.statusText}`);return i.json()},async post(r,e,t){const i=r.startsWith("http")?r:`${this.baseUrl}${r.startsWith("/")?"":"/"}${r}`,n=await fetch(i,{method:"POST",...t,headers:{...m(),...t==null?void 0:t.headers},body:e!==void 0?JSON.stringify(e):void 0});if(!n.ok)throw new Error(`API error: ${n.status} ${n.statusText}`);return n.json()},async put(r,e,t){const i=r.startsWith("http")?r:`${this.baseUrl}${r.startsWith("/")?"":"/"}${r}`,n=await fetch(i,{method:"PUT",...t,headers:{...m(),...t==null?void 0:t.headers},body:e!==void 0?JSON.stringify(e):void 0});if(!n.ok)throw new Error(`API error: ${n.status} ${n.statusText}`);return n.json()},async delete(r,e){const t=r.startsWith("http")?r:`${this.baseUrl}${r.startsWith("/")?"":"/"}${r}`,i=await fetch(t,{method:"DELETE",...e,headers:{...m(),...e==null?void 0:e.headers}});if(!i.ok)throw new Error(`API error: ${i.status} ${i.statusText}`);return i.json()}};class y{constructor(e={}){this.heatmapEnabled=!1,this.isInitialized=!1,this.isEditorMode=!1,this.exitEditorButton=null,this.redBorderOverlay=null,this.studioBadge=null,this.loadingOverlay=null,this.config=e,this.storage=new G(e.storageKey),this.editorMode=new O,this.guideRenderer=new P,this.featureHeatmapRenderer=new z,this.editorFrame=new F}init(){if(this.isInitialized){console.warn("SDK already initialized");return}this.isInitialized=!0,this.injectMontserratFont(),this.injectIconifyScript();const e=this.shouldEnableEditorMode();console.log("[Visual Designer] init() called"),console.log("[Visual Designer] shouldEnableEditor:",e),console.log("[Visual Designer] localStorage designerMode:",localStorage.getItem("designerMode")),console.log("[Visual Designer] localStorage designerModeType:",localStorage.getItem("designerModeType")),console.log("[Visual Designer] __visualDesignerWasLaunched:",typeof window<"u"?window.__visualDesignerWasLaunched:"N/A"),e?(console.log("[Visual Designer] Enabling editor..."),this.showLoadingOverlay(),this.enableEditor()):(console.log("[Visual Designer] Not enabling editor, loading guides instead"),this.loadGuides()),this.heatmapEnabled=localStorage.getItem("designerHeatmapEnabled")==="true",this.renderFeatureHeatmap(),this.setupEventListeners()}enableEditor(){if(this.isEditorMode){console.log("[Visual Designer] Editor already enabled, skipping");return}console.log("[Visual Designer] enableEditor() called"),this.isEditorMode=!0;let e=typeof window<"u"?window.__visualDesignerMode:null;e||(e=localStorage.getItem("designerModeType")||null),console.log("[Visual Designer] Mode:",e),this.editorFrame.create(i=>this.handleEditorMessage(i),e);const t=e==="tag-page"||e==="tag-feature";t||this.editorMode.activate(i=>this.handleEditorMessage(i)),this.createExitEditorButton(),this.createRedBorderOverlay(),this.createStudioBadge(),localStorage.setItem("designerMode","true"),e&&localStorage.setItem("designerModeType",e),setTimeout(()=>{this.editorFrame.show(),this.hideLoadingOverlay()},t?100:300)}disableEditor(){this.isEditorMode&&(window.close(),this.isEditorMode=!1,this.editorMode.deactivate(),this.editorFrame.destroy(),this.removeExitEditorButton(),this.removeRedBorderOverlay(),this.removeStudioBadge(),this.featureHeatmapRenderer.destroy(),localStorage.removeItem("designerMode"),localStorage.removeItem("designerModeType"),this.hideLoadingOverlay(),this.loadGuides())}getGuides(){return this.storage.getGuides()}getGuidesForCurrentPage(){const e=b();return this.storage.getGuidesByPage(e)}saveGuide(e){const t={...e,id:S(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return this.storage.saveGuide(t),this.isEditorMode||this.loadGuides(),this.config.onGuideSaved&&this.config.onGuideSaved(t),t}deleteGuide(e){this.storage.deleteGuide(e),this.guideRenderer.dismissGuide(e)}loadGuides(){const e=this.storage.getGuides();this.guideRenderer.renderGuides(e)}shouldEnableEditorMode(){return this.config.editorMode!==void 0?(console.log("[Visual Designer] shouldEnableEditorMode: true (config override)"),this.config.editorMode):typeof window<"u"&&window.__visualDesignerWasLaunched?(console.log("[Visual Designer] shouldEnableEditorMode: true (wasLaunched flag)"),!0):localStorage.getItem("designerMode")==="true"?(console.log("[Visual Designer] shouldEnableEditorMode: true (localStorage)"),!0):(console.log("[Visual Designer] shouldEnableEditorMode: false"),!1)}handleEditorMessage(e){switch(e.type){case"ELEMENT_SELECTED":this.handleElementSelected(e);break;case"SAVE_GUIDE":this.handleSaveGuide(e);break;case"TAG_FEATURE_CLICKED":this.editorMode.activate(t=>this.handleEditorMessage(t));break;case"ACTIVATE_SELECTOR":this.editorMode.activate(t=>this.handleEditorMessage(t));break;case"CLEAR_SELECTION_CLICKED":this.editorMode.deactivate(),this.editorFrame.sendClearSelectionAck();break;case"SAVE_TAG_PAGE":this.handleSaveTagPage(e);break;case"SAVE_TAG_FEATURE":this.handleSaveTagFeature(e);break;case"HEATMAP_TOGGLE":this.handleHeatmapToggle(e.enabled);break;case"CANCEL":this.handleCancel();break;case"EXIT_EDITOR_MODE":this.handleExitEditorMode();break;case"EDITOR_READY":this.hideLoadingOverlay();break;default:console.warn("Unknown message type:",e)}}handleElementSelected(e){this.editorFrame.sendElementSelected(e)}handleSaveGuide(e){const t=this.saveGuide({...e.guide,page:b()});console.log("Guide saved:",t)}async handleSaveTagPage(e){const t=e.payload,i=typeof window<"u"?window.location.href:"",n=typeof window<"u"?`${window.location.hostname}${window.location.pathname}`:"";try{await v.post("/pages",{name:t.pageName,slug:n,description:t.description,status:"active"})}catch(a){console.warn("[Visual Designer] Failed to create page via API:",a),this.editorFrame.sendTagPageSavedAck();return}const o="designerTaggedPages";try{const a=localStorage.getItem(o)||"[]",s=JSON.parse(a);s.push({pageName:t.pageName,url:i}),localStorage.setItem(o,JSON.stringify(s))}catch(a){console.warn("[Visual Designer] Failed to persist tagged page:",a)}this.editorFrame.sendTagPageSavedAck()}handleSaveTagFeature(e){console.log("[Visual Designer] Tag feature saved:",e.payload);const t="designerTaggedFeatures",i=e.payload;if(!i.selector||!i.featureName){console.warn("[Visual Designer] Tag feature missing selector or featureName");return}try{const n=localStorage.getItem(t)||"[]",o=JSON.parse(n),a=typeof window<"u"?window.location.href:"",s={id:S(),featureName:i.featureName,selector:i.selector,url:a,elementInfo:i.elementInfo,createdAt:new Date().toISOString()};o.push(s),localStorage.setItem(t,JSON.stringify(o)),this.editorFrame.sendTagFeatureSavedAck(),this.renderFeatureHeatmap()}catch(n){console.warn("[Visual Designer] Failed to persist tagged feature:",n)}}handleHeatmapToggle(e){this.heatmapEnabled=e;try{localStorage.setItem("designerHeatmapEnabled",String(e))}catch{}this.renderFeatureHeatmap()}getTaggedFeatures(){try{const e=localStorage.getItem("designerTaggedFeatures")||"[]";return JSON.parse(e)}catch{return[]}}renderFeatureHeatmap(){const e=this.getTaggedFeatures();this.featureHeatmapRenderer.render(e,this.heatmapEnabled)}handleCancel(){this.editorFrame.hide()}handleExitEditorMode(){this.disableEditor()}setupEventListeners(){let e,t;const i=()=>{const o=this.storage.getGuides();this.guideRenderer.updatePositions(o)},n=()=>{const o=this.getTaggedFeatures();this.featureHeatmapRenderer.updatePositions(o)};window.addEventListener("resize",()=>{clearTimeout(e),e=window.setTimeout(()=>{i(),n()},100)}),window.addEventListener("scroll",()=>{clearTimeout(t),t=window.setTimeout(()=>{i(),n()},50)},!0)}isEditorModeActive(){return this.isEditorMode}injectMontserratFont(){if(typeof document>"u"||!document.head||document.getElementById("designer-montserrat-font"))return;const e=document.createElement("link");e.id="designer-montserrat-font",e.rel="stylesheet",e.href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",document.head.appendChild(e)}injectIconifyScript(){if(typeof document>"u"||!document.head||document.getElementById("designer-iconify-script"))return;const e=document.createElement("script");e.id="designer-iconify-script",e.src="https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js",e.async=!0,document.head.appendChild(e)}createExitEditorButton(){if(!this.exitEditorButton){if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.createExitEditorButton());return}setTimeout(()=>this.createExitEditorButton(),100);return}this.exitEditorButton=document.createElement("button"),this.exitEditorButton.id="designer-exit-editor-btn",this.exitEditorButton.innerHTML='<iconify-icon icon="mdi:exit-to-app" style="vertical-align:-0.2em;margin-right:6px;"></iconify-icon>Exit Editor',this.exitEditorButton.style.cssText=`
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
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
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
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0px 10px 3px;
      background: #3B82F6;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
      border-radius: 0 0 6px 6px;
      border: 5px solid #3B82F6;
      border-top: none;
      z-index: 1000001;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      pointer-events: none;
      white-space: nowrap;
    `,document.body.appendChild(this.studioBadge)}}removeStudioBadge(){this.studioBadge&&(this.studioBadge.remove(),this.studioBadge=null)}showLoadingOverlay(){if(this.loadingOverlay)return;if(!document.body){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>this.showLoadingOverlay());return}setTimeout(()=>this.showLoadingOverlay(),100);return}this.loadingOverlay=document.createElement("div"),this.loadingOverlay.id="designer-loading-overlay",this.loadingOverlay.style.cssText=`
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
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
    `;const e=document.createElement("div");e.style.cssText=`
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    `;const t=document.createElement("style");t.textContent=`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,document.head.appendChild(t);const i=document.createElement("div");i.textContent="Loading Visual Designer...",i.style.cssText=`
      color: #1e40af;
      font-size: 16px;
      font-weight: 500;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
    `,this.loadingOverlay.appendChild(e),this.loadingOverlay.appendChild(i),document.body.appendChild(this.loadingOverlay)}hideLoadingOverlay(){this.loadingOverlay&&(this.loadingOverlay.remove(),this.loadingOverlay=null)}}let d=null,B=!1;function h(r){return d||(d=new y(r),d.init(),d)}function x(){return d}function E(r){!r||!Array.isArray(r)||r.forEach(e=>{if(!e||!Array.isArray(e)||e.length===0)return;const t=e[0],i=e.slice(1);try{switch(t){case"initialize":{const n=i[0];h(n);break}case"identify":{const n=i[0];n&&console.log("[Visual Designer] identify (snippet) called with:",n);break}case"enableEditor":{(d??h()).enableEditor();break}case"disableEditor":{d&&d.disableEditor();break}case"loadGuides":{d&&d.loadGuides();break}case"getGuides":{if(d)return d.getGuides();break}default:console.warn("[Visual Designer] Unknown snippet method:",t)}}catch(n){console.error("[Visual Designer] Error processing queued call:",t,n)}})}if(typeof window<"u"){const r=window.visualDesigner;r&&Array.isArray(r._q)&&(B=!0,r.initialize=e=>{h(e)},r.identify=e=>{e&&console.log("[Visual Designer] identify (snippet) called with:",e)},r.enableEditor=()=>{(d??h()).enableEditor()},r.disableEditor=()=>{d&&d.disableEditor()},r.loadGuides=()=>{d&&d.loadGuides()},r.getGuides=()=>d?d.getGuides():void 0,r.getInstance=x,r.init=h,E(r._q));try{const e=new URL(window.location.href),t=e.searchParams.get("designer"),i=e.searchParams.get("mode"),n=e.searchParams.get("iud");if(t==="true"){i&&(window.__visualDesignerMode=i,localStorage.setItem("designerModeType",i)),localStorage.setItem("designerMode","true"),n&&localStorage.setItem(T,n),e.searchParams.delete("designer"),e.searchParams.delete("mode"),e.searchParams.delete("iud");const o=e.toString();window.history.replaceState({},"",o),window.__visualDesignerWasLaunched=!0}}catch{}}if(typeof window<"u"&&!d&&!B){const r=()=>{d||h()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r()}typeof window<"u"&&(window.VisualDesigner={init:h,initialize:h,getInstance:x,DesignerSDK:y,apiClient:v,_processQueue:E}),u.DesignerSDK=y,u._processQueue=E,u.apiClient=v,u.getInstance=x,u.init=h,Object.defineProperty(u,Symbol.toStringTag,{value:"Module"})});
