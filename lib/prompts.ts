import { RequestType, Subsidiary } from './schema';
import { getMIFRulesText } from './mif';
import { getLLMResponseJsonSchema } from './schema';

/**
 * Build the system message for the LLM
 */
export function buildSystemMessage(requestType: RequestType): string {
  const jsonSchema = JSON.stringify(getLLMResponseJsonSchema(), null, 2);
  
  let typeSpecificInstructions = '';
  
  switch (requestType) {
    case 'STOCK_PHOTO_KEYWORDS':
      typeSpecificInstructions = `
When requestType is STOCK_PHOTO_KEYWORDS:
- Emphasize generic, licensable stock photo keywords
- Provide 10-20 specific, searchable keywords
- Focus on visual elements, emotions, settings, and composition
- Make keywords useful for searching stock photo libraries`;
      break;
      
    case 'ALT_TEXT_DESCRIPTION':
      typeSpecificInstructions = `
When requestType is ALT_TEXT_DESCRIPTION:
- Write 1-3 clear, concise sentences for screen readers
- Ensure the alt text is device-safe and accessible
- Do not include brand claims or clinical outcomes
- Focus on describing what would be visually represented`;
      break;
      
    case 'ILLUSTRATION_CONCEPT':
      typeSpecificInstructions = `
When requestType is ILLUSTRATION_CONCEPT:
- Provide 3-6 clear, actionable bullets in graphicSuggestions
- Include composition ideas, subject matter, and visual style cues
- Be concrete and specific to guide designers
- Suggest themes, color palettes, and layout approaches`;
      break;
  }

  return `You are an expert medical-communications creative assistant for USHealthConnect.

Your role is to help generate compliant, professional image concepts and descriptions for medical education materials.

CRITICAL: Always follow MIF (Medical Information Framework) Rules:
${getMIFRulesText()}

If the source material contains content that violates these rules, you MUST:
1. Rewrite suggestions to compliant alternatives
2. Add a clear warning in the "notes" field
3. Explain what was changed and why

${typeSpecificInstructions}

OUTPUT FORMAT:
You MUST return ONLY valid JSON. Do NOT wrap it in markdown code blocks or add any other text.

Return a JSON object with these exact fields:
- "title" (string): The image title/headline
- "altText" (string): Device-safe alt text description
- "stockKeywords" (array of strings, optional): Only include if request type is Stock Photo Keywords
- "graphicSuggestions" (array of strings): 3-6 conceptual/graphic suggestions
- "notes" (array of strings, optional): Any warnings or caveats

Example format:
{
  "title": "Example title",
  "altText": "Example alt text",
  "graphicSuggestions": ["Suggestion 1", "Suggestion 2"],
  "notes": ["Note 1"]
}

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object, no markdown formatting
- No text before or after the JSON
- All field names must match exactly
- Ensure valid JSON syntax (proper quotes, commas, brackets)
- Be concise, concrete, and immediately usable by designers
- All suggestions must be MIF-compliant`;
}

/**
 * Build the user message with all context
 */
export function buildUserMessage(
  subsidiary: Subsidiary,
  requestType: RequestType,
  sourceText: string,
  mifWarnings: string[],
  wasTruncated: boolean
): string {
  const subsidiaryNames: Record<Subsidiary, string> = {
    RMD: 'ReachMD',
    GLC: 'Global Learning Collaborative',
    BMC: 'Bryn Mawr Communications',
  };

  const requestTypeNames: Record<RequestType, string> = {
    ILLUSTRATION_CONCEPT: 'Illustration Concept',
    STOCK_PHOTO_KEYWORDS: 'Stock Photo Keywords',
    ALT_TEXT_DESCRIPTION: 'Alt Text Description',
  };

  let message = `SUBSIDIARY: ${subsidiaryNames[subsidiary]}
REQUEST TYPE: ${requestTypeNames[requestType]}

SOURCE MATERIAL:
${sourceText}
`;

  if (mifWarnings.length > 0) {
    message += `\nMIF WARNINGS DETECTED:
${mifWarnings.map(w => `- ${w}`).join('\n')}
`;
  }

  if (wasTruncated) {
    message += '\n[NOTE: Source material was truncated due to length. Base your response on the provided excerpt.]';
  }

  message += '\n\nGenerate image suggestions according to the request type and system instructions.';
  message += '\n\nReturn ONLY valid JSON matching the LLMResponseSchema. No additional prose.';

  return message;
}

