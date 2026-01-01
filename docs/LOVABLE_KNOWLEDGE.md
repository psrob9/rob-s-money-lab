# Rob's Money Lab - Lovable Project Knowledge

## Project Overview

Rob's Money Lab is a portfolio of privacy-first personal finance tools. The target audience is people who find traditional budgeting apps overwhelming, with particular focus on the ADHD/neurospicy community who need quick insights rather than elaborate systems.

**Live Tools:**
- Money Snapshot (`/tools/money-snapshot`) - Quick spending categorization
- True Monthly Cost Calculator (`/tools/true-monthly-cost`) - Recurring cost finder

---

## Core Principles

### Privacy First
- All transaction parsing happens client-side in the browser
- No transaction data is ever sent to a server unless user explicitly opts into AI insights
- AI insights only receive aggregated summaries, never raw transaction data
- No user accounts, no logins, no data persistence on servers
- User preferences stored in localStorage only

### Quick Value
- Users should see meaningful insights within 60 seconds of uploading
- Front-load the "aha moment" — show the most interesting insight first
- Minimize friction — no accounts, no setup, just upload and see results

### Trust Building
- Always offer "Try with sample data" option for skeptical users
- Be explicit about what data is shared and when
- Use warm, non-judgmental language
- Celebrate wins, don't shame spending habits

---

## Design System

### Colors
- **Background:** Warm amber/peach (`bg-gradient-to-br from-lab-warm-cream to-lab-peach`)
- **Primary accent:** Teal (`text-lab-teal`, `bg-lab-teal`)
- **Cards:** White with subtle shadows
- **Text:** Dark warm gray

### Typography
- Headers: Bold, warm tones
- Body: Clean, readable
- Numbers: Prominent when showing financial data

### Component Patterns
- Cards for distinct sections
- Expandable/collapsible sections for details
- Toggle switches for include/exclude
- Dropdowns for category/frequency selection
- Progress bars for category breakdowns

### Tone
- Warm, not clinical
- Curious, not judgmental
- Actionable, not overwhelming
- Honest about limitations

---

## Code Conventions

### File Structure
```
src/
  components/     # Reusable UI components
  pages/          # Route pages
  utils/          # Helper functions, utilities
  hooks/          # Custom React hooks
```

### Naming
- Components: PascalCase (`MoneySnapshot.tsx`)
- Utilities: camelCase (`categoryLearning.ts`)
- Constants: UPPER_SNAKE_CASE (`SAMPLE_TRANSACTIONS`)

### TypeScript
- Always define interfaces for data structures
- Use explicit types, avoid `any`
- Export interfaces that might be reused

### State Management
- Use React useState/useEffect for component state
- localStorage for persistent user preferences
- No global state management library needed (keep it simple)

---

## Key Data Structures

### Transaction
```typescript
interface Transaction {
  date: Date;
  description: string;
  amount: number;  // Negative = expense, Positive = income
  category?: string;
}
```

### Recurring Transaction
```typescript
interface RecurringTransaction {
  merchant: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
  averageAmount: number;
  occurrences: number;
  monthlyEquivalent: number;
  confidence: 'high' | 'medium' | 'low';
  included: boolean;  // User can toggle off
}
```

### Learned Category
```typescript
interface LearnedCategory {
  pattern: string;      // Uppercase merchant pattern
  category: string;     // Category name
  addedAt: string;      // ISO timestamp
}
```

---

## Categorization Logic

### Order of Operations
1. Check user-taught categories (localStorage) first
2. Check pattern-based rules (AMZN*, TST*, SQ *, etc.)
3. Check keyword matches
4. Default to "Uncategorized"

### Categories
- Groceries
- Food & Dining
- Shopping
- Transportation
- Utilities & Bills
- Subscriptions & Entertainment
- Travel & Entertainment
- Healthcare
- Housing
- Donations & Memberships
- Transfers & Payments
- Other
- Uncategorized

### Pattern Rules
- `AMZN*`, `AMAZON*` → Shopping
- `TST*` (Toast POS) → Food & Dining
- `SQ *` (Square) → Check keywords, default Shopping
- `APPLE.COM/BILL` → Subscriptions
- `PAYROLL`, `DIRECT DEP` (positive amount) → Income

---

## AI Integration

### Supabase Edge Function
- Function name: `generate-insights`
- Hides Claude API key from client
- Accepts spending summary, returns insights

### What Gets Sent to AI
Only aggregated data:
- Category totals and percentages
- Total income/expenses/net
- Number of transactions
- Time period

Never sent:
- Individual transaction descriptions
- Raw amounts
- Dates
- Any identifying information

### Consent Flow
1. Show results without AI insights
2. Display opt-in prompt explaining what will be shared
3. User clicks "Get AI Insights"
4. Call Supabase function
5. Display Claude's response in Patterns section

---

## Recurring Detection Algorithm

### Requirements for "Recurring"
- Minimum 2 occurrences
- Span at least 60 days from first to last
- Not clustered (>50% within 7 days = burst, not recurring)

### Confidence Levels
- **High:** 6+ occurrences, 6+ month span, <20% amount variance
- **Medium:** 3-5 occurrences, 3+ month span, <30% variance
- **Low:** 2+ occurrences, 2+ month span

### Frequency Detection (by average interval)
- Weekly: 5-10 days
- Bi-weekly: 12-18 days
- Monthly: 25-35 days
- Quarterly: 80-100 days
- Annual: 350-400 days
- Irregular: anything else

### Amount Variance Thresholds
- Over $500: allow 25% variance (mortgages, rent)
- $100-500: allow 20% variance (utilities)
- Under $100: allow 15% variance (subscriptions)

---

## Sample Data

### Persona: Jamie Chen
- 28-year-old software engineer in Austin, TX
- 247 transactions over 12 months
- ~$100K income, ~$53K expenses, ~48% savings rate

### Built-in "Aha Moments"
1. 4 streaming services ($71/month) — consolidation opportunity
2. High dining:grocery ratio (2.8x) — awareness opportunity
3. July vacation spending spike — seasonal pattern
4. Nov/Dec holiday spending spike — seasonal pattern
5. Semi-annual car insurance — hidden periodic cost
6. Annual Amazon Prime — easy to forget annual charge
7. Strong savings rate — something positive to celebrate

### Usage
- Show "Try with sample data" button below upload zone
- When clicked, load SAMPLE_TRANSACTIONS from `utils/sampleData.ts`
- Display banner: "Viewing sample data for Jamie Chen"
- Let user experience full tool without uploading personal data

---

## Page Structure Pattern

### Before Upload
1. Clear value proposition (what they'll learn)
2. Upload zone
3. "Try with sample data" option
4. Privacy reassurance

### After Upload
1. **Headline Insight** (above fold) — One surprising finding
2. **Quick Stats** — Period, transactions, files
3. **The Big Picture** — Money in/out/net
4. **Where It Goes** — Category breakdown
5. **Quick Wins** — Actionable suggestions
6. **Patterns** — AI insights (opt-in)
7. **Summary + Next Steps** — Recap and CTAs

### Key UX Rule
The most valuable insight should be visible without scrolling.

---

## Common Fixes & Patterns

### CSV Parsing Issues
- Always use PapaParse with `header: true`
- Handle multiple date formats (MM/DD/YYYY, YYYY-MM-DD, DD/MM/YYYY)
- Strip currency symbols and commas from amounts
- Handle both "Amount" column and separate "Debit"/"Credit" columns
- Skip metadata rows before actual header

### Amount Sign Conventions
- Some banks: negative = expense, positive = income
- Some banks: positive = expense (in "Amount" column)
- Some banks: separate Debit/Credit columns
- Normalize to: negative = outflow, positive = inflow

### Merchant Name Cleaning
- Uppercase for comparison
- Remove trailing numbers, dates, IDs
- Remove location suffixes (#1234, STORE 567, etc.)
- Keep first 2-3 significant words for grouping

---

## Testing Checklist

### CSV Format Compatibility
- [ ] Standard 3-column (Date, Description, Amount)
- [ ] Separate Debit/Credit columns
- [ ] Different date formats
- [ ] Currency symbols in amounts
- [ ] Metadata rows before header
- [ ] European formats (DD/MM/YYYY, comma decimals)

### Categorization
- [ ] Major retailers detected (Amazon, Walmart, Target)
- [ ] Restaurants/food delivery detected
- [ ] Subscriptions detected (Netflix, Spotify)
- [ ] Utilities detected
- [ ] User-taught categories applied first

### Recurring Detection
- [ ] Monthly subscriptions detected
- [ ] Rent/mortgage detected (with variance)
- [ ] Annual subscriptions detected
- [ ] Burst purchases NOT detected as recurring
- [ ] Confidence levels appropriate

---

## Future Considerations

### Phase 2: Community Categories
- Opt-in sharing of merchant → category mappings
- Crowdsourced database of categorizations
- Confidence scoring based on submission count
- Sanitize patterns to remove personal info (names, numbers)

### Potential New Tools
- Budget Psychology Assessment
- YNAB Deep Analysis Dashboard
- Spending Trends Over Time
- Category Drill-Down Explorer

---

## Quick Reference

### localStorage Keys
- `money-snapshot-learned-categories` — User-taught category mappings

### Supabase Functions
- `generate-insights` — Claude AI insights generation

### Key Files
- `src/pages/MoneySnapshot.tsx` — Main Money Snapshot tool
- `src/pages/TrueMonthlyCost.tsx` — True Monthly Cost tool
- `src/utils/sampleData.ts` — Sample data for demo mode
- `src/utils/categoryLearning.ts` — User-taught categories

### External Dependencies
- PapaParse — CSV parsing
- Lucide React — Icons
- Recharts — Charts (if used)
- shadcn/ui — UI components
