# USH Image Helper

A production-ready, AI-powered image suggestion tool for medical communications. Built for USHealthConnect to help generate compliant image concepts, stock photo keywords, and alt text descriptions.

## Features

- **Multi-format Input**: Accept text, URLs, and file uploads (PDF, DOCX, TXT)
- **Three Request Types**:
  - Illustration Concept: Get creative direction with composition and style guidance
  - Stock Photo Keywords: Generate 10-20 searchable keywords for stock libraries
  - Alt Text Description: Create accessible, device-safe descriptions
- **MIF Compliance**: Built-in content safety rules for medical communications
- **OpenRouter Integration**: Flexible model selection with automatic fallback
- **Streaming Responses**: Fast, real-time AI generation
- **Modern UI**: Clean, accessible interface with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Validation**: Zod with JSON Schema enforcement
- **File Parsing**: pdf-parse, docx-parser
- **AI**: OpenRouter API (Claude, GPT-4, Gemini, Llama)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRouter API key ([get one here](https://openrouter.ai/))

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd img_gen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_actual_api_key_here
   OPENROUTER_SITE_URL=http://localhost:3000
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Required:
- `OPENROUTER_API_KEY`: Your OpenRouter API key

Optional:
- `OPENROUTER_BASE_URL`: API endpoint (default: https://openrouter.ai/api/v1)
- `OPENROUTER_SITE_URL`: Your app URL for OpenRouter headers
- `OPENROUTER_APP_NAME`: App identifier for OpenRouter (default: ush-image-helper)
- `MODEL_PREFERENCE`: Comma-separated list of model IDs in order of preference

## Model Selection

The app uses OpenRouter and tries models in this order:
1. `anthropic/claude-3.5-sonnet` (best for structured output)
2. `openai/gpt-4o` (creative, strong vision-language)
3. `google/gemini-1.5-pro` (long-context support)
4. `meta-llama/llama-3.1-405b-instruct` (cost-effective)

Customize via `MODEL_PREFERENCE` environment variable.

## MIF Compliance Rules

The system enforces Medical Information Framework (MIF) rules:
- No brand/drug names in screenshots
- No needles or injections
- No ISI (Important Safety Information) in images
- Children only for pediatric content (with warnings)
- No drug branding colors
- No clinical trial data visualization
- No dense small text
- No nude/partial-nude imagery
- No closed captions in images

Violations trigger warnings and compliant alternatives.

## Project Structure

```
/app
  /api
    /generate/route.ts    # Main generation endpoint
    /health/route.ts      # Health check
  /page.tsx              # Main UI
  /layout.tsx           # Root layout
  /globals.css          # Global styles
/components
  /ui/                  # shadcn/ui components
  Form.tsx              # Input form
  Output.tsx            # Results display
/lib
  schema.ts             # Zod schemas
  parsing.ts            # File & URL parsing
  mif.ts                # MIF compliance checker
  prompts.ts            # Prompt builders
  models.ts             # OpenRouter client
  utils.ts              # Utilities
```

## API Endpoints

### POST /api/generate

Generate image suggestions based on input material.

**Request**: `multipart/form-data`
- `subsidiary`: "RMD" | "GLC" | "BMC"
- `requestType`: "ILLUSTRATION_CONCEPT" | "STOCK_PHOTO_KEYWORDS" | "ALT_TEXT_DESCRIPTION"
- `userText`: Optional text input
- `url`: Optional URL to fetch
- `files`: Optional file uploads (PDF, DOCX, TXT)

**Response**: JSON
```json
{
  "success": true,
  "data": {
    "title": "Image title",
    "altText": "Alt text description",
    "stockKeywords": ["keyword1", "keyword2"],
    "graphicSuggestions": ["suggestion1", "suggestion2"],
    "notes": ["warning1"]
  },
  "meta": {
    "duration": 1234,
    "mifWarnings": [],
    "wasTruncated": false
  }
}
```

### GET /api/health

Health check endpoint.

**Response**: `{ "ok": true, "timestamp": "ISO-8601" }`

## Deploy to Vercel

1. Push your code to GitHub

2. Import project in Vercel dashboard

3. Configure environment variables:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_SITE_URL` (your Vercel URL)

4. Deploy!

Alternatively, use the Vercel CLI:
```bash
vercel
```

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck

# Lint
npm run lint
```

## Limitations

- Source material is capped at ~12,000 characters
- File uploads limited to PDF, DOCX, TXT
- URL fetches timeout after 10 seconds
- Single file size should be reasonable (< 10MB)

## Support

For questions or issues, contact the USHealthConnect development team.

## License

Proprietary - USHealthConnect

