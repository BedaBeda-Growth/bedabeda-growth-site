import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: process.env.NODE_ENV === 'production' ? 'github' : 'local',
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
