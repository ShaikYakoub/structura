# Structura - Multi-Tenant Website Builder

Production-ready Dockerized Next.js 15 application with PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Styling**: Tailwind CSS
- **Infrastructure**: Docker & Docker Compose

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start both app and database
npm run docker:up

# Initialize database
docker exec structura-app npx prisma migrate dev --name init

# Visit http://localhost:3000
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (via Docker)
docker-compose up postgres -d

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start dev server
npm run dev

# Visit http://localhost:3000
```

## Database Schema

**Multi-Tenant Architecture:**

- `Tenant` → Client/Organization
- `Site` → Website (belongs to Tenant)
- `Page` → Content (belongs to Site)

All models use UUIDs for IDs.

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:build     # Rebuild and start containers
```

## Environment Variables

Copy `.env.example` to `.env` and update as needed.

```env
DATABASE_URL="postgresql://structura:structura_dev_password@localhost:5432/structura"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## AI-Powered Site Generation

Structura includes an AI-powered site generator using **Google Gemini 2.0 Flash**. Users can describe their business in natural language, and the AI will generate a complete landing page with professional copy, appropriate components, and optimized structure.

### Setup

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key
```

### Features

- **Natural Language Input**: Describe your business in plain English
- **Intelligent Component Selection**: AI chooses optimal components (hero, features, pricing, etc.)
- **Professional Copy**: Generates compelling headlines, descriptions, and CTAs
- **Structured Outputs**: Uses Zod schemas for type-safe, validated content
- **Zero-Downtime Generation**: Creates temporary tenants and sites, handles collisions automatically

### Usage

1. Click "Create with AI" on the dashboard
2. Describe your business (e.g., "A luxury pet hotel in Dubai with grooming services")
3. AI generates a complete site in seconds
4. Edit and customize in the visual editor

### Example Prompts

- "A modern yoga studio offering online and in-person classes"
- "An organic coffee roastery that ships worldwide"
- "A mobile app development agency for startups"
- "A sustainable fashion brand selling handmade clothing"

## Project Structure

```
structura/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── lib/
│   └── prisma.ts       # Prisma singleton client
├── prisma/
│   └── schema.prisma   # Database schema
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Docker orchestration
└── next.config.ts      # Next.js config (standalone output)
```

## Production Deployment

The Dockerfile uses Next.js standalone output for optimal image size (~150MB).

```bash
# Build and run
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

## Notes

- PostgreSQL data persists in a Docker volume
- Prisma migrations run automatically on container startup
- Standalone build optimizes for production
- Connection pooling handled by Prisma singleton pattern
