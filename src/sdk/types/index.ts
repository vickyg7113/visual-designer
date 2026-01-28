/**
 * Guide metadata structure
 */
export interface Guide {
  id: string;
  page: string;
  selector: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  targeting?: GuideTargeting;
  status: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Targeting rules for guides
 */
export interface GuideTargeting {
  role?: string;
  userId?: string;
  userSegment?: string;
  [key: string]: unknown;
}

/**
 * Storage structure
 */
export interface StorageData {
  guides: Guide[];
  version: string;
}

/**
 * Element information for editor
 */
export interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  attributes: Record<string, string>;
  boundingRect: DOMRect;
}

/**
 * Selector generation result
 */
export interface SelectorResult {
  selector: string;
  confidence: 'high' | 'medium' | 'low';
  method: string;
}

/**
 * Editor message types
 */
export type EditorMessageType =
  | 'ELEMENT_SELECTED'
  | 'SAVE_GUIDE'
  | 'CANCEL'
  | 'EDITOR_READY'
  | 'GUIDE_SAVED'
  | 'EXIT_EDITOR_MODE';

/**
 * Messages sent from SDK to Editor iframe
 */
export interface ElementSelectedMessage {
  type: 'ELEMENT_SELECTED';
  selector: string;
  elementInfo: ElementInfo;
}

/**
 * Messages sent from Editor iframe to SDK
 */
export interface SaveGuideMessage {
  type: 'SAVE_GUIDE';
  guide: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface CancelMessage {
  type: 'CANCEL';
}

export interface EditorReadyMessage {
  type: 'EDITOR_READY';
}

export interface GuideSavedMessage {
  type: 'GUIDE_SAVED';
  guideId: string;
}

export interface ExitEditorModeMessage {
  type: 'EXIT_EDITOR_MODE';
}

/**
 * Union type for all editor messages
 */
export type EditorMessage =
  | ElementSelectedMessage
  | SaveGuideMessage
  | CancelMessage
  | EditorReadyMessage
  | GuideSavedMessage
  | ExitEditorModeMessage;

/**
 * SDK configuration options
 */
export interface SDKConfig {
  storageKey?: string;
  editorMode?: boolean;
  apiEndpoint?: string;
  onGuideSaved?: (guide: Guide) => void;
  onGuideDismissed?: (guideId: string) => void;
}
