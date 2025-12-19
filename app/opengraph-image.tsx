import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background: 'linear-gradient(135deg, #16a34a 0%, #14532d 70%, #0f172a 100%)',
          color: '#ffffff',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>9jaDirectory</div>
          <div style={{ fontSize: 34, fontWeight: 600, maxWidth: 900, lineHeight: 1.2 }}>
            Find trusted businesses and services across Nigeria
          </div>
          <div style={{ fontSize: 24, opacity: 0.9, maxWidth: 900 }}>
            Browse categories, locations, and verified listings in all 36 states + FCT.
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
          <div style={{ fontSize: 22 }}>9jadirectory.org</div>
          <div style={{ fontSize: 22 }}>Nigeria Business Directory</div>
        </div>
      </div>
    ),
    size
  )
}

