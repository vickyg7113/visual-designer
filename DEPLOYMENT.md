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
