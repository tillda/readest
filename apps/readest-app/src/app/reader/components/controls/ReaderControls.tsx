import React, { useState } from 'react';
import { Insets } from '@/types/misc';
import { PageInfo } from '@/types/book';
import { useActionState } from './useActionState';
import { deriveVisibility } from './deriveVisibility';
import { TTSStateForControls } from './types';
import { useTTSControl } from '../../hooks/useTTSControl';
import HeaderBar from '../HeaderBar';
import FooterBar from '../footerbar/FooterBar';
import ProgressBar from '../ProgressBar';
import SectionInfo from '../SectionInfo';
import PageNavigationButtons from '../PageNavigationButtons';
import TTSControl from '../tts/TTSControl';
import { RSVPControl } from '../rsvp';
import Ribbon from '../Ribbon';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTTSPanel, setShowTTSPanel] = useState(false);

  const tts = useTTSControl({
    bookKey,
    onRequestHidePanel: () => setShowTTSPanel(false),
  });

  const ttsStateForControls: TTSStateForControls = {
    isActive: tts.showIndicator,
    isPlaying: tts.isPlaying,
    isPaused: tts.isPaused,
    ttsClientsInited: tts.ttsClientsInited,
    showTTSBar: tts.showTTSBar,
    showBackToTTSLocation: tts.showBackToCurrentTTSLocation,
    showPanel: showTTSPanel,
  };

  const actionState = useActionState({
    bookKey,
    gridInsets,
    screenInsets,
    isDropdownOpen: dropdownOpen,
    ttsState: ttsStateForControls,
  });

  const visibility = deriveVisibility(actionState);

  return (
    <>
      {isBookmarked && visibility.ribbonVisible && <Ribbon width={`${horizontalGapPercent}%`} />}
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
      <PageNavigationButtons
        bookKey={bookKey}
        isDropdownOpen={dropdownOpen}
        isVisible={visibility.pageNavButtonsVisible}
      />
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
      {visibility.progressBarVisible && (
        <ProgressBar
          bookKey={bookKey}
          horizontalGap={horizontalGapPercent}
          contentInsets={contentInsets}
          gridInsets={gridInsets}
        />
      )}
      <FooterBar
        bookKey={bookKey}
        bookFormat={bookFormat}
        section={section}
        pageinfo={pageinfo}
        isHoveredAnim={false}
        gridInsets={gridInsets}
        isVisible={visibility.footerVisible}
      />
      <TTSControl
        bookKey={bookKey}
        gridInsets={gridInsets}
        tts={tts}
        showPanel={showTTSPanel}
        setShowPanel={setShowTTSPanel}
        isIconVisible={visibility.ttsIconVisible}
        isBarVisible={visibility.ttsBarVisible}
        isBackToTTSVisible={visibility.backToTTSVisible}
      />
      <RSVPControl bookKey={bookKey} gridInsets={gridInsets} />
    </>
  );
};

export default ReaderControls;
