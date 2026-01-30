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
  }

  try {
    const url = new URL(window.location.href);
    const designerParam = url.searchParams.get('designer');
    const modeParam = url.searchParams.get('mode');

    if (designerParam === 'true') {
      // Capture mode before removing params
      if (modeParam) {
        (window as any).__visualDesignerMode = modeParam;
        // Also store in localStorage for persistence across page refreshes
        localStorage.setItem('designerModeType', modeParam);
      }

      // Store designerMode flag in localStorage so it persists even after login/refresh
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
// - Snippet mode: DO NOT auto-init based on localStorage (to prevent showing on login page)
//   Only auto-init if ?designer=true was in URL at script load time (wasLaunched flag)
//   When init() is explicitly called after login, it will check localStorage and enable editor
if (typeof window !== 'undefined' && !sdkInstance) {
  const wasLaunched = (window as any).__visualDesignerWasLaunched === true;

  // In snippet mode, only auto-init if URL had ?designer=true (not based on localStorage)
  // This prevents editor from showing on login page
  // After login, when init() is called explicitly, it will check localStorage and enable editor
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
}

// For UMD builds, expose globally
if (typeof window !== 'undefined') {
  (window as any).VisualDesigner = {
    init,
    getInstance,
    DesignerSDK,
    _processQueue,
  };
}
