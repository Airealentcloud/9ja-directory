import { ImageResponse } from 'next/og'
import { createElement } from 'react'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #16a34a 0%, #14532d 70%, #0f172a 100%)',
          color: '#ffffff',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        },
      },
      createElement('div', { style: { fontSize: 72, fontWeight: 900, letterSpacing: -1 } }, '9ja'),
      createElement('div', { style: { fontSize: 48, fontWeight: 800, marginTop: 6 } }, 'Directory')
    ),
    { width: 512, height: 512 }
  )
}
