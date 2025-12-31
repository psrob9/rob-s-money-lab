const LEARNED_CATEGORIES_KEY = 'money-snapshot-learned-categories';

export interface LearnedCategory {
  pattern: string;      // Normalized merchant pattern (uppercase)
  category: string;     // The category name
  addedAt: string;      // ISO timestamp
}

// Get all learned categories from localStorage
export function getLearnedCategories(): LearnedCategory[] {
  try {
    const stored = localStorage.getItem(LEARNED_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Add a new learned category mapping
export function addLearnedCategory(pattern: string, category: string): void {
  const learned = getLearnedCategories();
  
  // Normalize the pattern (uppercase, trim)
  const normalizedPattern = pattern.toUpperCase().trim();
  
  // Remove existing entry for this pattern if exists
  const filtered = learned.filter(l => l.pattern !== normalizedPattern);
  
  // Add new entry
  filtered.push({
    pattern: normalizedPattern,
    category,
    addedAt: new Date().toISOString()
  });
  
  localStorage.setItem(LEARNED_CATEGORIES_KEY, JSON.stringify(filtered));
}

// Remove a learned category by pattern
export function removeLearnedCategory(pattern: string): void {
  const learned = getLearnedCategories();
  const filtered = learned.filter(l => l.pattern !== pattern.toUpperCase().trim());
  localStorage.setItem(LEARNED_CATEGORIES_KEY, JSON.stringify(filtered));
}

// Check if a description matches any learned pattern
export function matchLearnedCategory(description: string): string | null {
  const learned = getLearnedCategories();
  const upperDesc = description.toUpperCase();
  
  for (const entry of learned) {
    if (upperDesc.includes(entry.pattern)) {
      return entry.category;
    }
  }
  return null;
}

// Clear all learned categories
export function clearLearnedCategories(): void {
  localStorage.removeItem(LEARNED_CATEGORIES_KEY);
}

// Extract a meaningful pattern from a transaction description
export function extractPattern(description: string): string {
  let pattern = description.toUpperCase().trim();
  
  // Remove trailing numbers, dates, reference IDs
  pattern = pattern.replace(/\s+\d{4,}$/g, ''); // Remove trailing long numbers
  pattern = pattern.replace(/\s+\d{1,2}\/\d{1,2}(\/\d{2,4})?$/g, ''); // Remove dates
  pattern = pattern.replace(/\s+#\w+$/g, ''); // Remove reference IDs like #ABC123
  
  // Take first 3 meaningful words (non-pure-number tokens)
  const words = pattern.split(/\s+/)
    .filter(w => !/^\d+$/.test(w) && w.length > 1)
    .slice(0, 3);
  
  return words.join(' ').trim() || pattern.slice(0, 30);
}
