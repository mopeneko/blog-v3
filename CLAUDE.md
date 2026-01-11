# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
bun install          # Install dependencies (lockfile checked in)
bun dev              # Development server with Turbopack at localhost:3000
bun build            # Production build
bun start            # Serve production build
bun test             # Run tests with Vitest
bun test:ui          # Test watcher UI for debugging
bun format           # Format code with Biome
bun lint             # Lint with Biome
bun lint:fix         # Auto-fix lint issues
```

## Architecture Overview

Japanese blog built with Next.js 15 App Router, deployed to Google Cloud Run via Docker containers.

### Project Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Shared React components (ArticleCard, ProductCard, etc.)
- `src/lib/api/` - microCMS data fetching with Zod validation
- `src/lib/structured-data/` - JSON-LD schema generators
- `public/` - Static assets (fonts, favicons)

### Content Management

All content comes from microCMS. Data fetching is centralized in `src/lib/api/list_posts.ts` with full Zod schema validation.

**Key API functions:**
- `fetchPosts()` - Homepage post listing
- `fetchPostBySlug(slug)` - Individual post
- `fetchPostsByTags(tagIds)` - Tag-filtered posts
- `fetchPageBySlug(slug)` - Static page content
- `fetchTagById(id)` - Tag metadata

**Content types:** Posts, Pages, Tags, Products (affiliate)

### Routes

- `/` - Homepage with post list
- `/posts/[id]` - Individual posts
- `/pages/[id]` - Static pages
- `/tags/[id]` - Tag-filtered lists
- `/rss.xml` - RSS feed (API route)

### Required Environment Variables

```
MICROCMS_SERVICE_DOMAIN  # microCMS service domain
MICROCMS_API_KEY         # microCMS API key
NEXT_PUBLIC_SITE_URL     # Public site URL
```

## Code Style

- **Formatter:** Biome (not Prettier) - 2-space indent, single quotes
- **Imports:** Use `@/*` alias for `src/*` paths
- **Components:** Functional React with typed props, Tailwind + daisyUI
- **Tests:** Vitest with jsdom, colocate `*.test.ts` files with features

## Deployment

Docker-based deployment to Google Cloud Run via Cloud Build (`cloudbuild.yaml`). The `next.config.ts` uses standalone output mode for containerization.

Alternative deployment via Taskfile: `task deploy` (requires Docker and OCI CLI configured)
