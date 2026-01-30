# How SDK Injection Works & How UMD Build Is Generated

This document explains:
1. **How injection works** – how the SDK gets loaded and runs on a host page
2. **Why `visual-designer.umd.cjs` is used for injection**
3. **How source files become the UMD bundle**

---

## 1. How Injection Works

### What “injection” means here

**Injection** = loading the Visual Designer SDK into someone else’s page (e.g. your React app) so it can run there. The host page does this by including a `<script>` tag that loads the SDK file.

### Two ways the SDK is injected

#### A. Direct script tag (simplest)

```html
<script src="https://cdn.example.com/visual-designer/v1/visual-designer.umd.cjs"></script>
<script>
  VisualDesigner.init();
</script>
```

1. Browser fetches `visual-designer.umd.cjs`.
2. The script runs in the global scope.
3. The UMD wrapper (see below) attaches the SDK to `window.VisualDesigner`.
4. Your inline script calls `VisualDesigner.init()`.

So **injection** = one script tag loading the UMD file + your call to `init()`.

#### B. Pendo-style snippet (async injection)

```html
<script>
(function(){
  var v = window.visualDesigner = window.visualDesigner || {};
  v._q = v._q || [];
  v.initialize = function(){ v._q.unshift(['initialize'].concat([].slice.call(arguments))); };
  v.identify = function(){ v._q.push(['identify'].concat([].slice.call(arguments))); };
  // ... more methods

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://cdn.example.com/visual-designer/v1/visual-designer.umd.cjs';
  document.head.appendChild(s);
})();
</script>
```

1. A small **stub** runs first and creates `window.visualDesigner` with a queue `_q`.
2. Calls like `visualDesigner.initialize(config)` are stored in `_q` (they run later).
3. The stub creates a `<script>` tag and sets its `src` to the **same UMD file**.
4. When the UMD script loads and runs, it:
   - Defines the real SDK (e.g. `VisualDesigner`).
   - Checks for `window.visualDesigner._q` and runs `_processQueue(_q)` so earlier calls like `initialize` are applied.

So **injection** is still “load the UMD file via a script tag”; the snippet only changes *when* it’s loaded (async) and *how* early calls are handled (queue).

### Summary

- **Injection** = including the SDK in the page by loading it with a `<script src="...">` tag (or a script tag created in code, as in the snippet).
- The file that is loaded in both cases is **`visual-designer.umd.cjs`** (the UMD build).
- After load, the SDK is used via `VisualDesigner` (or the snippet’s `visualDesigner` + queue).

---

## 2. Why UMD and Why `visual-designer.umd.cjs`?

### What UMD is

**UMD** = Universal Module Definition. It’s a single file that can run in:

- Browsers (no module system) → attach to `window`
- AMD (e.g. RequireJS) → `define(...)`
- Node/CommonJS → `exports` / `module.exports`

So one file works with a plain `<script>` tag and with module loaders.

### Why the host page uses the UMD file for injection

When you inject with a **plain `<script>` tag** (no `type="module"`):

- The browser runs the script in “classic” mode.
- It does **not** understand `import`/`export`. So **ES module** files (like `visual-designer.js`) cannot be used directly in a `<script src="...">` tag unless you use `type="module"`, which has different loading and CORS behavior.
- The **UMD** build is written as a single, self-contained function that:
  - Uses no `import`/`export`.
  - Detects the environment and attaches the SDK to `window` (in the browser).
  - Exposes one global (e.g. `VisualDesigner`) so the host page can call `VisualDesigner.init()` right after the script loads.

So **UMD is what makes injection work** when you drop a single `<script src="...visual-designer.umd.cjs">` on the page.

### What the UMD wrapper looks like (conceptually)

The start of `visual-designer.umd.cjs` looks roughly like this:

```javascript
(function (global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    // Node/CommonJS
    factory(exports);
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define(["exports"], factory);
  } else {
    // Browser: attach to global (e.g. window)
    global = typeof globalThis !== "undefined" ? globalThis : global || self;
    factory(global.VisualDesigner = {});
  }
})(this, function (exports) {
  "use strict";
  // ... entire SDK code (DesignerSDK, init, getInstance, etc.) ...
  // It populates exports / window.VisualDesigner
});
```

So:

- **UMD** = this wrapper + the whole SDK bundled inside it.
- **`visual-designer.umd.cjs`** = the file that contains this. The `.cjs` extension is a convention for “CommonJS/UMD-style” script (not ES module).

So: **injection works because the UMD file is written for the browser and exposes `VisualDesigner` on `window`**, and the host page (or snippet) loads that one file.

---

## 3. How Our Source Files Generate `visual-designer.umd.cjs`

### Build command

From `package.json`:

```json
"build:sdk": "tsc && vite build --config vite.sdk.config.ts && copy ..."
```

So:

1. `tsc` type-checks the TypeScript.
2. `vite build --config vite.sdk.config.ts` produces the bundles (including UMD).
3. `copy` puts the built files into `cdn/visual-designer/v1/` (e.g. for deployment).

The file that matters for injection is the one copied from `dist/sdk/visual-designer.umd.cjs` → that’s the UMD build.

### Vite SDK config (`vite.sdk.config.ts`)

```ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sdk/index.ts'),  // Single entry
      name: 'VisualDesigner',                           // Global name in browser
      fileName: 'visual-designer',
      formats: ['es', 'umd'],                           // Builds both ES and UMD
    },
    outDir: 'dist/sdk',
    emptyOutDir: true,
    // ...
  },
});
```

- **Entry**: `src/sdk/index.ts` is the only entry. So **all code that ends up in the bundle is reachable from `index.ts`** (via imports).
- **Output**: Two formats:
  - **ES** → `dist/sdk/visual-designer.js` (for `import` in modern apps).
  - **UMD** → `dist/sdk/visual-designer.umd.cjs` (for script-tag injection).
- **Global name**: In the browser, the UMD build attaches to `window.VisualDesigner`.

So **the UMD file is generated from the same entry and the same dependency tree as the ES build**; only the wrapper and format differ.

### How source files get into the bundle

Everything flows from **one entry**:

```
src/sdk/index.ts
```

`index.ts` imports:

- `./core/DesignerSDK` → DesignerSDK, editor mode, guides, etc.
- `./types` → types (stripped or inlined in the bundle)

`DesignerSDK` and the rest of the core/editor/utils are imported from:

- `./core/DesignerSDK.ts`
- `./core/EditorMode.ts`
- `./core/GuideRenderer.ts`
- `./core/SelectorEngine.ts`
- `./editor/EditorFrame.ts`
- `./types/index.ts`
- `./utils/dom.ts`
- `./utils/storage.ts`
- etc.

Vite (with Rollup) does:

1. Start from `src/sdk/index.ts`.
2. Follow every `import` and include that file in the bundle.
3. Resolve and inline (or bundle) all dependencies.
4. For **UMD**, wrap the whole thing in the UMD IIFE and assign the result to `window.VisualDesigner`.
5. Write `dist/sdk/visual-designer.umd.cjs`.

So:

- **Actual files used** = everything reachable from `src/sdk/index.ts` (all SDK source under `src/sdk/` that is imported).
- **UMD file** = that same dependency graph, compiled and wrapped in the UMD wrapper.

No separate “injection” step: **injection is just loading this UMD file in a script tag**. The “injection-friendly” part is that the build format is UMD, so the browser can run it and get a global.

### Flow summary

```
Source files (TypeScript)
  src/sdk/index.ts          ← entry
  src/sdk/core/*.ts
  src/sdk/editor/*.ts
  src/sdk/types/*.ts
  src/sdk/utils/*.ts
         │
         ▼
  Vite (Rollup) lib build
  - One entry: index.ts
  - Tree-shake, bundle, minify
         │
         ├── ES format   → dist/sdk/visual-designer.js
         │
         └── UMD format  → dist/sdk/visual-designer.umd.cjs
                          (wrapper + same bundled code)
         │
         ▼
  Copy to cdn/.../v1/
  - visual-designer.js
  - visual-designer.umd.cjs   ← this one is used for injection
         │
         ▼
  Host page or snippet:
  <script src=".../visual-designer.umd.cjs"></script>
  → Script runs → window.VisualDesigner → init(), etc.
```

---

## 4. Short Answers

| Question | Answer |
|----------|--------|
| How does injection work? | You load the SDK with a `<script src="...visual-designer.umd.cjs">` tag. The script runs and sets `window.VisualDesigner`. You then call `VisualDesigner.init()` (or use the snippet, which loads the same file and replays queued calls). |
| Why UMD for injection? | Plain `<script>` tags don’t support ES modules. UMD is a single script that runs in the browser and attaches the SDK to `window`, so no `import`/`type="module"` is needed. |
| How is `visual-designer.umd.cjs` generated? | From the same source as the rest of the SDK: Vite builds from `src/sdk/index.ts`, bundles all imports into one file, and outputs it in UMD format (with the browser global `VisualDesigner`) as `visual-designer.umd.cjs`. |
| Which files produce the UMD? | Everything imported from `src/sdk/index.ts`: `DesignerSDK`, core, editor, types, utils — one dependency tree, one UMD file. |

This is how injection works and how the UMD file is produced from your actual source files.
