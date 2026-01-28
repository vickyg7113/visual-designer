# Visual Designer SDK POC

A Pendo-like Visual Designer SDK that enables in-app guide creation and rendering.

## Features

- 🎨 Visual element selection in editor mode
- 📍 Stable selector generation
- 💬 Tooltip/guide rendering
- 🔒 Isolated editor UI via iframe
- 💾 localStorage-based persistence (API-ready)

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the demo application:

```bash
npm run dev
```

### Building

Build the SDK:

```bash
npm run build:sdk
```

Build the demo:

```bash
npm run build
```

## Usage

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the demo:**
   ```bash
   npm run dev
   ```
   This starts a development server at `http://localhost:3000`

3. **Enable Editor Mode:**
   - Click the "Editor Mode" button in the top-right corner, OR
   - Add `?designer=true` to the URL: `http://localhost:3000?designer=true`

4. **Create a Guide:**
   - With editor mode enabled, hover over any element to see it highlighted
   - Click on an element to select it
   - Fill in the guide content and choose placement (top/bottom/left/right)
   - Click "Save Guide"

5. **View Guides:**
   - Disable editor mode (click the toggle button again)
   - Your saved guides will appear as tooltips on the selected elements

### Integration Methods

#### Method 1: ES Modules (Recommended)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <!-- Your app content -->
  <button id="my-button">Click me</button>

  <!-- Load SDK -->
  <script type="module">
    import { init } from './dist/sdk/visual-designer.js';
    
    // Initialize SDK
    const sdk = init();
    
    // Optional: Enable editor mode programmatically
    // sdk.enableEditor();
  </script>
</body>
</html>
```

#### Method 2: UMD Build (Browser)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <!-- Your app content -->
  <button id="my-button">Click me</button>

  <!-- Load SDK -->
  <script src="./dist/sdk/visual-designer.umd.cjs"></script>
  <script>
    // SDK is available globally as VisualDesigner
    VisualDesigner.init();
    
    // Optional: Enable editor mode
    // VisualDesigner.getInstance().enableEditor();
  </script>
</body>
</html>
```

#### Method 3: TypeScript/ES6 Import

```typescript
import { init, DesignerSDK } from './sdk';

// Initialize with optional config
const sdk = init({
  storageKey: 'my-app-guides',
  editorMode: false, // Set to true to auto-enable editor
  onGuideSaved: (guide) => {
    console.log('Guide saved:', guide);
  },
  onGuideDismissed: (guideId) => {
    console.log('Guide dismissed:', guideId);
  }
});
```

### Enabling Editor Mode

There are three ways to enable editor mode:

1. **URL Query Parameter:**
   ```
   http://yoursite.com?designer=true
   ```

2. **localStorage:**
   ```javascript
   localStorage.setItem('designerMode', 'true');
   // Then reload the page
   ```

3. **Programmatically:**
   ```javascript
   const sdk = VisualDesigner.getInstance();
   sdk.enableEditor();
   ```

### API Reference

#### Initialization

```typescript
init(config?: SDKConfig): DesignerSDK
```

**Config Options:**
- `storageKey?: string` - Custom localStorage key (default: `'visual-designer-guides'`)
- `editorMode?: boolean` - Auto-enable editor mode (default: `false`)
- `onGuideSaved?: (guide: Guide) => void` - Callback when guide is saved
- `onGuideDismissed?: (guideId: string) => void` - Callback when guide is dismissed

#### Methods

```typescript
// Enable editor mode
sdk.enableEditor(): void

// Disable editor mode
sdk.disableEditor(): void

// Check if editor mode is active
sdk.isEditorModeActive(): boolean

// Get all guides
sdk.getGuides(): Guide[]

// Get guides for current page
sdk.getGuidesForCurrentPage(): Guide[]

// Save a guide programmatically
sdk.saveGuide(guideData: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>): Guide

// Delete a guide
sdk.deleteGuide(guideId: string): void

// Reload and render guides
sdk.loadGuides(): void
```

#### Guide Structure

```typescript
interface Guide {
  id: string;                    // Auto-generated UUID
  page: string;                   // Page path (e.g., '/dashboard')
  selector: string;              // CSS selector (e.g., '#my-button')
  content: string;               // Guide text content
  placement: 'top' | 'bottom' | 'left' | 'right';
  targeting?: GuideTargeting;    // Optional targeting rules
  status: 'active' | 'inactive' | 'draft';
  createdAt?: string;            // ISO timestamp
  updatedAt?: string;            // ISO timestamp
}
```

### Examples

#### Example 1: Create Guide Programmatically

```javascript
const sdk = VisualDesigner.getInstance();

const guide = sdk.saveGuide({
  page: '/dashboard',
  selector: '#create-button',
  content: 'Click here to create a new project',
  placement: 'right',
  status: 'active'
});

console.log('Created guide:', guide.id);
```

#### Example 2: List All Guides

```javascript
const sdk = VisualDesigner.getInstance();
const guides = sdk.getGuides();

guides.forEach(guide => {
  console.log(`${guide.id}: ${guide.content} on ${guide.page}`);
});
```

#### Example 3: Delete All Guides

```javascript
const sdk = VisualDesigner.getInstance();
const guides = sdk.getGuides();

guides.forEach(guide => {
  sdk.deleteGuide(guide.id);
});
```

#### Example 4: Conditional Editor Mode

```javascript
// Only enable editor mode for admin users
const sdk = init({
  editorMode: userRole === 'admin'
});
```

### Selector Priority

The SDK generates stable selectors in this priority order:

1. **ID attribute** - `#my-button` (highest confidence)
2. **data-testid** - `[data-testid="create-btn"]`
3. **Other data-* attributes** - `[data-id="123"]`
4. **ARIA attributes** - `[role="button"][aria-label="Create"]`
5. **DOM path** - `body > div > button:nth-of-type(2)`
6. **Tag selector** - `button` (lowest confidence, POC only)

### Storage

Guides are stored in `localStorage` by default. The storage structure is:

```json
{
  "guides": [
    {
      "id": "123-456-789",
      "page": "/dashboard",
      "selector": "#create-btn",
      "content": "Click to create",
      "placement": "right",
      "status": "active"
    }
  ],
  "version": "1.0.0"
}
```

**Note:** The storage layer is designed to be easily swapped with an API backend. Simply modify `src/sdk/utils/storage.ts` to use your API instead of localStorage.

## Troubleshooting

### Editor mode doesn't activate

- Check browser console for errors
- Ensure SDK is loaded before calling `init()`
- Try using the URL parameter: `?designer=true`
- Check if localStorage is available and not blocked

### Guides don't appear

- Verify editor mode is disabled (guides only show in non-editor mode)
- Check that guides are saved: `localStorage.getItem('visual-designer-guides')`
- Ensure the selector still matches an element on the page
- Check browser console for errors

### Selector doesn't work

- The element may have been removed or changed
- Try recreating the guide with a more stable selector (use `id` or `data-testid`)
- Check the selector in browser DevTools: `document.querySelector('your-selector')`

### Editor iframe doesn't load

- Check browser console for CORS or loading errors
- Ensure you're running from a web server (not `file://`)
- The editor HTML is embedded, so it should work in most cases

## Architecture

- **SDK Core** (`DesignerSDK`) - Main SDK class coordinating all components
- **Editor Mode** (`EditorMode`) - DOM instrumentation, element highlighting, click capture
- **Selector Engine** (`SelectorEngine`) - Generates stable, replayable CSS selectors
- **Guide Renderer** (`GuideRenderer`) - Renders tooltips/guides for end users
- **Editor Frame** (`EditorFrame`) - Manages isolated iframe UI for guide creation
- **Storage Layer** (`Storage`) - localStorage-based persistence (easily swappable for API)

## Development

### Project Structure

```
visual-designer/
├── src/
│   ├── sdk/              # SDK source code
│   │   ├── core/         # Core SDK classes
│   │   ├── editor/       # Editor UI (iframe)
│   │   ├── types/        # TypeScript definitions
│   │   └── utils/        # Utility functions
│   └── demo/             # Demo application
├── dist/                 # Build output
└── package.json
```

### Building

Build the SDK for distribution:
```bash
npm run build:sdk
```

Output files:
- `dist/sdk/visual-designer.js` - ES module build
- `dist/sdk/visual-designer.umd.cjs` - UMD build for browsers

Build the demo app:
```bash
npm run build
```

### Testing

1. Start dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Enable editor mode
4. Create guides on different pages
5. Disable editor mode to see guides render
6. Refresh page to verify persistence

## License

MIT
