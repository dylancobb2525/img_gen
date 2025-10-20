'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select } from './ui/select';
import { Upload, X, Loader2, Sparkles } from 'lucide-react';
import { Subsidiary, RequestType } from '@/lib/schema';

interface FormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

export function Form({ onSubmit, isLoading }: FormProps) {
  const [subsidiary, setSubsidiary] = useState<Subsidiary>('RMD');
  const [requestType, setRequestType] = useState<RequestType>('ILLUSTRATION_CONCEPT');
  const [userText, setUserText] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'docx', 'txt'].includes(ext || '');
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('subsidiary', subsidiary);
    formData.append('requestType', requestType);
    formData.append('userText', userText);
    formData.append('url', url);
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Step 1: Select Subsidiary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            1
          </div>
          <Label htmlFor="subsidiary" className="text-lg font-semibold text-foreground">
            Select Subsidiary
          </Label>
        </div>
        <Select
          id="subsidiary"
          value={subsidiary}
          onChange={(e) => setSubsidiary(e.target.value as Subsidiary)}
          disabled={isLoading}
          className="h-12 text-base bg-background/50 border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
        >
          <option value="RMD">ReachMD (RMD)</option>
          <option value="GLC">Global Learning Collaborative (GLC)</option>
          <option value="BMC">Bryn Mawr Communications (BMC)</option>
        </Select>
      </div>

      {/* Step 2: Select Request Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            2
          </div>
          <Label className="text-lg font-semibold text-foreground">Select Request Type</Label>
        </div>
        <RadioGroup
          value={requestType}
          onValueChange={(value) => setRequestType(value as RequestType)}
          disabled={isLoading}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
            <RadioGroupItem value="ILLUSTRATION_CONCEPT" id="illustration" />
            <Label htmlFor="illustration" className="font-normal cursor-pointer flex-1">
              <span className="font-semibold text-foreground">Illustration Concept</span>
              <span className="block text-sm text-muted-foreground mt-0.5">Get creative direction with composition and style guidance</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
            <RadioGroupItem value="STOCK_PHOTO_KEYWORDS" id="stock" />
            <Label htmlFor="stock" className="font-normal cursor-pointer flex-1">
              <span className="font-semibold text-foreground">Stock Photo Keywords</span>
              <span className="block text-sm text-muted-foreground mt-0.5">Generate searchable keywords for stock photo libraries</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
            <RadioGroupItem value="ALT_TEXT_DESCRIPTION" id="alt" />
            <Label htmlFor="alt" className="font-normal cursor-pointer flex-1">
              <span className="font-semibold text-foreground">Alt Text Description</span>
              <span className="block text-sm text-muted-foreground mt-0.5">Create accessible, device-safe descriptions</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Step 3: Input Reference Material */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            3
          </div>
          <Label className="text-lg font-semibold text-foreground">Input Reference Material</Label>
        </div>
        
        {/* Text Area */}
        <div className="space-y-2">
          <Label htmlFor="userText" className="text-sm text-muted-foreground">Text Input (Optional)</Label>
          <Textarea
            id="userText"
            placeholder="Paste your reference material here..."
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            disabled={isLoading}
            rows={6}
            className="resize-y bg-background/50 border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
          />
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm text-muted-foreground">URL (Optional)</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/reference-material"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="h-12 bg-background/50 border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="files" className="text-sm text-muted-foreground">File Upload (Optional)</Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-background/30">
              <input
                id="files"
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
              <label
                htmlFor="files"
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, DOCX, or TXT files (multiple files allowed)
                </div>
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 mt-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <span className="text-sm truncate flex-1 text-foreground">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isLoading}
                    className="hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            4
          </div>
          <span className="text-lg font-semibold text-foreground">Generate</span>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Image Suggestions
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

