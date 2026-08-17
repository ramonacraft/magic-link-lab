# Walk one golden PR on paper

This is the Magic Link Lab teaching story. Read this once, then click **Run attempt 1** on PR #2104. After you see 50%, click **Retry with critic**. The dashboard should match these numbers. One click is one attempt.

## Words we will use

- **Magic link** — one-time email login link. No password.
- **Pending** — the few seconds the API is still writing the token while the email is already on its way.
- **Fake PR** — a made-up code change, not a real GitHub pull request.
- **Golden** — the plan you would sign. The scorer uses this. The drafter does not see it on attempt 1.
- **Score** — how much of the golden the draft covered, as a percent.
- **Critic** — the list of golden items still missing after a score.
- **Escalate** — stop guessing and hand the plan to a human after 3 attempts.

## The PR

**PR #2104 — Email link to open a gated article** (Web)

What changed: a reader types an email to open a gated story. The login link should sign them in and put them back on that article.

What can break at 2am: they click while the token is still writing, or the email already went out after the API died, and they are stranded.

## The golden (what a good plan must include)

A plan you would sign must cover at least:

| Must include | Why |
|--------------|-----|
| A good click returns to the **original article**, logged in. Already signed in is not prompted again | Home, or a second login when they are already in, is not a plan |
| **Resend** exists, and it is throttled | No resend traps them. Unlimited resend mints a pile of live links |
| Click during the **pending** window waits or retries, not a raw error | The email can arrive before the token write finishes |
| If the **API fails after the email went out**, fail closed with try again | Empty inbox or a no-op click is often the token write. Confirm which side |
| Only the **latest unused** link works | Expired, already used, or an older mail in the thread must not open the article |
| Started on **web**, tapped the link on the **phone** | The token cannot be bound to the laptop tab |

Pass bar: **80%**. Max attempts: **3**.

P0s are worth more than P1s, so the board uses weighted points (8 total). Pending and dead-link are worth 2 each.

## Attempt 1 — draft from the PR only

The drafter has not seen the golden. It writes the obvious cases:

1. Valid email, good click opens the original article logged in. Already signed in is not prompted again
2. User can resend if the email never arrives, with a short wait between sends
3. Expired or already-used link does not open the article
4. Email entered on web, link tapped on the phone, lands in the original article or explains why not

**Score: 50%** (4 of 8 weighted points). Missed **pending** and **dead-link**. Under 80%, so retry.

This is the 50% screenshot.

## Attempt 2 — retry with critic feedback

The critic says: missing P0, click during pending; missing P0, API failed after the email went out.

The drafter adds those two cases. Score is now **100%** (8 of 8). That is over 80%, so **Pass**.

This is the Pass screenshot: pending and dead-link both covered.

## Escalate (iOS PR, not this one)

If a plan is still under the bar after 3 attempts, stop. The iOS Mail-tap PR is that story. You should see **Needs human** and a short brief:

- **Theory** — a starting guess, not a root cause. Majority of these misses are the API. Not always.
- **Confirm fast** — one check that proves which side: token exists (client) or token never landed (backend)
- **Fix path** — what to change if the guess holds

Do not keep retrying. That is the point of the stop rule.
