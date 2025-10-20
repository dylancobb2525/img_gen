/**
 * MIF (Medical Information Framework) Rules and Content Safety
 * These rules ensure compliant image generation for medical communications
 */

export const MIF_RULES = [
  'Never use screenshots containing brand names or drug names',
  'Avoid images of needles or injections',
  'Do not include ISI (Important Safety Information) in images',
  'Do not use images of children unless the content is explicitly about pediatrics (if pediatrics, add a warning)',
  'Avoid drug branding colors or visual identities',
  'Do not display clinical trial data or statistics in images',
  'Avoid dense blocks of small text that are hard to read',
  'Do not use nude or partially nude imagery',
  'Do not include closed captions or subtitles in images',
];

// Keywords that may trigger MIF violations
const FLAGGED_TERMS = [
  'needle',
  'injection',
  'syringe',
  'ISI',
  'important safety information',
  'clinical trial',
  'trial data',
  'brand name',
  'drug name',
  'trademark',
  'nude',
  'naked',
  'closed caption',
  'subtitle',
  'children',
  'child',
  'pediatric',
  'kid',
  'infant',
  'baby',
];

interface ScanResult {
  hasIssues: boolean;
  flaggedTerms: string[];
  warnings: string[];
  redactedText?: string;
}

/**
 * Scan source text for potential MIF rule violations
 */
export function scan(text: string): ScanResult {
  const lowerText = text.toLowerCase();
  const flaggedTerms: string[] = [];
  const warnings: string[] = [];

  for (const term of FLAGGED_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      flaggedTerms.push(term);
    }
  }

  // Generate warnings based on flagged terms
  if (flaggedTerms.some(t => ['needle', 'injection', 'syringe'].includes(t))) {
    warnings.push('Content references needles/injections - suggesting alternative imagery');
  }

  if (flaggedTerms.some(t => ['ISI', 'important safety information'].includes(t))) {
    warnings.push('ISI content detected - will exclude from image suggestions');
  }

  if (flaggedTerms.some(t => ['children', 'child', 'pediatric', 'kid', 'infant', 'baby'].includes(t))) {
    warnings.push('Pediatric content detected - ensuring appropriate imagery guidelines');
  }

  if (flaggedTerms.some(t => ['brand name', 'drug name', 'trademark'].includes(t))) {
    warnings.push('Brand/drug name references detected - will suggest generic alternatives');
  }

  if (flaggedTerms.some(t => ['nude', 'naked'].includes(t))) {
    warnings.push('Sensitive imagery terms detected - will provide appropriate alternatives');
  }

  return {
    hasIssues: flaggedTerms.length > 0,
    flaggedTerms,
    warnings,
    redactedText: text, // In a production system, you might redact certain terms
  };
}

/**
 * Get MIF rules as a formatted string for prompts
 */
export function getMIFRulesText(): string {
  return 'MIF COMPLIANCE RULES:\n' + MIF_RULES.map((rule, i) => `${i + 1}. ${rule}`).join('\n');
}

