# Persona Analysis: Money Snapshot & True Monthly Cost

Analysis of both tools from the perspective of three target personas.

---

## Money Snapshot

### Overwhelmed Budgeter

**What would delight them:**
- "Try with sample data" option - low-risk way to see what they'd get before committing personal data
- Clear privacy messaging ("Privacy first: Your files are processed entirely in your browser")
- Simple value proposition checklist upfront: "Your top spending categories, Hidden patterns, Quick wins"
- The headline insight card gives them ONE thing to focus on, not 20 metrics
- "Quick Wins" section provides actionable next steps without overwhelming

**What might confuse them:**
- "What format do I need?" is collapsed by default - they may panic before finding it
- The category teaching feature (clicking uncategorized transactions) has subtle discoverability - just italic text saying "Click any transaction to teach me"
- No guidance on WHERE to get a CSV from their bank (copy says "Upload bank statement CSVs" but no "How do I export from Chase/BofA?" help)

**What might make them leave:**
- If their CSV doesn't parse correctly, they see a generic "Couldn't read this file" with no troubleshooting
- Seeing a large "Uncategorized" percentage could feel like failure rather than normal
- AI insights require explicit consent click - might feel like a barrier when they're already anxious

---

### Skeptical Redditor

**What would delight them:**
- Privacy-first architecture is legitimate (Papa.parse runs client-side)
- AI insights clearly disclose what's shared: "Only category totals and percentages... Your individual transactions are never sent"
- Sample data lets them verify the tool works before trusting it with their data
- Learned categories are stored in localStorage, not sent anywhere

**What might confuse them:**
- The Supabase edge function call for AI insights - they'd want to verify what's actually sent
- No visible network requests tab explanation or way to audit data flow

**What might make them leave:**
- If they inspect network traffic and see the AI endpoint, they might distrust even the summary data being sent
- No export/download option for their analysis - "You analyzed MY data, let me keep the results"
- The AI insights feature could feel like a dark pattern to collect data, despite clear disclosure

---

### YNAB Power User

**What would delight them:**
- Category teaching feature with pattern extraction - they can train it like they train YNAB
- Multi-file upload supports their multi-account setup
- Monthly averages shown when data spans multiple months
- Custom rules management dialog

**What might confuse them:**
- Categories are pre-defined - can't add their own category names like "Subscriptions I Actually Use"
- No way to export categorized data back to import into YNAB
- The categorization logic is opaque - they can't see WHY something was categorized a certain way (only fix via teaching)

**What might make them leave:**
- No integration with YNAB API - this is a parallel tool, not a complement
- Can't compare against their YNAB categories/budgets
- "Transfers & Payments" auto-excluded from spending - power users might want control over this

---

## True Monthly Cost

### Overwhelmed Budgeter

**What would delight them:**
- The big headline number: "Your True Monthly Recurring Costs" with massive `$X/mo` display
- "Hidden Costs You Might Forget" section explicitly calls out annual/quarterly subs they're missing
- Sample data option to preview without commitment
- Shared data banner if coming from Money Snapshot - "Use the X transactions you already uploaded?" reduces friction

**What might confuse them:**
- The confidence badges (High/Medium/Low) might feel like judgment - "Am I bad at money if I have 'Low' confidence items?"
- Frequency dropdown with 7 options (weekly, bi-weekly, monthly, quarterly, annual, irregular, one-time) could overwhelm
- Debug info toggle might accidentally get expanded and terrify them with technical jargon

**What might make them leave:**
- If detection misses obvious subscriptions (Netflix, Spotify), they'll lose trust
- Table with 5 columns + expandable rows + filters feels like a spreadsheet, not a friendly tool
- No clear "What do I DO with this information?" CTA after seeing results

---

### Skeptical Redditor

**What would delight them:**
- Debug info section is transparent about the algorithm: "Analyzed X transactions, Found Y merchants, Filtered Z because..."
- Detection reasons exposed: "Too few occurrences", "Clustered buying", "High variance" - shows real logic
- Same privacy model as Money Snapshot - processing in browser
- Confidence levels are honest about uncertainty

**What might confuse them:**
- What IS the detection algorithm? (It's in recurringDetection.ts but not visible/explained in UI)
- The AI insights still require sending data to Supabase function

**What might make them leave:**
- Can't verify the recurring detection algorithm is actually correct without digging into source
- "Your individual transactions are never sent" but the AI call sends merchant names + amounts - is merchant name PII?
- No data retention policy visible

---

### YNAB Power User

**What would delight them:**
- Editable frequency per item - can correct algorithm mistakes
- Include/exclude toggle per item
- Expandable rows show underlying transactions
- Monthly equivalent calculation shown alongside actual amounts
- Filtering by frequency and confidence level

**What might confuse them:**
- Why is "irregular" a frequency? YNAB thinks in terms of needed-by-date, not calendar frequency
- Can't set their own target amounts for "True Funding" like YNAB does
- "One-time" in frequency list - that's not recurring by definition?

**What might make them leave:**
- This doesn't integrate with YNAB's scheduled transactions or targets
- No way to export this list as YNAB-compatible scheduled transactions
- Recurring detection algorithm might conflict with their manual YNAB data - creates cognitive dissonance
- "True Monthly Cost" != "True Expenses" YNAB concept - semantic confusion

---

## Summary Table

| Aspect | Money Snapshot | True Monthly Cost |
|--------|---------------|-------------------|
| **Overwhelmed Budgeter - Delight** | Sample data, clear headline, Quick Wins | Big number focus, Hidden costs callout |
| **Overwhelmed Budgeter - Confusion** | CSV format help hidden, subtle teaching UX | Confidence badges, 7 frequency options |
| **Overwhelmed Budgeter - Leave risk** | Parse failures, large Uncategorized % | Table complexity, no clear next action |
| **Skeptical Redditor - Delight** | Legitimate client-side processing | Transparent debug info, honest confidence |
| **Skeptical Redditor - Confusion** | AI endpoint audit unclear | Algorithm opacity |
| **Skeptical Redditor - Leave risk** | No export, AI feels like data grab | Merchant names sent to AI |
| **YNAB Power User - Delight** | Category teaching, multi-file | Editable frequencies, toggle exclude |
| **YNAB Power User - Confusion** | Fixed category names, opaque logic | "Irregular" semantics, no targets |
| **YNAB Power User - Leave risk** | No YNAB integration/export | Conflicts with existing YNAB data |

---

## Key Opportunities

### Quick Wins (Low effort, high impact)
1. Add bank-specific CSV export instructions (link or expandable section)
2. Reframe "Uncategorized" as "Needs Review" with encouraging copy
3. Add "Download Results" button for skeptical users
4. Add clear next-action CTA after True Monthly Cost results

### Medium-term Improvements
1. Explain confidence levels in friendlier terms ("We're pretty sure" vs "High")
2. Hide debug info behind a "Developer Mode" toggle, not visible by default
3. Add data flow diagram or "What we send" breakdown for AI insights

### Longer-term Considerations
1. YNAB API integration for power users
2. Custom category creation
3. Export to common formats (CSV, YNAB-compatible)
