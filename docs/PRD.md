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
- **Proactive control**: Tools that help you prepare, not just track retrospectively

---

## 2. Target Personas

> 📋 **See also:** [Persona Analysis](./PERSONA_ANALYSIS.md) for detailed UX friction analysis by persona.

### Primary: The Overwhelmed Budgeter (Overwhelmed Avoiders)
- Tried YNAB/Monarch but found it too complex or time-consuming
- Wants to understand spending without maintaining a system
- Often ADHD/neurospicy — needs quick wins, not elaborate processes
- Values privacy, skeptical of apps that want bank login
- Struggles with shame spirals around money; needs gentle, non-judgmental tools
- Benefits most from: Money Snapshot, Emergency Fund Runway Calculator

### Secondary: The YNAB Power User (System Builders)
- Already uses YNAB but wants additional analysis
- Has CSV exports available
- Looking for insights their current tools don't provide (YoY comparisons, forecasting)
- Comfortable with data, appreciates depth
- Loves optimization and building systems that work
- Benefits most from: True Monthly Cost, future YNAB Insights Dashboard

### Tertiary: The Spreadsheet DIYer
- Manages finances in Excel/Google Sheets
- Wants tools that export clean data they can manipulate
- Values control and transparency over convenience
- Often frustrated by subscription creep and non-monthly expenses

### Validation Persona: The Skeptical Redditor
- Privacy-conscious, assumes the worst about data collection
- Won't upload real data until trust is established
- Needs to see value before committing
- Active in r/YNAB, r/personalfinance, r/privacy, r/ADHD
- **Validated insight**: Got pushback on r/ClaudeAI for asking users to upload data; sample data demos are essential

### Note: "Natural Frugals" Archetype
Research identified a third archetype — people who are naturally frugal and don't need financial tools. These are NOT our target users. Don't design for them.

---

## 3. Product Portfolio

### Tool 1: Money Snapshot
**Status:** ✅ Live  
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

**Validated Value:** Addresses the "convenience food spending" awareness gap and subscription creep that ADHD users struggle with.

---

### Tool 2: True Monthly Cost Calculator
**Status:** ✅ Live  
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

**Validated Value:** Reddit research confirmed people manually calculate periodic expenses using pen and paper. This tool automates that work. Directly addresses "ADHD tax" from forgotten subscriptions.

---

### Tool 3: Layoff Runway Calculator
**Status:** ✅ Live
**URL:** /tools/runway-calculator

**Purpose:** Show "how long will I last" based on current savings and spending patterns

**Origin:** Validated through Rob's personal use during spouse's unemployment, plus Reddit research showing users ask "can we survive X months?" without tools to answer it.

**Core Problem Solved:**
- YNAB tracks spending but doesn't do scenario planning
- No interactive calculator exists for "how long will my savings last?"
- Users experiencing income disruption need runway projections, not retrospective analysis

**Features:**
- **Simple Input Mode:** Savings + monthly expenses (single field)
- **Itemized Mode:** Detailed breakdown of essentials and discretionary spending
- **Income Sources:** Partner income, unemployment benefits (editable estimate)
- **Buffer Options:** None, 10%, or 20% safety margin
- **Multiple Scenarios:**
  - Current Lifestyle (keep everything)
  - Bare-Bones (essentials only)
  - With Unemployment Benefits
- **What-If Toggles:** Toggle UI, cut discretionary, add severance, add gig income
- **Status Indicators:** Survival/Urgent/Moderate/Strong/Positive based on runway
- **Action Recommendations:** Specific next steps based on situation
- **3 Sample Scenarios:** Tight Squeeze, Tech Layoff, Single Income Family

**Key Design Principles:**
- Positive framing: "options remaining" not "countdown to doom"
- Show what's possible, not just what's scary
- Celebrate buffer time, don't amplify anxiety
- Privacy upfront: accordion visible before user enters any data
- UI duration note: warns about 26-week typical benefit period

**Sample Scenarios:**
1. **The Tight Squeeze** — Dual income, primary earner laid off, $15K savings
2. **The Tech Layoff** — Single professional in HCOL area, $42K savings
3. **The Single Income Family** — Stay-at-home parent household, $28K savings

**Success Criteria:**
- User understands their runway within 2 minutes ✅
- Provides at least one actionable insight ✅
- Does NOT trigger anxiety spiral ✅

---

### Tool 4: YNAB Insights Dashboard (Potential)
**Status:** 🔴 Validated Concept, On Hold  
**URL:** /tools/ynab-insights (potential)

**Purpose:** Fill gaps in YNAB's native reporting

**Background:** Claude analyzed 10,165 YNAB transactions spanning 6.5 years and identified reports YNAB doesn't offer. A demo (ynab-insights-demo) was built but received negative Reddit feedback due to data upload concerns.

**Potential Features:**
- Year-over-year spending comparisons
- Spending velocity projections (annualized costs)
- Subscription audit with true annual costs
- Seasonal pattern analysis across multiple years
- Category trend detection

**Why On Hold:**
- Requires users to upload sensitive data (YNAB exports contain detailed financial history)
- Got "roasted" on r/ClaudeAI for requesting data uploads
- May need different approach: browser extension or local-only processing

**Demo URL:** https://psrob9.github.io/ynab-insights-demo/

---

### Future Tools (Backlog)
- **Budget Psychology Assessment** — Personality-based budgeting style quiz (52 completions from previous version, low engagement)
- **Spending Trends Over Time** — Visualize patterns across months/years
- **"Hobby Graveyard" Detector** — Identify burst spending followed by abandonment (validated ADHD pain point)

---

## 4. Rob's Categorization Mental Model

A key insight from research: traditional spending categories (Food, Transportation, Entertainment) don't answer the important question. Rob's personal model uses two dimensions:

### Dimension 1: Must-Have vs. Discretionary
- **Must-Have:** Rent, utilities, insurance, groceries, debt payments
- **Discretionary:** Dining out, subscriptions, entertainment, hobbies

### Dimension 2: Monthly vs. Periodic
- **Monthly:** Regular bills, subscriptions
- **Periodic:** Annual insurance, quarterly expenses, one-time purchases

### The Four Buckets
| | Monthly | Periodic |
|---|---|---|
| **Must-Have** | Rent, utilities | Car insurance, property tax |
| **Discretionary** | Streaming, gym | Annual subscriptions, travel |

**Why This Matters:** This model answers "what could I cut?" rather than just "what did I spend on?" It directly informs the Emergency Fund Runway Calculator's scenario modeling.

---

## 5. Analysis Framework

### Behavioral Signatures

These patterns reveal how someone actually behaves with money, beyond simple category totals:

| Signature | What It Measures | Display Example |
|-----------|------------------|-----------------|
| **Decision Velocity** | When big purchases happen | "Your Execution Day: Thursday — 73% of purchases over $500 happen here" |
| **Loyalty Fingerprint** | Vendor concentration | "Loyalty Score: X% of spending flows through just Y vendors" |
| **Anticipation Index** | Pre-funded vs reactive spending | "Anticipation Score: X% — You're a planner, not a reactor" |
| **Convenience Threshold** | Where you pay for convenience | "Your convenience threshold: ~$X delivery fees" |
| **Relationship Spending** | Solo vs shared transactions | "X% of discretionary spending involves others" |
| **Recovery Pattern** | Behavior after large expenses | "After big expenses, you go quiet for X weeks" |

### Statistical Measures

Different measures reveal different truths:

| Measure | Calculation | What It Reveals |
|---------|-------------|-----------------|
| **Simple Average** | Sum ÷ Count | Overall burn rate (misleading if volatile) |
| **Median** | Middle value | Typical month (ignores extremes) |
| **Trimmed Mean (10%)** | Remove top/bottom 10%, then average | True baseline without outliers |
| **IQR Range** | 25th-75th percentile | "Normal operating range" |
| **Floor Month** | Lowest non-emergency month | Proven minimum capability |
| **Flexibility Ratio** | Maximum ÷ Minimum | How much spending can swing |

**Key Insight:** Average spending ≠ baseline spending. A user with $5,000 average monthly spend might have a $3,200 baseline when outliers are removed.

### Financial Order of Operations Integration

```
LEVEL 1: DEFENSE (Do First)
├── Employer match captured?
├── High-interest debt eliminated? (>6%)
├── 1-month emergency buffer exists?
└── Insurance gaps covered?

LEVEL 2: STABILITY (Build Next)
├── 3-6 month emergency fund?
├── Retirement contributions at target %?
├── Debt payoff plan for remaining balances?
└── Income protection (disability, life)?

LEVEL 3: GROWTH (Then Optimize)
├── Tax-advantaged accounts maximized?
├── Additional investments flowing?
├── Career/income growth investments?
└── Major goal funding?

LEVEL 4: FREEDOM (Long-term)
├── Financial independence runway calculated?
└── Lifestyle alignment achieved?
```

---

## 6. Technical Architecture

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

## 7. Design System

### Brand Identity
- **Name:** Rob's Money Lab
- **Favicon:** Beaker with dollar sign (teal on cream)
- **Tone:** Warm, approachable, non-judgmental
- **Visual:** Soft amber/peach backgrounds, teal accents

### Color Palette
- Background: Warm amber (#FEF3E2 or similar)
- Primary accent: Deep teal (#0D9488)
- Secondary: Slate gray (#475569)
- Accent: Warm amber (#F59E0B)
- Warning: Red (#DC2626)
- Baseline reference: Green (#22C55E) — dashed lines on charts
- Average reference: Orange (#F97316) — dashed lines on charts
- Text: Dark warm gray
- Cards: White with subtle shadows

### UX Principles
1. **Front-load value** — Show insights immediately, details on scroll
2. **Minimize friction** — No accounts, no logins, just upload
3. **Build trust** — Clear privacy messaging, sample data option
4. **Celebrate wins** — Positive framing, not shame-based
5. **Warm visuals over gamification** — No points/badges; use completion messages, "big number hero" displays, win callouts

### Anti-Slop Principles

**The Core Problem:** AI defaults to the statistical average of its training data — vague insights, generic visuals, hedge-y language, fabricated confidence. We actively prevent this.

**Voice & Tone Rules:**
| Don't Say | Say Instead |
|-----------|-------------|
| "You spend a lot on X" | "X averaged $Y/month, Z% above baseline" |
| "Consider reducing" | "Cut to $X to save $Y/month" |
| "This is interesting" | "This matters because [specific reason]" |
| "You might want to" | "Do this:" or "Don't do this:" |
| "Studies show" (unsourced) | [Cite specific source] or don't claim it |

**Visual Hard Prohibitions:**
- ❌ Purple or indigo gradients (universal AI slop signal)
- ❌ Three-boxes-with-icons layouts
- ❌ Generic hero sections with centered text and CTA
- ❌ Default Tailwind colors without intentional override
- ❌ Pie charts (use horizontal bars instead)

### Content Quality Checklist

Before finalizing ANY output, verify:

**Insights:**
- [ ] Contains at least one specific number
- [ ] Compares to baseline, average, or benchmark
- [ ] Includes "So What" (why it matters)
- [ ] Includes "Now What" (specific action)
- [ ] No fabricated statistics

**Visualizations:**
- [ ] Title states the insight, not just the metric
- [ ] Uses Rob's Money Lab color palette
- [ ] Includes reference lines where applicable

**Written Content:**
- [ ] Uses active voice
- [ ] No hedge phrases from the "avoid" list
- [ ] Specific examples included
- [ ] Actionable takeaway at the end

### What NOT to Do
- ❌ Traditional gamification (points, badges, streaks) — adds complexity and judgment
- ❌ Shame-based messaging about spending
- ❌ Overwhelming users with too many insights at once
- ❌ Requiring ongoing engagement for one-time value tools
- ❌ Vague language that could apply to anyone
- ❌ Hedging with "you might want to consider maybe"

---

## 8. Content Strategy

### Insight Framework: What? So What? Now What?
- **What:** The data/numbers (you spent $X on Y)
- **So What:** The context/meaning (that's 3x the average)
- **Now What:** The action (here's what you could do)

**Example (Runway Calculator):**
- **What:** "Your runway is 23 months"
- **So What:** "That's well above the average job search timeline of 3-6 months"
- **Now What:** "Consider which discretionary expenses to cut first if needed"

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
- Celebratory about wins

---

## 9. Go-to-Market Strategy

### Phase 1: Soft Launch ✅ Complete
- ✅ Build functional tools that demonstrate real value (3 tools live)
- ✅ Create sample data demos for skeptical users
- ✅ Reddit soft launch (r/vibecoding, r/ClaudeAI, r/ClaudeCode)
- ⏳ Pending: r/personalfinance (awaiting mod approval)
- ⏳ Pending: r/YNAB (awaiting mod approval)
- ✅ Social media (Instagram, Threads)
- ✅ Open source (GitHub public with MIT license)

### Phase 2: Iteration 🔄 In Progress
- Monitor feedback via Formspree and Reddit
- Fix issues and add requested features
- Build credibility through engagement
- Active validation via authentic Reddit engagement

### Phase 3: Growth (Future)
- SEO optimization (deferred until traction)
- Custom domain (deferred until traction)
- Content marketing (frameworks, not just tools)
- Community-contributed category database
- Email list building (Formspree capture active)

### Key Differentiators
- Privacy-first (no bank login required)
- No ongoing commitment (one-time analysis)
- Built by someone who actually uses YNAB daily (20+ year user)
- Transparent about methodology and limitations
- Designed for neurospicy brains, not neurotypical assumptions

---

## 10. Success Metrics

### User Engagement
- Tool completions (upload → view results)
- AI insights opt-in rate
- Sample data usage
- Feedback submissions (Formspree)
- Return visits
- Email signups

### Product Quality
- Categorization accuracy
- Recurring detection accuracy
- Time to insight
- Error rate

### Community (Soft Launch)
- Reddit engagement (comments, upvotes)
- Feedback quality and sentiment
- Bug reports vs. feature requests

### Launch Baseline (Day 1-2)
- Visitors: 54
- Visit duration: 5m 55s (excellent)
- Tool exploration rate: 21%
- Bounce rate: 56% (normal)

### Key Learning: Monetization Challenge
One-time value tools struggle with subscription models. Current strategy is building credibility through free tools rather than rushing to monetize. Previous projects (YBW, Budget Psychology) had traffic but no engagement — focusing on solving real problems first.

---

## 11. Deferred Decisions

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

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Privacy concerns block adoption | High | High | Sample data demo, clear messaging, no account required |
| Categorization accuracy too low | Medium | High | User-taught categories, iterative improvement |
| AI costs exceed value | Low | Medium | Opt-in only, summary-based prompts, rate limiting |
| Model deprecation breaks AI | Medium | Medium | Model as env variable, no redeploy needed |
| Reddit posts removed/ignored | Medium | Low | Multiple subs, mod pre-approval where needed |
| One-time value = no recurring revenue | High | Medium | Portfolio approach, email capture, potential premium features |
| Reddit skepticism of data uploads | High | Medium | Emphasize client-side processing, transparent about what's shared |

---

## 13. Appendix

### Competitive Landscape
- **YNAB:** $99-109/year, full budgeting system, requires commitment, strong ADHD community adoption
- **Monarch:** Bank connection via Plaid, $14.99/month
- **Rocket Money:** Subscription tracking focus, freemium
- **Copilot:** $95/year, mobile-focused
- **Tiller:** Spreadsheet-based, requires setup, $79/year
- **Actual Budget:** Open source, self-hosted option
- **Lunch Money:** Developer-friendly, requires bank connection

### Rob's Money Lab Positioning
- Lighter weight than YNAB
- More private than Monarch/Rocket Money (no bank connection)
- Free (for now) vs. paid competitors
- Simpler than Tiller
- For people who want insights without a system
- **Unique:** Proactive scenario planning (Runway Calculator) that competitors don't offer

### ADHD Tax Research
- Forgotten subscriptions, late fees, impulse purchases cost $1,000+/year
- Traditional budgeting fails because it requires ongoing maintenance
- Users need: immediate gratification, visual feedback, automation over manual tracking

### Validated Pain Points from Reddit Research
- Subscription creep (4+ streaming services)
- Non-monthly expenses blindsiding budgets
- Shame spirals preventing financial engagement
- "How long will savings last?" anxiety with no tools to answer
- YNAB's missing features: forecasting, YoY comparisons, seasonal analysis

### Links & Resources
- **Live Site:** https://robsmoneylab.lovable.app
- **YNAB Insights Demo:** https://psrob9.github.io/ynab-insights-demo/
- **GitHub:** https://github.com/psrob9/rob-s-money-lab
- **Formspree:** https://formspree.io/f/mzdzdgga

---

*Document Version: 3.1*
*Last Updated: January 2, 2026*
*Next Review: January 15, 2026*
