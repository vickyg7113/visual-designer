import { DesignerSDK } from './core/DesignerSDK';
import { SDKConfig } from './types';

// Export main SDK class
export { DesignerSDK };

// Export types
export type { Guide, SDKConfig, GuideTargeting } from './types';

// Global instance
let sdkInstance: DesignerSDK | null = null;

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

// Auto-initialize if script is loaded directly (only if not already initialized)
// This allows manual initialization with config if needed
if (typeof window !== 'undefined' && !sdkInstance) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!sdkInstance) {
        init();
      }
    });
  } else {
    if (!sdkInstance) {
      init();
    }
  }
}

// For UMD builds, expose globally
if (typeof window !== 'undefined') {
  (window as any).VisualDesigner = {
    init,
    getInstance,
    DesignerSDK,
  };
}
