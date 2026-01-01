# Rob's Money Lab - Project Status

**Last Updated:** December 31, 2025  
**Sprint:** Initial Build  
**Overall Status:** 🟢 On Track

---

## Quick Summary

Two tools live and functional. Core features working. Refinement and polish phase next.

| Tool | Status | Notes |
|------|--------|-------|
| Money Snapshot | 🟢 Live | Working, needs UX polish |
| True Monthly Cost Calculator | 🟡 Live (Beta) | Algorithm needs tuning |
| Portfolio Site | 🟢 Live | Homepage, Tools page, About page |

---

## What's Done

### Infrastructure ✅
- [x] Portfolio site created (Rob's Money Lab)
- [x] Warm amber/teal design system implemented
- [x] Navigation (Home, Tools, About)
- [x] Responsive layout
- [x] Supabase Edge Function for Claude API (secure key handling)

### Money Snapshot Tool ✅
- [x] Multi-file CSV upload
- [x] Flexible column detection (handles various bank formats)
- [x] Date parsing (multiple formats)
- [x] Amount parsing (handles $, commas, negatives)
- [x] Automatic category detection (~70 keywords)
- [x] Category breakdown visualization
- [x] Income vs. spending summary (The Big Picture)
- [x] Monthly averages
- [x] Expandable Uncategorized transaction list
- [x] AI insights integration (opt-in)
- [x] Privacy consent flow
- [x] File management UI (add/remove files)
- [x] User-taught categories (localStorage)

### True Monthly Cost Calculator ✅
- [x] Tool page created
- [x] CSV upload (separate from Money Snapshot)
- [x] Recurring transaction detection
- [x] Frequency identification
- [x] Monthly equivalent calculation
- [x] Confidence scoring (High/Medium/Low)
- [x] Include/exclude toggle per item
- [x] Expandable transaction details
- [x] AI insights integration (opt-in)
- [x] Hidden Costs insight section

### Edge Case Testing ✅
- [x] Bank of America format
- [x] Capital One format (separate Debit/Credit columns)
- [x] Amex format (short dates)
- [x] Wells Fargo with metadata rows
- [x] European format (DD/MM/YYYY, German headers)

---

## What's In Progress

### Prompt Queue (Ready for Lovable)

| # | Prompt | Purpose | Status |
|---|--------|---------|--------|
| 12 | Algorithm Fixes + Filters | Fix burst detection, add filters | Ready |
| 14 | Page Restructure | Headline insight, Quick Wins, Summary | Ready |
| 15 | Sample Data Demo | "Try with sample data" for skeptical users | Ready |

### Known Issues to Fix

| Issue | Severity | Tool | Notes |
|-------|----------|------|-------|
| Burst purchases detected as recurring | High | True Monthly Cost | See's Candies 3x in 2 days flagged as weekly |
| Mortgage not detected | High | True Monthly Cost | PENNYMAC variations not grouping |
| Missing homepage card | Medium | True Monthly Cost | Tool not showing on homepage Tools section |
| Privacy messaging inconsistent | Medium | True Monthly Cost | Says "no data leaves browser" but has AI opt-in |
| Only top 5 uncategorized shown | Low | Money Snapshot | Users want to see/categorize more |
| No filters on recurring list | Low | True Monthly Cost | Hard to navigate with 70+ items |

---

## What's Not Started

### High Priority (Next Sprint)
- [ ] Sample data demo feature (Prompt 15)
- [ ] Page restructure for engagement (Prompt 14)
- [ ] Algorithm fixes for recurring detection (Prompt 12)
- [ ] Homepage card for True Monthly Cost

### Medium Priority
- [ ] Download CSV functionality
- [ ] Show more uncategorized transactions
- [ ] Manual "add custom rule" without clicking transaction
- [ ] Cross-tool data sharing (use Money Snapshot data in True Monthly Cost)

### Low Priority / Future
- [ ] Community category database (crowdsourced)
- [ ] YNAB-specific export format
- [ ] Spending trends over time visualization
- [ ] Budget Psychology Assessment tool
- [ ] Email capture / newsletter

---

## Prompts Completed (This Session)

| # | Title | What It Did |
|---|-------|-------------|
| 1-4 | Initial Setup | Portfolio site, navigation, design system |
| 5 | Money Snapshot Core | File upload, parsing, categorization |
| 6 | Multi-file Upload | Support for multiple CSV files |
| 7 | AI Insights | Claude integration via Supabase |
| 8 | Category Keywords | Expanded keyword list |
| 9 | User-Taught Categories | localStorage learning |
| 10 | True Monthly Cost | Second tool, recurring detection |
| 11 | Algorithm Improvements | Better detection logic (partial) |
| 12 | Combined Fixes | Homepage, privacy, algorithm, filters |
| 13 | Test CSV Files | Sample files for edge case testing |
| 14 | Page Restructure | Headline insight, Quick Wins, Summary |
| 15 | Sample Data Demo | Try without uploading |

---

## Test Files Created

| File | Purpose |
|------|---------|
| sample_checking_recurring.csv | Clear monthly patterns, mortgage, subscriptions |
| sample_credit_card_mixed.csv | Mixed spending + burst buying trap (See's Candies) |
| sample_annual_quarterly.csv | Annual/quarterly subscriptions |
| bofa_checking_sample.csv | Bank of America format test |
| capitalone_card_sample.csv | Capital One format test |
| amex_card_sample.csv | Amex format test |
| wells_fargo_problematic.csv | Metadata rows before header |
| european_bank_sample.csv | DD/MM/YYYY, German column names |

---

## Architecture Decisions Made

| Decision | Rationale |
|----------|-----------|
| Client-side CSV parsing | Privacy — no transaction data hits server |
| Supabase Edge Function for AI | Security — hides Claude API key |
| localStorage for user preferences | No account needed, data stays local |
| Opt-in AI insights | Explicit consent, clear about what's shared |
| Keyword-based categorization | Simple, transparent, user can understand |
| User-taught categories in localStorage | Gets smarter over time, per-user |

---

## Metrics & Observations

### From Testing (Rob's Real Data)
- 888 transactions across 3 files
- 13 month period
- 31% uncategorized (goal: <20%)
- $99K in, $58K out, +$41K net
- Categorization working but needs more keywords

### Algorithm Performance
- Parses all tested bank formats correctly
- Recurring detection catching obvious items
- False positives on burst purchases (needs fix)
- Missing some obvious recurring (mortgage)

---

## Next Session Priorities

1. **Apply Prompt 12** — Fix algorithm issues
2. **Apply Prompt 14** — Page restructure for engagement
3. **Apply Prompt 15** — Sample data demo
4. **Test with sample data** — Verify "aha moments" work
5. **Reddit soft launch** — Share for feedback

---

## Links & Resources

- **Live Site:** [Lovable preview URL]
- **Supabase Project:** [Dashboard URL]
- **GitHub:** [If exported]
- **Figma/Design:** N/A (built in Lovable)

---

## Questions / Decisions Needed

1. **Custom domain?** — Ready to connect robsmoneylab.com or similar?
2. **Analytics?** — Add Plausible/Simple Analytics for privacy-friendly tracking?
3. **Email capture?** — Add newsletter signup for updates?
4. **Beta feedback mechanism?** — How to collect structured feedback?

---

*Status updated: December 31, 2025 4:22 PM*
