# Preact vs Current Implementation: Pros & Cons

A comparison of using **Preact** for the Visual Designer editor UI versus the **current inline HTML/CSS/JS** approach.

---

## Current Implementation

The editor UI (Guide form, Tag Page form, Tag Feature form) is built as **inline HTML strings** inside `EditorFrame.ts`. Each mode returns a full HTML document via `getEditorHtmlContent()`, `getTagPageHtmlContent()`, and `getTagFeatureHtmlContent()`. The HTML is converted to a blob URL and loaded into an iframe.

### Pros

| Aspect | Benefit |
|--------|---------|
| **Zero dependencies** | No React/Preact runtime. The editor is pure HTML, CSS, and vanilla JS. |
| **Single bundle** | Everything ships in the main SDK UMD bundle. No separate build step for the editor. |
| **Small bundle size** | ~20–30KB for the editor HTML/JS. No framework overhead. |
| **Simple build** | One Vite config, one output. No extra tooling. |
| **Self-contained** | Editor HTML is fully isolated in an iframe. No external script loads at runtime. |
| **Fast load** | Blob URL loads instantly. No network request for editor assets. |
| **Works everywhere** | Works in any environment: UMD, ES modules, snippet injection. |
| **No hydration** | No SSR/hydration concerns. Straightforward imperative DOM updates. |

### Cons

| Aspect | Drawback |
|--------|----------|
| **Hard to maintain** | Large template strings are hard to read, refactor, and debug. |
| **No component reuse** | Shared UI (header, buttons, form groups) is copy-pasted across modes. |
| **No TypeScript in editor** | Editor logic is inline JS strings. No type checking, autocomplete, or refactoring support. |
| **Manual DOM updates** | All updates are manual (`innerHTML`, `style.display`, etc.). Easy to introduce bugs. |
| **No dev tools** | No React/Preact DevTools. Harder to inspect component tree and state. |
| **String escaping** | Dynamic content (e.g. page names) requires `escapeHtml()`. Risk of XSS if missed. |
| **Testing** | Hard to unit test. Would need to parse HTML or run in a real DOM. |
| **Styling** | CSS is inline in strings. No CSS modules, variables, or scoping. Duplication across modes. |

---

## Preact Implementation

The editor UI would be built as **Preact components**. There are two approaches:

### Option A: Two Builds (Separate Editor App)
The editor is a separate app, built to a single HTML file (or HTML + JS) and loaded into the iframe. Communication with the parent would still use `postMessage`.

### Option B: Single Build (Recommended)
Preact and the editor components are **bundled into the main SDK**. One build, one output. EditorFrame creates an iframe with minimal HTML (`srcdoc` or blob), then uses `preact.render()` to mount the Preact app into the iframe's document. No separate editor build.

### Pros

| Aspect | Benefit |
|--------|---------|
| **Component-based** | Reusable components (Header, FormGroup, Button, etc.). Clear structure and composition. |
| **TypeScript** | Full type safety, autocomplete, and refactoring for editor logic. |
| **Small runtime** | Preact is ~3KB min+gzip. Much smaller than React (~40KB). |
| **React-like API** | Hooks, JSX, familiar patterns. Easy to hire for or switch to React later. |
| **DevTools** | Preact DevTools for inspecting component tree and state. |
| **Declarative UI** | State changes drive re-renders. Less manual DOM manipulation. |
| **Easier testing** | Components can be unit tested with testing-library, jsdom, etc. |
| **Better styling** | Can use CSS modules, CSS-in-JS, or Tailwind. Scoped styles, no duplication. |
| **Maintainability** | Clear file structure. Easier to add features, fix bugs, and onboard developers. |
| **Ecosystem** | Can use Preact-compatible libraries (routing, forms, etc.) if needed. |

### Cons

| Aspect | Drawback |
|--------|----------|
| **Bundle size increase** | Adds ~3KB (Preact) + any component code. Current: ~25KB → With Preact: ~35–45KB. |
| **Learning curve** | Team needs to know Preact/React if they don’t already. |
| **Framework lock-in** | Tied to Preact. Migration to another framework would require a rewrite. |
| **Hydration not needed** | We don’t need SSR, so Preact’s SSR features add complexity we won’t use. |

*With **single build** (Option B), there is no extra build step or two outputs.*

---

## Side-by-Side Summary

| Criteria | Current (Inline HTML) | Preact |
|----------|------------------------|--------|
| **Bundle size** | Smaller (~25KB editor) | Larger (~35–45KB editor) |
| **Dependencies** | None | Preact (~3KB) |
| **Build** | Single build | Single build (Option B) or two builds (Option A) |
| **Maintainability** | Low | High |
| **TypeScript** | No (in editor) | Yes |
| **Testing** | Hard | Easier |
| **Component reuse** | No | Yes |
| **Dev experience** | Basic | Better (DevTools, hot reload) |
| **Risk of bugs** | Higher (manual DOM) | Lower (declarative) |
| **Onboarding** | Simple | Requires Preact knowledge |

---

## Recommendation

- **Stay with current implementation** if:
  - Bundle size is critical
  - The editor is stable and rarely changes
  - The team prefers minimal dependencies and a single build

- **Move to Preact** if:
  - You plan to add more editor features or modes
  - Maintainability and developer experience matter
  - You want TypeScript and tests for the editor
  - The extra ~10–20KB is acceptable

Preact is a good fit when you want React-like DX with minimal size impact.

---

## Single Build with Preact: How It Works

You can use Preact with **one build** by bundling everything into the main SDK:

### Architecture

1. **Preact + editor components** are part of the SDK source (e.g. `src/sdk/editor/components/`).
2. **EditorFrame** imports the Preact app and renders it into the iframe:
   - Creates iframe with `srcdoc="<html><body><div id='root'></div></body></html>"`
   - Waits for iframe load
   - Calls `preact.render(<EditorApp mode={mode} />, iframe.contentDocument.getElementById('root'))`
3. **One Vite build** bundles SDK + Preact + editor components → single `visual-designer.js` / `visual-designer.umd.cjs`.

### Build Setup

```json
// package.json - add Preact
"dependencies": {
  "preact": "^10.x"
},
"devDependencies": {
  "@preactjs/plugin-vite": "^4.x"  // for JSX/TSX
}
```

```ts
// vite.sdk.config.ts - add Preact plugin
import preact from '@preactjs/plugin-vite';

export default defineConfig({
  plugins: [preact()],
  // ... rest unchanged
});
```

### Key Points

- **Single entry**: `src/sdk/index.ts` → everything is tree-shaken into one bundle.
- **Iframe rendering**: `preact.render()` accepts a container from any document. Use `iframe.contentDocument.getElementById('root')`.
- **Styles**: Import CSS in components; Vite bundles it. Inject into iframe via a `<style>` tag or use CSS-in-JS (e.g. goober ~2KB).
- **postMessage**: Same as current. Preact components call `window.parent.postMessage()`.
