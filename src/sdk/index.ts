import { DesignerSDK } from './core/DesignerSDK';
import { SDKConfig } from './types';
import { apiClient, IUD_STORAGE_KEY } from './api/client';

// Export main SDK class
export { DesignerSDK };

// Export API client instance (base URL: https://devgw.revgain.ai/rg-pex, iud header from localStorage)
export { apiClient };

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
    const designerIudParam = url.searchParams.get('iud');

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

      // Store designer IUD (designer_id and iud are the same; single key for API headers)
      if (designerIudParam) localStorage.setItem(IUD_STORAGE_KEY, designerIudParam);

      // Remove the parameters from the URL immediately so they never "stick"
      url.searchParams.delete('designer');
      url.searchParams.delete('mode');
      url.searchParams.delete('iud');
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
// - Normal case (no snippet): auto-init so editor works without explicit init().
// - Snippet mode: NEVER auto-init. Wait for explicit init() call after login.
//   This prevents the editor from showing on the login page. When the host app
//   calls init() after login, the SDK will check localStorage and enable the designer.
if (typeof window !== 'undefined' && !sdkInstance) {
  // In snippet mode, do NOT auto-init – editor must only show after init() is called (e.g. after login)
  if (!isSnippetMode) {
    const doInit = () => {
      if (!sdkInstance) {
        init();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doInit);
    } else {
      doInit();
    }
  }
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
    apiClient,
    _processQueue,
  };
}
