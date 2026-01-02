# Rob's Money Lab - Claude Code Context

## Project Overview
Privacy-first personal finance tools for the ADHD/neurospicy community. React + TypeScript + Vite + Tailwind + shadcn/ui.

**Live URL:** https://robsmoneylab.lovable.app

## Key Directories
```
src/
├── components/     # React components
├── pages/          # Page components (MoneySnapshot, TrueMonthlyCost)
├── utils/          # Utilities (sampleData, categoryLearning)
├── hooks/          # Custom React hooks
supabase/
└── functions/      # Edge Functions (generate-insights)
docs/               # PRD, status, knowledge docs
```

## Skills (Read Before Working)

**Global skills** (in `~/.claude/skills/`):
- `anti-slop/SKILL.md` — Voice, tone, visual design rules. ALWAYS apply.
- `ship-not-perfect/SKILL.md` — Prevent over-engineering. Check before starting features.

**Apply these skills to ALL work on this project.**

## Workflow

### This repo has 2-way sync with Lovable
- Lovable → GitHub: Auto-pushes on save
- GitHub → Lovable: Auto-pulls within 30 seconds

### Safe Push Workflow
```bash
git sync   # alias for: git pull --rebase && git push
```

Never use `git push` directly. Always use `git sync`.

### When to Use Which Tool
| Task | Use |
|------|-----|
| UI/visual changes | Lovable |
| Logic/algorithms | Claude Code |
| Bug fixes | Claude Code |
| New features | Start in Lovable, refine in Claude Code |

## Before Making Changes

1. Read `docs/PROJECT_STATUS.md` for current state
2. Check `docs/LOVABLE_KNOWLEDGE.md` for patterns
3. Review the relevant skill files
4. Ask: "Does this help get users?" (ship-not-perfect)

## After Completing Features

1. Update `docs/PROJECT_STATUS.md`
2. Move items from "In Progress" to "Done"
3. Note any new issues discovered
4. Run `git sync` to push

## Key Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Supabase Edge Function | Claude API (generate-insights) | CLAUDE_MODEL env var |
| Formspree | Feedback forms | https://formspree.io/f/mzdzdgga |
| GitHub | Version control | 2-way sync with Lovable |

## AI Model
Current: `claude-sonnet-4-20250514` (set via CLAUDE_MODEL env var in Supabase)

## Anti-Slop Quick Reference

**Never say:**
- "You spend a lot on X"
- "Consider reducing"
- "You might want to"
- "Studies show" (unsourced)

**Always do:**
- Use specific numbers: "$487/month"
- State actions directly: "Cut to $300"
- Show your math: "Average ($487) ÷ Baseline ($162) = 3:1"

**Never use:**
- Purple gradients
- Three-boxes-with-icons layouts
- Pie charts (use horizontal bars)

## Ship-Not-Perfect Quick Reference

Before ANY feature, ask:
1. Does this help get beta testers?
2. Can I articulate the user benefit in one sentence?
3. Is this "must have" or "nice to have"?

Time box to 2-4 hours. Ship at the limit. Improve only if users complain.

## Target Personas (Remember Who You're Building For)

1. **Overwhelmed Budgeter** — Needs quick wins, hates complexity, shame-sensitive
2. **YNAB Power User** — Wants depth, comfortable with data, system builder
3. **Skeptical Redditor** — Privacy-first, won't upload until trust is earned

**Not building for:** Natural frugals who don't need financial tools.

## Current Priorities

1. Monitor Reddit feedback
2. Build Emergency Fund Runway Calculator (PRD complete)
3. Iterate based on user feedback
4. Don't over-engineer
