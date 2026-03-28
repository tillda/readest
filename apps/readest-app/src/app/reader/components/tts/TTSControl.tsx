import clsx from 'clsx';
import React, { useRef, useEffect, useState } from 'react';
import { useEnv } from '@/context/EnvContext';
import { useThemeStore } from '@/store/themeStore';
import { useReaderStore } from '@/store/readerStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { useTTSControl } from '@/app/reader/hooks/useTTSControl';
import { getPopupPosition, Position } from '@/utils/sel';
import { Insets } from '@/types/misc';
import { Overlay } from '@/components/Overlay';
import Popup from '@/components/Popup';
import TTSPanel from './TTSPanel';
import TTSIcon from './TTSIcon';
import TTSBar from './TTSBar';

const POPUP_WIDTH = 282;
const POPUP_HEIGHT = 160;
const POPUP_PADDING = 10;

/**
 * Props shared by both managed and standalone modes.
 */
interface TTSControlBaseProps {
  bookKey: string;
  gridInsets: Insets;
}

/**
 * When externally managed by ReaderControls, tts object and visibility props are provided.
 */
interface TTSControlManagedProps extends TTSControlBaseProps {
  tts: ReturnType<typeof useTTSControl>;
  showPanel: boolean;
  setShowPanel: (show: boolean) => void;
  isIconVisible: boolean;
  isBarVisible: boolean;
  isBackToTTSVisible: boolean;
}

/**
 * Standalone mode: TTSControl manages its own useTTSControl hook.
 */
interface TTSControlStandaloneProps extends TTSControlBaseProps {
  tts?: undefined;
  showPanel?: undefined;
  setShowPanel?: undefined;
  isIconVisible?: undefined;
  isBarVisible?: undefined;
  isBackToTTSVisible?: undefined;
}

type TTSControlProps = TTSControlManagedProps | TTSControlStandaloneProps;

/**
 * Inner component that renders TTS UI. Does NOT call useTTSControl.
 * Receives all TTS state/handlers via props.
 */
const TTSControlInner: React.FC<{
  bookKey: string;
  gridInsets: Insets;
  tts: ReturnType<typeof useTTSControl>;
  showPanel: boolean;
  setShowPanel: (show: boolean) => void;
  isIconVisible: boolean;
  isBarVisible: boolean;
  isBackToTTSVisible: boolean;
}> = ({
  bookKey,
  gridInsets,
  tts,
  showPanel,
  setShowPanel,
  isIconVisible,
  isBarVisible,
  isBackToTTSVisible,
}) => {
  const _ = useTranslation();
  const { appService } = useEnv();
  const { safeAreaInsets } = useThemeStore();
  const { hoveredBookKey, getViewSettings } = useReaderStore();

  const viewSettings = getViewSettings(bookKey);

  const [panelPosition, setPanelPosition] = useState<Position>();
  const [trianglePosition, setTrianglePosition] = useState<Position>();

  const iconRef = useRef<HTMLDivElement>(null);
  const backButtonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [shouldMountBackButton, setShouldMountBackButton] = useState(false);
  const [isBackButtonVisible, setIsBackButtonVisible] = useState(false);

  const popupPadding = useResponsiveSize(POPUP_PADDING);
  const maxWidth = window.innerWidth - 2 * popupPadding;
  const popupWidth = Math.min(maxWidth, useResponsiveSize(POPUP_WIDTH));
  const popupHeight = useResponsiveSize(POPUP_HEIGHT);

  // Back button mount/unmount animation
  useEffect(() => {
    if (isBackToTTSVisible) {
      setShouldMountBackButton(true);
      const fadeInTimeout = setTimeout(() => {
        setIsBackButtonVisible(true);
      }, 10);
      return () => clearTimeout(fadeInTimeout);
    } else {
      setIsBackButtonVisible(false);
      if (backButtonTimeoutRef.current) {
        clearTimeout(backButtonTimeoutRef.current);
      }
      backButtonTimeoutRef.current = setTimeout(() => {
        setShouldMountBackButton(false);
      }, 300);
      return;
    }
  }, [isBackToTTSVisible]);

  // Panel resize observer
  useEffect(() => {
    if (!iconRef.current || !showPanel) return;
    const parentElement = iconRef.current.parentElement;
    if (!parentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updatePanelPosition();
    });
    resizeObserver.observe(parentElement);
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPanel]);

  // Close panel when TTS bar is toggled on
  useEffect(() => {
    if (tts.showTTSBar) {
      setShowPanel(false);
    }
  }, [tts.showTTSBar, setShowPanel]);

  const updatePanelPosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const parentRect =
        iconRef.current.parentElement?.getBoundingClientRect() ||
        document.documentElement.getBoundingClientRect();

      const trianglePos = {
        dir: 'up',
        point: { x: rect.left + rect.width / 2 - parentRect.left, y: rect.top - 12 },
      } as Position;

      const popupPos = getPopupPosition(
        trianglePos,
        parentRect,
        popupWidth,
        popupHeight,
        popupPadding,
      );

      setPanelPosition(popupPos);
      setTrianglePosition(trianglePos);
    }
  };

  const togglePopup = () => {
    updatePanelPosition();
    if (!showPanel && tts.isTTSActive) {
      tts.refreshTtsLang();
    }
    setShowPanel(!showPanel);
  };

  const handleDismissPopup = () => {
    setShowPanel(false);
  };

  return (
    <>
      {shouldMountBackButton && (
        <div
          className={clsx(
            'absolute left-1/2 top-0 z-50 -translate-x-1/2',
            'transition-opacity duration-300',
            isBackButtonVisible ? 'opacity-100' : 'opacity-0',
            safeAreaInsets?.top ? '' : 'py-1',
          )}
          style={{
            top: `${safeAreaInsets?.top || 0}px`,
          }}
        >
          <button
            onClick={tts.handleBackToCurrentTTSLocation}
            className={clsx(
              'not-eink:bg-base-300 eink-bordered rounded-full px-4 py-2 font-sans text-sm shadow-lg',
              safeAreaInsets?.top ? 'h-11' : 'h-9',
            )}
          >
            {_('Back to TTS Location')}
          </button>
        </div>
      )}
      {showPanel && <Overlay onDismiss={handleDismissPopup} />}
      {isIconVisible && (
        <div
          ref={iconRef}
          className={clsx(
            'absolute h-12 w-12',
            'transition-transform duration-300',
            viewSettings?.rtl ? 'left-8' : 'right-6',
            !appService?.hasSafeAreaInset && 'bottom-[70px] sm:bottom-14',
          )}
          style={{
            bottom: appService?.hasSafeAreaInset
              ? `calc(env(safe-area-inset-bottom, 0px) * ${appService?.isIOSApp ? 0.33 : 1} + ${hoveredBookKey ? 70 : 52}px)`
              : undefined,
          }}
        >
          <TTSIcon
            isPlaying={tts.isPlaying}
            ttsInited={tts.ttsClientsInited}
            onClick={togglePopup}
          />
        </div>
      )}
      {showPanel && panelPosition && trianglePosition && tts.ttsClientsInited && (
        <Popup
          width={popupWidth}
          height={popupHeight}
          position={panelPosition}
          trianglePosition={trianglePosition}
          className='bg-base-200 flex shadow-lg'
          onDismiss={handleDismissPopup}
        >
          <TTSPanel
            bookKey={bookKey}
            ttsLang={tts.ttsLang}
            isPlaying={tts.isPlaying}
            timeoutOption={tts.timeoutOption}
            timeoutTimestamp={tts.timeoutTimestamp}
            onTogglePlay={tts.handleTogglePlay}
            onBackward={tts.handleBackward}
            onForward={tts.handleForward}
            onSetRate={tts.handleSetRate}
            onGetVoices={tts.handleGetVoices}
            onSetVoice={tts.handleSetVoice}
            onGetVoiceId={tts.handleGetVoiceId}
            onSelectTimeout={tts.handleSelectTimeout}
            onToogleTTSBar={tts.handleToggleTTSBar}
          />
        </Popup>
      )}
      {isBarVisible && (
        <TTSBar
          bookKey={bookKey}
          isPlaying={tts.isPlaying}
          onBackward={tts.handleBackward}
          onTogglePlay={tts.handleTogglePlay}
          onForward={tts.handleForward}
          gridInsets={gridInsets}
          isVisible={true}
        />
      )}
    </>
  );
};

/**
 * TTSControl: when `tts` prop is provided (managed mode from ReaderControls),
 * renders directly. When not provided (standalone/legacy mode), calls useTTSControl
 * internally and computes visibility using the original hover-based logic.
 */
const TTSControl: React.FC<TTSControlProps> = (props) => {
  if (props.tts !== undefined) {
    // Managed mode: tts and visibility provided by ReaderControls
    return <TTSControlInner {...props} />;
  }

  // Standalone mode: manage our own TTS hook
  return <TTSControlStandalone bookKey={props.bookKey} gridInsets={props.gridInsets} />;
};

/**
 * Standalone wrapper that calls useTTSControl and computes visibility using original logic.
 */
const TTSControlStandalone: React.FC<TTSControlBaseProps> = ({ bookKey, gridInsets }) => {
  const { hoveredBookKey } = useReaderStore();

  const [showPanel, setShowPanel] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showIndicatorWithinTimeout, setShowIndicatorWithinTimeout] = useState(true);

  const tts = useTTSControl({
    bookKey,
    onRequestHidePanel: () => setShowPanel(false),
  });

  // Original hover timeout logic for indicator visibility
  useEffect(() => {
    if (hoveredBookKey) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      const showTimeout = setTimeout(() => {
        setShowIndicatorWithinTimeout(true);
      }, 100);
      hoverTimeoutRef.current = showTimeout;
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      const hideTimeout = setTimeout(() => {
        setShowIndicatorWithinTimeout(false);
      }, 5000);
      hoverTimeoutRef.current = hideTimeout;
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hoveredBookKey]);

  const isIconVisible = showPanel || (tts.showIndicator && showIndicatorWithinTimeout);
  const isBarVisible = tts.showIndicator && tts.showTTSBar && tts.ttsClientsInited;
  const isBackToTTSVisible = tts.showBackToCurrentTTSLocation;

  return (
    <TTSControlInner
      bookKey={bookKey}
      gridInsets={gridInsets}
      tts={tts}
      showPanel={showPanel}
      setShowPanel={setShowPanel}
      isIconVisible={isIconVisible}
      isBarVisible={isBarVisible}
      isBackToTTSVisible={isBackToTTSVisible}
    />
  );
};

export default TTSControl;
