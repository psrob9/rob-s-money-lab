# Rob's Money Lab

Privacy-first personal finance tools for people who find traditional budgeting overwhelming.

## Tools

- **Money Snapshot** — Quick spending categorization from bank CSV exports
- **True Monthly Cost Calculator** — Find hidden recurring costs
- **Layoff Runway Calculator** — See how long your savings will last

## Privacy

All tools process your data locally in your browser. Nothing is sent to any server unless you explicitly opt-in to AI insights (which only receives aggregated summaries, never your actual transactions).

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase Edge Functions (for optional AI insights)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Build
npm run build
```

## Live Site

https://robsmoneylab.lovable.app

## License

MIT
