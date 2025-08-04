import Head from 'next/head';
import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
}

const defaultSEO = {
  title: 'Accountability On Autopilot - Your AI-Powered Discipline Coach',
  description: 'Transform your goals into achievements with our intelligent accountability app. Track progress, build habits, and stay motivated with AI-powered insights and real-time progress monitoring.',
  keywords: 'accountability, goal tracking, habit building, productivity, discipline, AI coach, progress tracking, personal development',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image' as const
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  twitterCard,
  noIndex = false
}) => {
  const seoTitle = title ? `${title} | Accountability On Autopilot` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = keywords || defaultSEO.keywords;
  const seoOgImage = ogImage || defaultSEO.ogImage;
  const seoTwitterCard = twitterCard || defaultSEO.twitterCard;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content="Accountability On Autopilot" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoOgImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:site_name" content="Accountability On Autopilot" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={seoTwitterCard} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoOgImage} />
      
      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Accountability" />
      
      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Accountability On Autopilot",
            "description": seoDescription,
            "url": ogUrl || "https://your-domain.com",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "priceValidUntil": "2024-12-31"
            },
            "author": {
              "@type": "Organization",
              "name": "Accountability On Autopilot"
            }
          })
        }}
      />
    </Head>
  );
};

export default SEO;
