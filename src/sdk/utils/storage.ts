import { Guide, StorageData } from '../types';

const DEFAULT_STORAGE_KEY = 'visual-designer-guides';
const STORAGE_VERSION = '1.0.0';

/**
 * Storage abstraction layer
 * Currently uses localStorage, but structured for easy API migration
 */
export class Storage {
  private storageKey: string;

  constructor(storageKey: string = DEFAULT_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  /**
   * Get all guides from storage
   */
  getGuides(): Guide[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }

      const parsed: StorageData = JSON.parse(data);
      
      // Validate version (for future migrations)
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, clearing old data');
        this.clear();
        return [];
      }

      return parsed.guides || [];
    } catch (error) {
      console.error('Error reading guides from storage:', error);
      return [];
    }
  }

  /**
   * Get guides for a specific page
   */
  getGuidesByPage(page: string): Guide[] {
    const guides = this.getGuides();
    return guides.filter(guide => guide.page === page && guide.status === 'active');
  }

  /**
   * Save a guide
   */
  saveGuide(guide: Guide): void {
    try {
      const guides = this.getGuides();
      const existingIndex = guides.findIndex(g => g.id === guide.id);

      const updatedGuide: Guide = {
        ...guide,
        updatedAt: new Date().toISOString(),
        createdAt: guide.createdAt || new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        guides[existingIndex] = updatedGuide;
      } else {
        guides.push(updatedGuide);
      }

      this.saveGuides(guides);
    } catch (error) {
      console.error('Error saving guide:', error);
      throw error;
    }
  }

  /**
   * Delete a guide
   */
  deleteGuide(guideId: string): void {
    try {
      const guides = this.getGuides();
      const filtered = guides.filter(g => g.id !== guideId);
      this.saveGuides(filtered);
    } catch (error) {
      console.error('Error deleting guide:', error);
      throw error;
    }
  }

  /**
   * Save all guides to storage
   */
  private saveGuides(guides: Guide[]): void {
    const data: StorageData = {
      guides,
      version: STORAGE_VERSION,
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to storage:', error);
      throw error;
    }
  }

  /**
   * Clear all guides
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get a specific guide by ID
   */
  getGuide(guideId: string): Guide | null {
    const guides = this.getGuides();
    return guides.find(g => g.id === guideId) || null;
  }
}
