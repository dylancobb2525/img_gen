# AI Models Configuration

## Current Model Setup

The app uses **OpenRouter** to access multiple AI models with automatic fallback.

### Default Model Priority (tries in this order):

1. **Claude 3.5 Sonnet** (Anthropic) - `anthropic/claude-3.5-sonnet`
   - Best for structured JSON outputs
   - Excellent instruction following
   - Most reliable for this use case
   - ~$3 per million tokens

2. **GPT-4o** (OpenAI) - `openai/gpt-4o`
   - Strong creative capabilities
   - Good fallback option
   - ~$2.50 per million tokens

3. **Gemini 1.5 Pro** (Google) - `google/gemini-1.5-pro`
   - Long context window (1M tokens)
   - Good for large documents
   - ~$1.25 per million tokens

4. **Llama 3.1 405B** (Meta) - `meta-llama/llama-3.1-405b-instruct`
   - Cost-effective option
   - Open source model
   - ~$0.75 per million tokens

## How to Change Models

### Option 1: Edit .env.local

Add or modify this line:
```env
MODEL_PREFERENCE=anthropic/claude-3.5-sonnet,openai/gpt-4o
```

The app will try models in the order you list them.

### Option 2: Try Different Models

Available on OpenRouter:
- `anthropic/claude-3-opus` - Most capable Claude model
- `openai/gpt-4-turbo` - Fast GPT-4 variant
- `google/gemini-pro` - Standard Gemini
- `mistralai/mistral-large` - European alternative
- `x-ai/grok-beta` - xAI's Grok model

### Option 3: Edit lib/models.ts

Change the `DEFAULT_MODEL_PREFERENCE` array to your preferred models.

## Current Usage

The app will automatically display which model was used below the "Generated Suggestions" heading in small text.

## Troubleshooting

**If you get JSON parsing errors:**
- Claude 3.5 Sonnet is most reliable
- Try lowering temperature in `lib/models.ts`
- Check OpenRouter status at https://openrouter.ai/status

**If responses are too creative/random:**
- Temperature is set to 0.3 (lower = more consistent)
- Adjust in `lib/models.ts` if needed

**If costs are too high:**
- Switch to Llama 3.1 405B or Gemini
- Monitor usage at https://openrouter.ai/activity

