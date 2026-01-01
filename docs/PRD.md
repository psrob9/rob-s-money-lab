# Rob's Money Lab - Product Requirements Document (PRD)

**Last Updated:** December 31, 2025  
**Status:** Active Development  
**Owner:** Rob Serpa

---

## 1. Executive Summary

Rob's Money Lab is a portfolio of privacy-first personal finance tools designed to help people understand their spending without the complexity of traditional budgeting apps. The target audience includes people who find apps like YNAB or Mint overwhelming, with particular focus on the ADHD/neurospicy community who need quick insights rather than elaborate systems.

### Core Value Proposition
- **Privacy-first**: Transaction data stays in the browser; only opt-in summaries shared for AI insights
- **Quick insights**: See where your money goes in 60 seconds, not 60 minutes
- **No account required**: Upload CSV, get insights, done
- **Authentic credibility**: Built from real personal finance experience and data

---

## 2. Target Personas

> **See also:** [Persona Analysis](./PERSONA_ANALYSIS.md) for detailed UX friction analysis by persona

### Primary: The Overwhelmed Budgeter
- Tried YNAB/Mint but found it too complex or time-consuming
- Wants to understand spending without maintaining a system
- Often ADHD/neurospicy — needs quick wins, not elaborate processes
- Values privacy, skeptical of apps that want bank login

### Secondary: The YNAB Power User
- Already uses YNAB but wants additional analysis
- Has CSV exports available
- Looking for insights their current tools don't provide
- Comfortable with data, appreciates depth

### Tertiary: The Spreadsheet DIYer
- Manages finances in Excel/Google Sheets
- Wants tools that export clean data they can manipulate
- Values control and transparency over convenience

### Validation Persona: The Skeptical Redditor
- Privacy-conscious, assumes the worst about data collection
- Won't upload real data until trust is established
- Needs to see value before committing
- Active in r/YNAB, r/personalfinance, r/privacy

---

## 3. Product Portfolio

### Tool 1: Money Snapshot
**Status:** Live (MVP)  
**URL:** /tools/money-snapshot

**Purpose:** Quick categorization and visualization of bank statement data

**Features:**
- Multi-file CSV upload
- Automatic transaction categorization (~70% coverage)
- Category breakdown with percentages
- Income vs. spending summary
- AI-powered insights (opt-in via Claude API)
- User-taught categories (localStorage)

**Key Metrics:**
- Time to first insight: <60 seconds
- Categorization accuracy: >70%
- Uncategorized rate: <30%

### Tool 2: True Monthly Cost Calculator
**Status:** Live (MVP)  
**URL:** /tools/true-monthly-cost

**Purpose:** Find recurring costs and calculate "true" monthly spending

**Features:**
- Recurring transaction detection
- Frequency identification (weekly/monthly/quarterly/annual)
- Monthly equivalent calculation
- Confidence scoring
- Editable frequency overrides
- AI-powered insights (opt-in)

**Key Metrics:**
- Recurring detection accuracy: >80%
- False positive rate: <15%

### Future Tools (Planned)
- Budget Psychology Assessment
- YNAB Insights Dashboard (deeper analysis for YNAB users)
- Spending Trends Over Time

---

## 4. Technical Architecture

### Frontend
- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Deployment:** Lovable (likely Netlify/Vercel backend)

### Data Processing
- **CSV Parsing:** PapaParse (client-side)
- **Data Storage:** Browser only (localStorage for user preferences)
- **No backend database for transaction data**

### AI Integration
- **Provider:** Anthropic Claude API
- **Security:** Supabase Edge Function (hides API key)
- **Data Sent:** Aggregated summaries only, no raw transactions
- **Consent:** Explicit opt-in required

### Privacy Model
```
User's Browser                    Supabase Edge Function
┌─────────────────┐              ┌─────────────────┐
│ CSV Upload      │              │ Claude API Key  │
│ ↓               │              │ (hidden)        │
│ Parse & Analyze │              └────────┬────────┘
│ ↓               │                       │
│ Show Results    │                       │
│ ↓               │    Summary Only       │
│ [Opt-in AI] ────┼──────────────────────→│
│ ↓               │                       │
│ Display Insights│←──────────────────────┤
└─────────────────┘              AI Response
```

---

## 5. Design System

### Brand Identity
- **Name:** Rob's Money Lab
- **Tone:** Warm, approachable, non-judgmental
- **Visual:** Soft amber/peach backgrounds, teal accents

### Color Palette
- Background: Warm amber (#FEF3E2 or similar)
- Primary accent: Teal (#0D9488)
- Text: Dark warm gray
- Cards: White with subtle shadows

### UX Principles
1. **Front-load value** — Show insights immediately, details on scroll
2. **Minimize friction** — No accounts, no logins, just upload
3. **Build trust** — Clear privacy messaging, sample data option
4. **Celebrate wins** — Positive framing, not shame-based

---

## 6. Content Strategy

### Insight Framework: What? So What? Now What?
- **What:** The data/numbers (you spent $X on Y)
- **So What:** The context/meaning (that's 3x the average)
- **Now What:** The action (here's what you could do)

### Page Structure
1. **Before upload:** Tell them what they'll learn
2. **After upload:** Headline insight above the fold
3. **On scroll:** Detailed breakdown
4. **At bottom:** Summary + next actions

### Tone Guidelines
- Warm, not clinical
- Curious, not judgmental
- Actionable, not overwhelming
- Honest about limitations

---

## 7. Go-to-Market Strategy

### Phase 1: Credibility Building (Current)
- Build functional tools that demonstrate real value
- Create sample data demos for skeptical users
- Develop authentic insights from personal data analysis

### Phase 2: Community Validation
- Share in r/YNAB, r/personalfinance, r/ClaudeAI
- Offer guided analysis sessions (not raw data uploads)
- Collect feedback, iterate on tools

### Phase 3: Growth
- SEO optimization for personal finance tool searches
- Content marketing (frameworks, not just tools)
- Community-contributed category database (Phase 2 of user learning)

### Key Differentiators
- Privacy-first (no bank login required)
- No ongoing commitment (one-time analysis)
- Built by someone who actually uses these tools
- Transparent about methodology and limitations

---

## 8. Success Metrics

### User Engagement
- Tool completions (upload → view results)
- AI insights opt-in rate
- Return visits
- Tool-to-tool conversion (Money Snapshot → True Monthly Cost)

### Product Quality
- Categorization accuracy
- Recurring detection accuracy
- Time to insight
- Error rate

### Business (Future)
- Email list signups
- Affiliate conversions (YNAB referrals)
- Premium tool purchases (if applicable)

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Privacy concerns block adoption | High | High | Sample data demo, clear messaging, no account required |
| Categorization accuracy too low | Medium | High | User-taught categories, community database |
| AI costs exceed value | Low | Medium | Opt-in only, summary-based prompts |
| Competition from established apps | Medium | Low | Focus on simplicity niche, not full budgeting |

---

## 10. Appendix

### Competitive Landscape
- **YNAB:** Full budgeting system, requires commitment
- **Mint:** Free but ad-supported, requires bank login
- **Copilot:** Subscription-based, mobile-focused
- **Tiller:** Spreadsheet-based, requires setup

### Rob's Money Lab Positioning
- Lighter weight than YNAB
- More private than Mint
- Cheaper than Copilot
- Simpler than Tiller
- For people who want insights without a system

---

*Document Version: 1.0*  
*Next Review: January 15, 2026*
