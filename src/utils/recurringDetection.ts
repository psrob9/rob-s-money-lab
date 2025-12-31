// Recurring transaction detection utilities

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
}

export interface RecurringTransaction {
  id: string;
  merchant: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one-time';
  averageAmount: number;
  occurrences: number;
  monthlyEquivalent: number;
  transactions: Transaction[];
  confidence: 'high' | 'medium' | 'low';
  isExcluded: boolean;
}

// Clean and normalize merchant names for grouping
export function cleanMerchantName(description: string): string {
  let cleaned = description.toUpperCase().trim();
  
  // Remove common prefixes
  const prefixes = [
    'SQ *', 'TST*', 'SP ', 'GOOGLE *', 'APPLE.COM/BILL', 
    'AMZN ', 'AMAZON ', 'PAYPAL *', 'VENMO *', 'ZELLE ',
    'ACH ', 'POS ', 'DEBIT ', 'CREDIT ', 'PURCHASE '
  ];
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length);
    }
  }
  
  // Remove trailing numbers, dates, reference IDs
  // Pattern: remove things like "12/15", "#1234", "1234567890"
  cleaned = cleaned
    .replace(/\s+\d{1,2}\/\d{1,2}(\/\d{2,4})?/g, '') // dates like 12/15 or 12/15/24
    .replace(/\s+#\d+/g, '') // #1234
    .replace(/\s+\*\w+/g, '') // *ABC123
    .replace(/\s+\d{6,}/g, '') // long numbers (transaction IDs)
    .replace(/\s+\d{4,5}$/g, '') // trailing 4-5 digit numbers (store numbers)
    .replace(/\s+(STORE|STR|STO)\s*#?\d*/gi, '') // STORE #123
    .replace(/\s+[A-Z]{2}\s*\d{5}(-\d{4})?$/g, '') // State + ZIP like "MD 20902"
    .replace(/\s+[A-Z]{2}$/g, ''); // Trailing state abbreviation
  
  // Remove location info (city names at end are tricky, just clean common patterns)
  cleaned = cleaned
    .replace(/\s+(USA|US|CA|UK|GB)$/g, '')
    .replace(/\s+\d+\s+\w+\s+(ST|AVE|BLVD|RD|DR|LN|WAY|CT)\.?/gi, ''); // Street addresses
  
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Take meaningful portion (first 3-4 words for long descriptions)
  const words = cleaned.split(' ');
  if (words.length > 4) {
    cleaned = words.slice(0, 4).join(' ');
  }
  
  return cleaned;
}

// Calculate amount variance as a percentage
function calculateVariance(amounts: number[]): number {
  if (amounts.length <= 1) return 0;
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const maxDiff = Math.max(...amounts.map(a => Math.abs(a - avg)));
  return avg === 0 ? 0 : (maxDiff / avg) * 100;
}

// Detect frequency based on occurrence count and date spread
function detectFrequency(
  occurrences: number,
  dateSpanMonths: number
): 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one-time' {
  if (occurrences <= 1) return 'one-time';
  
  // Normalize to 12-month equivalent
  const annualizedOccurrences = dateSpanMonths > 0 
    ? (occurrences / dateSpanMonths) * 12 
    : occurrences;
  
  if (annualizedOccurrences >= 40) return 'weekly';
  if (annualizedOccurrences >= 9) return 'monthly';
  if (annualizedOccurrences >= 3) return 'quarterly';
  if (annualizedOccurrences >= 1.5) return 'annual';
  
  return 'one-time';
}

// Calculate monthly equivalent based on frequency
export function calculateMonthlyEquivalent(
  amount: number,
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one-time'
): number {
  switch (frequency) {
    case 'weekly': return amount * 4.33;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'annual': return amount / 12;
    case 'one-time': return 0; // One-time costs don't contribute to monthly
  }
}

// Assign confidence level based on amount consistency and frequency clarity
function assignConfidence(
  variance: number,
  occurrences: number,
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one-time'
): 'high' | 'medium' | 'low' {
  // One-time items are low confidence for "recurring"
  if (frequency === 'one-time') return 'low';
  
  // High confidence: low variance and good number of occurrences
  if (variance < 5 && occurrences >= 3) return 'high';
  if (variance < 10 && occurrences >= 6) return 'high';
  
  // Medium confidence: moderate variance or fewer occurrences
  if (variance < 15 && occurrences >= 2) return 'medium';
  if (variance < 25 && occurrences >= 4) return 'medium';
  
  return 'low';
}

// Main function to find recurring transactions
export function findRecurringTransactions(transactions: Transaction[]): RecurringTransaction[] {
  if (transactions.length === 0) return [];
  
  // Only look at expenses (negative amounts or positive debits)
  const expenses = transactions.filter(t => t.amount < 0 || t.amount > 0);
  
  // Group by cleaned merchant name
  const merchantGroups = new Map<string, Transaction[]>();
  
  for (const txn of expenses) {
    // Skip income/deposits (positive amounts that look like income)
    if (txn.amount > 0 && txn.description.toUpperCase().match(/(PAYROLL|SALARY|DEPOSIT|DIRECT DEP|TRANSFER FROM)/)) {
      continue;
    }
    
    const cleanedName = cleanMerchantName(txn.description);
    if (!cleanedName || cleanedName.length < 2) continue;
    
    const existing = merchantGroups.get(cleanedName) || [];
    existing.push(txn);
    merchantGroups.set(cleanedName, existing);
  }
  
  // Analyze each group
  const recurring: RecurringTransaction[] = [];
  let idCounter = 0;
  
  for (const [merchant, txns] of merchantGroups) {
    // Need at least 2 occurrences to be potentially recurring
    if (txns.length < 2) continue;
    
    // Calculate date span in months
    const dates = txns.map(t => t.date.getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateSpanMonths = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 30);
    
    // Get amounts (as positive values for consistency)
    const amounts = txns.map(t => Math.abs(t.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = calculateVariance(amounts);
    
    // Skip if amounts are wildly inconsistent (probably not the same subscription)
    if (variance > 50) continue;
    
    const frequency = detectFrequency(txns.length, dateSpanMonths);
    const confidence = assignConfidence(variance, txns.length, frequency);
    const monthlyEquivalent = calculateMonthlyEquivalent(avgAmount, frequency);
    
    // Only include items with meaningful monthly contribution
    if (monthlyEquivalent < 1 && frequency !== 'one-time') continue;
    
    recurring.push({
      id: `recurring-${++idCounter}`,
      merchant,
      frequency,
      averageAmount: avgAmount,
      occurrences: txns.length,
      monthlyEquivalent,
      transactions: txns.sort((a, b) => b.date.getTime() - a.date.getTime()),
      confidence,
      isExcluded: false
    });
  }
  
  // Sort by monthly equivalent (highest first)
  return recurring.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
}

// Recalculate monthly equivalent when user changes frequency
export function recalculateMonthlyEquivalent(item: RecurringTransaction): RecurringTransaction {
  return {
    ...item,
    monthlyEquivalent: calculateMonthlyEquivalent(item.averageAmount, item.frequency)
  };
}

// Calculate totals by frequency type
export interface RecurringSummary {
  totalMonthly: number;
  weeklyContribution: number;
  monthlyContribution: number;
  quarterlyContribution: number;
  annualContribution: number;
  itemCount: number;
  annualSubscriptionCount: number;
  quarterlySubscriptionCount: number;
}

export function calculateRecurringSummary(items: RecurringTransaction[]): RecurringSummary {
  const activeItems = items.filter(i => !i.isExcluded && i.frequency !== 'one-time');
  
  let weeklyContribution = 0;
  let monthlyContribution = 0;
  let quarterlyContribution = 0;
  let annualContribution = 0;
  let annualSubscriptionCount = 0;
  let quarterlySubscriptionCount = 0;
  
  for (const item of activeItems) {
    switch (item.frequency) {
      case 'weekly':
        weeklyContribution += item.monthlyEquivalent;
        break;
      case 'monthly':
        monthlyContribution += item.monthlyEquivalent;
        break;
      case 'quarterly':
        quarterlyContribution += item.monthlyEquivalent;
        quarterlySubscriptionCount++;
        break;
      case 'annual':
        annualContribution += item.monthlyEquivalent;
        annualSubscriptionCount++;
        break;
    }
  }
  
  return {
    totalMonthly: weeklyContribution + monthlyContribution + quarterlyContribution + annualContribution,
    weeklyContribution,
    monthlyContribution,
    quarterlyContribution,
    annualContribution,
    itemCount: activeItems.length,
    annualSubscriptionCount,
    quarterlySubscriptionCount
  };
}
