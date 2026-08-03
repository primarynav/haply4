/**
 * Static HTML generated at build time, for the parts of this site that have to
 * work without JavaScript.
 *
 * The app is a client-rendered SPA, which is fine for members and useless for
 * three audiences that matter:
 *
 *  - Search crawlers. Google will sometimes execute JS and sometimes not; most
 *    other crawlers, including the ones now feeding answer engines, will not.
 *    A page that only exists after hydration effectively does not exist.
 *  - Platform reviewers. Facebook, Apple and Google all require a Privacy
 *    Policy at a plain URL and check it with a fetcher that does not run React.
 *    A /privacy that renders empty is a rejected app review.
 *  - Anyone linked straight to a policy, who should not have to boot an app to
 *    read one.
 *
 * So the legal pages and the guides are rendered here from the same TypeScript
 * the app uses, and emitted as real files. Generated rather than hand-written
 * on purpose: there used to be a hand-maintained public/privacy.html that had
 * drifted badly from the policy members actually consent to — it still said 18+
 * when the product is 21+, and promised documents were deleted immediately when
 * the real policy says 90 days. Two versions of a privacy policy is not a
 * content problem, it is a legal one, and the only durable fix is for there to
 * be one source.
 *
 * This module is pure: it returns file contents and writes nothing. vite.config.ts
 * emits them, and also copies the built index.html to 404.html so that GitHub
 * Pages — which has no rewrite rules — falls back to the SPA for client routes
 * like /switch instead of serving its own 404.
 */

import { PRIVACY_POLICY, TERMS_OF_SERVICE, LEGAL_LAST_UPDATED, SUPPORT_EMAIL, type LegalSection } from '../src/haply/legalContent';
import { ARTICLES, type Article, type Block, type FaqItem } from './articles';

export const SITE_ORIGIN = 'https://happilyeverafteragain.com';

export interface EmittedFile {
  /** Path relative to the build output root. */
  fileName: string;
  source: string;
}

/**
 * Write a page at both `foo.html` and `foo/index.html`.
 *
 * GitHub Pages resolves `/foo` to `foo.html`, so one file would be enough
 * there — but that is a property of one host, and the page it decides is the
 * Privacy Policy URL that Facebook, Apple and Google check during app review.
 * A policy URL that 404s is a rejected review, and this is not the place to
 * depend on behaviour that cannot be tested from here.
 *
 * With both files, `/foo` and `/foo/` each resolve on any static host, and the
 * canonical tag on both names the extensionless form so the duplicate does not
 * split ranking.
 */
function bothForms(slug: string, source: string): EmittedFile[] {
  return [
    { fileName: `${slug}.html`, source },
    { fileName: `${slug}/index.html`, source }
  ];
}

/** Escape for HTML text and double-quoted attributes. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * JSON-LD sits inside a <script> element, where the parser is looking for
 * `</script` and nothing else — so escaping HTML would corrupt the JSON, and not
 * escaping `<` would let a stray closing tag break out. Escape the sequence.
 */
function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// ---------------------------------------------------------------------------
// Shared shell

const CSS = `
:root{--ink:#211D1A;--body:#44403C;--muted:#78716C;--sand:#FAF7F4;--line:#EDE6DF;--rose:#e11d48}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--sand);color:var(--body);font:16px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
a{color:#be123c}
a:hover{color:#9f1239}
.wrap{max-width:720px;margin:0 auto;padding:0 clamp(18px,5vw,28px)}
.top{background:#fff;border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{display:flex;align-items:center;gap:9px;text-decoration:none;color:var(--ink)}
.brand b{font-family:'Source Serif 4',Georgia,serif;font-size:21px;font-weight:700;letter-spacing:-.01em}
.brand span{font-size:11px;color:var(--muted);display:block;line-height:1.1}
.cta{background:var(--rose);color:#fff;border-radius:999px;padding:9px 18px;font-size:14px;font-weight:600;text-decoration:none;white-space:nowrap}
.cta:hover{background:#be123c;color:#fff}
main{padding:clamp(30px,6vw,56px) 0 8px}
h1{font-family:'Source Serif 4',Georgia,serif;font-size:clamp(29px,5.4vw,42px);line-height:1.14;font-weight:600;color:var(--ink);margin:0 0 14px;letter-spacing:-.01em}
.dek{font-size:19px;line-height:1.6;color:#57534E;margin:0 0 8px}
.byline{font-size:13px;color:var(--muted);margin:0 0 34px;padding-bottom:22px;border-bottom:1px solid var(--line)}
h2{font-family:'Source Serif 4',Georgia,serif;font-size:clamp(22px,3.4vw,28px);line-height:1.25;font-weight:600;color:var(--ink);margin:44px 0 12px}
h3{font-size:17px;font-weight:700;color:var(--ink);margin:28px 0 6px}
p{margin:0 0 17px}
ul,ol{margin:0 0 20px;padding-left:22px}
li{margin-bottom:9px}
.note{background:#fff;border:1px solid var(--line);border-left:3px solid var(--rose);border-radius:0 12px 12px 0;padding:18px 20px;margin:26px 0}
.note h4{margin:0 0 6px;font-size:15px;color:var(--ink)}
.note p{margin:0;font-size:15px}
.faq{margin:26px 0 8px}
.faq details{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin-bottom:10px}
.faq summary{font-weight:700;color:var(--ink);cursor:pointer;font-size:16px}
.faq details p{margin:10px 0 0;font-size:15.5px}
.end{background:#fff;border:1px solid var(--line);border-radius:16px;padding:26px;margin:48px 0 8px}
.end h2{margin:0 0 10px;font-size:23px}
.end p{font-size:15.5px}
.end .cta{display:inline-block;margin-top:6px;padding:12px 24px;font-size:15px}
.cards{display:grid;gap:14px;margin:28px 0}
.card{display:block;background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px 22px;text-decoration:none}
.card b{display:block;font-family:'Source Serif 4',Georgia,serif;font-size:20px;font-weight:600;color:var(--ink);margin-bottom:5px}
.card span{color:var(--body);font-size:15px}
.card:hover{border-color:#D6CCC2}
.legal h2{font-size:19px;font-family:inherit;font-weight:700;margin:30px 0 7px}
.legal p{font-size:15.5px}
footer{background:var(--ink);color:#A8A29E;margin-top:56px;padding:32px 0;font-size:13.5px}
footer .wrap{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:space-between;align-items:center}
footer a{color:#D6CCC2;text-decoration:none}
footer a:hover{color:#fb7185}
footer nav{display:flex;flex-wrap:wrap;gap:18px}
`.trim();

interface ShellOptions {
  title: string;
  description: string;
  /** Path with a leading slash, e.g. "/guides/is-he-really-divorced". */
  path: string;
  heading: string;
  bodyHtml: string;
  schema?: unknown[];
  /** Omitted on the legal pages, which do not want a "join free" push. */
  hideCta?: boolean;
}

function shell(o: ShellOptions): string {
  const url = `${SITE_ORIGIN}${o.path}`;
  const graph = o.schema?.length ? `\n<script type="application/ld+json">${jsonLd({ '@context': 'https://schema.org', '@graph': o.schema })}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#E11D48">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Haply">
<meta property="og:title" content="${esc(o.heading)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITE_ORIGIN}/images/hero-2.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.heading)}">
<meta name="twitter:description" content="${esc(o.description)}">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet">
<style>${CSS}</style>${graph}
</head>
<body>
<header class="top"><div class="wrap">
<a class="brand" href="/"><b>Haply</b><span>Community for divorced people</span></a>
${o.hideCta ? '' : '<a class="cta" href="/">Join free</a>'}
</div></header>
<main><div class="wrap">
${o.bodyHtml}
</div></main>
<footer><div class="wrap">
<span>&copy; 2026 Haply &middot; 21+ &middot; Free to join</span>
<nav><a href="/">Home</a><a href="/guides/">Guides</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:${SUPPORT_EMAIL}">Contact</a></nav>
</div></footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Legal pages

function legalPage(kind: 'privacy' | 'terms'): EmittedFile[] {
  const isPrivacy = kind === 'privacy';
  const sections: LegalSection[] = isPrivacy ? PRIVACY_POLICY : TERMS_OF_SERVICE;
  const heading = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const description = isPrivacy
    ? 'How Haply collects, uses, and deletes your information — including divorce-verification documents, which are deleted 90 days after a decision.'
    : 'The terms of using Haply, including what a divorce-verification badge does and does not mean, and your right to human review of an automated decision.';

  const body = `<h1>${heading}</h1>
<p class="dek">Haply &mdash; a community for people who are divorced or legally separated.</p>
<p class="byline">Last updated ${esc(LEGAL_LAST_UPDATED)} &middot; Questions: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
<div class="legal">
${sections.map((s) => `<h2>${esc(s.heading)}</h2>\n<p>${esc(s.body)}</p>`).join('\n')}
</div>
<div class="note"><h4>The other document</h4><p>${
    isPrivacy
      ? `This policy sits alongside our <a href="/terms">Terms of Service</a>, which set out what a verification badge does and does not mean.`
      : `These terms sit alongside our <a href="/privacy">Privacy Policy</a>, which sets out what we collect and how long we keep it.`
  }</p></div>`;

  return bothForms(
    kind,
    shell({
      title: `${heading} | Haply`,
      description,
      path: `/${kind}`,
      heading,
      bodyHtml: body,
      hideCta: true,
      schema: [
        {
          '@type': 'WebPage',
          name: heading,
          url: `${SITE_ORIGIN}/${kind}`,
          description,
          dateModified: '2026-07-01',
          publisher: { '@type': 'Organization', name: 'Haply', url: SITE_ORIGIN }
        }
      ]
    })
  );
}

// ---------------------------------------------------------------------------
// Guides

function renderBlock(b: Block): string {
  switch (b.kind) {
    case 'p':
      return `<p>${esc(b.text)}</p>`;
    case 'h2':
      return `<h2>${esc(b.text)}</h2>`;
    case 'h3':
      return `<h3>${esc(b.text)}</h3>`;
    case 'ul':
      return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'ol':
      return `<ol>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'note':
      return `<div class="note"><h4>${esc(b.heading)}</h4><p>${esc(b.text)}</p></div>`;
    case 'faq':
      // <details> rather than a script toggle: it works with JS disabled, which
      // is the entire premise of these pages, and it is keyboard accessible for
      // free. Crawlers read the contents whether or not it is open.
      return `<h2>Common questions</h2><div class="faq">${b.items
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join('')}</div>`;
  }
}

function faqItems(a: Article): FaqItem[] {
  return a.blocks.flatMap((b) => (b.kind === 'faq' ? b.items : []));
}

function articlePage(a: Article): EmittedFile[] {
  const url = `${SITE_ORIGIN}/guides/${a.slug}`;
  const others = ARTICLES.filter((x) => x.slug !== a.slug);
  const faqs = faqItems(a);

  const schema: unknown[] = [
    {
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      datePublished: a.published,
      dateModified: a.updated,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Organization', name: 'Haply', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'Haply', url: SITE_ORIGIN, logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/icons/icon-512.png` } }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_ORIGIN}/guides/` },
        { '@type': 'ListItem', position: 3, name: a.title, item: url }
      ]
    }
  ];
  if (faqs.length) {
    schema.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    });
  }

  const readable = new Date(`${a.updated}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  const body = `<p style="font-size:13.5px;margin:0 0 14px"><a href="/guides/">Guides</a></p>
<h1>${esc(a.title)}</h1>
<p class="dek">${esc(a.dek)}</p>
<p class="byline">Haply &middot; updated ${esc(readable)}</p>
${a.blocks.map(renderBlock).join('\n')}
<div class="end">
<h2>Haply</h2>
<p>Haply is a free community for people who are divorced or legally separated, 21 and over. It is free to join anywhere in the US &mdash; the community is the point, and it works whether or not you are dating.</p>
<p>Members can also submit their divorce decree for an automated review and carry a verified badge. To be straight about what that is: it means a review found the uploaded document consistent with what the member entered. It is not an identity check and not a background check. Dating is currently open in Chicago only, because a dating pool spread thin is no dating pool at all.</p>
<a class="cta" href="/">Join the community &mdash; free</a>
</div>
<h2>More guides</h2>
<div class="cards">
${others.map((o) => `<a class="card" href="/guides/${o.slug}"><b>${esc(o.title)}</b><span>${esc(o.cardLine)}</span></a>`).join('\n')}
</div>`;

  return bothForms(`guides/${a.slug}`, shell({ title: a.metaTitle, description: a.description, path: `/guides/${a.slug}`, heading: a.title, bodyHtml: body, schema }));
}

function guidesIndex(): EmittedFile {
  const description = 'Straight answers on divorce, separation, and dating afterwards — how to check whether someone is really divorced, what separated actually means, and dating again in your fifties.';
  const body = `<h1>Guides</h1>
<p class="dek">Practical answers to the questions people actually search for at 11pm. No sign-up needed to read any of them.</p>
<p class="byline">Haply &middot; a community for divorced and legally separated people</p>
<div class="cards">
${ARTICLES.map((a) => `<a class="card" href="/guides/${a.slug}"><b>${esc(a.title)}</b><span>${esc(a.cardLine)}</span></a>`).join('\n')}
</div>
<div class="end">
<h2>About Haply</h2>
<p>A free community for people who are divorced or legally separated, 21 and over &mdash; the co-parenting week from hell, the empty Saturday, starting over at 47. Free to join anywhere in the US. Dating, for members who want it, is open in Chicago.</p>
<a class="cta" href="/">Join free</a>
</div>`;

  return {
    fileName: 'guides/index.html',
    source: shell({
      title: 'Guides | Haply',
      description,
      path: '/guides/',
      heading: 'Guides',
      bodyHtml: body,
      schema: [
        {
          '@type': 'CollectionPage',
          name: 'Haply Guides',
          url: `${SITE_ORIGIN}/guides/`,
          description,
          hasPart: ARTICLES.map((a) => ({ '@type': 'Article', headline: a.title, url: `${SITE_ORIGIN}/guides/${a.slug}`, description: a.description }))
        }
      ]
    })
  };
}

// ---------------------------------------------------------------------------
// robots.txt and sitemap.xml
//
// Generated rather than dropped in public/ so the sitemap cannot fall out of
// step with the pages that actually exist — a sitemap listing a URL that 404s
// is worse than no sitemap.

/**
 * Every URL that has a real file behind it, and therefore answers 200.
 *
 * Client-only routes are deliberately absent. `/switch` works for a human — the
 * 404.html fallback boots the app, which routes on the path — but the response
 * still carries a 404 status, because that is what serving a 404 page means.
 * Listing a 404 in a sitemap gets the whole sitemap distrusted, so a route only
 * belongs here once something static answers it.
 */
function urls(): { loc: string; lastmod: string; priority: string }[] {
  const today = '2026-08-03';
  return [
    { loc: `${SITE_ORIGIN}/`, lastmod: today, priority: '1.0' },
    { loc: `${SITE_ORIGIN}/guides/`, lastmod: today, priority: '0.8' },
    ...ARTICLES.map((a) => ({ loc: `${SITE_ORIGIN}/guides/${a.slug}`, lastmod: a.updated, priority: '0.8' })),
    { loc: `${SITE_ORIGIN}/privacy`, lastmod: '2026-07-01', priority: '0.3' },
    { loc: `${SITE_ORIGIN}/terms`, lastmod: '2026-07-01', priority: '0.3' }
  ];
}

function sitemap(): EmittedFile {
  return {
    fileName: 'sitemap.xml',
    source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls()
  .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>
`
  };
}

function robots(): EmittedFile {
  return {
    fileName: 'robots.txt',
    source: `# https://happilyeverafteragain.com
User-agent: *
Allow: /

# Signed-in surfaces. Nothing sensitive is exposed by crawling them — they are
# empty without a session — but they are not pages anyone should land on from a
# search result.
Disallow: /dashboard
Disallow: /community-profile

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`
  };
}

// ---------------------------------------------------------------------------

/** Everything this module contributes to the build output. */
export function staticPages(): EmittedFile[] {
  return [...legalPage('privacy'), ...legalPage('terms'), guidesIndex(), ...ARTICLES.flatMap(articlePage), sitemap(), robots()];
}
