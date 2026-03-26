import { describe, it, expect } from 'vitest';
import { collapseMarksForParagraphMode } from '@/utils/ssml';
import { TTSMark } from '@/services/tts/types';

describe('collapseMarksForParagraphMode', () => {
  it('should collapse multiple marks into a single mark', () => {
    const marks: TTSMark[] = [
      { offset: 0, name: '0', text: 'Hello. ', language: 'en' },
      { offset: 7, name: '1', text: 'World.', language: 'en' },
    ];
    const result = collapseMarksForParagraphMode(marks);
    expect(result).toHaveLength(1);
    expect(result[0]!.text).toBe('Hello. World.');
    expect(result[0]!.name).toBe('0');
    expect(result[0]!.language).toBe('en');
    expect(result[0]!.offset).toBe(0);
  });

  it('should return empty array for empty input', () => {
    expect(collapseMarksForParagraphMode([])).toEqual([]);
  });

  it('should return single mark unchanged', () => {
    const marks: TTSMark[] = [{ offset: 0, name: '0', text: 'Hello.', language: 'en' }];
    const result = collapseMarksForParagraphMode(marks);
    expect(result).toHaveLength(1);
    expect(result[0]!.text).toBe('Hello.');
  });

  it('should use first mark language for mixed-language paragraphs', () => {
    const marks: TTSMark[] = [
      { offset: 0, name: '0', text: 'Hello. ', language: 'en' },
      { offset: 7, name: '1', text: 'Bonjour.', language: 'fr' },
    ];
    const result = collapseMarksForParagraphMode(marks);
    expect(result).toHaveLength(1);
    expect(result[0]!.language).toBe('en');
    expect(result[0]!.text).toBe('Hello. Bonjour.');
  });

  it('should preserve first mark name', () => {
    const marks: TTSMark[] = [
      { offset: 5, name: '3', text: 'First. ', language: 'en' },
      { offset: 12, name: '4', text: 'Second. ', language: 'en' },
      { offset: 20, name: '5', text: 'Third.', language: 'en' },
    ];
    const result = collapseMarksForParagraphMode(marks);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('3');
    expect(result[0]!.text).toBe('First. Second. Third.');
  });
});
