import { init } from '../sdk/index';

// Simple router
class Router {
  private currentRoute: string = '/';

  init(): void {
    // Get initial route
    this.currentRoute = window.location.pathname || '/';
    this.render();

    // Handle navigation
    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = (e.target as HTMLElement).getAttribute('data-route') || '/';
        this.navigate(route);
      });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.currentRoute = window.location.pathname || '/';
      this.render();
    });
  }

  navigate(route: string): void {
    this.currentRoute = route;
    window.history.pushState({}, '', route);
    this.render();
  }

  render(): void {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      (page as HTMLElement).classList.remove('active');
    });

    // Show current page
    const pageMap: Record<string, string> = {
      '/': 'dashboard',
      '/settings': 'settings',
      '/profile': 'profile',
    };

    const pageId = pageMap[this.currentRoute] || 'dashboard';
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-route') === this.currentRoute) {
        link.classList.add('active');
      }
    });

    // Reload guides when route changes
    const sdk = (window as any).VisualDesigner?.getInstance();
    if (sdk) {
      sdk.loadGuides();
    }
  }
}

// Initialize router
const router = new Router();
router.init();

// Initialize SDK
const sdk = init();

// Editor toggle
const editorToggle = document.getElementById('editorToggle') as HTMLButtonElement;
if (editorToggle) {
  editorToggle.addEventListener('click', () => {
    const isEditorMode = sdk.isEditorModeActive();
    
    if (isEditorMode) {
      sdk.disableEditor();
      editorToggle.textContent = 'Editor Mode: OFF';
      editorToggle.classList.remove('active');
    } else {
      sdk.enableEditor();
      editorToggle.textContent = 'Editor Mode: ON';
      editorToggle.classList.add('active');
    }
  });

  // Update toggle state on load
  if (sdk.isEditorModeActive()) {
    editorToggle.textContent = 'Editor Mode: ON';
    editorToggle.classList.add('active');
  }
}

// Demo button handlers
document.getElementById('createBtn')?.addEventListener('click', () => {
  alert('Create button clicked!');
});

document.getElementById('saveSettings')?.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Settings saved!');
});

document.getElementById('editProfile')?.addEventListener('click', () => {
  alert('Edit profile clicked!');
});

document.getElementById('changePassword')?.addEventListener('click', () => {
  alert('Change password clicked!');
});

document.getElementById('deleteAccount')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete your account?')) {
    alert('Account deletion requested');
  }
});

console.log('Demo app initialized');
console.log('Add ?designer=true to URL or click "Editor Mode" to enable editor');
