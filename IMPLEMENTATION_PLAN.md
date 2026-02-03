# BedaBeda Growth Site - Blog & CMS Implementation Plan

## Keystatic + Vercel (No External Services)

---

## Quick Summary

| What | How |
|------|-----|
| **Blog** | MDX files in `/content/blog/` |
| **Case Studies** | JSON files in `/content/case-studies/` |
| **Admin UI** | Keystatic at `/keystatic` route |
| **Auth** | GitHub login (free) |
| **Database** | None - just files in your repo |
| **Hosting** | Everything on Vercel |

**Your wife's workflow:**
1. Goes to `bedabedagrowth.com/keystatic`
2. Logs in with GitHub (one-time setup)
3. Creates/edits blog posts or case studies in visual editor
4. Clicks "Save" → auto-commits to GitHub → Vercel rebuilds (~30 sec)
5. Done!

---

## Architecture Decision: Astro vs Vite

### Current Setup: Vite + React (Client-Side Rendered)

The site currently runs as a **Single Page Application (SPA)**. This works fine but has SEO limitations:
- Search engines see a blank page initially, then JavaScript loads content
- Not ideal for "SEO juice" goals
- Keystatic's GitHub mode requires extra API route setup

### Recommended: Migrate to Astro

**Astro** is perfect for this use case:
- Generates **static HTML** at build time (excellent for SEO)
- **First-class Keystatic support** (zero config)
- Can **reuse all your existing React components**
- Built-in **image optimization**
- **Faster page loads** (ships zero JS by default, adds it only where needed)
- Vercel has official Astro adapter

**Migration effort:** Medium - mostly moving files and updating imports. All React components work as-is.

---

## Phase 1: Migrate to Astro

### Step 1.1: Initialize Astro in the Project

```bash
# Install Astro and required packages
npm install astro @astrojs/react @astrojs/tailwind @astrojs/vercel

# Install Keystatic
npm install @keystatic/core @keystatic/astro
```

### Step 1.2: Create Astro Config

**File: `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';
import keystatic from '@keystatic/astro';

export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    keystatic(),
  ],
  output: 'hybrid', // Allows both static and server routes
  adapter: vercel(),
});
```

### Step 1.3: Restructure for Astro

```
bedabeda-growth-site/
├── src/
│   ├── components/          # Keep all existing React components
│   │   ├── ui/              # shadcn components (unchanged)
│   │   ├── Header.tsx       # (unchanged)
│   │   ├── Footer.tsx       # (unchanged)
│   │   ├── CaseStudyGallery.tsx  # (will update to read from content)
│   │   └── ...
│   ├── layouts/
│   │   └── BaseLayout.astro # New: common page wrapper
│   ├── pages/
│   │   ├── index.astro      # Convert from Index.tsx
│   │   ├── services.astro   # Convert from Services.tsx
│   │   ├── contact.astro    # Convert from Contact.tsx
│   │   ├── blog/
│   │   │   ├── index.astro  # Blog listing page
│   │   │   └── [...slug].astro  # Dynamic blog post pages
│   │   └── keystatic/
│   │       └── [...params].astro  # Keystatic admin UI
│   └── content/             # NEW: Where content lives
│       ├── blog/            # Blog posts (MDX files)
│       └── case-studies/    # Case study data (JSON files)
├── public/
│   └── images/              # Static images
├── keystatic.config.ts      # Keystatic schema
├── astro.config.mjs         # Astro config
└── package.json
```

### Step 1.4: Create Base Layout

**File: `src/layouts/BaseLayout.astro`**

```astro
---
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/index.css';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description, ogImage } = Astro.props;
const siteUrl = 'https://bedabedagrowth.com';
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | BedaBeda Growth</title>
    <meta name="description" content={description || 'CRO & Conversion Optimization Agency'} />

    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage || `${siteUrl}/og-default.png`} />
    <meta property="og:url" content={Astro.url} />
    <meta property="og:type" content="website" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@bedabedagrowth" />

    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="min-h-screen bg-background font-sans antialiased">
    <Header client:load />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

### Step 1.5: Convert Homepage

**File: `src/pages/index.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero';
import ClientLogos from '@/components/ClientLogos';
import DisruptiveCROSection from '@/components/DisruptiveCROSection';
import WhoWeWorkWith from '@/components/WhoWeWorkWith';
import CROMethodologyDiagram from '@/components/CROMethodologyDiagram';
import CaseStudyTeasers from '@/components/CaseStudyTeasers';
import CaseStudyGallery from '@/components/CaseStudyGallery';
import AntiCookieCutter from '@/components/AntiCookieCutter';
import SlackMessages from '@/components/SlackMessages';
import TestimonialSlider from '@/components/TestimonialSlider';
import WhoYoullWorkWith from '@/components/WhoYoullWorkWith';
import ConversionBlock from '@/components/ConversionBlock';

// Fetch case studies at build time
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);
const caseStudies = await reader.collections.caseStudies.all();
---

<BaseLayout
  title="CRO & Conversion Optimization Agency"
  description="We help e-commerce brands increase revenue through data-driven conversion rate optimization."
>
  <Hero client:load />
  <ClientLogos />
  <DisruptiveCROSection client:visible />
  <WhoWeWorkWith />
  <CROMethodologyDiagram client:visible />
  <CaseStudyTeasers />
  <CaseStudyGallery caseStudies={caseStudies} client:load />
  <AntiCookieCutter />
  <SlackMessages client:visible />
  <TestimonialSlider client:load />
  <WhoYoullWorkWith />
  <ConversionBlock />
</BaseLayout>
```

---

## Phase 2: Set Up Keystatic

### Step 2.1: Create Keystatic Config

**File: `keystatic.config.ts`**

```typescript
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    // Use 'local' for development, 'github' for production
    kind: process.env.NODE_ENV === 'development' ? 'local' : 'github',
    repo: {
      owner: 'BedaBeda-Growth',
      name: 'bedabeda-growth-site',
    },
  },

  collections: {
    // ==================
    // BLOG POSTS
    // ==================
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
        }),
        publishedDate: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Short summary for SEO and social sharing (150-160 characters ideal)',
          multiline: true,
        }),
        featuredImage: fields.image({
          label: 'Featured Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'BedaBeda Growth Team',
        }),
        categories: fields.multiselect({
          label: 'Categories',
          options: [
            { label: 'CRO', value: 'cro' },
            { label: 'E-commerce', value: 'ecommerce' },
            { label: 'Landing Pages', value: 'landing-pages' },
            { label: 'A/B Testing', value: 'ab-testing' },
            { label: 'Case Study', value: 'case-study' },
            { label: 'Strategy', value: 'strategy' },
          ],
        }),
        seoTitle: fields.text({
          label: 'SEO Title',
          description: 'Override the title for search engines (optional)',
        }),
        seoDescription: fields.text({
          label: 'SEO Description',
          description: 'Override the excerpt for search engines (optional)',
          multiline: true,
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/blog',
              publicPath: '/images/blog/',
            },
          },
        }),
      },
    }),

    // ==================
    // CASE STUDIES
    // ==================
    caseStudies: collection({
      label: 'Case Studies',
      slugField: 'title',
      path: 'src/content/case-studies/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
          description: 'e.g., "Product Page Optimization"',
        }),
        order: fields.integer({
          label: 'Display Order',
          description: 'Lower numbers appear first in the carousel',
          defaultValue: 99,
        }),
        isActive: fields.checkbox({
          label: 'Show on Website',
          defaultValue: true,
        }),
        metric: fields.text({
          label: 'Key Metric',
          validation: { isRequired: true },
          description: 'e.g., "+15.8% Revenue Per Session"',
        }),
        description: fields.text({
          label: 'Short Description',
          description: 'One-line description shown on the card',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'E-commerce', value: 'E-commerce' },
            { label: 'Landing Page', value: 'Landing Page' },
            { label: 'Online B2C Community', value: 'Online B2C Community' },
            { label: 'High SKU E-Commerce', value: 'High SKU E-Commerce' },
            { label: 'DTC Brand', value: 'DTC Brand' },
          ],
          defaultValue: 'E-commerce',
        }),
        cardImage: fields.image({
          label: 'Card Background Image',
          description: 'Image shown in the carousel card (recommended: 600x450px)',
          directory: 'public/images/case-studies',
          publicPath: '/images/case-studies/',
        }),
        clientLogo: fields.image({
          label: 'Client Logo',
          description: 'Small logo shown in bottom-right of card',
          directory: 'public/images/case-studies',
          publicPath: '/images/case-studies/',
        }),
        modalImage: fields.image({
          label: 'Modal/Popup Image',
          description: 'Large image shown when clicking into the case study',
          directory: 'public/images/case-studies',
          publicPath: '/images/case-studies/',
        }),
        challenge: fields.text({
          label: 'Challenge',
          description: 'What challenge did the client face?',
          multiline: true,
          validation: { isRequired: true },
        }),
        solution: fields.text({
          label: 'Solution',
          description: 'How did BedaBeda Growth solve it?',
          multiline: true,
          validation: { isRequired: true },
        }),
      },
    }),
  },
});
```

### Step 2.2: Create Keystatic Admin Route

**File: `src/pages/keystatic/[...params].astro`**

```astro
---
import { Keystatic } from '@keystatic/astro/ui';
---
<Keystatic />
```

### Step 2.3: Set Up GitHub Authentication (for Production)

1. **Create GitHub OAuth App:**
   - Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
   - Application name: `BedaBeda CMS`
   - Homepage URL: `https://bedabedagrowth.com`
   - Authorization callback URL: `https://bedabedagrowth.com/api/keystatic/github/oauth/callback`

2. **Add Environment Variables in Vercel:**
   ```
   KEYSTATIC_GITHUB_CLIENT_ID=your_client_id
   KEYSTATIC_GITHUB_CLIENT_SECRET=your_client_secret
   KEYSTATIC_SECRET=any_random_32_character_string
   ```

3. **Create API Route for GitHub OAuth:**

**File: `src/pages/api/keystatic/[...params].ts`**

```typescript
import { makeHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../../keystatic.config';

export const all = makeHandler({ config: keystaticConfig });
export const prerender = false;
```

---

## Phase 3: Build Blog Pages

### Step 3.1: Blog Listing Page

**File: `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);
const posts = await reader.collections.blog.all();

// Sort by date, newest first
const sortedPosts = posts
  .filter(post => post.entry.publishedDate)
  .sort((a, b) =>
    new Date(b.entry.publishedDate!).getTime() - new Date(a.entry.publishedDate!).getTime()
  );
---

<BaseLayout
  title="Blog"
  description="Expert insights on conversion rate optimization, A/B testing, and e-commerce growth strategies."
>
  <section class="pt-24 pb-16">
    <div class="container mx-auto px-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl lg:text-5xl font-bold mb-4">The Growth Blog</h1>
        <p class="text-xl text-gray-600 mb-12">
          Insights on CRO, A/B testing, and conversion optimization
        </p>

        <div class="grid gap-8">
          {sortedPosts.map((post) => (
            <a href={`/blog/${post.slug}`} class="group">
              <article class="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-gray-200 hover:border-primary transition-colors">
                {post.entry.featuredImage && (
                  <div class="md:w-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.entry.featuredImage}
                      alt={post.entry.title}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div class="flex-1">
                  <div class="flex gap-2 mb-2">
                    {post.entry.categories?.map((cat) => (
                      <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h2 class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.entry.title}
                  </h2>
                  <p class="text-gray-600 text-sm mb-2">
                    {post.entry.excerpt}
                  </p>
                  <time class="text-xs text-gray-400">
                    {new Date(post.entry.publishedDate!).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </article>
            </a>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <p class="text-center text-gray-500 py-12">
            No blog posts yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  </section>
</BaseLayout>
```

### Step 3.2: Individual Blog Post Page

**File: `src/pages/blog/[slug].astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../keystatic.config';

export async function getStaticPaths() {
  const reader = createReader(process.cwd(), keystaticConfig);
  const posts = await reader.collections.blog.all();

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.entry.content();

const seoTitle = post.entry.seoTitle || post.entry.title;
const seoDescription = post.entry.seoDescription || post.entry.excerpt;
---

<BaseLayout
  title={seoTitle}
  description={seoDescription}
  ogImage={post.entry.featuredImage}
>
  <article class="pt-24 pb-16">
    <div class="container mx-auto px-6">
      <div class="max-w-3xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="text-sm mb-8">
          <a href="/blog" class="text-gray-500 hover:text-primary">Blog</a>
          <span class="mx-2 text-gray-300">/</span>
          <span class="text-gray-700">{post.entry.title}</span>
        </nav>

        <!-- Header -->
        <header class="mb-8">
          <div class="flex gap-2 mb-4">
            {post.entry.categories?.map((cat) => (
              <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {cat}
              </span>
            ))}
          </div>
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">
            {post.entry.title}
          </h1>
          <div class="flex items-center gap-4 text-gray-500">
            <span>{post.entry.author}</span>
            <span>•</span>
            <time>
              {new Date(post.entry.publishedDate!).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        <!-- Featured Image -->
        {post.entry.featuredImage && (
          <div class="mb-8 rounded-2xl overflow-hidden">
            <img
              src={post.entry.featuredImage}
              alt={post.entry.title}
              class="w-full"
            />
          </div>
        )}

        <!-- Content -->
        <div class="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary">
          <Content />
        </div>

        <!-- CTA -->
        <div class="mt-12 p-8 bg-gray-100 rounded-2xl text-center">
          <h3 class="text-2xl font-bold mb-2">Ready to grow your conversions?</h3>
          <p class="text-gray-600 mb-4">Let's talk about how we can help.</p>
          <a
            href="/contact"
            class="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  </article>

  <!-- JSON-LD Structured Data for SEO -->
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.entry.title,
    "description": post.entry.excerpt,
    "author": {
      "@type": "Organization",
      "name": post.entry.author || "BedaBeda Growth"
    },
    "datePublished": post.entry.publishedDate,
    "image": post.entry.featuredImage,
    "publisher": {
      "@type": "Organization",
      "name": "BedaBeda Growth",
      "url": "https://bedabedagrowth.com"
    }
  })} />
</BaseLayout>
```

---

## Phase 4: Update Case Study Gallery

### Step 4.1: Refactor to Accept Props

**Update `src/components/CaseStudyGallery.tsx`:**

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface CaseStudy {
  slug: string;
  entry: {
    title: string;
    metric: string;
    description?: string;
    category: string;
    cardImage?: string;
    clientLogo?: string;
    modalImage?: string;
    challenge: string;
    solution: string;
    order: number;
    isActive: boolean;
  };
}

interface Props {
  caseStudies: CaseStudy[];
}

const CaseStudyGallery = ({ caseStudies }: Props) => {
  // Filter active and sort by order
  const activeCaseStudies = caseStudies
    .filter(cs => cs.entry.isActive)
    .sort((a, b) => (a.entry.order || 99) - (b.entry.order || 99));

  return (
    <section id="case-studies" className="py-20 bg-gray-900 text-white scroll-mt-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-primary text-sm font-medium mb-2">Case Studies & Portfolio</p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Browse Some of Our Wins
            </h2>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {activeCaseStudies.map((study) => (
                <CarouselItem key={study.slug} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors group">
                        <div className="aspect-[4/3] bg-gray-700 relative overflow-hidden">
                          {study.entry.cardImage && (
                            <>
                              <img
                                src={study.entry.cardImage}
                                alt={study.entry.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                            </>
                          )}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 relative">
                              <p className="text-xs text-gray-300 mb-1">{study.entry.category}</p>
                              <p className="font-semibold text-lg">{study.entry.metric}</p>
                              {study.entry.clientLogo && (
                                <img
                                  src={study.entry.clientLogo}
                                  alt="Client logo"
                                  className="absolute top-2 right-2 h-6 w-auto"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {study.entry.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {study.entry.description}
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        {study.entry.modalImage && (
                          <div className="bg-gray-100 rounded-lg mb-6 overflow-hidden">
                            <img
                              src={study.entry.modalImage}
                              alt={study.entry.title}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                        <h2 className="text-2xl font-bold mb-4">{study.entry.title}</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Challenge</h3>
                            <p className="text-gray-600 mb-4">{study.entry.challenge}</p>
                            <h3 className="font-semibold mb-2">Solution</h3>
                            <p className="text-gray-600">{study.entry.solution}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Results</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-3xl font-bold text-primary mb-2">{study.entry.metric}</div>
                              <p className="text-gray-600 text-sm">{study.entry.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex text-black hover:text-white h-12 w-12" />
            <CarouselNext className="hidden md:flex text-black hover:text-white h-12 w-12" />
            <CarouselPrevious className="md:hidden flex text-black hover:text-white h-12 w-12 -left-2 z-10 top-[40%]" />
            <CarouselNext className="md:hidden flex text-black hover:text-white h-12 w-12 -right-2 z-10 top-[40%]" />
          </Carousel>

          <div className="text-center mt-12">
            <a href="/services">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth"
              >
                Get Results Like These
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyGallery;
```

---

## Phase 5: Migrate Existing Content

### Step 5.1: Create Content Directories

```bash
mkdir -p src/content/blog
mkdir -p src/content/case-studies
mkdir -p public/images/blog
mkdir -p public/images/case-studies
```

### Step 5.2: Migrate Case Studies

Create JSON files for each existing case study. Example:

**File: `src/content/case-studies/product-page-optimization.json`**

```json
{
  "title": "Product Page Optimization",
  "order": 1,
  "isActive": true,
  "metric": "+15.8% Revenue Per Session",
  "description": "Data-driven PDP overhaul for niche home goods",
  "category": "E-commerce",
  "cardImage": "/images/case-studies/allegiance-card.png",
  "clientLogo": "/images/case-studies/allegiance-logo.png",
  "modalImage": "/images/case-studies/allegiance-modal.png",
  "challenge": "Allegiance Flag Supply was growing quickly and wanted to ensure efficiency as they scaled, especially knowing their product was more expensive than others in the market.",
  "solution": "We used a combination of user research, custom conversion & behavioral reports, and an updated page journey to showcase the right information at the right time to build trust & perceived value."
}
```

### Step 5.3: Move Images

```bash
# Move existing case study images to new location
cp public/lovable-uploads/cee89299-*.png public/images/case-studies/allegiance-card.png
cp public/lovable-uploads/84c87a09-*.png public/images/case-studies/allegiance-logo.png
cp public/lovable-uploads/073035e6-*.png public/images/case-studies/allegiance-modal.png
# ... repeat for other case studies
```

---

## Phase 6: SEO & Final Setup

### Step 6.1: Generate Sitemap

Astro can auto-generate sitemaps. Add to config:

```bash
npm install @astrojs/sitemap
```

**Update `astro.config.mjs`:**

```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bedabedagrowth.com',
  integrations: [
    // ... other integrations
    sitemap(),
  ],
});
```

### Step 6.2: Update robots.txt

**File: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://bedabedagrowth.com/sitemap-index.xml
```

### Step 6.3: Configure Vercel

**File: `vercel.json`**

```json
{
  "framework": "astro",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

## Implementation Checklist

### Phase 1: Astro Migration
- [ ] Install Astro and required packages
- [ ] Create `astro.config.mjs`
- [ ] Create `BaseLayout.astro`
- [ ] Convert `Index.tsx` → `index.astro`
- [ ] Convert `Services.tsx` → `services.astro`
- [ ] Convert `Contact.tsx` → `contact.astro`
- [ ] Convert other pages
- [ ] Test all pages render correctly

### Phase 2: Keystatic Setup
- [ ] Install Keystatic packages
- [ ] Create `keystatic.config.ts` with blog + case study schemas
- [ ] Create `/keystatic/[...params].astro` route
- [ ] Create `/api/keystatic/[...params].ts` API route
- [ ] Test Keystatic admin UI locally

### Phase 3: Blog Feature
- [ ] Create `src/pages/blog/index.astro`
- [ ] Create `src/pages/blog/[slug].astro`
- [ ] Add blog link to Header navigation
- [ ] Create first test blog post
- [ ] Verify SEO meta tags work

### Phase 4: Case Studies
- [ ] Update `CaseStudyGallery.tsx` to accept props
- [ ] Update homepage to pass case studies as props
- [ ] Test carousel and modals work

### Phase 5: Content Migration
- [ ] Create content directories
- [ ] Create JSON files for all 5 case studies
- [ ] Move/rename images to new locations
- [ ] Verify all case studies display correctly

### Phase 6: Production Setup
- [ ] Create GitHub OAuth App
- [ ] Add environment variables to Vercel:
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `KEYSTATIC_SECRET`
- [ ] Deploy to Vercel
- [ ] Test Keystatic login in production
- [ ] Test content editing workflow
- [ ] Submit sitemap to Google Search Console

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   Astro     │    │  Keystatic  │    │   GitHub    │    │
│   │   Pages     │◄───│  Admin UI   │───►│    Repo     │    │
│   │  (static)   │    │ /keystatic  │    │  (content)  │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                                      │            │
│         │         ┌─────────────────┐          │            │
│         └────────►│ src/content/    │◄─────────┘            │
│                   │   blog/*.mdx    │                       │
│                   │   case-studies/ │                       │
│                   └─────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Your wife's workflow:
1. bedabedagrowth.com/keystatic
2. Login with GitHub
3. Edit content visually
4. Save → commits to repo → Vercel rebuilds → live!
```

---

## Estimated Migration Effort

| Task | Files |
|------|-------|
| Astro setup & config | 3 new |
| Layout & page conversions | 6-8 modified |
| Keystatic config | 2 new |
| Blog pages | 2 new |
| Case study refactor | 1 modified |
| Content files | 5+ new (JSON for case studies) |
| API routes | 1 new |

**Total:** ~15-20 files to create/modify

---

## Questions Before Starting

1. **GitHub access for your wife?**
   - She'll need a GitHub account to log into Keystatic
   - Just needs to be added as collaborator on the repo

2. **Blog URL preference?**
   - `/blog/post-title` (recommended)
   - Something else?

3. **Keep Lovable integration?**
   - The `lovable-tagger` can be removed if not needed
   - Or kept for visual editing of non-content stuff

4. **Domain confirmed?**
   - Plan assumes `bedabedagrowth.com`
   - Need to know for OAuth callback URLs
