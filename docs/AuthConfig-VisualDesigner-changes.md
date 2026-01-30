# AuthConfig.tsx – Visual Designer initialization changes

Use these edits so Visual Designer is initialized **once after login** with the correct API. The SDK expects `init(config?)` (or `initialize(config?)`); optional user data can be passed in `config` for future use.

---

## 1. Replace `initializeVisualDesigner` with this version

**Replace your entire `initializeVisualDesigner` function** (the one that starts with `const initializeVisualDesigner = (userData: any) => {`) with:

```ts
/**
 * Initialize Visual Designer with user and account information.
 * Call once after login. SDK reads localStorage for ?designer=true and enables editor if set.
 * @param userData - User data from authentication (isAuthenticated)
 */
const initializeVisualDesigner = (userData: any) => {
  if (visualDesignerInitialized.current) {
    return;
  }

  const VD = (window as any).VisualDesigner;
  const vd = (window as any).visualDesigner;
  const api = VD || vd;
  if (!api) {
    return;
  }

  try {
    console.log("=== Visual Designer Initialization ===");
    console.log("userData (raw):", userData);

    const userId = userData.sub || userData.id || userData.email || 'unknown';
    const email = userData.email || userData.emailAddress;
    const firstName = userData.given_name || userData.firstName || userData.first_name;
    const lastName = userData.family_name || userData.lastName || userData.last_name;
    const accountId = userData.organizationId || userData.accountId || userData.realm || 'default';
    const accountName = userData.organizationName || userData.accountName || userData.realm || 'Default Account';

    const config = {
      id: userId,
      email,
      firstName,
      lastName,
      accountId,
      accountName,
    };
    console.log("Visual Designer config:", config);

    if (typeof api.init === 'function') {
      api.init(config);
    } else if (typeof api.initialize === 'function') {
      api.initialize(config);
    } else {
      console.warn('Visual Designer: init/initialize not found');
      return;
    }

    visualDesignerInitialized.current = true;
    console.log('✅ Visual Designer initialized successfully');
  } catch (error) {
    console.error('Error initializing Visual Designer:', error);
  }
};
```

---

## 2. How to call (based on your AuthConfig)

You already call `initializeVisualDesigner` from a `useEffect` when the user is authenticated. **Keep that call exactly as is** – only the implementation of `initializeVisualDesigner` changes (section 1).

### Where it’s called

In your `AuthConfig.tsx`, inside the same `useEffect` that runs when `isAuthenticated` changes:

```tsx
useEffect(() => {
  // Reset initialization flags when user logs out
  if (!isAuthenticated || (typeof isAuthenticated === 'object' && Object.keys(isAuthenticated).length === 0)) {
    pendoInitialized.current = false;
    visualDesignerInitialized.current = false;
    rgInitialized.current = false;

    const rg = (window as any).rg;
    if (rg && typeof rg.reset === 'function') {
      rg.reset();
    }
    return;
  }

  if (isAuthenticated) {
    initTelemetry();

    if (isAuthenticated && typeof isAuthenticated === 'object' && Object.keys(isAuthenticated).length > 0) {
      initializePendo(isAuthenticated);
      initializeVisualDesigner(isAuthenticated);  // ← call here (pass isAuthenticated as userData)
      initializeRG(isAuthenticated);
    }
  }
}, [isAuthenticated]);
```

### Call pattern

| When | What happens |
|------|-------------------------------|
| User logs in | `isAuthenticated` is set → `useEffect` runs → `initializeVisualDesigner(isAuthenticated)` runs once (guarded by `visualDesignerInitialized.current`). |
| User logs out | `isAuthenticated` is cleared → `useEffect` runs → `visualDesignerInitialized.current = false`; next login will init again. |

So you **don’t add a new call** – you keep calling `initializeVisualDesigner(isAuthenticated)` in that same `useEffect`; only the body of `initializeVisualDesigner` is replaced with the code in section 1.

---

## 3. What changed (summary)

| Before | After |
|--------|--------|
| Checked both `visualDesigner` and `VisualDesigner`, then branched on `initialize` vs `identify(userId, userDataPayload)` | Use `VisualDesigner` or `visualDesigner` and call **only** `init(config)` or `initialize(config)` |
| Fallback `identify(userId, userDataPayload)` (wrong signature for this SDK) | Removed; SDK is initialized with `init(config)` and reads `designerMode` from localStorage (set when launcher opens app with `?designer=true`) |
| Same ref guard and “init once after login” behavior | Kept; still guarded by `visualDesignerInitialized.current` and called from the same `useEffect` when `isAuthenticated` is set |

---

## 4. No other changes needed

- Keep calling `initializeVisualDesigner(isAuthenticated)` from your existing `useEffect` when `isAuthenticated` is set.
- Keep resetting `visualDesignerInitialized.current = false` on logout in the same `useEffect`.
- Ensure **index.html** loads the SDK via the Pendo-style snippet (no `VisualDesigner.init()` in HTML); only AuthConfig calls `init()` after login.

After these changes, when the user opens your app with `?designer=true&mode=guide` (from the launcher) and then logs in, the SDK will initialize and show the editor. If the user lands without that query, the SDK still initializes but does not enable the editor.
