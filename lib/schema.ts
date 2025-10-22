import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

// Enums for the form
export const SubsidiaryEnum = z.enum(['RMD', 'GLC', 'BMC']);
export type Subsidiary = z.infer<typeof SubsidiaryEnum>;

export const RequestTypeEnum = z.enum([
  'ILLUSTRATION_CONCEPT',
  'STOCK_PHOTO_KEYWORDS',
  'ALT_TEXT_DESCRIPTION'
]);
export type RequestType = z.infer<typeof RequestTypeEnum>;

// Base input from the form
export const BaseInputSchema = z.object({
  subsidiary: SubsidiaryEnum,
  requestType: RequestTypeEnum,
  userText: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  files: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});
export type BaseInput = z.infer<typeof BaseInputSchema>;

// LLM Request with parsed source text
export const LLMRequestSchema = BaseInputSchema.extend({
  sourceText: z.string(),
});
export type LLMRequest = z.infer<typeof LLMRequestSchema>;

// LLM Response - what we expect back from the model
export const LLMResponseSchema = z.object({
  title: z.string().min(1, 'Title is required').describe('Image title or headline'),
  altText: z.string().min(1, 'Alt text is required').describe('Clear, device-safe alt text description'),
  stockKeywords: z.array(z.string()).optional().nullable().describe('Stock photo keywords (10-20 items)'),
  graphicSuggestions: z.array(z.string()).min(1, 'At least one graphic suggestion is required').describe('Conceptual/graphic image suggestions with themes, organization, and layout cues'),
  notes: z.array(z.string()).optional().nullable().describe('Caveats, edge cases, warnings, or truncation notes'),
}).passthrough(); // Allow additional fields from the AI
export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// Export JSON Schema for LLM
export function getLLMResponseJsonSchema() {
  return zodToJsonSchema(LLMResponseSchema, 'LLMResponseSchema');
}

