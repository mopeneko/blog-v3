# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
bun dev              # Development server (with Turbopack)
bun build            # Production build  
bun start            # Production server
bun test             # Run tests with Vitest
bun test:ui          # Test UI interface
bun format           # Format code with Biome
bun lint             # Next.js linting
```

## Deployment Commands

```bash
bun run preview      # Build and preview with OpenNext locally
bun run deploy       # Build and deploy to Cloudflare Workers
bun run upload       # Build and upload to Cloudflare Workers
bun run cf-typegen   # Generate Cloudflare environment types
```

## Architecture Overview

This is a Japanese blog built with Next.js 15 App Router, deployed on Cloudflare Workers using OpenNext, with content managed through microCMS.

### Content Management System

- **microCMS Integration**: All content fetching is centralized in `src/lib/api/list_posts.ts`
- **Type Safety**: Full Zod schema validation for all CMS content types (Post, Page, Tag, Product, Image)
- **Content Types**: Posts (main content), Pages (static content), Tags (taxonomy), Products (affiliate content)

### Key API Functions

- `fetchPosts()`: Homepage post listing
- `fetchPostBySlug(slug)`: Individual post retrieval
- `fetchPostsByTags(tagIds)`: Tag-filtered posts with related posts
- `fetchPageBySlug(slug)`: Static page content
- `fetchTagById(id)`: Tag metadata

### Deployment Configuration

- **OpenNext**: Configured for Cloudflare Workers with R2 incremental cache
- **Wrangler**: Production deployment via `wrangler.jsonc`
- **Cache**: R2 bucket (`mope-blog`) for Next.js ISR

### Required Environment Variables

```
MICROCMS_SERVICE_DOMAIN= # microCMS service domain
MICROCMS_API_KEY=        # microCMS API key
NEXT_PUBLIC_SITE_URL=    # Public site URL
```

### Routing Structure

- `/` - Homepage (post list with AdSense placement every 3 posts)
- `/posts/[slug]` - Individual post pages
- `/pages/[slug]` - Static pages
- `/tags/[id]` - Tag-filtered post lists
- `/rss.xml` - RSS feed generation (API route)

### Component Patterns

- **ArticleCard**: Main post card with thumbnail, metadata, and tags
- **ProductCard**: Affiliate product display with structured data
- **LiteYTEmbed**: Performance-optimized YouTube embeds
- **RelatedArticleCard**: Tag-based post recommendations

### Content Processing

- **SEO**: Dynamic Open Graph metadata and JSON-LD structured data
- **RSS**: Custom RSS generation with HTML content processing
- **Ad Integration**: Automatic AdSense placement via rehype plugins
- **Related Posts**: Tag-based content recommendations

### Testing Setup

- **Framework**: Vitest with jsdom environment
- **Coverage**: RSS generation has comprehensive test coverage
- **Path Aliases**: `@/*` imports configured for `src/*`

### Code Quality

- **Formatting**: Biome (not Prettier) - run `bun format`
- **Linting**: Next.js ESLint configuration
- **TypeScript**: Strict mode with comprehensive type coverage

ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `cu log <env_id>` AND `cu checkout <env_id>`. Failure to do this will make your work inaccessible to others.
