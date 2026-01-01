# Rob's Money Lab - Product Requirements Document (PRD)

**Last Updated:** January 2, 2026  
**Status:** Soft Launch  
**Owner:** Rob Serpa

---

## 1. Executive Summary

Rob's Money Lab is a portfolio of privacy-first personal finance tools designed to help people understand their spending without the complexity of traditional budgeting apps. The target audience includes people who find apps like YNAB or Monarch overwhelming, with particular focus on the ADHD/neurospicy community who need quick insights rather than elaborate systems.

### Core Value Proposition
- **Privacy-first**: Transaction data stays in the browser; only opt-in summaries shared for AI insights
- **Quick insights**: See where your money goes in 60 seconds, not 60 minutes
- **No account required**: Upload CSV, get insights, done
- **Authentic credibility**: Built by a longtime YNAB user (previously Mvelopes) from real personal finance experience

---

## 2. Target Personas

> 📋 **See also:** [Persona Analysis](./PERSONA_ANALYSIS.md) for detailed UX friction analysis by persona.

### Primary: The Overwhelmed Budgeter
- Tried YNAB/Monarch but found it too complex or time-consuming
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
**Status:** Live  
**URL:** /tools/money-snapshot

**Purpose:** Quick categorization and visualization of bank statement data

**Features:**
- Multi-file CSV upload
- Automatic transaction categorization (~70% coverage)
- Category breakdown with percentages
- Income vs. spending summary (The Big Picture)
- Headline insight (above the fold)
- Quick Wins section
- "Needs Review" transactions (teachable categories)
- AI-powered insights (opt-in via Claude API)
- User-taught categories (localStorage)
- Sample data demo (Jamie Chen persona)
- Bank CSV export instructions
- Download Results (CSV export)
- Privacy section with expandable details

**Key Metrics:**
- Time to first insight: <60 seconds
- Categorization accuracy: >70%
- Uncategorized rate: <30%

### Tool 2: True Monthly Cost Calculator
**Status:** Live  
**URL:** /tools/true-monthly-cost

**Purpose:** Find recurring costs and calculate "true" monthly spending

**Features:**
- Recurring transaction detection
- Frequency identification (weekly/monthly/quarterly/annual)
- Monthly equivalent calculation
- Confidence scoring (High/Medium/Low)
- Editable frequency overrides
- Include/exclude toggle per item
- Hidden Costs insight section
- What to Do With This section
- AI-powered insights (opt-in)
- Sample data demo
- Bank CSV export instructions
- Download Results (CSV export)
- Privacy section with expandable details

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
- **Deployment:** Lovable (robsmoneylab.lovable.app)

### Data Processing
- **CSV Parsing:** PapaParse (client-side)
- **Data Storage:** Browser only (localStorage for user preferences)
- **No backend database for transaction data**

### AI Integration
- **Provider:** Anthropic Claude API
- **Model:** Configurable via environment variable (CLAUDE_MODEL)
- **Security:** Supabase Edge Function (hides API key)
- **Rate Limiting:** 10 requests per IP per hour
- **Input Validation:** 50KB max, type checking, XSS sanitization
- **Data Sent:** Aggregated summaries only, no raw transactions
- **Consent:** Explicit opt-in required

### Privacy Model
```
User's Browser                    Supabase Edge Function
┌─────────────────┐              ┌─────────────────┐
│ CSV Upload      │              │ Claude API Key  │
│ ↓               │              │ (hidden)        │
│ Parse & Analyze │              │ CLAUDE_MODEL    │
│ ↓               │              │ (env variable)  │
│ Show Results    │              └────────┬────────┘
│ ↓               │    Summary Only       │
│ [Opt-in AI] ────┼──────────────────────→│
│ ↓               │                       │
│ Display Insights│←──────────────────────┤
└─────────────────┘              AI Response
```

### Development Workflow
- **UI/Visual changes:** Lovable
- **Logic/Algorithms:** Claude Code
- **Version Control:** GitHub (2-way sync with Lovable)
- **Safe Push:** `git sync` alias (always pulls before push)

---

## 5. Design System

### Brand Identity
- **Name:** Rob's Money Lab
- **Favicon:** Beaker with dollar sign (teal on cream)
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

### Page Structure (After Upload)
1. **Headline insight** — Above the fold
2. **The Big Picture** — Money in/out/net
3. **Summary** — Key stats recap
4. **Where It Goes** — Category breakdown
5. **Quick Wins** — Actionable suggestions
6. **Needs Review** — Uncategorized transactions
7. **Patterns / AI Insights** — Opt-in Claude analysis
8. **What's Next** — Action buttons (download, next tool, feedback)

### Tone Guidelines
- Warm, not clinical
- Curious, not judgmental
- Actionable, not overwhelming
- Honest about limitations

---

## 7. Go-to-Market Strategy

### Phase 1: Soft Launch (Current)
- ✅ Build functional tools that demonstrate real value
- ✅ Create sample data demos for skeptical users
- ✅ Reddit soft launch (r/vibecoding, r/ClaudeAI, r/ClaudeCode)
- ⏳ Pending: r/personalfinance (awaiting mod approval)
- ⏳ Pending: r/YNAB (awaiting mod approval)

### Phase 2: Iteration
- Monitor feedback via Formspree and Reddit
- Fix issues and add requested features
- Build credibility through engagement

### Phase 3: Growth (Future)
- SEO optimization (deferred until traction)
- Custom domain (deferred until traction)
- Content marketing (frameworks, not just tools)
- Community-contributed category database

### Key Differentiators
- Privacy-first (no bank login required)
- No ongoing commitment (one-time analysis)
- Built by someone who actually uses YNAB daily
- Transparent about methodology and limitations

---

## 8. Success Metrics

### User Engagement
- Tool completions (upload → view results)
- AI insights opt-in rate
- Sample data usage
- Feedback submissions (Formspree)
- Return visits

### Product Quality
- Categorization accuracy
- Recurring detection accuracy
- Time to insight
- Error rate

### Community (Soft Launch)
- Reddit engagement (comments, upvotes)
- Feedback quality and sentiment
- Bug reports vs. feature requests

---

## 9. Deferred Decisions

### SEO Optimization
**Status:** Deferred  
**Reasoning:** Focus on Reddit-driven traffic for soft launch. Lovable sites can be indexed, but organic search isn't priority until product-market fit is validated.  
**Trigger to revisit:** Consistent traffic, positive feedback, ready for custom domain.

### Monetization
**Status:** Stay free  
**Reasoning:** Free removes friction and builds trust with skeptical users. No significant costs yet.  
**Trigger to revisit:**
- API costs exceed $50/month
- Users request features requiring ongoing costs
- Someone offers to pay

**Options to consider later:**
- Freemium (basic free, advanced paid)
- Pay what you want / "buy me a coffee"
- YNAB affiliate links
- One-time purchase for premium features

### Custom Domain
**Status:** Deferred  
**Reasoning:** robsmoneylab.lovable.app is fine for soft launch.  
**Trigger to revisit:** Positive feedback, growing traffic, ready to build brand.

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Privacy concerns block adoption | High | High | Sample data demo, clear messaging, no account required |
| Categorization accuracy too low | Medium | High | User-taught categories, iterative improvement |
| AI costs exceed value | Low | Medium | Opt-in only, summary-based prompts, rate limiting |
| Model deprecation breaks AI | Medium | Medium | Model as env variable, no redeploy needed |
| Reddit posts removed/ignored | Medium | Low | Multiple subs, mod pre-approval where needed |

---

## 11. Appendix

### Competitive Landscape
- **YNAB:** Full budgeting system, requires commitment, $14.99/month
- **Monarch:** Bank connection via Plaid, $14.99/month
- **Rocket Money:** Subscription tracking focus, freemium
- **Copilot:** Mobile-focused, $10.99/month
- **Tiller:** Spreadsheet-based, requires setup, $79/year

### Rob's Money Lab Positioning
- Lighter weight than YNAB
- More private than Monarch/Rocket Money
- Cheaper than all of them (free)
- Simpler than Tiller
- For people who want insights without a system

### Links & Resources
- **Live Site:** https://robsmoneylab.lovable.app
- **GitHub:** https://github.com/psrob9/rob-s-money-lab
- **Formspree:** https://formspree.io/f/mzdzdgga

---

*Document Version: 2.0*  
*Next Review: January 15, 2026*
