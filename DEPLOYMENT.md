# Visual Designer SDK - CDN Deployment & Integration Guide

## Issues Fixed

✅ **DOM Readiness**: SDK now waits for `document.body` before appending elements  
✅ **Script Loading**: Proper handling of script execution timing

## Quick Integration (Fixed)

### Step 1: Use ONLY the UMD Build

**✅ CORRECT - Use this:**
```html
<!-- Load ONLY the UMD build -->
<script src="https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs"></script>
<script>
  VisualDesigner.init();
</script>
```

**❌ WRONG - Don't do this:**
```html
<!-- DON'T load both files -->
<script src="...visual-designer.js"></script>  <!-- ❌ ES module, needs type="module" -->
<script src="...visual-designer.umd.cjs"></script>
```

### Step 2: Place Script Before `</body>` OR Use `defer`

**Option A: Before closing `</body>` tag (Recommended)**
```html
<body>
  <!-- Your app content -->
  
  <!-- SDK at the end -->
  <script src="https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs"></script>
  <script>
    VisualDesigner.init();
  </script>
</body>
```

**Option B: In `<head>` with `defer`**
```html
<head>
  <script defer src="https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs"></script>
  <script>
    // This will run after DOM is ready due to defer
    document.addEventListener('DOMContentLoaded', () => {
      VisualDesigner.init();
    });
  </script>
</head>
```

## Complete Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your App</title>
</head>
<body>
  <!-- Your application content -->
  <h1>My Application</h1>
  <button id="my-button">Click Me</button>
  
  <!-- Visual Designer SDK -->
  <script src="https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs"></script>
  <script>
    // Initialize SDK
    VisualDesigner.init();
    
    // Optional: Enable editor mode programmatically
    // VisualDesigner.getInstance().enableEditor();
  </script>
</body>
</html>
```

## Pendo-style snippet (initialize after login)

Use this snippet when you load the SDK early but only call `initialize()` after the user logs in (e.g. in React `useEffect` when `isAuthenticated` is true). The snippet creates a stub (`window.visualDesigner`) that queues calls until the real script loads, then the SDK replaces the stub with real methods so later calls run immediately.

**Snippet (place before `</body>`):**
```html
<script>
  (function (cdnUrl) {
    (function (r, e, v, a, i) {
      var w, x, y, z, t;
      a = r[i] = r[i] || {};
      a._q = a._q || [];
      w = ["initialize", "identify", "enableEditor", "disableEditor", "loadGuides", "getGuides"];
      for (x = 0, y = w.length; x < y; ++x) {
        (function (m) {
          a[m] = a[m] || function () {
            a._q[m === w[0] ? "unshift" : "push"]([m].concat([].slice.call(arguments, 0)));
          };
        })(w[x]);
      }
      z = e.createElement(v);
      z.async = !0;
      z.src = cdnUrl || "https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs";
      z.onload = function() {
        setTimeout(function() {
          if (r.VisualDesigner && r.VisualDesigner._processQueue) {
            r.VisualDesigner._processQueue(a._q);
          }
        }, 100);
      };
      t = e.getElementsByTagName(v)[0];
      t.parentNode.insertBefore(z, t);
    })(window, document, "script", null, "visualDesigner");
  })("https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs");
</script>
```

**After login (e.g. in React):**
```javascript
const visualDesigner = window.visualDesigner || window.VisualDesigner;
if (visualDesigner && visualDesigner.initialize) {
  visualDesigner.initialize(userDataPayload);  // or VisualDesigner.init(userDataPayload)
}
```

When the launcher opens the target URL with `?designer=true&mode=guide`, the SDK stores `designerMode` and `designerModeType` in localStorage. After login, when you call `visualDesigner.initialize(userDataPayload)`, the SDK initializes and, if `designerMode` is in localStorage, enables the designer and shows the loading overlay, then the editor.

---

## Integration: index.html + AuthConfig.tsx (React, init after login)

Use this when your app has a login and you want the designer to appear only **after** the user is authenticated.

### 1. index.html – load the SDK (snippet only, no init)

In your app’s **index.html**, add this script **once**, e.g. before `</body>`. Replace `YOUR_CDN_BASE` with your deployed Visual Designer base URL (e.g. `https://vickyg7113.github.io/visual-designer` or your GitHub Pages URL for this repo).

```html
<!-- Visual Designer: load SDK; init is called from React after login -->
<script>
  (function (cdnUrl) {
    (function (r, e, v, a, i) {
      var w, x, y, z, t;
      a = r[i] = r[i] || {};
      a._q = a._q || [];
      w = ["initialize", "identify", "enableEditor", "disableEditor", "loadGuides", "getGuides"];
      for (x = 0, y = w.length; x < y; ++x) {
        (function (m) {
          a[m] = a[m] || function () {
            a._q[m === w[0] ? "unshift" : "push"]([m].concat([].slice.call(arguments, 0)));
          };
        })(w[x]);
      }
      z = e.createElement(v);
      z.async = !0;
      z.src = cdnUrl;
      z.onload = function() {
        setTimeout(function() {
          if (r.VisualDesigner && r.VisualDesigner._processQueue) {
            r.VisualDesigner._processQueue(a._q);
          }
        }, 100);
      };
      t = e.getElementsByTagName(v)[0];
      t.parentNode.insertBefore(z, t);
    })(window, document, "script", null, "visualDesigner");
  })("YOUR_CDN_BASE/cdn/visual-designer/v1/visual-designer.umd.cjs");
</script>
```

Example with a real base URL:

```html
})("https://vickyg7113.github.io/visual-designer/cdn/visual-designer/v1/visual-designer.umd.cjs");
```

Do **not** call `VisualDesigner.init()` in index.html; that happens in React after login.

### 2. AuthConfig.tsx – init only after login

After the user logs in, call `init()` (or `initialize()`) so the SDK starts and, if the page was opened with `?designer=true`, enables the editor.

```tsx
import { useEffect } from 'react';

// Your auth type (adjust to your app)
type User = {
  id: string;
  email?: string;
  // ...
};

export function AuthConfig({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth(); // your auth hook

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const VD = (window as any).VisualDesigner;
    if (!VD || typeof VD.init !== 'function') {
      return;
    }
    VD.init({ /* optional config */ });
    // Optional: pass user for future use
    // (window as any).visualDesigner?.identify?.(user);
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
```

If you already have a post-login callback (e.g. in a router or auth provider), call init there instead:

```tsx
function onLoginSuccess(user: User) {
  const VD = (window as any).VisualDesigner;
  if (VD?.init) VD.init({});
}
```

- **Before login:** The SDK script is loaded but **not** initialized → no editor on the login page.
- **After login:** `VD.init()` runs → SDK reads `designerMode` from localStorage (set when the launcher opened the app with `?designer=true`) and shows the editor if needed.

### 3. How changes are reflected (GitHub / CDN)

Your **app** loads the SDK from a URL (e.g. your visual-designer repo on GitHub Pages). That URL always points at whatever is **currently** in that repo.

| Step | What you do |
|------|-------------|
| 1. Change SDK | Edit code in the visual-designer repo (e.g. `src/sdk/`). |
| 2. Build UMD | In that repo run: `npm run build:sdk` (writes to `cdn/visual-designer/v1/visual-designer.umd.cjs`). |
| 3. Deploy CDN | Commit and push the updated `cdn/` folder to the visual-designer repo. If that repo is deployed to GitHub Pages, the new file is served at the same URL. |
| 4. Your app sees it | Your app’s index.html loads `.../visual-designer/v1/visual-designer.umd.cjs` from that URL. The **next** time a user loads your app (or after cache expires), the browser fetches the new file and your changes are live. |

So: **index.html** and **AuthConfig.tsx** stay the same; you only redeploy the **visual-designer** repo (with the new `cdn/` build). No change required in your app repo unless you switch CDN URL or add a new version path (e.g. `/v2/`) for cache busting.

---

## Enable Editor Mode

**Method 1: URL Parameter**
```
https://yourapp.com?designer=true
```

**Method 2: Programmatically**
```javascript
VisualDesigner.getInstance().enableEditor();
```

**Method 3: localStorage**
```javascript
localStorage.setItem('designerMode', 'true');
// Then reload the page
```

## File Types Explained

| File | Type | Usage |
|------|------|-------|
| `visual-designer.umd.cjs` | UMD (Universal Module Definition) | ✅ Use this for `<script>` tags |
| `visual-designer.js` | ES Module | Only use with `type="module"` |

## Troubleshooting

### Error: "Unexpected token 'export'"
- **Cause**: Loading `visual-designer.js` without `type="module"`
- **Fix**: Use `visual-designer.umd.cjs` instead

### Error: "Cannot read properties of null (reading 'appendChild')"
- **Cause**: Script running before DOM is ready
- **Fix**: Place script before `</body>` or use `defer` attribute

### SDK Not Loading
- Check browser console for CORS errors
- Verify the CDN URL is accessible
- Ensure you're using HTTPS (GitHub Pages provides this)

## Rebuild After Fixes

After pulling the fixes, rebuild the SDK:

```bash
npm run build:sdk
```

Then copy the new files to your `cdn/` folder and push to GitHub.

## Next Steps

1. ✅ Rebuild SDK: `npm run build:sdk`
2. ✅ Copy to `cdn/visual-designer/v1/`
3. ✅ Push to GitHub
4. ✅ Update your app to use ONLY `visual-designer.umd.cjs`
5. ✅ Place script before `</body>` tag
