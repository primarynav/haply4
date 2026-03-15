import { useEffect } from 'react';

export function PWAMetaTags() {
  useEffect(() => {
    // Set document title
    document.title = 'Haply - Dating for Divorced Singles | Find Love Again After Divorce';

    // Create or update meta tags
    const metaTags = [
      { name: 'description', content: 'Haply (Happily Ever After Again) is the #1 dating platform for divorced singles. AI-powered matching, verified profiles, safe messaging. Join free today and find love again!' },
      { name: 'keywords', content: 'divorced dating, dating after divorce, divorced singles, second chance love, dating for divorced, find love again, divorced and dating, single parent dating, AI matchmaking, Haply dating' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'author', content: 'Haply - Happily Ever After Again' },
      { name: 'theme-color', content: '#be185d' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Haply' },
      { name: 'application-name', content: 'Haply' },
      { name: 'msapplication-TileColor', content: '#be185d' },
      { name: 'msapplication-tap-highlight', content: 'no' },
      // Open Graph
      { property: 'og:title', content: 'Haply - Find Love Again After Divorce | Free to Join' },
      { property: 'og:description', content: 'The #1 dating platform for divorced singles. AI-powered matching finds you truly compatible partners who understand your journey. Join free for a limited time!' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Haply - Happily Ever After Again' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:url', content: 'https://www.happilyeverafteragain.com' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Haply - Find Love Again After Divorce' },
      { name: 'twitter:description', content: 'AI-powered dating for divorced singles. Verified profiles, safe messaging, and a community that understands. Join free today!' },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://www.happilyeverafteragain.com');

    // Add JSON-LD structured data for SEO
    let jsonLd = document.querySelector('script[type="application/ld+json"]#haply-schema');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      jsonLd.setAttribute('id', 'haply-schema');
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Haply - Happily Ever After Again",
      "alternateName": "Haply",
      "description": "AI-powered dating platform designed exclusively for divorced singles to find love again. Features verified profiles, conversational AI matching, and safe messaging.",
      "url": "https://www.happilyeverafteragain.com",
      "applicationCategory": "DatingApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free for a limited time - all premium features included"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1200",
        "bestRating": "5"
      },
      "creator": {
        "@type": "Organization",
        "name": "Haply"
      }
    });

    // Add FAQ structured data
    let faqLd = document.querySelector('script[type="application/ld+json"]#haply-faq');
    if (!faqLd) {
      faqLd = document.createElement('script');
      faqLd.setAttribute('type', 'application/ld+json');
      faqLd.setAttribute('id', 'haply-faq');
      document.head.appendChild(faqLd);
    }
    faqLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Haply?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Haply (Happily Ever After Again) is an AI-powered dating platform designed exclusively for divorced singles who are ready to find love again."
          }
        },
        {
          "@type": "Question",
          "name": "Is Haply free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Haply is currently free for a limited time. All premium features are included at no cost during our launch period."
          }
        },
        {
          "@type": "Question",
          "name": "How does AI matching work on Haply?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply have a natural conversation with our AI matchmaker about what you're looking for. No forms or endless swiping - just tell us what matters to you and we'll find compatible matches."
          }
        }
      ]
    });

    // Add manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', '/manifest.json');

    // Add iOS specific links for app icons
    const iconSizes = [120, 152, 167, 180];
    iconSizes.forEach(size => {
      let link = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}x${size}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'apple-touch-icon');
        link.setAttribute('sizes', `${size}x${size}`);
        document.head.appendChild(link);
      }
      link.setAttribute('href', `/icons/icon-${size}x${size}.png`);
    });

    // Add favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/png');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', '/icons/icon-192x192.png');

    // Add viewport meta tag with proper settings for PWA
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover');

  }, []);

  return null;
}