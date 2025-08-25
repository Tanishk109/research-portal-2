import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload Google Fonts: Inter as an example */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Place for critical CSS or additional preloads if needed */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 