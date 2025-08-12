import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Accountability" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Accountability" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3e%3ccircle fill='%232563eb' cx='96' cy='96' r='96'/%3e%3ctext x='96' y='120' font-family='system-ui' font-size='80' fill='white' text-anchor='middle'%3eA%3c/text%3e%3c/svg%3e" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3e%3ccircle fill='%232563eb' cx='96' cy='96' r='96'/%3e%3ctext x='96' y='120' font-family='system-ui' font-size='80' fill='white' text-anchor='middle'%3eA%3c/text%3e%3c/svg%3e" />
        <link rel="shortcut icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3e%3ccircle fill='%232563eb' cx='96' cy='96' r='96'/%3e%3ctext x='96' y='120' font-family='system-ui' font-size='80' fill='white' text-anchor='middle'%3eA%3c/text%3e%3c/svg%3e" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
