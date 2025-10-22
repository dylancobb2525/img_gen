'use client';

import { LLMResponse } from '@/lib/schema';
import { Button } from './ui/button';
import { Copy, Download, AlertCircle, Save, Check } from 'lucide-react';
import { useState } from 'react';
import { addToLibrary, LibraryItem } from '@/lib/cookies';

interface OutputProps {
  data: LLMResponse;
  requestType: string;
  subsidiary: string;
  sourcePreview: string;
}

export function Output({ data, requestType, subsidiary, sourcePreview }: OutputProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatOutput = () => {
    let text = `IMAGE GENERATION RESULTS\n`;
    text += `========================\n\n`;
    text += `Title/Headline:\n${data.title}\n\n`;
    text += `Alt Text Description:\n${data.altText}\n\n`;
    
    if (data.stockKeywords && data.stockKeywords.length > 0) {
      text += `Stock Photo Keywords:\n`;
      text += data.stockKeywords.join(', ') + '\n\n';
    }
    
    if (data.graphicSuggestions && data.graphicSuggestions.length > 0) {
      text += `Conceptual/Graphic Suggestions:\n`;
      data.graphicSuggestions.forEach((suggestion, i) => {
        text += `${i + 1}. ${suggestion}\n`;
      });
      text += '\n';
    }
    
    if (data.notes && data.notes.length > 0) {
      text += `Notes:\n`;
      data.notes.forEach(note => {
        text += `- ${note}\n`;
      });
    }
    
    return text;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatOutput();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-suggestions-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToLibrary = async () => {
    const libraryItem: LibraryItem = {
      id: `item-${Date.now()}`,
      timestamp: Date.now(),
      subsidiary,
      requestType,
      title: data.title,
      altText: data.altText,
      stockKeywords: data.stockKeywords ?? undefined,
      graphicSuggestions: data.graphicSuggestions,
      notes: data.notes ?? undefined,
      sourcePreview,
    };

    try {
      // Get user email from cookies
      const userEmail = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('userEmail='))
        ?.split('=')[1];

      if (!userEmail) {
        console.error('No user email found');
        return;
      }

      // Save to database via API
      const response = await fetch('/api/library/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: decodeURIComponent(userEmail),
          libraryItem,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to library');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving to library:', error);
      // Fallback to local storage
      addToLibrary(libraryItem);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSaveToLibrary} 
          variant="outline" 
          size="sm"
          className="bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all"
          disabled={saved}
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleCopy} 
          variant="outline" 
          size="sm"
          className="bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? '✓ Copied!' : 'Copy All'}
        </Button>
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm"
          className="bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all"
        >
          <Download className="mr-2 h-4 w-4" />
          Download .txt
        </Button>
      </div>

      {/* Output Content */}
      <div className="space-y-8">
        {/* Title */}
        <div className="group">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-1 bg-primary rounded-full"></div>
            <h3 className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors">
              Image Title/Headline
            </h3>
          </div>
          <p className="text-foreground text-lg pl-3 border-l-2 border-primary/30">{data.title}</p>
        </div>

        {/* Alt Text */}
        <div className="group">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-1 bg-primary rounded-full"></div>
            <h3 className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors">
              Alt Text Description
            </h3>
          </div>
          <p className="text-foreground pl-3 border-l-2 border-primary/30">{data.altText}</p>
        </div>

        {/* Stock Keywords (conditional) */}
        {data.stockKeywords && data.stockKeywords.length > 0 && (
          <div className="group">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-1 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors">
                Stock Photo Keywords
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.stockKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full text-sm border border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-default"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Graphic Suggestions */}
        {data.graphicSuggestions && data.graphicSuggestions.length > 0 && (
          <div className="group">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-1 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors">
                Conceptual/Graphic Image Suggestions
              </h3>
            </div>
            <ul className="space-y-3">
              {data.graphicSuggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-3 group/item">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/20 text-primary rounded-full text-sm font-semibold group-hover/item:bg-primary group-hover/item:text-white transition-all">
                    {i + 1}
                  </span>
                  <span className="text-foreground flex-1 group-hover/item:text-foreground/90 transition-colors">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes (warnings, caveats) */}
        {data.notes && data.notes.length > 0 && (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur"></div>
            <div className="relative bg-primary/5 backdrop-blur-sm border border-primary/30 p-6 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-primary">Important Notes</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {data.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

