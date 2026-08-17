import type { FakePr } from '../types/loop'

const PASS_BAR = 80
const MAX_ATTEMPTS = 3

export const fixtures: FakePr[] = [
  {
    id: 'gated-article',
    number: 2104,
    title: 'Email link to open a gated article on web, iOS, and Android',
    platform: 'Web + mobile',
    teaching: true,
    summary:
      'One profile, three surfaces, no shared cookie. Ungating on web does not sign them in on iOS or Android. Each surface needs its own email link. A good click on that surface should put them back on that article, including when they type the email on a laptop and tap Mail on the phone.',
    whatCanBreak:
      'The link works on web and dies in the app, they expect the laptop login to unlock the phone, they click while the token is still writing, or the API dies after the email went out.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'return-article',
        priority: 'P0',
        mustInclude:
          'A good click on web, on iOS, and on Android each returns to the original article, logged in on that surface. Same-surface session is not prompted again. Ungating on web does not sign them in on iOS or Android',
        why: 'Each surface has its own session. Home after a good click on that surface is not a plan. A shared cookie across devices is not how this flow works',
        weight: 1,
      },
      {
        id: 'resend',
        priority: 'P0',
        mustInclude: 'Resend exists on web and in the apps, and it is throttled',
        why: 'No resend traps them. Unlimited resend mints a pile of live links',
        weight: 1,
      },
      {
        id: 'pending',
        priority: 'P0',
        mustInclude:
          'Click during the pending window waits or retries, not a raw error, on web and in the apps',
        why: 'Mail on the phone can arrive before the token write finishes, same as a desktop click',
        weight: 2,
      },
      {
        id: 'dead-link',
        priority: 'P0',
        mustInclude:
          'If the API fails after the email went out, fail closed with try again on web and in the apps',
        why: 'Empty inbox or a no-op tap is often the token write. Confirm which side before blaming the web page or the app',
        weight: 2,
      },
      {
        id: 'latest-unused',
        priority: 'P0',
        mustInclude: 'Only the latest unused link works on web and in the apps',
        why: 'Expired, already used, or an older mail in the thread must not open the article',
        weight: 1,
      },
      {
        id: 'web-to-phone',
        priority: 'P0',
        mustInclude:
          'Started on web, tapped the link on iPhone or Android: that tap is the phone sign-in. The app opens the original article, or the copy says why not. The laptop cookie does not travel',
        why: 'The click happens on one device. A logged-out mobile browser after that tap looks like an outage. A later open of the app still needs its own login if they never completed it there',
        weight: 1,
      },
    ],
    scripts: [
      {
        cases: [
          {
            title:
              'Good click on web, on iOS, and on Android each opens the original article on that surface. Same-surface session is not prompted again. Web login does not ungate iOS or Android',
            covers: ['return-article'],
          },
          {
            title:
              'User can resend if the email never arrives on web or in the apps, with a short wait between sends',
            covers: ['resend'],
          },
          {
            title: 'Expired or already-used link does not open the article on web or in the apps',
            covers: ['latest-unused'],
          },
          {
            title:
              'Email entered on web, link tapped on iPhone or Android: that tap signs in the phone and opens the original article, or copy explains why not. Laptop cookie does not travel',
            covers: ['web-to-phone'],
          },
        ],
      },
      {
        cases: [
          {
            title:
              'Good click on web, on iOS, and on Android each opens the original article on that surface. Same-surface session is not prompted again. Web login does not ungate iOS or Android',
            covers: ['return-article'],
          },
          {
            title:
              'User can resend if the email never arrives on web or in the apps, with a short wait between sends',
            covers: ['resend'],
          },
          {
            title:
              'Click while the token is still writing waits or retries on web and in the apps, not a raw error',
            covers: ['pending'],
          },
          {
            title:
              'API failed after send shows try again on web and in the apps, not a blank failure',
            covers: ['dead-link'],
          },
          {
            title: 'Expired or already-used link does not open the article on web or in the apps',
            covers: ['latest-unused'],
          },
          {
            title:
              'Email entered on web, link tapped on iPhone or Android: that tap signs in the phone and opens the original article, or copy explains why not. Laptop cookie does not travel',
            covers: ['web-to-phone'],
          },
        ],
      },
    ],
  },
  {
    id: 'ios-deeplink',
    number: 2118,
    title: 'iOS: start on web or in the app, tap Mail, land on the article',
    platform: 'iOS',
    summary:
      'Same gated-article path. They may have typed the email on web, then tapped the link on iPhone. That tap is the iOS sign-in. The app should open the story, not a logged-out Safari tab. A web login from earlier does not count on the phone.',
    whatCanBreak:
      'Mail opens Safari with no session, the app opens on home after a good tap, or they assume ungating on web already unlocked the app.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'opens-app',
        priority: 'P0',
        mustInclude:
          'Tap in Mail opens the iOS app on the original article, including when the email was entered on web',
        why: 'A logged-out Safari tab after a web start is the Friday-night screenshot',
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
        mustInclude:
          'After the iOS tap completes sign-in, the original gated article is on screen. A prior web login does not skip the email step on iOS',
        why: 'Home after a successful tap is a failed read. Gated on iOS after ungating on web is expected',
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
            title:
              'Expired link after a web start shows try again in the iOS app, not a blank screen',
            covers: ['expired'],
          },
        ],
      },
      {
        cases: [
          {
            title:
              'Expired link after a web start shows try again in the iOS app, not a blank screen',
            covers: ['expired'],
          },
          {
            title: 'Tap still works if the app was killed after they started on web',
            covers: ['killed-app'],
          },
        ],
      },
      {
        cases: [
          {
            title:
              'Expired link after a web start shows try again in the iOS app, not a blank screen',
            covers: ['expired'],
          },
          {
            title: 'Tap still works if the app was killed after they started on web',
            covers: ['killed-app'],
          },
          {
            title: 'Early tap in the app waits, not a raw error, including after a web start',
            covers: ['pending-in-app'],
          },
        ],
      },
    ],
  },
  {
    id: 'android-link',
    number: 2124,
    title: 'Android: start on web or in the app, tap the link, open the story',
    platform: 'Android',
    summary:
      'Same inbox-to-article path. They may have typed the email on web, then tapped the link on Android. That tap is the Android sign-in. The app should claim the link and open the story. A web login from earlier does not count on the phone.',
    whatCanBreak:
      'The chooser opens a browser instead of the app, the story never loads after a good tap, or they assume ungating on web already unlocked the app.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'opens-app',
        priority: 'P0',
        mustInclude:
          'Tap opens the Android app on the matching article, including when the email was entered on web',
        why: 'If the chooser sends them to a logged-out browser, that tap never created the Android session',
        weight: 2,
      },
      {
        id: 'pending',
        priority: 'P0',
        mustInclude: 'Early tap waits or retries, not a crash, on Android and after a web start',
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
            title:
              'Tap the login link after a web start and land in the Android app on the article',
            covers: ['opens-app'],
          },
          {
            title: 'Early tap waits or retries, not a crash, including after a web start',
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
    title: 'Private window and blocked cookies on desktop and mobile Safari',
    platform: 'Web + mobile',
    summary:
      'A magic link needs a place to store the session. Desktop private windows, iOS Safari private browsing, and blocked cookies should say so, not fail silent.',
    whatCanBreak:
      'They tap the link on a laptop or on the phone, the page reloads, and they are still gated with no explanation.',
    passBar: PASS_BAR,
    maxAttempts: MAX_ATTEMPTS,
    golden: [
      {
        id: 'honest-block',
        priority: 'P0',
        mustInclude:
          'Blocked cookies, a desktop private window, or iOS Safari private browsing explain why sign-in cannot finish',
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
            title:
              'Blocked cookies, desktop private window, or iOS Safari private browsing explain why sign-in cannot finish',
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
    title: 'In-article comments: web embed vs a separate app login',
    platform: 'Web + mobile',
    summary:
      'Comments sit in a vendor widget on the article. Posting requires the news-site profile. The embed and the site should agree in the same browser. The iOS or Android app is a separate login.',
    whatCanBreak:
      'They are already on the site, tap comment, and get asked to sign in again in the widget. Or they sign in on web and expect the app to post without its own login.',
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
        mustInclude:
          'Already signed in on the site, in the same browser, is not asked to sign in again in the embed',
        why: 'Two logins on the same web page looks like an outage. A second login in the app is expected',
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
        mustInclude:
          'The embed and the site profile agree on the same session in that browser. The iOS or Android app is a separate login',
        why: 'Site says in and widget says out is a handoff bug. App vs web is not a shared cookie',
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
            title:
              'Already signed in on the site, in the same browser, is not asked to sign in again in the embed',
            covers: ['no-double-prompt'],
          },
          {
            title: 'After login, the comment box on that article is ready',
            covers: ['return-composer'],
          },
          {
            title:
              'The embed and the site profile share the same session in that browser. The app is a separate login',
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
