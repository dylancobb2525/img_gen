'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/Form';
import { Output } from '@/components/Output';
import { LLMResponse } from '@/lib/schema';
import { AlertCircle, Sparkles, LogOut, Library } from 'lucide-react';
import Image from 'next/image';
import { getUserEmail, clearUserEmail } from '@/lib/cookies';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LLMResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<string>('');
  const [subsidiary, setSubsidiary] = useState<string>('');
  const [sourcePreview, setSourcePreview] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
    } else {
      setUserEmail(email);
    }
  }, [router]);

  const handleLogout = () => {
    clearUserEmail();
    router.push('/login');
  };

  if (!userEmail) {
    return null; // Show nothing while redirecting
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    // Store form data for library saving
    setRequestType(formData.get('requestType') as string);
    setSubsidiary(formData.get('subsidiary') as string);
    
    // Create source preview (first 200 chars)
    const userText = formData.get('userText') as string || '';
    const url = formData.get('url') as string || '';
    const preview = (userText || url || 'File upload').substring(0, 200);
    setSourcePreview(preview);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to generate suggestions';
        const details = data.details ? `\n\nDetails: ${data.details}` : '';
        const suggestion = data.suggestion ? `\n\n${data.suggestion}` : '';
        throw new Error(errorMsg + details + suggestion);
      }

      setResult(data.data);
      setModelUsed(data.meta?.model || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Generation error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <Image 
                  src="/images/ush.jpeg" 
                  alt="USH Logo" 
                  width={80} 
                  height={80}
                  className="relative rounded-xl shadow-2xl border-2 border-primary/30"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent">
                  Image Helper
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI-powered image suggestions for medical communications
                </p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm text-foreground">{userEmail}</span>
                <span className="text-xs text-primary">Signed in</span>
              </div>
              
              <Link href="/library">
                <Button variant="outline" className="bg-primary/10 border-primary/30 hover:bg-primary/20">
                  <Library className="mr-2 h-4 w-4" />
                  Library
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/20 hover:text-destructive"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Form */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-10 shadow-2xl">
              <Form onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-destructive/50 rounded-xl blur"></div>
              <div className="relative bg-card/90 backdrop-blur-xl border border-destructive/30 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-2">Error</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{error}</p>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Check the browser console (F12) for detailed error logs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 flex-1 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
                    Generated Suggestions
                  </h2>
                  {modelUsed && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Powered by {modelUsed.split('/')[1] || modelUsed}
                    </p>
                  )}
                </div>
                <div className="h-1 flex-1 bg-gradient-to-l from-primary to-transparent rounded-full"></div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-red-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-card/90 backdrop-blur-xl border border-border rounded-2xl overflow-hidden">
                  <Output 
                    data={result} 
                    requestType={requestType}
                    subsidiary={subsidiary}
                    sourcePreview={sourcePreview}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 backdrop-blur-sm bg-card/30 mt-20">
        <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold text-primary">USHealthConnect</span>
            <span>•</span>
            <span>Next.js & OpenRouter AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

