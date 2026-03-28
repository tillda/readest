import { ActionState, ControlVisibility } from './types';

/**
 * Active mode: all controls visible all the time for experimentation.
 * This is the default function used by ReaderControls.
 */
export function deriveVisibility(_state: ActionState): ControlVisibility {
  return {
    headerVisible: true,
    footerVisible: true,
    progressBarVisible: true,
    ttsIconVisible: true,
    ttsBarVisible: true,
    backToTTSVisible: true,
    pageNavButtonsVisible: true,
    sectionInfoVisible: true,
    ribbonVisible: true,
  };
}

/**
 * Original logic preserved for future use.
 * Switch by replacing deriveVisibility call in ReaderControls with deriveVisibilityOriginal.
 *
 * Original behavior:
 * - Header/footer only visible on hover (hoveredBookKey === bookKey) or dropdown open
 * - In scroll mode, bars hidden unless showBarsOnScroll is true
 * - TTSBar uses inverted logic: visible when NOT hovering (hoveredBookKey !== bookKey)
 * - TTSIcon visible when TTS active or panel open
 * - PageNavButtons visible on hover + user pref
 * - SectionInfo visible on hover
 * - Ribbon visible when NOT hovering
 */
export function deriveVisibilityOriginal(state: ActionState): ControlVisibility {
  const controlsActive =
    state.hover.hoveredBookKey === state.hover.bookKey || state.hover.isDropdownOpen;

  const barsEnabled = state.prefs.scrolled ? state.prefs.showBarsOnScroll : true;

  return {
    headerVisible: controlsActive && state.prefs.showHeader && barsEnabled,
    footerVisible: controlsActive && state.prefs.showFooter && barsEnabled,
    progressBarVisible: state.prefs.showFooter && barsEnabled,
    ttsIconVisible: state.tts.showPanel || state.tts.isActive,
    ttsBarVisible:
      state.tts.isActive && state.tts.showTTSBar && state.tts.ttsClientsInited && !controlsActive,
    backToTTSVisible: state.tts.showBackToTTSLocation,
    pageNavButtonsVisible: controlsActive && state.prefs.showPaginationButtons,
    sectionInfoVisible: controlsActive,
    ribbonVisible: !controlsActive,
  };
}
