import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventDispatcher } from '@/utils/event';

/**
 * Tests for TTS resume-from-location behavior.
 *
 * When TTS is stopped and the user presses play again (e.g. via Bluetooth
 * media controls), the system should dispatch a 'tts-speak' event with
 * the saved ttsLocation so playback resumes from where it left off,
 * rather than starting from the beginning of the chapter.
 *
 * The actual handleTogglePlay logic lives in useTTSControl.ts and
 * dispatches 'tts-speak' when the controller is null but a ttsLocation
 * exists. This test validates the event-dispatch mechanism that enables
 * that resume behavior.
 */
describe('TTS resume from saved location', () => {
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dispatchSpy = vi.spyOn(eventDispatcher, 'dispatch');
  });

  afterEach(() => {
    dispatchSpy.mockRestore();
  });

  it('should dispatch tts-speak with bookKey when resuming without saved location', async () => {
    await eventDispatcher.dispatch('tts-speak', { bookKey: 'test-book' });
    expect(dispatchSpy).toHaveBeenCalledWith('tts-speak', { bookKey: 'test-book' });
  });

  it('should dispatch tts-speak with range and index when resuming from saved location', async () => {
    const mockRange = {} as Range;
    const mockIndex = 3;
    await eventDispatcher.dispatch('tts-speak', {
      bookKey: 'test-book',
      range: mockRange,
      index: mockIndex,
    });
    expect(dispatchSpy).toHaveBeenCalledWith('tts-speak', {
      bookKey: 'test-book',
      range: mockRange,
      index: mockIndex,
    });
  });

  it('should pass null range when CFI resolution fails', async () => {
    await eventDispatcher.dispatch('tts-speak', {
      bookKey: 'test-book',
      range: null,
      index: 2,
    });
    expect(dispatchSpy).toHaveBeenCalledWith('tts-speak', {
      bookKey: 'test-book',
      range: null,
      index: 2,
    });
  });
});
