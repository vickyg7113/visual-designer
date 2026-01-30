import { DesignerSDK } from './core/DesignerSDK';
import { SDKConfig } from './types';

// Export main SDK class
export { DesignerSDK };

// Export types
export type { Guide, SDKConfig, GuideTargeting } from './types';

// Global instance
let sdkInstance: DesignerSDK | null = null;
let isSnippetMode = false;

/**
 * Initialize the SDK globally
 */
export function init(config?: SDKConfig): DesignerSDK {
  if (sdkInstance) {
    return sdkInstance;
  }

  sdkInstance = new DesignerSDK(config);
  sdkInstance.init();
  return sdkInstance;
}

/**
 * Get the SDK instance
 */
export function getInstance(): DesignerSDK | null {
  return sdkInstance;
}

/**
 * Process queued calls from the snippet pattern (Pendo-style)
 * Supports: initialize, identify, enableEditor, disableEditor, loadGuides, getGuides
 */
export function _processQueue(queue: any[]): void {
  if (!queue || !Array.isArray(queue)) {
    return;
  }

  queue.forEach((call) => {
    if (!call || !Array.isArray(call) || call.length === 0) {
      return;
    }

    const method = call[0];
    const args = call.slice(1);

    try {
      switch (method) {
        case 'initialize': {
          const config: SDKConfig | undefined = args[0];
          init(config);
          break;
        }
        case 'identify': {
          // For now we just log; you can wire this into SDKConfig later if needed
          const user = args[0];
          if (user) {
            // eslint-disable-next-line no-console
            console.log('[Visual Designer] identify (snippet) called with:', user);
          }
          break;
        }
        case 'enableEditor': {
          const sdk = sdkInstance ?? init();
          sdk.enableEditor();
          break;
        }
        case 'disableEditor': {
          if (sdkInstance) {
            sdkInstance.disableEditor();
          }
          break;
        }
        case 'loadGuides': {
          if (sdkInstance) {
            sdkInstance.loadGuides();
          }
          break;
        }
        case 'getGuides': {
          if (sdkInstance) {
            return sdkInstance.getGuides();
          }
          break;
        }
        default: {
          // eslint-disable-next-line no-console
          console.warn('[Visual Designer] Unknown snippet method:', method);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Visual Designer] Error processing queued call:', method, error);
    }
  });
}

// Detect if snippet pattern is being used (window.visualDesigner with _q queue)
// Also, if ?designer=true is present at script load time, remove it from the URL
// and mark a flag so the SDK can still enable editor mode later.
if (typeof window !== 'undefined') {
  const globalVD = (window as any).visualDesigner;
  if (globalVD && Array.isArray(globalVD._q)) {
    isSnippetMode = true;
    // Mutate the EXISTING stub object so that any reference the host app holds
    // (e.g. const v = window.visualDesigner at mount) gets real methods.
    // Replacing with a new object would leave stale references still calling the old stub.
    globalVD.initialize = (config?: SDKConfig | Record<string, unknown>) => {
      init(config as SDKConfig);
    };
    globalVD.identify = (user: unknown) => {
      if (user) {
        console.log('[Visual Designer] identify (snippet) called with:', user);
      }
    };
    globalVD.enableEditor = () => {
      (sdkInstance ?? init()).enableEditor();
    };
    globalVD.disableEditor = () => {
      if (sdkInstance) sdkInstance.disableEditor();
    };
    globalVD.loadGuides = () => {
      if (sdkInstance) sdkInstance.loadGuides();
    };
    globalVD.getGuides = () => {
      return sdkInstance ? sdkInstance.getGuides() : undefined;
    };
    globalVD.getInstance = getInstance;
    globalVD.init = init;
    // Process any calls that were queued BEFORE this script loaded
    _processQueue(globalVD._q);
  }

  try {
    const url = new URL(window.location.href);
    const designerParam = url.searchParams.get('designer');
    const modeParam = url.searchParams.get('mode');

    if (designerParam === 'true') {
      // Capture mode before removing params
      if (modeParam) {
        (window as any).__visualDesignerMode = modeParam;
        // Store mode in localStorage for persistence (Pendo-style: store intent before login)
        // This allows the designer to be enabled after login when init() is called
        localStorage.setItem('designerModeType', modeParam);
      }

      // Store designerMode flag in localStorage (Pendo-style: store intent before login)
      localStorage.setItem('designerMode', 'true');

      // Remove the parameters from the URL immediately so they never "stick"
      url.searchParams.delete('designer');
      url.searchParams.delete('mode');
      const cleanUrl = url.toString();
      window.history.replaceState({}, '', cleanUrl);

      // Set a flag so DesignerSDK.can still know that designer=true was present
      (window as any).__visualDesignerWasLaunched = true;
    }
  } catch {
    // ignore URL parsing errors
  }
}

// Auto-initialize rules:
// - Normal case (no snippet): auto-init as before
// - Snippet mode: DO NOT auto-init normally, BUT
//   if the page was launched via ?designer=true (flag set in __visualDesignerWasLaunched),
//   OR if designerMode exists in localStorage (stored intent from previous launch),
//   we auto-init so editor comes up even if the host app doesn't explicitly call initialize().
//   NOTE: In snippet mode, the host app should call init() after login, which will check localStorage.
if (typeof window !== 'undefined' && !sdkInstance) {
  const wasLaunched = (window as any).__visualDesignerWasLaunched === true;
  // Check localStorage for stored designerMode (Pendo-style: stored intent)
  const hasDesignerMode = typeof localStorage !== 'undefined' && localStorage.getItem('designerMode') === 'true';

  // Auto-init if:
  // 1. Not in snippet mode (normal case), OR
  // 2. Was launched via URL params (wasLaunched flag), OR
  // 3. Has designerMode in localStorage (stored intent - but only if not in snippet mode to avoid showing on login page)
  if (!isSnippetMode || wasLaunched) {
    const doInit = () => {
      if (!sdkInstance && (!isSnippetMode || wasLaunched)) {
        init();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doInit);
    } else {
      doInit();
    }
  }
  // In snippet mode, if localStorage has designerMode but wasLaunched is false,
  // we DON'T auto-init here - we wait for explicit init() call after login
  // This prevents showing designer on login page
}

// For UMD builds, expose globally
// initialize() is an alias for init() so host apps can call either
// visualDesigner.initialize(userData) or VisualDesigner.initialize(userData)
if (typeof window !== 'undefined') {
  (window as any).VisualDesigner = {
    init,
    initialize: init,
    getInstance,
    DesignerSDK,
    _processQueue,
  };
}
