// ============================================
// ROB'S MONEY LAB - RUNWAY CALCULATOR SAMPLE DATA
// ============================================
// All scenarios are fully itemized with traceable math.
// Every number can be verified independently.
// 
// Math verification formula:
// Runway = Savings ÷ (Expenses - Income)
// ============================================

export interface ExpenseItem {
  category: string;
  amount: number;
  isEssential: boolean;
  notes?: string;
}

export interface IncomeSource {
  source: string;
  amount: number;
  isGuaranteed: boolean;
  notes?: string;
}

export interface RunwayScenario {
  id: string;
  name: string;
  tagline: string;
  description: string;
  
  // Inputs
  savings: number;
  previousMonthlyIncome: number; // For UI benefit calculation
  
  expenses: ExpenseItem[];
  incomesSources: IncomeSource[];
  
  // Calculated totals (for verification)
  totalEssentials: number;
  totalDiscretionary: number;
  totalExpenses: number;
  partnerIncome: number;
  estimatedUIBenefit: number;
  
  // Calculated runways (months)
  runwayCurrentLifestyle: number;
  runwayBareBones: number;
  runwayWithUI: number;
  
  // Display content
  headlineInsight: string;
  soWhat: string;
  nowWhat: string[];
}

// ============================================
// SCENARIO 1: THE TIGHT SQUEEZE (Default)
// ============================================
// Dual income household, primary earner laid off, limited savings
// 
// MATH VERIFICATION:
// Current:    $15,000 ÷ ($4,500 - $1,800) = $15,000 ÷ $2,700 = 5.56 months
// Bare bones: $15,000 ÷ ($4,100 - $1,800) = $15,000 ÷ $2,300 = 6.52 months
// With UI:    $15,000 ÷ ($4,100 - $1,800 - $1,375) = $15,000 ÷ $925 = 16.22 months
// ============================================

export const TIGHT_SQUEEZE_SCENARIO: RunwayScenario = {
  id: 'tight-squeeze',
  name: 'The Tight Squeeze',
  tagline: 'Dual income household, primary earner laid off, limited savings',
  description: 'You and your partner were making it work on two incomes. Now yours is gone, and savings are modest. Your partner\'s part-time income helps, but you need to know exactly how long you can last.',
  
  savings: 15000,
  previousMonthlyIncome: 5500,
  
  expenses: [
    // Essential expenses - $4,100 total
    { category: 'Rent/Mortgage', amount: 1800, isEssential: true, notes: 'Modest 2BR in MCOL area' },
    { category: 'Utilities', amount: 250, isEssential: true, notes: 'Electric, gas, water, trash' },
    { category: 'Internet', amount: 70, isEssential: true },
    { category: 'Car Payment', amount: 350, isEssential: true, notes: 'One car' },
    { category: 'Car Insurance', amount: 125, isEssential: true },
    { category: 'Gas', amount: 180, isEssential: true, notes: 'Commute for partner' },
    { category: 'Groceries', amount: 650, isEssential: true, notes: 'Family of 2-3' },
    { category: 'Phone Plans', amount: 120, isEssential: true, notes: 'Two lines' },
    { category: 'Health Insurance', amount: 350, isEssential: true, notes: 'Marketplace plan' },
    { category: 'Minimum Debt Payments', amount: 205, isEssential: true, notes: 'Credit card minimum' },
    
    // Discretionary expenses - $400 total
    { category: 'Streaming Services', amount: 45, isEssential: false, notes: 'Netflix, one other' },
    { category: 'Dining Out', amount: 150, isEssential: false, notes: 'Already reduced' },
    { category: 'Subscriptions', amount: 55, isEssential: false, notes: 'Gym, apps' },
    { category: 'Misc/Entertainment', amount: 150, isEssential: false },
  ],
  
  incomesSources: [
    { source: 'Partner Income', amount: 1800, isGuaranteed: true, notes: 'Part-time work' },
  ],
  
  // Verification totals
  totalEssentials: 4100,      // Sum of isEssential: true
  totalDiscretionary: 400,    // Sum of isEssential: false
  totalExpenses: 4500,        // 4100 + 400
  partnerIncome: 1800,
  estimatedUIBenefit: 1375,   // ~25% of $5,500, rough estimate
  
  // Runway calculations (rounded for display)
  runwayCurrentLifestyle: 5.5,  // $15,000 ÷ $2,700 = 5.56
  runwayBareBones: 6.5,         // $15,000 ÷ $2,300 = 6.52
  runwayWithUI: 16,             // $15,000 ÷ $925 = 16.22
  
  headlineInsight: "Your partner's income is doing heavy lifting. Unemployment benefits nearly triple your runway.",
  
  soWhat: "Your partner's income covers 40% of your essentials — that's significant. But your savings alone only buys you about 5.5 months at current spending. The good news: cutting discretionary spending and filing for unemployment extends your runway from 5.5 to 16 months.",
  
  nowWhat: [
    'FILE FOR UNEMPLOYMENT the day you\'re laid off — this extends your runway from 6.5 to 16 months',
    'CUT DISCRETIONARY spending immediately — streaming, dining out, subscriptions',
    'JOB SEARCH should be your full-time job — 16 months is buffer, not vacation',
    'CONSIDER gig or part-time income to reduce your burn rate further',
  ],
};

// ============================================
// SCENARIO 2: THE TECH LAYOFF
// ============================================
// Single professional in HCOL area, caught in layoffs
// 
// MATH VERIFICATION:
// Current:    $42,000 ÷ ($5,000 - $0) = $42,000 ÷ $5,000 = 8.4 months
// Bare bones: $42,000 ÷ ($3,800 - $0) = $42,000 ÷ $3,800 = 11.05 months
// With UI:    $42,000 ÷ ($3,800 - $2,125) = $42,000 ÷ $1,675 = 25.07 months
// ============================================

export const TECH_LAYOFF_SCENARIO: RunwayScenario = {
  id: 'tech-layoff',
  name: 'The Tech Layoff',
  tagline: 'Single professional in high-cost area, caught in layoffs',
  description: 'You were making good money in tech, saved a decent amount, but your lifestyle expanded with your income. Now you\'re facing layoffs and wondering how long your savings will actually last.',
  
  savings: 42000,
  previousMonthlyIncome: 8500,
  
  expenses: [
    // Essential expenses - $3,800 total
    { category: 'Rent', amount: 2200, isEssential: true, notes: '1BR in HCOL city' },
    { category: 'Utilities', amount: 150, isEssential: true, notes: 'Electric, included water' },
    { category: 'Internet', amount: 80, isEssential: true },
    { category: 'Groceries', amount: 500, isEssential: true, notes: 'Single person, HCOL prices' },
    { category: 'Phone', amount: 85, isEssential: true },
    { category: 'Health Insurance', amount: 450, isEssential: true, notes: 'COBRA estimate' },
    { category: 'Transportation', amount: 185, isEssential: true, notes: 'Transit pass + occasional rideshare' },
    { category: 'Minimum Debt Payments', amount: 150, isEssential: true, notes: 'Student loans' },
    
    // Discretionary expenses - $1,200 total
    { category: 'Dining Out', amount: 400, isEssential: false, notes: 'Restaurants, coffee shops' },
    { category: 'Streaming & Subscriptions', amount: 120, isEssential: false, notes: 'Netflix, Spotify, gym, apps' },
    { category: 'Shopping', amount: 250, isEssential: false, notes: 'Clothes, electronics, random' },
    { category: 'Entertainment', amount: 200, isEssential: false, notes: 'Bars, concerts, events' },
    { category: 'Personal Care', amount: 100, isEssential: false, notes: 'Haircuts, grooming' },
    { category: 'Hobbies', amount: 130, isEssential: false },
  ],
  
  incomesSources: [],
  
  // Verification totals
  totalEssentials: 3800,
  totalDiscretionary: 1200,
  totalExpenses: 5000,
  partnerIncome: 0,
  estimatedUIBenefit: 2125,   // ~25% of $8,500
  
  // Runway calculations
  runwayCurrentLifestyle: 8.4,   // $42,000 ÷ $5,000 = 8.4
  runwayBareBones: 11,           // $42,000 ÷ $3,800 = 11.05
  runwayWithUI: 25,              // $42,000 ÷ $1,675 = 25.07
  
  headlineInsight: "Your lifestyle inflation is costing you 3 months of runway. Cut it and add unemployment — you've got 2 years.",
  
  soWhat: "You saved well, but you're also spending $1,200/month on lifestyle expenses. That's not judgment — it's math. Cutting discretionary spending adds 3 months. Adding unemployment benefits extends you to over 2 years. You have more options than you think.",
  
  nowWhat: [
    'FILE FOR UNEMPLOYMENT immediately — this is what takes you from 11 to 25 months',
    'CUT LIFESTYLE spending — dining, subscriptions, shopping. This adds 3 months alone.',
    'REVIEW your health insurance options — COBRA is expensive, marketplace might be cheaper',
    'USE THIS TIME strategically — 25 months is enough to pivot careers if you want',
  ],
};

// ============================================
// SCENARIO 3: THE SINGLE INCOME FAMILY
// ============================================
// Stay-at-home parent household, breadwinner laid off
// 
// MATH VERIFICATION:
// Current:    $28,000 ÷ ($4,800 - $0) = $28,000 ÷ $4,800 = 5.83 months
// Bare bones: $28,000 ÷ ($4,200 - $0) = $28,000 ÷ $4,200 = 6.67 months
// With UI:    $28,000 ÷ ($4,200 - $1,625) = $28,000 ÷ $2,575 = 10.87 months
// ============================================

export const SINGLE_INCOME_FAMILY_SCENARIO: RunwayScenario = {
  id: 'single-income-family',
  name: 'The Single Income Family',
  tagline: 'Stay-at-home parent household, breadwinner laid off',
  description: 'Your family made the choice for one parent to stay home with the kids. It was working — until the layoff. Now you need to know how long you can maintain stability while job searching.',
  
  savings: 28000,
  previousMonthlyIncome: 6500,
  
  expenses: [
    // Essential expenses - $4,200 total
    { category: 'Mortgage', amount: 1650, isEssential: true, notes: '3BR suburban home' },
    { category: 'Utilities', amount: 280, isEssential: true, notes: 'Electric, gas, water, trash' },
    { category: 'Internet', amount: 65, isEssential: true },
    { category: 'Car Payment', amount: 420, isEssential: true, notes: 'Family SUV' },
    { category: 'Car Insurance', amount: 180, isEssential: true, notes: 'Two cars' },
    { category: 'Gas', amount: 200, isEssential: true },
    { category: 'Groceries', amount: 850, isEssential: true, notes: 'Family of 4' },
    { category: 'Phone Plans', amount: 140, isEssential: true, notes: 'Two lines' },
    { category: 'Health Insurance', amount: 0, isEssential: true, notes: 'COBRA paid through severance period' },
    { category: 'Kids Activities', amount: 150, isEssential: true, notes: 'School fees, basic activities' },
    { category: 'Minimum Debt Payments', amount: 265, isEssential: true },
    
    // Discretionary expenses - $600 total
    { category: 'Streaming Services', amount: 65, isEssential: false },
    { category: 'Dining Out', amount: 200, isEssential: false, notes: 'Family meals out' },
    { category: 'Subscriptions', amount: 85, isEssential: false, notes: 'Gym, apps, kids apps' },
    { category: 'Entertainment', amount: 150, isEssential: false, notes: 'Family activities' },
    { category: 'Misc', amount: 100, isEssential: false },
  ],
  
  incomesSources: [],
  
  // Verification totals
  totalEssentials: 4200,
  totalDiscretionary: 600,
  totalExpenses: 4800,
  partnerIncome: 0,
  estimatedUIBenefit: 1625,   // ~25% of $6,500
  
  // Runway calculations
  runwayCurrentLifestyle: 5.8,   // $28,000 ÷ $4,800 = 5.83
  runwayBareBones: 6.7,          // $28,000 ÷ $4,200 = 6.67
  runwayWithUI: 10.9,            // $28,000 ÷ $2,575 = 10.87
  
  headlineInsight: "Unemployment nearly doubles your runway. Filing on day one is critical.",
  
  soWhat: "With no partner income, your savings are your only buffer. At current spending, you have under 6 months. But unemployment benefits change the math significantly — they nearly double your runway to almost 11 months. That's enough time to find the right job, not just any job.",
  
  nowWhat: [
    'FILE FOR UNEMPLOYMENT the day you\'re laid off — this doubles your runway',
    'PAUSE discretionary spending — explain to kids this is temporary belt-tightening',
    'CONSIDER whether partner can pick up part-time work — even $500/month adds 2+ months',
    'JOB SEARCH intensively — 11 months is good, but family stability is priority',
  ],
};

// ============================================
// ALL SCENARIOS EXPORT
// ============================================

export const RUNWAY_SAMPLE_SCENARIOS: RunwayScenario[] = [
  TIGHT_SQUEEZE_SCENARIO,
  TECH_LAYOFF_SCENARIO,
  SINGLE_INCOME_FAMILY_SCENARIO,
];

export const DEFAULT_SCENARIO = TIGHT_SQUEEZE_SCENARIO;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate runway in months
 * @param savings Total liquid savings
 * @param monthlyExpenses Total monthly expenses
 * @param monthlyIncome Total monthly income (partner + UI + other)
 * @returns Runway in months, or Infinity if cash-flow positive
 */
export function calculateRunway(
  savings: number,
  monthlyExpenses: number,
  monthlyIncome: number
): number {
  const monthlyBurn = monthlyExpenses - monthlyIncome;
  
  if (monthlyBurn <= 0) {
    return Infinity; // Cash-flow positive
  }
  
  return savings / monthlyBurn;
}

/**
 * Estimate unemployment benefits (rough estimate only)
 * Actual benefits vary significantly by state, previous income, and other factors.
 * This uses ~25% of previous income as a rough middle-ground estimate.
 * 
 * @param previousMonthlyIncome Previous monthly net income
 * @returns Estimated monthly UI benefit
 */
export function estimateUIBenefit(previousMonthlyIncome: number): number {
  // Rough estimate: ~25% of previous income
  // Most states cap between $300-$900/week ($1,200-$3,600/month)
  const estimate = previousMonthlyIncome * 0.25;
  
  // Cap at reasonable maximum (roughly $2,500/month)
  const maxBenefit = 2500;
  
  return Math.min(estimate, maxBenefit);
}

/**
 * Get runway status category
 * @param runwayMonths Runway in months
 * @returns Status category for UI styling
 */
export function getRunwayStatus(runwayMonths: number): 'strong' | 'moderate' | 'urgent' | 'positive' {
  if (runwayMonths === Infinity) return 'positive';
  if (runwayMonths >= 12) return 'strong';
  if (runwayMonths >= 3) return 'moderate';
  return 'urgent';
}

/**
 * Format runway for display
 * @param runwayMonths Runway in months
 * @returns Formatted string
 */
export function formatRunway(runwayMonths: number): string {
  if (runwayMonths === Infinity) {
    return 'Cash-flow positive';
  }
  
  if (runwayMonths >= 24) {
    const years = Math.floor(runwayMonths / 12);
    const months = Math.round(runwayMonths % 12);
    if (months === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
  }
  
  // Round to 1 decimal place for display
  const rounded = Math.round(runwayMonths * 10) / 10;
  return `${rounded} month${rounded !== 1 ? 's' : ''}`;
}

// ============================================
// MATH VERIFICATION (for testing)
// ============================================

export function verifyScenarioMath(scenario: RunwayScenario): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Verify expense totals
  const calcEssentials = scenario.expenses
    .filter(e => e.isEssential)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const calcDiscretionary = scenario.expenses
    .filter(e => !e.isEssential)
    .reduce((sum, e) => sum + e.amount, 0);
  
  if (calcEssentials !== scenario.totalEssentials) {
    errors.push(`Essentials mismatch: calculated ${calcEssentials}, stated ${scenario.totalEssentials}`);
  }
  
  if (calcDiscretionary !== scenario.totalDiscretionary) {
    errors.push(`Discretionary mismatch: calculated ${calcDiscretionary}, stated ${scenario.totalDiscretionary}`);
  }
  
  if (calcEssentials + calcDiscretionary !== scenario.totalExpenses) {
    errors.push(`Total expenses mismatch: ${calcEssentials} + ${calcDiscretionary} ≠ ${scenario.totalExpenses}`);
  }
  
  // Verify runway calculations (within 0.5 month tolerance for rounding)
  const currentBurn = scenario.totalExpenses - scenario.partnerIncome;
  const calcCurrentRunway = scenario.savings / currentBurn;
  if (Math.abs(calcCurrentRunway - scenario.runwayCurrentLifestyle) > 0.5) {
    errors.push(`Current runway mismatch: calculated ${calcCurrentRunway.toFixed(2)}, stated ${scenario.runwayCurrentLifestyle}`);
  }
  
  const bareBonesBurn = scenario.totalEssentials - scenario.partnerIncome;
  const calcBareBonesRunway = scenario.savings / bareBonesBurn;
  if (Math.abs(calcBareBonesRunway - scenario.runwayBareBones) > 0.5) {
    errors.push(`Bare bones runway mismatch: calculated ${calcBareBonesRunway.toFixed(2)}, stated ${scenario.runwayBareBones}`);
  }
  
  const withUIBurn = scenario.totalEssentials - scenario.partnerIncome - scenario.estimatedUIBenefit;
  if (withUIBurn > 0) {
    const calcWithUIRunway = scenario.savings / withUIBurn;
    if (Math.abs(calcWithUIRunway - scenario.runwayWithUI) > 0.5) {
      errors.push(`With UI runway mismatch: calculated ${calcWithUIRunway.toFixed(2)}, stated ${scenario.runwayWithUI}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
