// InvestWise - A modern stock trading and investment education platform for young investors

/**
 * The page tours.
 *
 * One tour per page, a handful of steps each, written as a sentence a person
 * would say while pointing at the thing — what it is and what to do with it,
 * nothing about how it was built. Steps whose target isn't on screen (no
 * holdings yet, the mobile layout, a hidden quest card) are skipped rather than
 * ending the tour.
 */

export type TourStep = {
  /** CSS selector for the thing being pointed at. Omit for a centred card. */
  target?: string;
  title: string;
  body: string;
  /** Header controls live in a header that folds away once the page scrolls. */
  scrollTop?: boolean;
  /** Corner radius of the spotlight, to match the thing it frames. */
  radius?: number;
  /** The dashboard's opening card gets the "hello" lettering. */
  welcome?: boolean;
};

const SHARED_CHROME: TourStep[] = [
  {
    target: "#tour-side-rail, #bottom-nav-tutorial",
    title: "Get around",
    body: "Explore, Portfolio, Trade, Goals and Community live here. You can also press and drag the highlight to jump between pages.",
    radius: 40,
  },
  {
    target: "#tour-chatbot",
    title: "Ask the AI",
    body: "Stuck on a word or a chart? The assistant already knows which page you're on.",
    radius: 999,
  },
  {
    target: "#tour-spotlight",
    title: "Spotlight Search",
    body: "Search any stock or any command. Star results to pin them here, and hold the button to rearrange them.",
    scrollTop: true,
    radius: 999,
  },
  {
    target: "#tour-pro-toggle",
    title: "Pro Mode",
    body: "When you're ready for more, this switches to four live charts with indicators. Flip it back any time.",
    scrollTop: true,
    radius: 999,
  },
  {
    target: "#tour-help",
    title: "Need this again?",
    body: "Tap the question mark on any page to replay its tour.",
    scrollTop: true,
    radius: 999,
  },
];

export const TOURS: Record<string, TourStep[]> = {
  dashboard: [
    {
      title: "Welcome to InvestWise",
      body: "Here's a quick look around. It takes less than a minute, and you can skip whenever you like.",
      welcome: true,
    },
    {
      target: "#portfolio-card-tutorial",
      title: "Your portfolio",
      body: "Your total value and how it's moved. Switch between 1W, 1M, 6M and 1Y to change the range.",
    },
    {
      target: "#watchlist-tutorial",
      title: "Your watchlist",
      body: "Stocks you're keeping an eye on. Tap Trade to buy one, or the row to open its chart.",
    },
    {
      target: "#holdings-summary-tutorial",
      title: "What you own",
      body: "Your biggest holdings at a glance. The full list is on the Portfolio page.",
    },
    {
      target: "#auto-invest-tutorial",
      title: "Auto-Invest",
      body: "Invest a set amount on a schedule. When one is due, you'll get a notification to approve it.",
    },
    {
      target: "#ai-prediction-tutorial",
      title: "AI Stock Prediction",
      body: "Type a symbol to see its AI Score from 1 to 10 and a price forecast, powered by Danelfin. It's for learning, not advice.",
    },
    {
      target: "#community-leaderboard-tutorial",
      title: "Leaderboard",
      body: "See how you rank against everyone else learning. You can stay anonymous in Settings.",
    },
    {
      target: "#bundles-tutorial",
      title: "Investment Bundles",
      body: "Ready-made sets of stocks that spread your money across a theme in one go.",
    },
    ...SHARED_CHROME,
  ],

  portfolio: [
    {
      target: "#add-funds-tutorial",
      title: "Add virtual money",
      body: "Top up your balance with $100 of practice money whenever you need it.",
      radius: 16,
    },
    {
      target: "#portfolio-tabs-tutorial",
      title: "Overview and Goals",
      body: "Switch between your investments and the goals you're saving for.",
      radius: 999,
    },
    {
      target: "#portfolio-value-tutorial",
      title: "Portfolio value",
      body: "Everything you own, added up, over the range you pick.",
    },
    {
      target: "#holdings-section-tutorial",
      title: "Holdings",
      body: "Every stock you own, with today's change and your total gain or loss.",
    },
    {
      target: "#trade-history-button-tutorial",
      title: "Trade history",
      body: "Every buy and sell you've made, in order.",
      radius: 16,
    },
    {
      target: "#watchlist-portfolio-tutorial",
      title: "Watchlist",
      body: "The same watchlist as on Explore, so it's here when you need it.",
    },
    {
      target: "#auto-invest-portfolio-tutorial",
      title: "Auto-Invest",
      body: "Manage your recurring investments without leaving the page.",
    },
  ],

  trade: [
    {
      target: "#stock-chart-tutorial",
      title: "Find a stock",
      body: "Search any company to see its live chart. Star it to add it to your watchlist, or tap Ask AI for a plain-English read.",
    },
    {
      target: "#trade-form-tutorial",
      title: "Place an order",
      body: "Buy or sell with virtual money, as a market or a limit order. The summary shows the total before you confirm.",
    },
    {
      target: "#ai-prediction-trade-tutorial",
      title: "Check the outlook",
      body: "Get an AI prediction for the stock you're looking at before you decide.",
    },
    {
      target: "#bundles-trade-tutorial",
      title: "Or buy a bundle",
      body: "A themed set of stocks in one order — an easy way to spread your risk.",
    },
    {
      target: "#learn-trading-tutorial",
      title: "Learn as you go",
      body: "Short videos on reading charts and trading basics. Watch them to the end to count towards your quests.",
    },
  ],

  goals: [
    {
      target: "#create-goal-tutorial",
      title: "Set a goal",
      body: "Give it a name and a target amount — a laptop, a trip, your first car.",
    },
    {
      target: "#goal-list-tutorial",
      title: "Track it",
      body: "Your goals and how close you are. Your progress also shows on the dashboard.",
    },
    {
      target: "#goal-videos-tutorial",
      title: "Learn about goals",
      body: "Two short videos on setting goals you'll actually hit.",
    },
  ],

  community: [
    {
      target: "#community-tabs-tutorial",
      title: "Feed and Trends",
      body: "Feed shows the leaderboard and your quests. Trends shows what other investors are buying.",
      radius: 999,
    },
    {
      target: "#leaderboard-tutorial",
      title: "Leaderboard",
      body: "Rankings by returns. Choose whether you show up by name, anonymously, or not at all in Settings.",
    },
    {
      target: "#quests-tutorial",
      title: "Investment Quests",
      body: "Beginner, Intermediate and Pro lessons that fill in as you go. Finish the beginner ones to earn your certificate.",
    },
    {
      target: "#experts-tutorial",
      title: "Learn from the experts",
      body: "YouTube channels from experienced traders, one tap away.",
    },
  ],

  research: [
    {
      target: "#research-grid-tutorial",
      title: "Four charts at once",
      body: "Each chart carries RSI, MACD, a moving average and Bollinger Bands. Use the buttons above to show one, two or four.",
    },
    {
      target: "#research-search-tutorial",
      title: "Deep analysis",
      body: "Search any symbol for its 52-week range, market cap, P/E, dividend yield and more.",
      radius: 999,
    },
    {
      target: "#tour-pro-toggle",
      title: "Back to guided",
      body: "Switch Pro Mode off to return to where you were.",
      scrollTop: true,
      radius: 999,
    },
  ],
};

/** Which tour belongs to a route, if any. */
export function tourIdFor(pathname: string | null): string | null {
  if (!pathname) return null;
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/explore")) return "dashboard";
  if (pathname.startsWith("/portfolio")) return "portfolio";
  if (pathname.startsWith("/trade")) return "trade";
  if (pathname.startsWith("/goals")) return "goals";
  if (pathname.startsWith("/community")) return "community";
  if (pathname.startsWith("/research")) return "research";
  return null;
}
