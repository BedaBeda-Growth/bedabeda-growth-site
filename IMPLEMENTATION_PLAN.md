# BedaBeda Growth Site - Blog & CMS Implementation Plan

## Executive Summary

This plan outlines how to add:
1. **A blog** - SEO-friendly, easy to update without coding
2. **Case study management** - Swap out case studies via a visual interface

**Current State**: Everything is hardcoded in React components. No backend, no CMS.

**Recommended Solution**: **Sanity CMS** (headless CMS with visual editor)

---

## Why Sanity CMS?

| Feature | Benefit |
|---------|---------|
| Free tier | 100K API requests/month, 10GB bandwidth - plenty for a marketing site |
| Visual editor | Non-technical users can add/edit content |
| Image handling | Built-in image optimization and CDN |
| SEO fields | Easy to add meta titles, descriptions, OG images |
| React SDK | First-class React integration |
| Real-time | Content updates appear instantly |
| Portable | You own your data, can export anytime |

**Alternative Options** (covered at end):
- Contentful (similar to Sanity, slightly less flexible)
- MDX files in repo (requires GitHub knowledge to update)

---

## Phase 1: Sanity CMS Setup

### Step 1.1: Create Sanity Project

```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Create new Sanity project (in a separate folder, NOT in the React app)
cd ..
mkdir bedabeda-cms
cd bedabeda-cms
npx sanity@latest init

# When prompted:
# - Create new project: Yes
# - Project name: bedabeda-growth-cms
# - Use default dataset (production): Yes
# - Project output path: (current directory)
# - Select template: Clean project with no predefined schemas
```

### Step 1.2: Define Content Schemas

Create schemas for blog posts and case studies.

**File: `bedabeda-cms/schemaTypes/blogPost.ts`**

```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary for SEO and previews (150-160 chars ideal)',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'BedaBeda Growth Team',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'CRO', value: 'cro' },
          { title: 'E-commerce', value: 'ecommerce' },
          { title: 'Landing Pages', value: 'landing-pages' },
          { title: 'A/B Testing', value: 'ab-testing' },
          { title: 'Case Study', value: 'case-study' },
        ],
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' }, // Rich text
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    }),
    // SEO Fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Meta Title', type: 'string' },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2 },
        { name: 'ogImage', title: 'Open Graph Image', type: 'image' },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
      media: 'featuredImage',
    },
  },
})
```

**File: `bedabeda-cms/schemaTypes/caseStudy.ts`**

```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Product Page Optimization"',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first in carousel',
    }),
    defineField({
      name: 'metric',
      title: 'Key Metric',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "+15.8% Revenue Per Session"',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'string',
      description: 'One-line description for the card',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'E-commerce', value: 'E-commerce' },
          { title: 'Landing Page', value: 'Landing Page' },
          { title: 'Online B2C Community', value: 'Online B2C Community' },
          { title: 'High SKU E-Commerce', value: 'High SKU E-Commerce' },
        ],
      },
    }),
    defineField({
      name: 'cardBackgroundImage',
      title: 'Card Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown in the carousel card',
    }),
    defineField({
      name: 'clientLogo',
      title: 'Client Logo',
      type: 'image',
      description: 'Small logo shown in bottom-right of card',
    }),
    defineField({
      name: 'modalImage',
      title: 'Modal/Popup Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Large image shown when clicking into the case study',
    }),
    defineField({
      name: 'challenge',
      title: 'Challenge',
      type: 'text',
      rows: 4,
      description: 'What challenge did the client face?',
    }),
    defineField({
      name: 'solution',
      title: 'Solution',
      type: 'text',
      rows: 4,
      description: 'How did BedaBeda solve it?',
    }),
    defineField({
      name: 'isActive',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to show/hide this case study',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      metric: 'metric',
      media: 'cardBackgroundImage',
    },
    prepare({ title, metric, media }) {
      return {
        title,
        subtitle: metric,
        media,
      }
    },
  },
})
```

**File: `bedabeda-cms/schemaTypes/index.ts`**

```typescript
import blogPost from './blogPost'
import caseStudy from './caseStudy'

export const schemaTypes = [blogPost, caseStudy]
```

### Step 1.3: Deploy Sanity Studio

```bash
# Deploy the Sanity Studio (admin interface)
cd bedabeda-cms
npx sanity deploy

# This will give you a URL like: https://bedabeda-growth-cms.sanity.studio
# Your wife can bookmark this to manage content!
```

---

## Phase 2: Connect React App to Sanity

### Step 2.1: Install Sanity Client in React App

```bash
cd /home/user/bedabeda-growth-site
npm install @sanity/client @sanity/image-url @portabletext/react
```

### Step 2.2: Create Sanity Client Configuration

**File: `src/lib/sanity.ts`**

```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'YOUR_PROJECT_ID', // Get from sanity.io/manage
  dataset: 'production',
  useCdn: true, // Faster, cached responses
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Query helpers
export async function getBlogPosts() {
  return client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      featuredImage,
      categories,
      author
    }
  `)
}

export async function getBlogPost(slug: string) {
  return client.fetch(`
    *[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      featuredImage,
      categories,
      author,
      body,
      seo
    }
  `, { slug })
}

export async function getCaseStudies() {
  return client.fetch(`
    *[_type == "caseStudy" && isActive == true] | order(order asc) {
      _id,
      title,
      metric,
      description,
      category,
      cardBackgroundImage,
      clientLogo,
      modalImage,
      challenge,
      solution
    }
  `)
}
```

### Step 2.3: Create Custom Hook for Data Fetching

**File: `src/hooks/useSanityData.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { getBlogPosts, getBlogPost, getCaseStudies } from '@/lib/sanity'

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: getBlogPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => getBlogPost(slug),
    enabled: !!slug,
  })
}

export function useCaseStudies() {
  return useQuery({
    queryKey: ['caseStudies'],
    queryFn: getCaseStudies,
    staleTime: 1000 * 60 * 5,
  })
}
```

---

## Phase 3: Build the Blog Feature

### Step 3.1: Create Blog List Page

**File: `src/pages/Blog.tsx`**

```tsx
import { useBlogPosts } from '@/hooks/useSanityData'
import { urlFor } from '@/lib/sanity'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Helmet } from 'react-helmet-async'

const Blog = () => {
  const { data: posts, isLoading, error } = useBlogPosts()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Blog | BedaBeda Growth - CRO & Conversion Optimization Insights</title>
        <meta name="description" content="Expert insights on conversion rate optimization, A/B testing, and e-commerce growth strategies from the BedaBeda Growth team." />
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              The Growth Blog
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Insights on CRO, A/B testing, and conversion optimization
            </p>

            <div className="grid gap-8">
              {posts?.map((post: any) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug.current}`}
                  className="group"
                >
                  <article className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-gray-200 hover:border-primary transition-colors">
                    {post.featuredImage && (
                      <div className="md:w-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={urlFor(post.featuredImage).width(400).height(250).url()}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        {post.categories?.map((cat: string) => (
                          <span
                            key={cat}
                            className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-2">
                        {post.excerpt}
                      </p>
                      <time className="text-xs text-gray-400">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Blog
```

### Step 3.2: Create Blog Post Detail Page

**File: `src/pages/BlogPost.tsx`**

```tsx
import { useParams } from 'react-router-dom'
import { useBlogPost } from '@/hooks/useSanityData'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Helmet } from 'react-helmet-async'

// Custom components for Portable Text rendering
const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <figure className="my-8">
        <img
          src={urlFor(value).width(800).url()}
          alt={value.alt || ''}
          className="rounded-lg w-full"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-gray-600">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ value, children }: any) => (
      <a
        href={value.href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
}

const BlogPost = () => {
  const { slug } = useParams()
  const { data: post, isLoading } = useBlogPost(slug || '')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return <div>Post not found</div>
  }

  const seoTitle = post.seo?.metaTitle || post.title
  const seoDescription = post.seo?.metaDescription || post.excerpt
  const ogImage = post.seo?.ogImage
    ? urlFor(post.seo.ogImage).width(1200).height(630).url()
    : post.featuredImage
      ? urlFor(post.featuredImage).width(1200).height(630).url()
      : null

  return (
    <>
      <Helmet>
        <title>{seoTitle} | BedaBeda Growth Blog</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <article className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm mb-8">
              <a href="/blog" className="text-gray-500 hover:text-primary">Blog</a>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-700">{post.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-8">
              <div className="flex gap-2 mb-4">
                {post.categories?.map((cat: string) => (
                  <span
                    key={cat}
                    className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-500">
                <span>{post.author}</span>
                <span>•</span>
                <time>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={urlFor(post.featuredImage).width(1200).url()}
                  alt={post.title}
                  className="w-full"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <PortableText
                value={post.body}
                components={portableTextComponents}
              />
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-gray-100 rounded-2xl text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to grow your conversions?</h3>
              <p className="text-gray-600 mb-4">Let's talk about how we can help.</p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  )
}

export default BlogPost
```

### Step 3.3: Add Routes and Navigation

**Update `src/App.tsx`** - Add new routes:

```tsx
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'

// Add to routes:
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />
```

**Update `src/components/Header.tsx`** - Add Blog link to navigation:

```tsx
// Add to the navigation items:
{ name: 'Blog', path: '/blog' }
```

### Step 3.4: Install SEO Dependencies

```bash
npm install react-helmet-async
```

**Wrap app in HelmetProvider** in `src/main.tsx`:

```tsx
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)
```

---

## Phase 4: Update Case Studies to Use CMS

### Step 4.1: Refactor CaseStudyGallery Component

**Replace `src/components/CaseStudyGallery.tsx`** with dynamic version:

```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useCaseStudies } from "@/hooks/useSanityData"
import { urlFor } from "@/lib/sanity"

const CaseStudyGallery = () => {
  const { data: caseStudies, isLoading } = useCaseStudies()

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

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
              {caseStudies?.map((study: any) => (
                <CarouselItem key={study._id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors group">
                        <div className="aspect-[4/3] bg-gray-700 relative overflow-hidden">
                          {study.cardBackgroundImage && (
                            <>
                              <img
                                src={urlFor(study.cardBackgroundImage).width(600).height(450).url()}
                                alt={study.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            </>
                          )}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 relative">
                              <p className="text-xs text-gray-300 mb-1">{study.category}</p>
                              <p className="font-semibold text-lg">{study.metric}</p>
                              {study.clientLogo && (
                                <img
                                  src={urlFor(study.clientLogo).height(24).url()}
                                  alt="Client logo"
                                  className="absolute top-2 right-2 h-6 w-auto"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {study.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {study.description}
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        {study.modalImage && (
                          <div className="bg-gray-100 rounded-lg mb-6 overflow-hidden">
                            <img
                              src={urlFor(study.modalImage).width(1200).url()}
                              alt={study.title}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                        <h2 className="text-2xl font-bold mb-4">{study.title}</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Challenge</h3>
                            <p className="text-gray-600 mb-4">{study.challenge}</p>
                            <h3 className="font-semibold mb-2">Solution</h3>
                            <p className="text-gray-600">{study.solution}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Results</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-3xl font-bold text-primary mb-2">{study.metric}</div>
                              <p className="text-gray-600 text-sm">{study.description}</p>
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
  )
}

export default CaseStudyGallery
```

### Step 4.2: Migrate Existing Case Studies to Sanity

After Sanity is set up, manually enter the 5 existing case studies via the Sanity Studio interface. Upload the images from `/public/lovable-uploads/` directory.

---

## Phase 5: SEO Optimizations

### Step 5.1: Add Sitemap Generation

Create a build script to generate sitemap. Install dependencies:

```bash
npm install -D sitemap
```

**File: `scripts/generate-sitemap.js`**

```javascript
const { SitemapStream, streamToPromise } = require('sitemap')
const { createWriteStream } = require('fs')
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://bedabedagrowth.com' })
  const writeStream = createWriteStream('./dist/sitemap.xml')
  sitemap.pipe(writeStream)

  // Static pages
  sitemap.write({ url: '/', changefreq: 'weekly', priority: 1.0 })
  sitemap.write({ url: '/services', changefreq: 'monthly', priority: 0.8 })
  sitemap.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 })
  sitemap.write({ url: '/blog', changefreq: 'daily', priority: 0.9 })

  // Blog posts
  const posts = await client.fetch(`*[_type == "blogPost"]{ slug, publishedAt }`)
  for (const post of posts) {
    sitemap.write({
      url: `/blog/${post.slug.current}`,
      lastmod: post.publishedAt,
      changefreq: 'monthly',
      priority: 0.7,
    })
  }

  sitemap.end()
  await streamToPromise(sitemap)
  console.log('Sitemap generated!')
}

generateSitemap()
```

### Step 5.2: Update robots.txt

**Update `public/robots.txt`**:

```
User-agent: *
Allow: /

Sitemap: https://bedabedagrowth.com/sitemap.xml
```

### Step 5.3: Add JSON-LD Structured Data

Add to blog posts for better search appearance:

```tsx
// In BlogPost.tsx, add this JSON-LD script in <Helmet>:
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Organization",
      "name": "BedaBeda Growth"
    },
    "datePublished": post.publishedAt,
    "image": ogImage,
    "publisher": {
      "@type": "Organization",
      "name": "BedaBeda Growth",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bedabedagrowth.com/logo.png"
      }
    }
  })}
</script>
```

---

## Implementation Checklist

### Phase 1: Sanity Setup (Do First)
- [ ] Install Sanity CLI
- [ ] Create Sanity project
- [ ] Define blog post schema
- [ ] Define case study schema
- [ ] Deploy Sanity Studio
- [ ] Note down project ID and dataset name

### Phase 2: React Integration
- [ ] Install Sanity client packages
- [ ] Create `src/lib/sanity.ts` with client config
- [ ] Create `src/hooks/useSanityData.ts`
- [ ] Test connection with a simple query

### Phase 3: Blog Feature
- [ ] Install react-helmet-async
- [ ] Create Blog list page (`src/pages/Blog.tsx`)
- [ ] Create Blog post page (`src/pages/BlogPost.tsx`)
- [ ] Add routes to App.tsx
- [ ] Add Blog link to header navigation
- [ ] Add HelmetProvider to main.tsx
- [ ] Test with sample blog post

### Phase 4: Case Studies CMS
- [ ] Refactor CaseStudyGallery to use Sanity data
- [ ] Migrate existing 5 case studies to Sanity
- [ ] Upload all images to Sanity
- [ ] Test carousel and modals work correctly
- [ ] Remove hardcoded data

### Phase 5: SEO & Polish
- [ ] Set up sitemap generation
- [ ] Update robots.txt
- [ ] Add JSON-LD structured data
- [ ] Test meta tags with social preview tools
- [ ] Submit sitemap to Google Search Console

---

## Alternative Approaches

### Option B: MDX-Based Blog (Simpler, More Technical)

If the team is comfortable with Git/GitHub, MDX offers a simpler approach:

```
src/
  content/
    blog/
      my-first-post.mdx
      another-post.mdx
```

**Pros:**
- No external service needed
- Content lives in the repo
- Version controlled

**Cons:**
- Requires Git knowledge to publish
- No visual editor
- Need to redeploy for new content

### Option C: Contentful (Alternative CMS)

Similar to Sanity but with a different interface:

**Pros:**
- Very polished admin interface
- Good documentation

**Cons:**
- Pricing can scale up quickly
- Less flexible than Sanity

---

## Questions to Decide Before Starting

1. **Domain for Sanity Studio?**
   - Default: `bedabeda-cms.sanity.studio`
   - Or custom subdomain like `admin.bedabedagrowth.com`

2. **Who will be writing blog posts?**
   - Just your wife? Add her email as admin
   - Multiple authors? Set up team permissions

3. **Blog URL structure preference?**
   - `/blog/post-title` (recommended)
   - `/insights/post-title`
   - `/resources/post-title`

4. **Categories for blog posts?**
   - Current suggestions: CRO, E-commerce, Landing Pages, A/B Testing, Case Study
   - Any others to add?

---

## Estimated Scope

| Phase | Complexity | Files to Create/Modify |
|-------|-----------|----------------------|
| Phase 1: Sanity Setup | Medium | 4-5 new files (separate repo) |
| Phase 2: React Integration | Low | 2 new files |
| Phase 3: Blog Feature | Medium | 3 new files, 2 modified |
| Phase 4: Case Studies | Low | 1 file refactored |
| Phase 5: SEO | Low | 2 new files, 1 modified |

**Total new files:** ~10-12
**Total modified files:** ~4-5
