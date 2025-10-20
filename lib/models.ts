/**
 * OpenRouter model selection and API client
 */

export const DEFAULT_MODEL_PREFERENCE = [
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
  'google/gemini-1.5-pro',
  'meta-llama/llama-3.1-405b-instruct',
];

/**
 * Get the preferred model from environment or use default
 */
export function getModelPreference(): string[] {
  const envPref = process.env.MODEL_PREFERENCE;
  if (envPref) {
    return envPref.split(',').map(m => m.trim());
  }
  return DEFAULT_MODEL_PREFERENCE;
}

/**
 * Pick the first available model from preferences
 * In production, you might want to check model availability via OpenRouter API
 */
export function pickPreferredModel(): string {
  const preferences = getModelPreference();
  return preferences[0]; // For now, just use the first preference
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: { type: 'json_object' };
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenRouter API with the given messages
 */
export async function callOpenRouter(
  systemMessage: string,
  userMessage: string,
  useJsonMode = true
): Promise<{ content: string; usage?: OpenRouterResponse['usage']; model?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const siteUrl = process.env.OPENROUTER_SITE_URL || 'https://ush-image-helper.vercel.app';
  const appName = process.env.OPENROUTER_APP_NAME || 'ush-image-helper';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const model = pickPreferredModel();

  const requestBody: OpenRouterRequest = {
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  };

  // Add JSON mode if supported and requested
  // Note: OpenRouter supports response_format for some models
  if (useJsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': appName,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenRouter');
  }

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
  };
}

