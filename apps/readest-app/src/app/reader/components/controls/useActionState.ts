import { useMemo } from 'react';
import { Insets } from '@/types/misc';
import { useEnv } from '@/context/EnvContext';
import { useReaderStore } from '@/store/readerStore';
import { useThemeStore } from '@/store/themeStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { ActionState, TTSStateForControls } from './types';

interface UseActionStateParams {
  bookKey: string;
  gridInsets: Insets;
  screenInsets: Insets;
  isDropdownOpen: boolean;
  ttsState: TTSStateForControls;
}

export function useActionState({
  bookKey,
  gridInsets,
  screenInsets,
  isDropdownOpen,
  ttsState,
}: UseActionStateParams): ActionState {
  const { appService } = useEnv();
  const { hoveredBookKey, getViewSettings } = useReaderStore();
  const { isSideBarVisible, isSideBarPinned } = useSidebarStore();
  const { systemUIVisible, statusBarHeight, safeAreaInsets } = useThemeStore();
  const viewSettings = getViewSettings(bookKey);

  return useMemo(
    (): ActionState => ({
      hover: {
        hoveredBookKey,
        isDropdownOpen,
        bookKey,
      },
      tts: {
        isActive: ttsState.isActive,
        isPlaying: ttsState.isPlaying,
        isPaused: ttsState.isPaused,
        ttsClientsInited: ttsState.ttsClientsInited,
        showTTSBar: ttsState.showTTSBar,
        showBackToTTSLocation: ttsState.showBackToTTSLocation,
      },
      prefs: {
        showHeader: viewSettings?.showHeader ?? true,
        showFooter: viewSettings?.showFooter ?? true,
        showBarsOnScroll: viewSettings?.showBarsOnScroll ?? false,
        showPaginationButtons: viewSettings?.showPaginationButtons ?? false,
        scrolled: viewSettings?.scrolled ?? false,
        vertical: viewSettings?.vertical ?? false,
        rtl: viewSettings?.rtl ?? false,
        isEink: viewSettings?.isEink ?? false,
      },
      sidebar: {
        isVisible: isSideBarVisible,
        isPinned: isSideBarPinned,
      },
      layout: {
        isMobile: appService?.isMobile || window.innerWidth < 640,
        hasRoundedWindow: !!appService?.hasRoundedWindow,
        hasSafeAreaInset: !!appService?.hasSafeAreaInset,
        hasTrafficLight: !!appService?.hasTrafficLight,
        gridInsets,
        screenInsets,
        safeAreaInsets,
        systemUIVisible,
        statusBarHeight,
      },
    }),
    [
      hoveredBookKey,
      isDropdownOpen,
      bookKey,
      ttsState,
      viewSettings,
      isSideBarVisible,
      isSideBarPinned,
      appService,
      gridInsets,
      screenInsets,
      safeAreaInsets,
      systemUIVisible,
      statusBarHeight,
    ],
  );
}
