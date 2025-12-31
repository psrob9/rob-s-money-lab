// Recurring transaction detection utilities

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
}

export type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular' | 'one-time';
export type Confidence = 'high' | 'medium' | 'low';

export interface RecurringTransaction {
  id: string;
  merchant: string;
  frequency: Frequency;
  averageAmount: number;
  occurrences: number;
  monthlyEquivalent: number;
  transactions: Transaction[];
  confidence: Confidence;
  isExcluded: boolean;
  // Additional metadata for transparency
  dateSpanDays: number;
  avgIntervalDays: number;
  intervalStdDev: number;
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
  cleaned = cleaned
    .replace(/\s+\d{1,2}\/\d{1,2}(\/\d{2,4})?/g, '') // dates like 12/15 or 12/15/24
    .replace(/\s+#\d+/g, '') // #1234
    .replace(/\s+\*\w+/g, '') // *ABC123
    .replace(/\s+\d{6,}/g, '') // long numbers (transaction IDs)
    .replace(/\s+\d{4,5}$/g, '') // trailing 4-5 digit numbers (store numbers)
    .replace(/\s+(STORE|STR|STO)\s*#?\d*/gi, '') // STORE #123
    .replace(/\s+[A-Z]{2}\s*\d{5}(-\d{4})?$/g, '') // State + ZIP like "MD 20902"
    .replace(/\s+[A-Z]{2}$/g, ''); // Trailing state abbreviation
  
  // Remove location info
  cleaned = cleaned
    .replace(/\s+(USA|US|CA|UK|GB)$/g, '')
    .replace(/\s+\d+\s+\w+\s+(ST|AVE|BLVD|RD|DR|LN|WAY|CT)\.?/gi, '');
  
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

// Calculate intervals between transactions (in days)
function calculateIntervals(dates: Date[]): number[] {
  if (dates.length < 2) return [];
  
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const intervals: number[] = [];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }
  
  return intervals;
}

// Calculate standard deviation
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// Check if transactions are clustered (burst buying)
function isClusteredBuying(dates: Date[]): boolean {
  if (dates.length < 2) return false;
  
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  // Count how many transactions are within 7 days of another
  let clusteredCount = 0;
  
  for (let i = 0; i < sortedDates.length; i++) {
    for (let j = i + 1; j < sortedDates.length; j++) {
      if (sortedDates[j].getTime() - sortedDates[i].getTime() <= sevenDaysMs) {
        clusteredCount++;
        break; // Found a cluster partner, move to next
      }
    }
  }
  
  // If more than 50% of occurrences are clustered, it's burst buying
  return clusteredCount > sortedDates.length * 0.5;
}

// Detect frequency based on average interval
function detectFrequency(avgInterval: number, occurrences: number, dateSpanDays: number): Frequency {
  if (occurrences <= 1) return 'one-time';
  
  // Weekly: avg interval 5-10 days
  if (avgInterval >= 5 && avgInterval <= 10) return 'weekly';
  
  // Bi-weekly: avg interval 12-18 days
  if (avgInterval >= 12 && avgInterval <= 18) return 'bi-weekly';
  
  // Monthly: avg interval 25-35 days
  if (avgInterval >= 25 && avgInterval <= 35) return 'monthly';
  
  // Quarterly: avg interval 80-100 days
  if (avgInterval >= 80 && avgInterval <= 100) return 'quarterly';
  
  // Annual: avg interval 350-400 days OR 1-2 occurrences over 12 months
  if (avgInterval >= 350 && avgInterval <= 400) return 'annual';
  if (occurrences <= 2 && dateSpanDays >= 300) return 'annual';
  
  return 'irregular';
}

// Calculate monthly equivalent based on frequency
export function calculateMonthlyEquivalent(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case 'weekly': return amount * 4.33;
    case 'bi-weekly': return amount * 2.17;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'annual': return amount / 12;
    case 'irregular': return amount; // Assume monthly-ish for irregular
    case 'one-time': return 0;
  }
}

// Assign confidence level based on new criteria
function assignConfidence(
  occurrences: number,
  dateSpanDays: number,
  variance: number,
  avgInterval: number,
  intervalStdDev: number
): Confidence | null {
  // Not recurring: only 1 occurrence
  if (occurrences < 2) return null;
  
  // Not recurring: all within 14 days (burst buying)
  if (dateSpanDays < 14) return null;
  
  // Not recurring: spans less than 45 days
  if (dateSpanDays < 45) return null;
  
  const dateSpanMonths = dateSpanDays / 30;
  const intervalConsistencyRatio = avgInterval > 0 ? intervalStdDev / avgInterval : 1;
  
  // High confidence:
  // 6+ occurrences AND spans 6+ months AND amount variance < 15% AND interval std dev < 30% of mean
  if (
    occurrences >= 6 &&
    dateSpanMonths >= 6 &&
    variance < 15 &&
    intervalConsistencyRatio < 0.30
  ) {
    return 'high';
  }
  
  // Medium confidence:
  // 3-5 occurrences AND spans 3+ months AND amount variance < 30%
  if (
    occurrences >= 3 &&
    dateSpanMonths >= 3 &&
    variance < 30
  ) {
    return 'medium';
  }
  
  // Low confidence:
  // 2+ occurrences over 2+ months
  if (occurrences >= 2 && dateSpanMonths >= 2) {
    return 'low';
  }
  
  return null;
}

// Main function to find recurring transactions
export function findRecurringTransactions(transactions: Transaction[]): RecurringTransaction[] {
  if (transactions.length === 0) return [];
  
  // Only look at expenses
  const expenses = transactions.filter(t => t.amount < 0 || t.amount > 0);
  
  // Group by cleaned merchant name
  const merchantGroups = new Map<string, Transaction[]>();
  
  for (const txn of expenses) {
    // Skip income/deposits
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
    
    // Calculate date span
    const dates = txns.map(t => t.date);
    const timestamps = dates.map(d => d.getTime());
    const minDate = Math.min(...timestamps);
    const maxDate = Math.max(...timestamps);
    const dateSpanDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    
    // Rule 1: Minimum time span - transactions must span at least 60 days
    // (We use 45 days for the confidence check, but 60 days for initial filter)
    if (dateSpanDays < 45) continue;
    
    // Rule 2: No clustering - check for burst buying
    if (isClusteredBuying(dates)) continue;
    
    // Calculate intervals
    const intervals = calculateIntervals(dates);
    const avgInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : 0;
    const intervalStdDev = calculateStdDev(intervals);
    
    // Get amounts (as positive values)
    const amounts = txns.map(t => Math.abs(t.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = calculateVariance(amounts);
    
    // Skip if amounts are wildly inconsistent
    if (variance > 50) continue;
    
    // Assign confidence - returns null if not recurring
    const confidence = assignConfidence(txns.length, dateSpanDays, variance, avgInterval, intervalStdDev);
    if (!confidence) continue;
    
    // Rule 3: If interval std dev > 50% of average, lower confidence significantly
    // Already handled in assignConfidence, but we can skip very erratic patterns
    if (avgInterval > 0 && intervalStdDev / avgInterval > 0.7) continue;
    
    const frequency = detectFrequency(avgInterval, txns.length, dateSpanDays);
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
      isExcluded: false,
      dateSpanDays,
      avgIntervalDays: avgInterval,
      intervalStdDev
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
  biWeeklyContribution: number;
  monthlyContribution: number;
  quarterlyContribution: number;
  annualContribution: number;
  irregularContribution: number;
  itemCount: number;
  weeklyCount: number;
  biWeeklyCount: number;
  monthlySubscriptionCount: number;
  annualSubscriptionCount: number;
  quarterlySubscriptionCount: number;
  irregularCount: number;
  excludedCount: number;
}

export function calculateRecurringSummary(items: RecurringTransaction[]): RecurringSummary {
  const activeItems = items.filter(i => !i.isExcluded && i.frequency !== 'one-time');
  const excludedCount = items.filter(i => i.isExcluded).length;
  
  let weeklyContribution = 0;
  let biWeeklyContribution = 0;
  let monthlyContribution = 0;
  let quarterlyContribution = 0;
  let annualContribution = 0;
  let irregularContribution = 0;
  let weeklyCount = 0;
  let biWeeklyCount = 0;
  let monthlySubscriptionCount = 0;
  let annualSubscriptionCount = 0;
  let quarterlySubscriptionCount = 0;
  let irregularCount = 0;
  
  for (const item of activeItems) {
    switch (item.frequency) {
      case 'weekly':
        weeklyContribution += item.monthlyEquivalent;
        weeklyCount++;
        break;
      case 'bi-weekly':
        biWeeklyContribution += item.monthlyEquivalent;
        biWeeklyCount++;
        break;
      case 'monthly':
        monthlyContribution += item.monthlyEquivalent;
        monthlySubscriptionCount++;
        break;
      case 'quarterly':
        quarterlyContribution += item.monthlyEquivalent;
        quarterlySubscriptionCount++;
        break;
      case 'annual':
        annualContribution += item.monthlyEquivalent;
        annualSubscriptionCount++;
        break;
      case 'irregular':
        irregularContribution += item.monthlyEquivalent;
        irregularCount++;
        break;
    }
  }
  
  return {
    totalMonthly: weeklyContribution + biWeeklyContribution + monthlyContribution + quarterlyContribution + annualContribution + irregularContribution,
    weeklyContribution,
    biWeeklyContribution,
    monthlyContribution,
    quarterlyContribution,
    annualContribution,
    irregularContribution,
    itemCount: activeItems.length,
    weeklyCount,
    biWeeklyCount,
    monthlySubscriptionCount,
    annualSubscriptionCount,
    quarterlySubscriptionCount,
    irregularCount,
    excludedCount
  };
}
