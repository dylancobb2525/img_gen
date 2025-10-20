import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMResponseSchema, RequestTypeEnum, SubsidiaryEnum } from '@/lib/schema';
import { parseFile, fetchURL } from '@/lib/parsing';
import { scan as mifScan } from '@/lib/mif';
import { buildSystemMessage, buildUserMessage } from '@/lib/prompts';
import { callOpenRouter } from '@/lib/models';

// Mark as Node.js runtime for file parsing
export const runtime = 'nodejs';

const MAX_SOURCE_CHARS = 12000;

/**
 * POST /api/generate
 * Main endpoint for generating image suggestions
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse form data
    const formData = await request.formData();
    
    const subsidiary = formData.get('subsidiary') as string;
    const requestType = formData.get('requestType') as string;
    const userText = formData.get('userText') as string || '';
    const url = formData.get('url') as string || '';
    
    // Validate subsidiary and requestType
    if (!SubsidiaryEnum.safeParse(subsidiary).success) {
      return NextResponse.json(
        { error: 'Invalid subsidiary' },
        { status: 400 }
      );
    }
    
    if (!RequestTypeEnum.safeParse(requestType).success) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      );
    }
    
    // Collect source text from all inputs
    let sourceText = '';
    const sourceParts: string[] = [];
    
    // Add user text
    if (userText.trim()) {
      sourceParts.push(userText.trim());
    }
    
    // Fetch URL if provided
    if (url.trim()) {
      try {
        new URL(url); // Validate URL
        const urlContent = await fetchURL(url);
        sourceParts.push(`[FROM URL: ${url}]\n${urlContent}`);
      } catch (error) {
        sourceParts.push(`[URL fetch failed: ${url}]`);
      }
    }
    
    // Parse uploaded files
    const files = formData.getAll('files') as File[];
    for (const file of files) {
      if (file && file.size > 0) {
        try {
          const fileContent = await parseFile(file);
          sourceParts.push(`[FROM FILE: ${file.name}]\n${fileContent}`);
        } catch (error) {
          sourceParts.push(`[File parsing failed: ${file.name}]`);
        }
      }
    }
    
    // Check if we have any source material
    if (sourceParts.length === 0) {
      return NextResponse.json(
        { 
          error: 'Please provide at least one source of information (text, URL, or file upload)' 
        },
        { status: 400 }
      );
    }
    
    // Concatenate all sources
    sourceText = sourceParts.join('\n\n');
    
    // Truncate if necessary
    let wasTruncated = false;
    if (sourceText.length > MAX_SOURCE_CHARS) {
      sourceText = sourceText.slice(0, MAX_SOURCE_CHARS);
      wasTruncated = true;
    }
    
    // Run MIF scan
    const mifResult = mifScan(sourceText);
    
    // Build prompts
    const systemMessage = buildSystemMessage(requestType as any);
    const userMessage = buildUserMessage(
      subsidiary as any,
      requestType as any,
      sourceText,
      mifResult.warnings,
      wasTruncated
    );
    
    // Call LLM
    let llmResponse;
    let modelUsed;
    try {
      const result = await callOpenRouter(systemMessage, userMessage, true);
      llmResponse = result;
      modelUsed = result.model || 'unknown';
      console.log('Using model:', modelUsed);
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response from AI model. Please check your API key configuration.' },
        { status: 500 }
      );
    }
    
    // Parse and validate JSON response
    let parsedResponse;
    try {
      let jsonContent = llmResponse.content.trim();
      
      // Remove any markdown code blocks
      if (jsonContent.includes('```')) {
        const match = jsonContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (match) {
          jsonContent = match[1].trim();
        }
      }
      
      // Remove any leading/trailing text that's not JSON
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('Attempting to parse JSON:', jsonContent.substring(0, 200));
      
      const parsed = JSON.parse(jsonContent);
      console.log('Parsed JSON structure:', JSON.stringify(parsed, null, 2));
      
      const validationResult = LLMResponseSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.error('Zod validation failed:', validationResult.error.format());
        throw new Error(`Validation failed: ${JSON.stringify(validationResult.error.format())}`);
      }
      parsedResponse = validationResult.data;
      
    } catch (parseError) {
      // Retry with more explicit instructions
      console.error('First parse failed:', parseError);
      console.log('Raw response:', llmResponse.content);
      
      try {
        const fixSystemMessage = `${systemMessage}

CRITICAL: Your previous response could not be parsed. You MUST:
1. Return ONLY raw JSON - no markdown, no code blocks, no extra text
2. Start with { and end with }
3. Use proper JSON syntax with double quotes
4. Include all required fields: title, altText, graphicSuggestions
5. Do not wrap the JSON in backticks or markdown`;

        const retryResponse = await callOpenRouter(fixSystemMessage, userMessage, true);
        
        let retryJson = retryResponse.content.trim();
        
        // Clean up the retry response
        if (retryJson.includes('```')) {
          const match = retryJson.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          if (match) {
            retryJson = match[1].trim();
          }
        }
        
        const jsonStart = retryJson.indexOf('{');
        const jsonEnd = retryJson.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          retryJson = retryJson.substring(jsonStart, jsonEnd + 1);
        }
        
        console.log('Retry JSON:', retryJson.substring(0, 200));
        
        const parsed = JSON.parse(retryJson);
        console.log('Retry parsed JSON:', JSON.stringify(parsed, null, 2));
        
        const validationResult = LLMResponseSchema.safeParse(parsed);
        if (!validationResult.success) {
          console.error('Retry Zod validation failed:', validationResult.error.format());
          throw new Error(`Retry validation failed: ${JSON.stringify(validationResult.error.format())}`);
        }
        parsedResponse = validationResult.data;
        
      } catch (retryError) {
        console.error('Retry parse failed:', retryError);
        const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
        const originalError = parseError instanceof Error ? parseError.message : 'Unknown error';
        
        return NextResponse.json(
          { 
            error: 'The AI model returned an invalid response format. Please try again.',
            details: `Original error: ${originalError}\nRetry error: ${errorMessage}`,
            suggestion: 'Try simplifying your input or using different reference material.',
          },
          { status: 500 }
        );
      }
    }
    
    // Add MIF warnings to notes if not already present
    if (mifResult.hasIssues && parsedResponse.notes) {
      const existingNotes = parsedResponse.notes || [];
      parsedResponse.notes = [...existingNotes, ...mifResult.warnings.filter(w => !existingNotes.includes(w))];
    } else if (mifResult.hasIssues) {
      parsedResponse.notes = mifResult.warnings;
    }
    
    // Add truncation note if necessary
    if (wasTruncated) {
      const truncNote = 'Source material was truncated due to length limits';
      if (!parsedResponse.notes) {
        parsedResponse.notes = [truncNote];
      } else if (!parsedResponse.notes.includes(truncNote)) {
        parsedResponse.notes.push(truncNote);
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Log telemetry (no PII)
    console.log({
      duration,
      requestType,
      subsidiary,
      sourceLength: sourceText.length,
      wasTruncated,
      mifIssues: mifResult.hasIssues,
      usage: llmResponse.usage,
    });
    
    return NextResponse.json({
      success: true,
      data: parsedResponse,
      meta: {
        duration,
        mifWarnings: mifResult.warnings,
        wasTruncated,
        model: modelUsed,
      },
    });
    
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

