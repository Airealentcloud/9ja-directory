'use client'

import Script from 'next/script'

const ADSENSE_CLIENT_ID = 'ca-pub-4971002905973697'

export default function GoogleAdSense() {
  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  )
}
