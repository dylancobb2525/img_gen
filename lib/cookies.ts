/**
 * Cookie management utilities for user authentication and library storage
 */

export interface LibraryItem {
  id: string;
  timestamp: number;
  subsidiary: string;
  requestType: string;
  title: string;
  altText: string;
  stockKeywords?: string[];
  graphicSuggestions: string[];
  notes?: string[];
  sourcePreview: string; // First 200 chars of source material
}

/**
 * Get user email from cookies
 */
export function getUserEmail(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const emailCookie = cookies.find(c => c.trim().startsWith('userEmail='));
  
  if (!emailCookie) return null;
  
  return decodeURIComponent(emailCookie.split('=')[1]);
}

/**
 * Set user email in cookies (expires in 30 days)
 */
export function setUserEmail(email: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  
  document.cookie = `userEmail=${encodeURIComponent(email)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

/**
 * Clear user email from cookies
 */
export function clearUserEmail(): void {
  document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Get library items from cookies
 */
export function getLibrary(): LibraryItem[] {
  if (typeof document === 'undefined') return [];
  
  const cookies = document.cookie.split(';');
  const libraryCookie = cookies.find(c => c.trim().startsWith('library='));
  
  if (!libraryCookie) return [];
  
  try {
    const libraryData = decodeURIComponent(libraryCookie.split('=')[1]);
    return JSON.parse(libraryData);
  } catch (error) {
    console.error('Failed to parse library cookie:', error);
    return [];
  }
}

/**
 * Save library items to cookies
 * Note: Cookie size limit is ~4KB, so we limit to 10 most recent items
 */
export function saveLibrary(items: LibraryItem[]): void {
  // Keep only the 10 most recent items to avoid cookie size limits
  const limitedItems = items.slice(0, 10);
  
  const libraryData = JSON.stringify(limitedItems);
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  
  try {
    document.cookie = `library=${encodeURIComponent(libraryData)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  } catch (error) {
    console.error('Failed to save library cookie:', error);
  }
}

/**
 * Add item to library
 */
export function addToLibrary(item: LibraryItem): void {
  const library = getLibrary();
  
  // Add to beginning of array (most recent first)
  const updatedLibrary = [item, ...library];
  
  saveLibrary(updatedLibrary);
}

/**
 * Remove item from library by ID
 */
export function removeFromLibrary(id: string): void {
  const library = getLibrary();
  const updatedLibrary = library.filter(item => item.id !== id);
  
  saveLibrary(updatedLibrary);
}

/**
 * Clear entire library
 */
export function clearLibrary(): void {
  document.cookie = 'library=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

