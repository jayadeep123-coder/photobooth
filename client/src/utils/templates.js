export const TEMPLATES = [
  {
    id: 'vintage-love',
    name: 'Vintage Love',
    layout: 'vertical-strip',
    frameCount: 3,
    photoFilter: 'sepia(0.55) contrast(1.05) saturate(0.85) brightness(0.96)',
    frameStyle: {
      borderColor: '#faf7f2', // Cream white paper strip
      borderWidth: 12,
      borderStyle: 'solid',
      cornerRadius: 4,
      background: { type: 'color', value: '#c3bcaf' } // Neutral tan-grey board
    },
    decorations: [],
    captionFont: '700 64px Caveat, cursive',
    captionText: 'Love you... ♡'
  },
  {
    id: 'friends-forever',
    name: 'Friends Forever',
    layout: 'vertical-strip',
    frameCount: 2,
    photoFilter: 'contrast(1.08) brightness(1.02) saturate(1.1)',
    frameStyle: {
      borderColor: '#ffdcd0',
      borderWidth: 16,
      borderStyle: 'solid',
      cornerRadius: 0,
      background: { type: 'pattern', value: 'pink-stripe' }
    },
    decorations: [],
    captionFont: '700 58px Caveat, cursive',
    captionText: 'friends forever'
  },
  {
    id: 'live-in-moment',
    name: 'Live Moment',
    layout: 'vertical-strip',
    frameCount: 3,
    photoFilter: 'none',
    frameStyle: {
      borderColor: '#fdfbf7',
      borderWidth: 0,
      borderStyle: 'solid',
      cornerRadius: 24,
      background: { type: 'color', value: '#fbf9f4' }
    },
    decorations: [],
    captionFont: '600 52px Outfit, sans-serif',
    captionText: 'LIVE IN THE moment'
  },
  {
    id: 'friends-scrapbook',
    name: 'Friends Scrapbook',
    layout: 'vertical-strip',
    frameCount: 2,
    photoFilter: 'contrast(1.1) brightness(0.98) saturate(0.9)',
    frameStyle: {
      borderColor: '#181818',
      borderWidth: 18,
      borderStyle: 'solid',
      cornerRadius: 0,
      background: { type: 'pattern', value: 'kraft-paper' }
    },
    decorations: [],
    captionFont: '700 78px Caveat, cursive',
    captionText: 'friends'
  },
  {
    id: 'valentine-strip',
    name: 'Valentine',
    layout: 'vertical-strip',
    frameCount: 3,
    photoFilter: 'grayscale(1) contrast(1.1) brightness(0.96)',
    frameStyle: {
      borderColor: '#ffffff',
      borderWidth: 0,
      borderStyle: 'solid',
      cornerRadius: 0,
      background: { type: 'color', value: '#242424' }
    },
    decorations: [],
    captionFont: '500 38px Courier New, monospace',
    captionText: 'happy\nvalentine’s\nday!'
  },
  {
    id: 'classic-strip',
    name: 'Classic Strip',
    layout: 'vertical-strip',
    frameCount: 4,
    photoFilter: 'none',
    frameStyle: {
      borderColor: '#ffffff',
      borderWidth: 20,
      borderStyle: 'solid',
      cornerRadius: 10,
      background: { type: 'color', value: '#ffffff' }
    },
    decorations: [
      { type: 'emoji', value: '💖', position: { x: 8, y: 3 }, size: 40 },
      { type: 'emoji', value: '✨', position: { x: 88, y: 95 }, size: 40 }
    ],
    captionFont: 'bold 44px Outfit, sans-serif',
    captionText: 'Smile Film'
  },
  {
    id: 'retro-film',
    name: 'Retro Film',
    layout: 'vertical-strip',
    frameCount: 3,
    photoFilter: 'grayscale(1) contrast(1.3) brightness(0.92)',
    frameStyle: {
      borderColor: '#151515',
      borderWidth: 22,
      borderStyle: 'solid',
      cornerRadius: 0,
      background: { type: 'color', value: '#151515' }
    },
    decorations: [
      { type: 'washi-tape', position: { x: 50, y: 2.5 }, size: { w: 140, h: 42 } }
    ],
    captionFont: '700 52px Caveat, cursive',
    captionText: 'Retro Memories'
  },
  {
    id: 'vintage-stamp',
    name: 'Vintage Stamp',
    layout: 'vertical-strip',
    frameCount: 3,
    photoFilter: 'sepia(0.4) contrast(0.98) brightness(1.04)',
    frameStyle: {
      borderColor: '#7a1b1b', // Maroon red
      borderWidth: 16,
      borderStyle: 'dotted', // Trigger perforated stamp edge
      cornerRadius: 6,
      background: { type: 'pattern', value: 'stripe' } // Subtle vertical stripe paper texture
    },
    decorations: [],
    frameDecorations: [
      { frameIndex: 0, type: 'doodle-bow', position: { x: 6, y: -20 }, size: 55 },
      { frameIndex: 1, type: 'doodle-heart', position: { x: 86, y: 30 }, size: 50 },
      { frameIndex: 2, type: 'doodle-arrow', position: { x: 5, y: 40 }, size: 55 }
    ],
    captionFont: 'bold 40px Outfit, sans-serif',
    captionText: 'Vintage Days'
  },
  {
    id: 'cozy-grid',
    name: 'Cozy Grid 2x2',
    layout: 'grid-2x2',
    frameCount: 4,
    photoFilter: 'contrast(1.05) saturate(1.15) brightness(1.02)',
    frameStyle: {
      borderColor: '#fcf8f2',
      borderWidth: 24,
      borderStyle: 'solid',
      cornerRadius: 16,
      background: { type: 'color', value: '#fcf8f2' }
    },
    decorations: [
      { type: 'emoji', value: '🧸', position: { x: 50, y: 50 }, size: 55 }
    ],
    captionFont: 'bold 44px Outfit, sans-serif',
    captionText: 'Sweet Memories'
  }
];
export default TEMPLATES;
