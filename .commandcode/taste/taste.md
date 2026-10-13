# Taste

- Prefers keeping the Sanity Studio as a standalone project (its own sibling folder/package that deploys independently), not embedded in or moved into the app. Confidence: 0.6
- Prefers the agent to stop and ask before proceeding when a prerequisite is unmet or the situation is ambiguous (e.g. skill missing, unsure which folder is the app), rather than guessing or improvising. Confidence: 0.6
- Prefers following established, named skills/best-practice references (e.g. the `sanity-best-practices` skill, installed via `npx skills add`) over ad-hoc setups. Confidence: 0.5
- When setup is involved, wants a clear breakdown of what remains and what only they can do themselves (account-level/token/manual steps) versus what the agent handles, rather than just being told the code is done. Confidence: 0.55
