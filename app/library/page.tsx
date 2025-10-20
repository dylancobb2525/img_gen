'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserEmail, getLibrary, removeFromLibrary, LibraryItem } from '@/lib/cookies';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
    } else {
      setUserEmail(email);
      // Fetch library from database
      fetchLibrary(email);
    }
  }, [router]);

  const fetchLibrary = async (email: string) => {
    try {
      const response = await fetch(`/api/library/get?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const result = await response.json();
        setLibrary(result.data || []);
      } else {
        // Fallback to local storage if API fails
        setLibrary(getLibrary());
      }
    } catch (error) {
      console.error('Error fetching library:', error);
      // Fallback to local storage
      setLibrary(getLibrary());
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!userEmail) return;

      const response = await fetch(`/api/library/delete?id=${id}&email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setLibrary(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        // Fallback to local storage
        removeFromLibrary(id);
        setLibrary(getLibrary());
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // Fallback to local storage
      removeFromLibrary(id);
      setLibrary(getLibrary());
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ILLUSTRATION_CONCEPT': 'Illustration Concept',
      'STOCK_PHOTO_KEYWORDS': 'Stock Photo Keywords',
      'ALT_TEXT_DESCRIPTION': 'Alt Text Description',
    };
    return labels[type] || type;
  };

  const getSubsidiaryLabel = (sub: string) => {
    const labels: Record<string, string> = {
      'RMD': 'ReachMD',
      'GLC': 'Global Learning Collaborative',
      'BMC': 'Bryn Mawr Communications',
    };
    return labels[sub] || sub;
  };

  if (!userEmail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent">
                Your Library
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {library.length} {library.length === 1 ? 'item' : 'items'} saved
            </div>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-8 py-12">
        {library.length === 0 ? (
          /* Empty State */
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-red-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-12">
                <div className="text-6xl mb-6">📚</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Your library is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Generate image suggestions and save them here for easy access later.
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-primary to-red-600">
                    Create Your First Generation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Library Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items List */}
            <div className="lg:col-span-1 space-y-4">
              {library.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`relative group cursor-pointer ${
                    selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-red-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                  <div className="relative bg-card/90 backdrop-blur-xl border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.timestamp)}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {getSubsidiaryLabel(item.subsidiary)}
                      </span>
                      <span className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs">
                        {getRequestTypeLabel(item.requestType)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="relative group sticky top-8">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-red-600 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-8 space-y-6">
                    {/* Header */}
                    <div className="border-b border-border pb-4">
                      <h2 className="text-2xl font-bold text-foreground mb-3">
                        {selectedItem.title}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(selectedItem.timestamp)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {getSubsidiaryLabel(selectedItem.subsidiary)}
                        </span>
                        <span>•</span>
                        <span>{getRequestTypeLabel(selectedItem.requestType)}</span>
                      </div>
                    </div>

                    {/* Source Preview */}
                    {selectedItem.sourcePreview && (
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-2">Source Material</h3>
                        <p className="text-sm text-muted-foreground italic">
                          "{selectedItem.sourcePreview}..."
                        </p>
                      </div>
                    )}

                    {/* Alt Text */}
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-2">Alt Text Description</h3>
                      <p className="text-foreground">{selectedItem.altText}</p>
                    </div>

                    {/* Stock Keywords */}
                    {selectedItem.stockKeywords && selectedItem.stockKeywords.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-3">Stock Photo Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.stockKeywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full text-sm border border-primary/30"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Graphic Suggestions */}
                    {selectedItem.graphicSuggestions && selectedItem.graphicSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-3">Graphic Suggestions</h3>
                        <ul className="space-y-2">
                          {selectedItem.graphicSuggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/20 text-primary rounded-full text-sm font-semibold">
                                {i + 1}
                              </span>
                              <span className="text-foreground flex-1">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedItem.notes && selectedItem.notes.length > 0 && (
                      <div className="bg-primary/5 border border-primary/30 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-primary mb-2">Notes</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedItem.notes.map((note, i) => (
                            <li key={i}>• {note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-5xl mb-4">👈</div>
                    <p>Select an item to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

