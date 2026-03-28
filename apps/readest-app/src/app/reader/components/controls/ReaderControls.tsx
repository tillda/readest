import clsx from 'clsx';
import React, { useState, useCallback } from 'react';
import { FaHeadphones } from 'react-icons/fa6';
import { Insets } from '@/types/misc';
import { PageInfo } from '@/types/book';
import { useActionState } from './useActionState';
import { deriveVisibility } from './deriveVisibility';
import { TTSStateForControls } from './types';
import { useTTSControl } from '../../hooks/useTTSControl';
import { useReaderStore } from '@/store/readerStore';
import { useTranslation } from '@/hooks/useTranslation';
import { eventDispatcher } from '@/utils/event';
import HeaderBar from '../HeaderBar';
import FooterBar from '../footerbar/FooterBar';
import ProgressBar from '../ProgressBar';
import SectionInfo from '../SectionInfo';
import PageNavigationButtons from '../PageNavigationButtons';
import TTSControl from '../tts/TTSControl';
import TTSBar from '../tts/TTSBar';
import { RSVPControl } from '../rsvp';
import Ribbon from '../Ribbon';
import Button from '@/components/Button';

interface ReaderControlsProps {
  bookKey: string;
  bookTitle: string;
  bookFormat: string;
  isTopLeft: boolean;
  isBookmarked: boolean;
  horizontalGapPercent: number;
  gridInsets: Insets;
  screenInsets: Insets;
  contentInsets: Insets;
  bookKeysCount: number;
  section?: PageInfo;
  pageinfo?: PageInfo;
  sectionLabel?: string;
  showDoubleBorder: boolean;
  isScrolled: boolean;
  isVertical: boolean;
  isEink: boolean;
  onCloseBook: (bookKey: string) => void;
  onGoToLibrary: () => void;
}

const ReaderControls: React.FC<ReaderControlsProps> = ({
  bookKey,
  bookTitle,
  bookFormat,
  isTopLeft,
  isBookmarked,
  horizontalGapPercent,
  gridInsets,
  screenInsets,
  contentInsets,
  bookKeysCount,
  section,
  pageinfo,
  sectionLabel,
  showDoubleBorder,
  isScrolled,
  isVertical,
  isEink,
  onCloseBook,
  onGoToLibrary,
}) => {
  const _ = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { getView, getViewState, getProgress } = useReaderStore();

  const tts = useTTSControl({
    bookKey,
    onRequestHidePanel: () => {},
  });

  const ttsStateForControls: TTSStateForControls = {
    isActive: tts.showIndicator,
    isPlaying: tts.isPlaying,
    isPaused: tts.isPaused,
    ttsClientsInited: tts.ttsClientsInited,
    showTTSBar: tts.showTTSBar,
    showBackToTTSLocation: tts.showBackToCurrentTTSLocation,
  };

  const actionState = useActionState({
    bookKey,
    gridInsets,
    screenInsets,
    isDropdownOpen: dropdownOpen,
    ttsState: ttsStateForControls,
  });

  const visibility = deriveVisibility(actionState);

  const view = getView(bookKey);
  const viewState = getViewState(bookKey);
  const progress = getProgress(bookKey);

  const handleSpeakText = useCallback(() => {
    if (!view || !progress || !viewState) return;
    const eventType = viewState.ttsEnabled ? 'tts-stop' : 'tts-speak';
    eventDispatcher.dispatch(eventType, { bookKey });
  }, [view, progress, viewState, bookKey]);

  return (
    <>
      {/* Controls outside the grid (unique positioning) */}
      {isBookmarked && visibility.ribbonVisible && <Ribbon width={`${horizontalGapPercent}%`} />}
      <PageNavigationButtons
        bookKey={bookKey}
        isDropdownOpen={dropdownOpen}
        isVisible={visibility.pageNavButtonsVisible}
      />
      {visibility.progressBarVisible && (
        <ProgressBar
          bookKey={bookKey}
          horizontalGap={horizontalGapPercent}
          contentInsets={contentInsets}
          gridInsets={gridInsets}
        />
      )}

      {/* 4-row overlay grid above reading content */}
      <div className='pointer-events-none absolute inset-0 z-20 flex flex-col'>
        {/* === TOP ROW === */}
        <HeaderBar
          bookKey={bookKey}
          gridInsets={gridInsets}
          screenInsets={screenInsets}
          bookTitle={bookTitle}
          isTopLeft={isTopLeft}
          isHoveredAnim={bookKeysCount > 2}
          isVisible={visibility.headerVisible}
          onCloseBook={onCloseBook}
          onGoToLibrary={onGoToLibrary}
          onDropdownOpenChange={(isOpen) => setDropdownOpen(isOpen)}
        />

        {/* === TOP 2ND ROW === */}
        {visibility.sectionInfoVisible && (
          <SectionInfo
            bookKey={bookKey}
            section={sectionLabel}
            showDoubleBorder={showDoubleBorder}
            isScrolled={isScrolled}
            isVertical={isVertical}
            isEink={isEink}
            horizontalGap={horizontalGapPercent}
            contentInsets={contentInsets}
            gridInsets={gridInsets}
            isVisible={visibility.sectionInfoVisible}
          />
        )}

        {/* BackToTTSLocation button (absolute top-0, stays in grid for z-context) */}
        <TTSControl bookKey={bookKey} tts={tts} isBackToTTSVisible={visibility.backToTTSVisible} />

        {/* Spacer — reading area, clicks pass through */}
        <div className='flex-1' />

        {/* === BOTTOM 2ND ROW — audio controls === */}
        {visibility.ttsBarVisible && (
          <div className={clsx('pointer-events-auto flex items-center justify-between')}>
            <div /> {/* left: empty */}
            <div>
              {' '}
              {/* center: TTS player */}
              <TTSBar
                bookKey={bookKey}
                isPlaying={tts.isPlaying}
                onBackward={tts.handleBackward}
                onTogglePlay={tts.handleTogglePlay}
                onForward={tts.handleForward}
                isVisible={true}
              />
            </div>
            <div className='px-4'>
              {' '}
              {/* right: headphones */}
              <Button
                icon={<FaHeadphones className={viewState?.ttsEnabled ? 'text-blue-500' : ''} />}
                onClick={handleSpeakText}
                label={_('Speak')}
              />
            </div>
          </div>
        )}

        {/* === BOTTOM ROW — footer === */}
        <FooterBar
          bookKey={bookKey}
          bookFormat={bookFormat}
          section={section}
          pageinfo={pageinfo}
          isHoveredAnim={false}
          gridInsets={gridInsets}
          isVisible={visibility.footerVisible}
        />
      </div>

      <RSVPControl bookKey={bookKey} gridInsets={gridInsets} />
    </>
  );
};

export default ReaderControls;
