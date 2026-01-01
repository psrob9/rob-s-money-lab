# Rob's Money Lab - Claude Code Context

## Project Overview
Privacy-first personal finance tools. React + TypeScript + Vite.

## Key Directories
- src/components/ - React components
- src/pages/ - Page components (MoneySnapshot, TrueMonthlyCost)
- src/utils/ - Utilities (sampleData, categoryLearning)
- supabase/functions/ - Edge Functions (generate-insights)
- docs/ - PRD, status, knowledge docs

## Workflow
- This repo has 2-way sync with Lovable
- After changes: git add . && git commit -m "message" && git push
- Lovable auto-pulls within 30 seconds

## Before Making Changes
- Read docs/robs-money-lab-project-status.md for current state
- Check docs/lovable-project-knowledge.md for patterns

## After Completing Features
- Update docs/robs-money-lab-project-status.md
- Move items from "In Progress" to "Done"
- Note any new issues discovered

## Key Integrations
- Supabase Edge Function: generate-insights (Claude API)
- Formspree: https://formspree.io/f/mzdzdgga (feedback form)
- AI Model: claude-sonnet-4-20250514