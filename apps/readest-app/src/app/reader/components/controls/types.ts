import { Insets } from '@/types/misc';

/**
 * ActionState: raw inputs gathered from stores/hooks that determine control visibility.
 * Contains only facts, never derived booleans.
 */
export interface ActionState {
  // Hover / interaction
  hover: {
    hoveredBookKey: string | null;
    isDropdownOpen: boolean;
    bookKey: string;
  };

  // TTS state
  tts: {
    isActive: boolean; // TTS session exists (showIndicator)
    isPlaying: boolean;
    isPaused: boolean;
    ttsClientsInited: boolean;
    showTTSBar: boolean; // user preference: sticky bar enabled
    showBackToTTSLocation: boolean;
    showPanel: boolean; // TTS popup panel open
  };

  // User preferences (persisted ViewSettings)
  prefs: {
    showHeader: boolean;
    showFooter: boolean;
    showBarsOnScroll: boolean;
    showPaginationButtons: boolean;
    scrolled: boolean;
    vertical: boolean;
    rtl: boolean;
    isEink: boolean;
  };

  // Sidebar
  sidebar: {
    isVisible: boolean;
    isPinned: boolean;
  };

  // Layout / platform
  layout: {
    isMobile: boolean;
    hasRoundedWindow: boolean;
    hasSafeAreaInset: boolean;
    hasTrafficLight: boolean;
    gridInsets: Insets;
    screenInsets: Insets;
    safeAreaInsets: Insets | null;
    systemUIVisible: boolean;
    statusBarHeight: number;
  };
}

/**
 * ControlVisibility: flat set of booleans determining what is shown.
 * Derived from ActionState by deriveVisibility().
 */
export interface ControlVisibility {
  headerVisible: boolean;
  footerVisible: boolean;
  progressBarVisible: boolean;
  ttsIconVisible: boolean;
  ttsBarVisible: boolean;
  backToTTSVisible: boolean;
  pageNavButtonsVisible: boolean;
  sectionInfoVisible: boolean;
  ribbonVisible: boolean;
}

/**
 * TTS state subset passed from useTTSControl into useActionState.
 */
export interface TTSStateForControls {
  isActive: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  ttsClientsInited: boolean;
  showTTSBar: boolean;
  showBackToTTSLocation: boolean;
  showPanel: boolean;
}
