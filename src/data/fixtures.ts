import type { FakePr } from '../types/loop'

const PASS_BAR = 80
const MAX_ATTEMPTS = 3

export const fixtures: FakePr[] = [
  {
    id: 'gated-article',
    number: 2104,
    title: 'Email link to open a gated article',
    platform: 'Web',
    teaching: true,
    summary:
      'A reader types an email on web to open a gated story. The login link should sign them in and put them back on that article, including if they tap it on their phone.',
    whatCanBreak:
      'They click while the token is still writing, the email already went out after the API died, they are already signed in and get the form again, or the link works on the wrong device.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'return-article',
        priority: 'P0',
        mustInclude:
          'A good click returns to the original article, logged in. An existing session is not prompted again',
        why: 'Landing on home, or asking again when they are already in, is not a plan',
        weight: 1,
      },
      {
        id: 'resend',
        priority: 'P0',
        mustInclude: 'Resend exists, and it is throttled',
        why: 'No resend traps them. Unlimited resend mints a pile of live links',
        weight: 1,
      },
      {
        id: 'pending',
        priority: 'P0',
        mustInclude: 'Click during the pending window waits or retries, not a raw error',
        why: 'The email can arrive before the token write finishes',
        weight: 2,
      },
      {
        id: 'dead-link',
        priority: 'P0',
        mustInclude:
          'If the API fails after the email went out, fail closed with try again',
        why: 'Empty inbox or a no-op click is often the token write. Confirm which side before blaming the button',
        weight: 2,
      },
      {
        id: 'latest-unused',
        priority: 'P0',
        mustInclude: 'Only the latest unused link works',
        why: 'Expired, already used, or an older mail in the thread must not open the article',
        weight: 1,
      },
      {
        id: 'web-to-phone',
        priority: 'P0',
        mustInclude:
          'Started on web, tapped the link on the phone: they land in the original article on the phone, or the copy says why not',
        why: 'The token cannot be bound to the laptop tab. Desktop waiting must not strand them',
        weight: 1,
      },
    ],
    scripts: [
      {
        cases: [
          {
            title:
              'Valid email, good click opens the original article logged in. Already signed in is not prompted again',
            covers: ['return-article'],
          },
          {
            title: 'User can resend if the email never arrives, with a short wait between sends',
            covers: ['resend'],
          },
          {
            title: 'Expired or already-used link does not open the article',
            covers: ['latest-unused'],
          },
          {
            title:
              'Email entered on web, link tapped on the phone, lands in the original article or explains why not',
            covers: ['web-to-phone'],
          },
        ],
      },
      {
        cases: [
          {
            title:
              'Valid email, good click opens the original article logged in. Already signed in is not prompted again',
            covers: ['return-article'],
          },
          {
            title: 'User can resend if the email never arrives, with a short wait between sends',
            covers: ['resend'],
          },
          {
            title: 'Click while the token is still writing waits or retries, not a raw error',
            covers: ['pending'],
          },
          {
            title: 'API failed after send shows try again, not a blank failure',
            covers: ['dead-link'],
          },
          {
            title: 'Expired or already-used link does not open the article',
            covers: ['latest-unused'],
          },
          {
            title:
              'Email entered on web, link tapped on the phone, lands in the original article or explains why not',
            covers: ['web-to-phone'],
          },
        ],
      },
    ],
  },
  {
    id: 'ios-deeplink',
    number: 2118,
    title: 'iOS: tap the login link in Mail and land in the article',
    platform: 'iOS',
    summary:
      'The same gated-article path on iPhone. Tapping the login link should open the app on the story, not a logged-out browser tab.',
    whatCanBreak:
      'Mail opens Safari with no session, or the app opens on home instead of the article they wanted.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'opens-app',
        priority: 'P0',
        mustInclude: 'Tap in Mail opens the app, not a logged-out browser tab',
        why: 'A browser tab with no session looks like the feature is broken',
        weight: 2,
        brief: {
          theory:
            'Mail opened a logged-out browser tab. That can be a missing app link (client) or a token that never landed (API).',
          confirm:
            'Check whether the token exists first. If it does and Safari still opens logged out, the app association is missing. If there is no token, fix the write before the client.',
          fixPath:
            'If the API is good: associate the login domain with the app and complete sign-in from the inbound URL. If the API is empty: commit the token before the email goes out.',
        },
      },
      {
        id: 'return-article',
        priority: 'P0',
        mustInclude: 'After sign-in, the original gated article is on screen',
        why: 'Home after a successful tap is still a failed read',
        weight: 2,
        brief: {
          theory:
            'Sign-in succeeds but the article id is dropped, so the app lands on home. Confirm it is not an empty session from the API.',
          confirm:
            'Start on a gated story, send the link, tap it. If a session exists and home still loads, the return path is a client miss. If there is no session, the backend never finished.',
          fixPath:
            'Store the article id with the pending token and route there after the session is created. Do not guess the client until the token read succeeds.',
        },
      },
      {
        id: 'expired',
        priority: 'P0',
        mustInclude: 'An expired or used link shows try again, not a blank screen',
        why: 'Stale mail is common. Blank is an incident screenshot',
        weight: 1,
      },
      {
        id: 'killed-app',
        priority: 'P1',
        mustInclude: 'Tap still works if the app was killed',
        why: 'Most taps happen later, with the app not in memory',
        weight: 1,
      },
      {
        id: 'pending-in-app',
        priority: 'P1',
        mustInclude: 'Early tap in the app waits, not a raw error',
        why: 'The same pending window exists on mobile',
        weight: 1,
      },
    ],
    scripts: [
      {
        cases: [
          {
            title: 'Expired link shows try again, not a blank screen',
            covers: ['expired'],
          },
        ],
      },
      {
        cases: [
          {
            title: 'Expired link shows try again, not a blank screen',
            covers: ['expired'],
          },
          {
            title: 'Tap still works if the app was killed',
            covers: ['killed-app'],
          },
        ],
      },
      {
        cases: [
          {
            title: 'Expired link shows try again, not a blank screen',
            covers: ['expired'],
          },
          {
            title: 'Tap still works if the app was killed',
            covers: ['killed-app'],
          },
          {
            title: 'Early tap in the app waits, not a raw error',
            covers: ['pending-in-app'],
          },
        ],
      },
    ],
  },
  {
    id: 'android-link',
    number: 2124,
    title: 'Android: tap the login link and open the gated story',
    platform: 'Android',
    summary:
      'Same inbox-to-article path on Android. The app should claim the link and open the story.',
    whatCanBreak:
      'The chooser opens a browser instead of the app, or the story never loads.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'opens-app',
        priority: 'P0',
        mustInclude: 'Tap opens the app on the matching article',
        why: 'If the chooser sends them to a browser, the session is on the wrong surface',
        weight: 2,
      },
      {
        id: 'pending',
        priority: 'P0',
        mustInclude: 'Early tap waits or retries, not a crash',
        why: 'Mail can be faster than the token write on Android too',
        weight: 2,
      },
      {
        id: 'expired',
        priority: 'P0',
        mustInclude: 'Expired or used link fails closed with try again',
        why: 'Stale notifications and old mail are the Friday-night path',
        weight: 1,
      },
      {
        id: 'no-chooser-trap',
        priority: 'P1',
        mustInclude: 'If a browser wins the chooser, the user is told how to open the app',
        why: 'A silent logged-out web page looks like an outage',
        weight: 1,
      },
    ],
    scripts: [
      {
        cases: [
          {
            title: 'Tap the login link and land in the app on the article',
            covers: ['opens-app'],
          },
          {
            title: 'Early tap waits or retries, not a crash',
            covers: ['pending'],
          },
          {
            title: 'Expired or used link shows try again',
            covers: ['expired'],
          },
          {
            title: 'If a browser opens instead, copy tells them to open the app',
            covers: ['no-chooser-trap'],
          },
        ],
      },
    ],
  },
  {
    id: 'private-window',
    number: 2130,
    title: 'Web: private window and blocked cookies still fail honestly',
    platform: 'Web',
    summary:
      'A magic link needs a place to store the session. Private windows and blocked cookies should say so, not fail silent.',
    whatCanBreak:
      'They click the link, the page reloads, and they are still gated with no explanation.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'honest-block',
        priority: 'P0',
        mustInclude: 'Blocked cookies or a private window explain why sign-in cannot finish',
        why: 'A silent return to the gate looks like the link is broken',
        weight: 2,
      },
      {
        id: 'same-window',
        priority: 'P0',
        mustInclude: 'Completing the link in the same window keeps the article context',
        why: 'A new tab that drops the story is a lost read',
        weight: 2,
      },
      {
        id: 'try-again',
        priority: 'P0',
        mustInclude: 'After an honest fail, the user can start over from the article',
        why: 'Dead-end copy without a next step still strands them',
        weight: 1,
      },
      {
        id: 'no-leak',
        priority: 'P1',
        mustInclude: 'Error copy does not reveal whether the email exists',
        why: 'Honest UX is not an account-enumeration shortcut',
        weight: 1,
      },
    ],
    scripts: [
      {
        cases: [
          {
            title: 'Completing the link in the same window keeps the article',
            covers: ['same-window'],
          },
          {
            title: 'Error copy does not reveal whether the email exists',
            covers: ['no-leak'],
          },
        ],
      },
      {
        cases: [
          {
            title: 'Blocked cookies or a private window explain why sign-in cannot finish',
            covers: ['honest-block'],
          },
          {
            title: 'Completing the link in the same window keeps the article',
            covers: ['same-window'],
          },
          {
            title: 'After an honest fail, the user can start over from the article',
            covers: ['try-again'],
          },
          {
            title: 'Error copy does not reveal whether the email exists',
            covers: ['no-leak'],
          },
        ],
      },
    ],
  },
  {
    id: 'comment-embed',
    number: 2136,
    title: 'In-article comments require profile login through a third-party embed',
    platform: 'Web',
    summary:
      'Comments sit in a vendor widget on the article. Posting requires the news-site profile. That is a different risk surface from the gated-article magic link.',
    whatCanBreak:
      'They are already on the site, tap comment, and get asked to sign in again. Or they sign in and still cannot post.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'embed-login',
        priority: 'P0',
        mustInclude: 'Posting a comment requires profile login through the embed',
        why: 'The widget is not the gated-article path. It still has to complete sign-in',
        weight: 2,
      },
      {
        id: 'no-double-prompt',
        priority: 'P0',
        mustInclude: 'Already signed in on the site is not asked to sign in again to comment',
        why: 'Two logins for one article is the friction that looks like an outage',
        weight: 2,
      },
      {
        id: 'return-composer',
        priority: 'P0',
        mustInclude: 'After login, they land on the comment box on that same article',
        why: 'Home, or the article without the composer, is still a failed comment',
        weight: 1,
      },
      {
        id: 'session-agrees',
        priority: 'P1',
        mustInclude: 'The embed and the site profile agree on the same session',
        why: 'Site says in, widget says out, is a handoff bug',
        weight: 1,
      },
    ],
    scripts: [
      {
        cases: [
          {
            title: 'Commenting requires profile login through the embed',
            covers: ['embed-login'],
          },
          {
            title: 'After login, the comment box on that article is ready',
            covers: ['return-composer'],
          },
        ],
      },
      {
        cases: [
          {
            title: 'Commenting requires profile login through the embed',
            covers: ['embed-login'],
          },
          {
            title: 'Already signed in on the site is not asked to sign in again to comment',
            covers: ['no-double-prompt'],
          },
          {
            title: 'After login, the comment box on that article is ready',
            covers: ['return-composer'],
          },
          {
            title: 'The embed and the site profile share the same session',
            covers: ['session-agrees'],
          },
        ],
      },
    ],
  },
]

export function getFixture(id: string): FakePr | undefined {
  return fixtures.find((pr) => pr.id === id)
}
