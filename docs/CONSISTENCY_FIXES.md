# Rob's Money Lab - Consistency & Polish Fixes

**Date:** January 2, 2026
**Status:** Ready for Claude Code
**Repo:** https://github.com/psrob9/rob-s-money-lab (PUBLIC)

---

## Overview

Lovable built the Runway Calculator with improved design patterns. Now we need to:
1. Apply those patterns consistently across all pages
2. Add missing elements (GitHub link, tool cards)
3. Fix specific issues with the Runway Calculator

---

## Task List

### PRIORITY 1: Missing Tool Cards

#### Task 1.1: Homepage — Add 3rd Tool Card
**File:** `src/pages/Index.tsx`
**Issue:** Only 2 tools showing in card section
**Fix:** Add Runway Calculator card matching existing style

```tsx
// Add this card to the tools section, matching existing card pattern:
{
  title: "Layoff Runway Calculator",
  description: "Are you prepared for a layoff? Calculate how long your savings will last across different scenarios.",
  icon: "🛡️", // or Shield icon from lucide-react
  href: "/tools/runway-calculator",
  badge: "New" // optional
}
```

#### Task 1.2: About Page — Add 3rd Tool
**File:** `src/pages/About.tsx`
**Issue:** Only 2 tools in tools section
**Fix:** Add Runway Calculator to tools list

---

### PRIORITY 2: GitHub Link (Trust Signal)

#### Task 2.1: Footer — Add GitHub Link
**File:** `src/components/Footer.tsx` (or wherever footer is)
**Action:** Add GitHub icon/link

```tsx
// Add to footer links:
<a 
  href="https://github.com/psrob9/rob-s-money-lab" 
  target="_blank" 
  rel="noopener noreferrer"
  className="text-gray-500 hover:text-lab-teal transition-colors"
>
  <Github className="h-5 w-5" />
  <span className="sr-only">View source on GitHub</span>
</a>
```

#### Task 2.2: About Page — Add GitHub Reference
**File:** `src/pages/About.tsx`
**Action:** Add "Open Source" section or mention

```tsx
// Add to About page:
<p>
  Rob's Money Lab is open source. 
  <a href="https://github.com/psrob9/rob-s-money-lab" target="_blank">
    View the code on GitHub
  </a> 
  to see exactly how your data is processed.
</p>
```

#### Task 2.3: Privacy Sections — Add "View Code" Link
**Files:** All tool pages with privacy accordions
**Action:** Add link in privacy section

```tsx
// Add to privacy accordion content:
<p className="text-sm text-gray-500">
  Don't take our word for it — 
  <a href="https://github.com/psrob9/rob-s-money-lab" target="_blank" className="text-lab-teal hover:underline">
    view the source code
  </a>.
</p>
```

---

### PRIORITY 3: Runway Calculator Fixes

#### Task 3.1: Move Privacy Section
**File:** `src/pages/RunwayCalculator.tsx`
**Issue:** Privacy section at bottom of page
**Fix:** Move between "Who This Is For" and "Your Safety Net" input section

#### Task 3.2: Editable UI Benefits
**File:** `src/pages/RunwayCalculator.tsx`
**Issue:** UI benefit estimate not editable
**Fix:** Make the estimated amount an editable input with calculated default

```tsx
// Change from display-only to editable:
<div>
  <label>Estimated monthly UI benefit</label>
  <input 
    type="number"
    value={uiBenefit}
    onChange={(e) => setUiBenefit(Number(e.target.value))}
    className="..."
  />
  <p className="text-xs text-gray-500">
    Default estimate: ~25% of previous income. 
    Adjust based on your state's benefits.
  </p>
</div>
```

#### Task 3.3: UI Duration Note (Optional)
**File:** `src/pages/RunwayCalculator.tsx`  
**Action:** Add informational note about UI duration

```tsx
// Add note below UI benefit input:
<p className="text-xs text-gray-500">
  ℹ️ Most states provide unemployment for ~26 weeks (6 months). 
  Your runway assumes benefits continue — factor this into your planning.
</p>
```

---

### PRIORITY 4: Design Consistency Across Tool Pages

#### Task 4.1: Analyze Runway Calculator Patterns
**File:** `src/pages/RunwayCalculator.tsx`
**Action:** Identify design patterns to apply to other tools

**Patterns to extract:**
- [ ] Hero section with emoji icon
- [ ] "Who This Is For" collapsible section
- [ ] Sample data selector UI
- [ ] Results card styling
- [ ] "What's Next" footer section linking to other tools
- [ ] Privacy accordion styling

#### Task 4.2: Update Money Snapshot
**File:** `src/pages/MoneySnapshot.tsx`
**Action:** Apply consistent patterns

- [ ] Add emoji to hero section (if missing)
- [ ] Add "Who This Is For" section (if missing)
- [ ] Update "What's Next" section to link to all 3 tools
- [ ] Ensure privacy section matches Runway style
- [ ] Add GitHub link to privacy section

#### Task 4.3: Update True Monthly Cost
**File:** `src/pages/TrueMonthlyCost.tsx`
**Action:** Apply consistent patterns

- [ ] Add emoji to hero section (if missing)
- [ ] Add "Who This Is For" section (if missing)  
- [ ] Update "What's Next" section to link to all 3 tools
- [ ] Ensure privacy section matches Runway style
- [ ] Add GitHub link to privacy section

---

### PRIORITY 5: Shared Components (If Needed)

#### Task 5.1: Extract ToolCard Component
**Action:** If tool cards are duplicated, extract to shared component

**File to create:** `src/components/ToolCard.tsx`

```tsx
interface ToolCardProps {
  title: string;
  description: string;
  icon: string | React.ReactNode;
  href: string;
  badge?: string;
}

export function ToolCard({ title, description, icon, href, badge }: ToolCardProps) {
  // ... consistent card styling
}
```

#### Task 5.2: Extract WhatsNextSection Component
**Action:** If "What's Next" section is duplicated, extract

**File to create:** `src/components/WhatsNextSection.tsx`

```tsx
interface WhatsNextProps {
  currentTool: 'money-snapshot' | 'true-monthly-cost' | 'runway-calculator';
}

export function WhatsNextSection({ currentTool }: WhatsNextProps) {
  // Links to other 2 tools + feedback link
}
```

#### Task 5.3: Extract PrivacyAccordion Component
**Action:** Standardize privacy section across tools

**File to create:** `src/components/PrivacyAccordion.tsx`

---

### PRIORITY 6: Sample Data Verification

#### Task 6.1: Compare Lovable's Sample Data with Ours
**Files:** 
- Lovable's: `src/utils/runwaySampleData.ts` (or similar)
- Ours: `src/utils/runwaySampleData.ts` (the one you copied)

**Action:** Verify math matches. If Lovable created different data:
- Check if their math is correct
- Replace with our verified data if needed
- Ensure all 3 scenarios have traceable, verifiable calculations

#### Task 6.2: Add Math Verification Test
**Action:** Add a simple test or console check

```tsx
// In development, verify sample data math:
import { verifyScenarioMath, RUNWAY_SAMPLE_SCENARIOS } from '@/utils/runwaySampleData';

if (import.meta.env.DEV) {
  RUNWAY_SAMPLE_SCENARIOS.forEach(scenario => {
    const result = verifyScenarioMath(scenario);
    if (!result.isValid) {
      console.error(`Math error in ${scenario.name}:`, result.errors);
    }
  });
}
```

---

### PRIORITY 7: README Update

#### Task 7.1: Update README.md
**File:** `README.md`
**Action:** Replace Lovable boilerplate with project-specific info

```markdown
# Rob's Money Lab

Privacy-first personal finance tools for people who find traditional budgeting overwhelming.

## Tools

- **Money Snapshot** — Quick spending categorization from bank CSV exports
- **True Monthly Cost Calculator** — Find hidden recurring costs
- **Layoff Runway Calculator** — See how long your savings will last

## Privacy

All tools process your data locally in your browser. Nothing is sent to any server unless you explicitly opt-in to AI insights (which only receives aggregated summaries).

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase Edge Functions (for optional AI insights)

## Live Site

https://robsmoneylab.lovable.app

## License

MIT
```

#### Task 7.2: Add LICENSE File
**File:** `LICENSE`
**Action:** Add MIT license

```
MIT License

Copyright (c) 2026 Rob Serpa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Execution Order

1. **Quick wins first:**
   - Task 1.1: Add tool to homepage
   - Task 1.2: Add tool to about page
   - Task 2.1-2.3: Add GitHub links

2. **Runway fixes:**
   - Task 3.1: Move privacy section
   - Task 3.2: Editable UI benefits

3. **Consistency pass:**
   - Task 4.1: Analyze patterns
   - Task 4.2-4.3: Update other tools

4. **Cleanup:**
   - Task 5.x: Extract shared components (if worth it)
   - Task 6.x: Verify sample data
   - Task 7.x: Update README and LICENSE

---

## Claude Code Commands

When in Claude Code, you can reference this file and say:

```
Read the task list in CONSISTENCY_FIXES.md and start with Priority 1.
Show me the current Index.tsx and let's add the missing tool card.
```

Or:

```
Complete all Priority 2 tasks (GitHub links) across the codebase.
```

---

## Files to Touch

| File | Tasks |
|------|-------|
| `src/pages/Index.tsx` | 1.1 |
| `src/pages/About.tsx` | 1.2, 2.2 |
| `src/pages/RunwayCalculator.tsx` | 3.1, 3.2, 3.3 |
| `src/pages/MoneySnapshot.tsx` | 4.2, 2.3 |
| `src/pages/TrueMonthlyCost.tsx` | 4.3, 2.3 |
| `src/components/Footer.tsx` | 2.1 |
| `README.md` | 7.1 |
| `LICENSE` (new) | 7.2 |

---

*Created: January 2, 2026*
