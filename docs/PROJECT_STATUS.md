# Rob's Money Lab - Project Status

**Last Updated:** January 2, 2026
**Sprint:** Soft Launch
**Overall Status:** 🟢 Live & Launched

---

## Quick Summary

Three tools live and fully functional. Published to robsmoneylab.lovable.app. Security hardened. Feedback system in place. Repo is now public with MIT license.

| Tool | Status | Notes |
|------|--------|-------|
| Money Snapshot | 🟢 Live | Full feature set, sample data demo |
| True Monthly Cost Calculator | 🟢 Live | Algorithm tuned, UX polished |
| Layoff Runway Calculator | 🟢 Live | 3 sample scenarios, editable UI benefits |
| Portfolio Site | 🟢 Live | Homepage, Tools, About (with photo), Feedback system |

**Live URL:** https://robsmoneylab.lovable.app
**GitHub:** https://github.com/psrob9/rob-s-money-lab (public, MIT license)

---

## Launch Analytics (Day 1-2)

| Metric | Value | Assessment |
|--------|-------|------------|
| **Visitors** | 54 | From ~5 channels in 1 day |
| **Pageviews** | 138 | |
| **Views/Visit** | 2.56 | People clicking around, not bouncing |
| **Visit Duration** | 5m 55s | **Excellent** — people actually engaging |
| **Bounce Rate** | 56% | Normal (industry average 40-60%) |

### Traffic Sources
| Source | Visitors | Insight |
|--------|----------|---------|
| **Direct** | 44 | Likely IG/Threads/Reddit app (strip referrers) |
| **Reddit** | 7 | Only credited from Reddit web |
| **Google** | 2 | Organic discovery on Day 1 |

### Page Funnel
| Page | Visitors | Conversion |
|------|----------|------------|
| `/` | 52 | Landing page |
| `/tools` | 11 | **21% clicked through** |
| `/tools/money-snapshot` | 11 | Core tool explored |
| `/tools/true-monthly-cost` | 8 | Secondary tool explored |
| `/about` | 7 | People wanted to know who you are |

**Key Insight:** 5m 55s duration + 21% tool exploration = Right audience at low volume, not wrong audience at high volume.

---

## Soft Launch Status

| Platform | Status | Reception | Notes |
|----------|--------|-----------|-------|
| r/vibecoding | ✅ Posted | Neutral/curious | Interest in TDD approach |
| r/ClaudeAI | ❌ Deleted | Hostile | Data privacy concerns, "make this open source or gtfo" |
| r/ClaudeCode | ✅ Posted | Technical patterns | |
| r/SideProject | ✅ Posted | | |
| r/personalfinance | ⏳ Pending | Awaiting mod approval | Messaged mods |
| r/YNAB | ⏳ Pending | Awaiting mod response | Previous post pending |
| Instagram | ✅ Posted | Carousel content | |
| Threads | ✅ Posted | | |

**Key Lesson:** r/ClaudeAI is NOT the target audience. They're builders/skeptics, not users looking for tools.

---

## What's Done

### Infrastructure ✅
- [x] Portfolio site created (Rob's Money Lab)
- [x] Warm amber/teal design system implemented
- [x] Navigation (Home, Tools, About, Feedback)
- [x] Responsive layout
- [x] Supabase Edge Functions for Claude API
- [x] Published to robsmoneylab.lovable.app
- [x] GitHub 2-way sync enabled
- [x] .env and .claude/ added to .gitignore
- [x] Favicon (beaker + dollar sign)
- [x] About page photo
- [x] Git alias `git sync` configured for safe pushing
- [x] GitHub repo made public with README and MIT LICENSE
- [x] GitHub links in footer and privacy sections

### Security ✅
- [x] Edge Function rate limiting (10 requests/IP/hour)
- [x] Edge Function input validation (50KB limit, type checking, XSS sanitization)
- [x] Claude model as environment variable (CLAUDE_MODEL in Supabase secrets)
- [x] Supabase anon key verified (no secret keys exposed)
- [x] GitGuardian alert resolved (false positive)

### Money Snapshot Tool ✅
- [x] Multi-file CSV upload
- [x] Flexible column detection (various bank formats)
- [x] Date/amount parsing (multiple formats)
- [x] Automatic category detection (~70 keywords)
- [x] Category breakdown visualization
- [x] Income vs. spending summary (The Big Picture)
- [x] Monthly averages
- [x] Expandable "Needs Review" transaction list (renamed from Uncategorized)
- [x] AI insights integration (opt-in)
- [x] Privacy consent flow
- [x] User-taught categories (localStorage)
- [x] Headline insight (above the fold)
- [x] Quick Wins section
- [x] Sample data demo (Jamie Chen persona)
- [x] Bank CSV export instructions accordion
- [x] Download Results (CSV export)
- [x] Summary section (between Big Picture and Where It Goes)
- [x] What's Next section (at bottom with action buttons)
- [x] Privacy section with expandable details + link to About

### True Monthly Cost Calculator ✅
- [x] CSV upload with format detection
- [x] Recurring transaction detection
- [x] Frequency identification
- [x] Monthly equivalent calculation
- [x] Confidence scoring (High/Medium/Low)
- [x] Include/exclude toggle per item
- [x] Expandable transaction details
- [x] AI insights integration (opt-in)
- [x] Hidden Costs insight section
- [x] Burst detection fix
- [x] Mortgage grouping fix
- [x] Sample data demo working
- [x] Bank CSV export instructions accordion
- [x] Download Results (CSV export)
- [x] What to Do With This section (above recurring costs table)
- [x] Consistent terminology (recurring costs)
- [x] Privacy section with expandable details
- [x] What's Next section with links to other tools

### Layoff Runway Calculator ✅
- [x] Input form: savings, expenses (simple or itemized), income sources
- [x] Unemployment benefits toggle with editable amount
- [x] UI duration note (~26 weeks warning)
- [x] Buffer options (none, 10%, 20%)
- [x] Scenario results (current lifestyle, bare bones, with UI)
- [x] Status indicators (survival/urgent/moderate/strong/positive)
- [x] What-if toggles (UI, cut discretionary, severance, gig income)
- [x] Detailed breakdown table
- [x] Action recommendations based on runway
- [x] 3 sample scenarios (Tight Squeeze, Tech Layoff, Single Income Family)
- [x] Privacy accordion (moved upfront for trust)
- [x] What's Next section with links to other tools
- [x] "Who This Is For" collapsible section

### Feedback System ✅
- [x] Formspree integration (https://formspree.io/f/mzdzdgga)
- [x] FeedbackModal component (reusable, contextual)
- [x] "Feedback" link in header navigation
- [x] "Share feedback" link in footer
- [x] "Got an Idea?" card on Tools page
- [x] Tool-specific feedback after analysis
- [x] Context tracking (page/tool source)

### Documentation ✅
- [x] PRD.md (v3.0 with Runway Calculator, Analysis Framework, Anti-Slop)
- [x] PROJECT_STATUS.md
- [x] LOVABLE_KNOWLEDGE.md
- [x] PERSONA_ANALYSIS.md (UX friction analysis by persona)
- [x] CLAUDE.md

### Market Research ✅
- [x] ADHD/neurospicy community pain points documented
- [x] Three user archetypes identified (System Builders, Overwhelmed Avoiders, Natural Frugals)
- [x] "ADHD tax" quantified ($1,000+/year from forgotten subscriptions, late fees)
- [x] Competitive landscape analyzed (Monarch, Copilot, Actual Budget, Lunch Money)
- [x] Reddit validation posts drafted and submitted
- [x] Emergency Fund Runway Calculator PRD section complete
- [x] UI Flow Document v2.0 created (12,000+ words with validated scenarios)

---

## What's In Progress

### Active Validation
| Activity | Status | Notes |
|----------|--------|-------|
| r/personalfinance post | 🟡 Pending mod approval | Using authentic personal situation |
| r/YNAB post | 🟡 Pending mod response | Asking about runway calculations |
| Response monitoring | 🔄 Ongoing | Watching for patterns in feedback |
| Formspree feedback | 🔄 Monitoring | Check for submissions |

### Layoff Runway Calculator
| Task | Status | Notes |
|------|--------|-------|
| PRD Complete | ✅ Done | Section added to main PRD |
| UI Flow Document | ✅ Done | v2.0 with validated scenarios |
| Build in Lovable | ✅ Done | Built by Lovable Jan 2, 2026 |
| Sample scenarios | ✅ Done | 3 scenarios (Tight Squeeze, Tech Layoff, Single Income Family) |
| Consistency polish | ✅ Done | Privacy moved up, editable UI benefits, duration note |
| Cross-linking | ✅ Done | Added to all What's Next sections |

---

## What's Not Started

### High Priority (Next Sprint)
- [ ] Email capture / newsletter signup
- [ ] Meta tags / Open Graph for social sharing
- [ ] Monitor Reddit feedback and iterate
- [ ] Respond to Reddit comments

### Medium Priority
- [ ] Show more "Needs Review" transactions
- [ ] Manual "add custom rule" without clicking transaction
- [ ] Cross-tool data sharing (use Money Snapshot data in True Monthly Cost)

### Low Priority / Future
- [ ] Community category database (crowdsourced)
- [ ] YNAB-specific export format
- [ ] Spending trends over time visualization
- [ ] Budget Psychology Assessment tool
- [ ] Custom domain (defer until traction)
- [ ] SEO optimization (defer until traction)
- [ ] "Hobby Graveyard" detector (validated ADHD pain point)

---

## Deferred Decisions

### SEO Optimization
**Status:** Deferred  
**Reasoning:** Focus on Reddit-driven traffic for soft launch. Lovable sites can be indexed, but organic search isn't priority until product-market fit is validated.  
**Trigger to revisit:** Consistent traffic, positive feedback, ready to invest in custom domain.

### Monetization
**Status:** Stay free  
**Reasoning:** Free removes friction and builds trust with skeptical users. No significant costs yet.  
**Trigger to revisit:**
- API costs exceed $50/month
- Users request features that require ongoing costs
- Someone offers to pay (listen to what they'd pay for)

**Options to consider later:**
- Freemium (basic free, advanced paid)
- Pay what you want / "buy me a coffee"
- YNAB affiliate links
- One-time purchase for premium features

### Custom Domain
**Status:** Deferred  
**Reasoning:** robsmoneylab.lovable.app is fine for beta. Wait for traction before investing.  
**Trigger to revisit:** Positive feedback, growing traffic, ready to build brand.

---

## Parking Lot (Maybe / Deferred Ideas)

### Floating TOC / Section Navigation

**Idea:** Add a left-hand floating menu that links to each section on tool results pages.

**Persona Analysis:**
| Persona | Reaction | Notes |
|---------|----------|-------|
| Overwhelmed Budgeter | Neutral to negative | Adds visual noise |
| Skeptical Redditor | Slightly positive | Shows transparency |
| YNAB Power User | Strong positive | Expects efficient navigation |

**Decision:** Skip for now (Jan 2, 2026)

**Reasoning:**
1. Pages aren't that long after section reordering
2. Adds complexity (code maintenance, mobile edge cases)
3. 2 of 3 personas are neutral or negative
4. Wait for real user feedback

**Alternative considered:** Simple "Jump to Results" button — lighter-weight option.

**Trigger to reconsider:** Multiple user feedback reports about difficulty finding sections.

### Dark Mode

**Idea:** Add dark mode toggle for users who prefer it, especially for late-night financial reviews.

**Decision:** Deferred (Jan 2, 2026)

**Reasoning:** Nice-to-have, not essential for launch. Wait for user feedback requesting it.

**Trigger to reconsider:** Multiple user requests, or if adding other visual customization features.

---

## Prompts Completed

### Initial Build Session (Dec 31, 2025)
| # | Title | What It Did |
|---|-------|-------------|
| 1-4 | Initial Setup | Portfolio site, navigation, design system |
| 5 | Money Snapshot Core | File upload, parsing, categorization |
| 6 | Multi-file Upload | Support for multiple CSV files |
| 7 | AI Insights | Claude integration via Supabase |
| 8 | Category Keywords | Expanded keyword list |
| 9 | User-Taught Categories | localStorage learning |
| 10 | True Monthly Cost | Second tool, recurring detection |
| 11 | Algorithm Improvements | Better detection logic |
| 12 | Combined Fixes | Homepage, privacy, algorithm, filters |
| 13 | Test CSV Files | Sample files for edge case testing |
| 14 | Page Restructure | Headline insight, Quick Wins, Summary |
| 15 | Sample Data Demo | Try without uploading |

### Launch Prep Session (Jan 1-2, 2026)
| # | Title | What It Did |
|---|-------|-------------|
| 16 | Formspree Fix | Fixed feedback form submission |
| 17 | Security: Rate Limiting | 10 req/IP/hour limit on Edge Functions |
| 18 | Security: Input Validation | Size limits, type checking, XSS protection |
| 19 | Claude Model Update | Fixed deprecated model (twice) |
| 20 | Feedback Modal System | Reusable modal, header/footer/tools integration |
| 21 | UX Improvements | Bank CSV help, Needs Review rename, Download Results, What's Next |
| 22 | Section Reordering | Moved Summary and What to Do sections |
| 23 | Privacy Section Enhancement | Expandable details, link to About page |
| 24 | Model as Env Variable | CLAUDE_MODEL in Supabase secrets |
| 25 | Terminology Consistency | Fixed "above/below" and duplicate sections |
| 26 | Favicon | Beaker + dollar sign generated |
| 27 | About Page Photo | Added personal photo |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Client-side CSV parsing | Privacy — no transaction data hits server |
| Supabase Edge Function for AI | Security — hides Claude API key |
| Claude model as env variable | Can update model without redeploying code |
| localStorage for user preferences | No account needed, data stays local |
| Opt-in AI insights | Explicit consent, clear about what's shared |
| Rate limiting on Edge Functions | Prevent API abuse and cost overruns |
| Input validation on Edge Functions | Security hardening |
| Formspree for feedback | Simple, no backend needed |
| Contextual feedback modal | Single component, reusable everywhere |

---

## Claude Code Skills & Workflows

### Validated Techniques
| Technique | Why It Works |
|-----------|--------------|
| **Spec-Driven Development** | "Slows down" Claude to think 4x on requirements; enables granular review |
| **Git Worktrees** | Safe parallel development and A/B experiments without risking main branch |
| **Playwright E2E Testing** | Validates webapp behavior automatically |
| **Pre-commit Linting Hooks** | Catches quality issues before commits |
| **Tab Completion / Prompt Prediction** | Claude Code maintains context via CLAUDE.md and skill files |

### Skills Stack

**Tier 1: Install Immediately**
```bash
# Superpowers (complete dev workflow by obra)
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**Tier 2: Custom Skills (Created/To Create)**
```
~/.claude/skills/
├── ynab-insights/SKILL.md      # Data analysis rules ✅
├── anti-slop/SKILL.md          # Voice + presentation ✅
├── ship-not-perfect/SKILL.md   # Customer acquisition focus ✅
└── reddit-content/SKILL.md     # Content framework (to create)
```

**Tier 3: Project-Local Skills**
```
~/robs-money-lab/.claude/skills/
├── demo-data/SKILL.md          # Synthetic dataset generation
└── deployment/SKILL.md         # GitHub Pages workflow
```

### Superpowers Workflow System
1. **brainstorming** — Asks clarifying questions before coding
2. **using-git-worktrees** — Creates isolated worktree for safe changes
3. **writing-plans** — Detailed plan with exact file paths, complete code
4. **test-driven-development** — RED-GREEN-REFACTOR workflow
5. **requesting-code-review** — Reviews each task before moving on
6. **finishing-a-development-branch** — Handles merge/PR/keep/discard

### Key Resources
- **Superpowers**: https://github.com/obra/superpowers
- **Awesome Claude Skills**: https://github.com/ComposioHQ/awesome-claude-skills
- **Skills Directory**: https://www.skillsdirectory.org

---

## Idea Mining Resources

### Subreddits for Problem Discovery

**"I wish this existed" communities:**
- r/SomebodyMakeThis (81K members)
- r/AppIdeas
- r/Lightbulb

**Where pain points surface organically:**
- r/entrepreneur, r/startups — Complaint threads
- r/SaaS — Feature requests, "why doesn't X do Y"
- r/YNAB — Product-adjacent frustrations
- r/QuantifiedSelf — "I have data, what does it mean?"
- r/Biohackers — Health metrics correlation

### Search Queries That Surface Gold
- `"I wish there was"`
- `"alternative to [tool]"`
- `"biggest problem with"`
- `"I'd pay for"`
- `"why is [tool] so bad at"`

### Monitoring Tools
| Tool | Cost | Best For |
|------|------|----------|
| **F5Bot** | Free | Basic keyword alerts (Reddit, HN, Lobsters) |
| **GummySearch** | $29-49/mo | Deep Reddit research |
| **Syften** | Paid | Multi-platform monitoring |

### Privacy Solution: Synthetic Data
Created "Jamie Chen" — a fictional persona with realistic spending patterns for demos:
- 32-year-old software developer in Austin
- Realistic behavioral signatures
- Demo: https://psrob9.github.io/ynab-insights-demo/

---

## Git Workflow

**Safe push command:** `git sync` (alias for `git pull --rebase && git push`)

**Setup:**
```bash
git config --global alias.sync "!git pull --rebase && git push"
```

**When working in both Lovable and Claude Code:**
1. Let Lovable finish and push first
2. Run `git pull` in Claude Code before editing
3. Use `git sync` instead of `git push`

---

## Key Learnings (This Sprint)

### What Worked
- Authentic Reddit engagement using real personal situation
- Privacy-first architecture resonates with skeptical users
- Two-tool portfolio approach provides multiple entry points
- Formspree as quick email capture solution
- Hybrid workflow (Lovable for UI, Claude Code for logic)
- Sample data demos for trust building

### What Didn't Work
- r/ClaudeAI post deleted/hostile reception
- ynab-insights-demo got "roasted" for asking users to upload data
- Previous projects (YBW, Budget Psychology) had traffic but no engagement

### Key Insights
1. **Sample data demos are essential** — Skeptical Redditors won't upload real data first
2. **One-time value ≠ recurring revenue** — Portfolio approach better than subscription
3. **ADHD tax is quantifiable** — $1,000+/year gives concrete value proposition
4. **"What could I cut?" > "What did I spend?"** — Rob's 2D model is more actionable
5. **Proactive > Retrospective** — Runway Calculator fills gap competitors don't address
6. **5m 55s duration = right audience** — Quality over quantity

---

## Metrics to Track

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Site visitors | 54 | 100/week | Day 1 baseline |
| Visit duration | 5m 55s | >3 min | Day 1 baseline (excellent) |
| Tool exploration rate | 21% | >20% | Day 1 baseline (good) |
| Reddit post engagement | Unknown | 10+ comments | Validation indicator |
| Email signups | 0 | 50 | Via Formspree |
| Feedback submissions | 0 | 5+ | Via Formspree |

---

## Links & Resources

- **Live Site:** https://robsmoneylab.lovable.app
- **YNAB Insights Demo:** https://psrob9.github.io/ynab-insights-demo/
- **GitHub:** https://github.com/psrob9/rob-s-money-lab
- **Formspree:** https://formspree.io/f/mzdzdgga
- **Supabase Dashboard:** [your project URL]

---

## Next Session Priorities

1. **Monitor Reddit** — Check engagement, respond to comments
2. **Check Formspree** — Review any feedback submissions
3. **Follow up on mods** — r/personalfinance, r/YNAB responses
4. **Announce Runway Calculator** — Share new tool on social/Reddit
5. **Email capture** — Add newsletter signup component
6. **Check Google Search Console** — Organic queries bringing traffic

---

## Questions / Decisions Pending

1. ~~**Build order** — Runway Calculator next, or iterate on existing tools first?~~ ✅ Runway Calculator built
2. **Analytics** — Add Plausible/Simple Analytics for privacy-friendly tracking?
3. **Custom domain** — Ready to connect robsmoneylab.com?
4. **YNAB Insights approach** — Browser extension vs. current upload model?
5. **Monetization** — When/how to introduce paid features?
6. ~~**Open source timing** — After validation, or now for credibility?~~ ✅ Now public with MIT license

---

*Status updated: January 2, 2026*
