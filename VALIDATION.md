# Launch Desk validation checklist

## Agent behavior

- [ ] The response begins with a readiness audit that separates facts supplied from missing or unclear launch details.
- [ ] A plan always opens with P0/P1/P2 work and dates relative to the provided launch date.
- [ ] Risk register names likelihood, impact, mitigation, and an owner.
- [ ] Owner checklist includes Engineering, Product, Marketing, and Support where applicable.
- [ ] Launch copy contains release notes, email, and social variants tailored to the audience.
- [ ] Missing launch date, metric, or approval information becomes focused follow-up questions, not invented facts.

## Tool outputs

- [ ] `extract_launch_tasks` runs first and produces P0 work.
- [ ] Readiness rubric flags absent success metrics, rollback/monitoring, support material, and security/privacy status.
- [ ] Owner checklist returns explicit action verbs for each owner.
- [ ] Copy drafts use the brief and audience rather than generic filler.

## Frontend flow

- [ ] A user can enter all five intake fields and submit.
- [ ] Button enters a loading state during generation.
- [ ] Activity log shows status plus tool start/completion updates.
- [ ] Model response progressively appears in the Plan room.
- [ ] Mobile layout stacks intake above output without horizontal scrolling.

## End-to-end API stream

- [ ] `.env` contains a valid `GROQ_API_KEY` available to the backend process.
- [ ] With `npm run dev:server` running, `npm run verify:stream` exits zero.
- [ ] The verifier prints at least one `tool` event and one `delta` event.
- [ ] A failed key, network issue, or model access failure returns a readable API stream error.
