import { describe, it, expect } from 'vitest';
import { calculatePageSplitFraction } from '@/utils/ttsPageSplit';

type MockRendererOptions = {
  scrolled?: boolean;
  sideProp?: 'width' | 'height';
};

function createMockRenderer(opts: MockRendererOptions = {}) {
  return {
    scrolled: opts.scrolled ?? false,
    sideProp: opts.sideProp ?? ('width' as const),
    // Other properties required by the type but not used by our function
    scrollLocked: false,
    size: 0,
    viewSize: 0,
    start: 0,
    end: 0,
    page: 0,
    pages: 1,
    atStart: true,
    atEnd: false,
    containerPosition: 0,
    setAttribute: () => {},
    removeAttribute: () => {},
    next: async () => {},
    prev: async () => {},
    primaryIndex: 0,
    getContents: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

type MockRect = { x: number; y: number; width: number; height: number };

function createMockRange(rects: MockRect[], viewportWidth = 800, viewportHeight = 600) {
  const mockDocElement = {
    clientWidth: viewportWidth,
    clientHeight: viewportHeight,
  };

  return {
    getClientRects: () => {
      const list = rects.map((r) => ({
        ...r,
        top: r.y,
        left: r.x,
        right: r.x + r.width,
        bottom: r.y + r.height,
        toJSON: () => ({}),
      }));
      return {
        length: list.length,
        item: (i: number) => list[i] ?? null,
        [Symbol.iterator]: () => list[Symbol.iterator](),
      };
    },
    startContainer: {
      ownerDocument: {
        documentElement: mockDocElement,
      },
    },
  } as unknown as Range;
}

describe('calculatePageSplitFraction', () => {
  it('returns null in scrolled mode', () => {
    const renderer = createMockRenderer({ scrolled: true });
    const range = createMockRange([{ x: 0, y: 0, width: 700, height: 20 }]);
    expect(calculatePageSplitFraction(range, renderer)).toBeNull();
  });

  it('returns null when range has no rects', () => {
    const renderer = createMockRenderer();
    const range = createMockRange([]);
    expect(calculatePageSplitFraction(range, renderer)).toBeNull();
  });

  it('returns null when paragraph is fully visible (horizontal)', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // 5 lines, all within viewport width of 800
    const rects: MockRect[] = [
      { x: 10, y: 0, width: 700, height: 20 },
      { x: 10, y: 20, width: 700, height: 20 },
      { x: 10, y: 40, width: 700, height: 20 },
      { x: 10, y: 60, width: 700, height: 20 },
      { x: 10, y: 80, width: 500, height: 20 },
    ];
    const range = createMockRange(rects, 800);
    expect(calculatePageSplitFraction(range, renderer)).toBeNull();
  });

  it('returns fraction when paragraph is split 50/50 (horizontal)', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // 4 lines total: 2 on current page (x in [0,800]), 2 on next page (x >= 800)
    const rects: MockRect[] = [
      { x: 10, y: 0, width: 700, height: 20 }, // visible
      { x: 10, y: 20, width: 700, height: 20 }, // visible
      { x: 810, y: 0, width: 700, height: 20 }, // next page
      { x: 810, y: 20, width: 700, height: 20 }, // next page
    ];
    const range = createMockRange(rects, 800);
    const result = calculatePageSplitFraction(range, renderer);
    expect(result).toBeCloseTo(0.5, 1);
  });

  it('returns fraction when paragraph is split 75/25 (horizontal)', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // 4 lines: 3 visible, 1 on next page
    const rects: MockRect[] = [
      { x: 10, y: 0, width: 700, height: 20 },
      { x: 10, y: 20, width: 700, height: 20 },
      { x: 10, y: 40, width: 700, height: 20 },
      { x: 810, y: 0, width: 700, height: 20 }, // next page
    ];
    const range = createMockRange(rects, 800);
    const result = calculatePageSplitFraction(range, renderer);
    expect(result).toBeCloseTo(0.75, 1);
  });

  it('returns 0 when paragraph is entirely off-screen', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // All lines on next page
    const rects: MockRect[] = [
      { x: 810, y: 0, width: 700, height: 20 },
      { x: 810, y: 20, width: 700, height: 20 },
    ];
    const range = createMockRange(rects, 800);
    const result = calculatePageSplitFraction(range, renderer);
    expect(result).toBe(0);
  });

  it('handles vertical pagination (sideProp === height)', () => {
    const renderer = createMockRenderer({ sideProp: 'height' });
    // 4 lines: 3 within viewport height of 600, 1 on next page (y >= 600)
    const rects: MockRect[] = [
      { x: 0, y: 10, width: 400, height: 20 },
      { x: 0, y: 30, width: 400, height: 20 },
      { x: 0, y: 50, width: 400, height: 20 },
      { x: 0, y: 610, width: 400, height: 20 }, // next page
    ];
    const range = createMockRange(rects, 800, 600);
    const result = calculatePageSplitFraction(range, renderer);
    expect(result).toBeCloseTo(0.75, 1);
  });

  it('returns null when two-page spread paragraph fits within viewport', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // Two-page spread: viewport width = 1440 (two 720px columns)
    // Lines in column 1 (x ~ 0-720) and column 2 (x ~ 720-1440) are both visible
    const rects: MockRect[] = [
      { x: 10, y: 0, width: 700, height: 20 }, // column 1
      { x: 10, y: 20, width: 700, height: 20 },
      { x: 730, y: 0, width: 700, height: 20 }, // column 2
      { x: 730, y: 20, width: 700, height: 20 },
    ];
    const range = createMockRange(rects, 1440);
    expect(calculatePageSplitFraction(range, renderer)).toBeNull();
  });

  it('returns fraction when two-page spread paragraph extends to next spread', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // Two-page spread: viewport width = 1440
    // Some lines in columns 1-2 (visible), some in column 3+ (next spread, x >= 1440)
    const rects: MockRect[] = [
      { x: 10, y: 0, width: 700, height: 20 }, // col 1 visible
      { x: 10, y: 20, width: 700, height: 20 }, // col 1 visible
      { x: 730, y: 0, width: 700, height: 20 }, // col 2 visible
      { x: 1450, y: 0, width: 700, height: 20 }, // col 3, next spread
    ];
    const range = createMockRange(rects, 1440);
    const result = calculatePageSplitFraction(range, renderer);
    expect(result).toBeCloseTo(0.75, 1);
  });

  it('handles partially visible line at page boundary', () => {
    const renderer = createMockRenderer({ sideProp: 'width' });
    // A line that straddles the page boundary (partially visible)
    const rects: MockRect[] = [
      { x: 10, y: 0, width: 700, height: 20 }, // fully visible (710 < 800)
      { x: 750, y: 0, width: 200, height: 20 }, // partially visible (750-800 = 50px visible, 800-950 = 150px hidden)
    ];
    const range = createMockRange(rects, 800);
    const result = calculatePageSplitFraction(range, renderer);
    // visible: 700 + 50 = 750, total: 700 + 200 = 900
    expect(result).toBeCloseTo(750 / 900, 2);
  });
});
