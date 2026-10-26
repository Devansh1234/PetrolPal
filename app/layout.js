import './globals.css';
import Header from '@/components/Header';
import { TabBar } from '@/components/Nav';
import { SITE_URL } from '@/lib/status';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Petrol Pal — Find petrol pumps and fuel test results across India',
    template: '%s · Petrol Pal',
  },
  description:
    'A map of petrol pumps across India, with community fuel test results from Petrol Pal testers. Check whether the petrol near you matches E20.',
  openGraph: {
    siteName: 'Petrol Pal',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F766E',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans text-[15px] leading-normal">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
