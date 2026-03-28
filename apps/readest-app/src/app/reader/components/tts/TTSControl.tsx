import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTTSControl } from '@/app/reader/hooks/useTTSControl';

interface TTSControlProps {
  bookKey: string;
  tts?: ReturnType<typeof useTTSControl>;
  isBackToTTSVisible: boolean;
}

const TTSControl: React.FC<TTSControlProps> = ({ tts, isBackToTTSVisible }) => {
  const _ = useTranslation();
  const { safeAreaInsets } = useThemeStore();

  const backButtonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shouldMountBackButton, setShouldMountBackButton] = useState(false);
  const [isBackButtonVisible, setIsBackButtonVisible] = useState(false);

  useEffect(() => {
    if (isBackToTTSVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (!tts) return null;

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
    </>
  );
};

export default TTSControl;
