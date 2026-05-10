// InvestWise - A modern stock trading and investment education platform for young investors

/**
 * Detailed page descriptions for the InvestWise AI chatbot.
 * These are injected into the chatbot's context so it can give tailored,
 * page-specific answers when users ask "Explain this page".
 */

export const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/dashboard': `The Explore/Dashboard page is the main hub of InvestWise. It contains:
- **Portfolio Value Chart**: A large interactive chart showing the user's total portfolio value over time (1D, 1W, 1M, 3M, 6M, 1Y, All). It displays current balance, total gain/loss percentage, and a line graph.
- **Watchlist**: A horizontal scrollable list of stocks the user is tracking, showing each stock's symbol, current price, and daily change percentage. Users can tap a stock to go to the Trade page.
- **Holdings Summary**: A card showing the user's top stock holdings with allocation percentages, quantities, current values, and gain/loss.
- **Auto-Invest**: A feature that lets users set up recurring automatic investments into specific stocks at chosen intervals (daily, weekly, monthly). Shows active auto-investments with their next execution date.
- **AI Prediction**: An AI-powered stock prediction tool where users can enter a stock symbol and get a 5-month price forecast with confidence levels (High/Medium/Low).
- **Goal Progress**: Shows progress toward financial goals the user has set (e.g., "Save for College", "Emergency Fund"), with progress bars and target amounts.
- **Community Leaderboard**: Displays top investors in the InvestWise community ranked by portfolio performance.
- **Latest Headlines**: A grid of 5 financial news articles with images, sourced from live news APIs.
- **Educational Content**: Curated educational videos about investing basics, stock market fundamentals, etc.
- **Investment Bundles**: Pre-made collections of stocks grouped by theme (e.g., "Tech Giants", "Green Energy") that users can explore for diversification ideas.
- **Market Status**: Shows whether the US stock market is currently open or closed.
- **Congratulations Banner**: Shown to beginner users to celebrate milestones.`,

  '/portfolio': `The Portfolio page provides a detailed view of the user's investments. It has two tabs:

**Overview Tab:**
- **Portfolio Value Chart**: Same interactive chart as dashboard but dedicated — shows portfolio balance over various time ranges.
- **Holdings Table**: A detailed table of all stocks the user owns, showing symbol, company name, quantity, average cost, current price, market value, and unrealized gain/loss (both dollar amount and percentage). Rows are color-coded green/red.
- **Watchlist**: The user's tracked stocks with prices and changes.
- **Auto-Invest Section**: Manage recurring investment plans.
- **AI Prediction**: Get AI forecasts for any stock.
- **Market Status**: Real-time open/closed indicator.

**Goals Tab:**
- **Create Goal**: A form to create new financial goals with target amounts, deadlines, and goal types.
- **Goal List**: All active goals with progress tracking, contribution history, and status.
- **Learn About Goals**: Educational YouTube videos about setting SMART financial goals and trading psychology.`,

  '/trade': `The Trade page is where users buy and sell stocks. It contains:
- **Stock Chart (TradingView)**: A full interactive TradingView chart showing the selected stock's price history with candlesticks, volume, and technical indicators. Users can change timeframes, draw on the chart, and use professional chart tools.
- **Stock Search Bar**: A search input at the top where users can look up any stock by symbol or company name. Results appear as a dropdown with stock logos, names, current prices, and daily changes.
- **Ask AI Button**: Sends the current stock and price to the AI chatbot for analysis.
- **Watchlist Star**: Toggle to add/remove the current stock from the watchlist.
- **Trade Form**: A form to execute buy/sell orders. Users select Buy or Sell, choose Market or Limit order type, enter quantity, see the estimated total, and submit. For sell orders, it shows available shares.
- **Watchlist Panel**: Quick access to tracked stocks.
- **AI Prediction (Trade)**: AI-powered prediction specific to the stock being viewed.
- **Stock Screener**: A TradingView-powered screener showing a wide table of stocks with metrics like market cap, P/E ratio, dividends, etc. Users can filter and sort.
- **Investment Bundles**: Themed stock collections for exploration.
- **Learn About Trading**: Educational videos about reading stock charts and trading basics.
- **Market Status**: Real-time market open/closed indicator.`,

  '/goals': `The Goals page helps users set and track financial goals. It contains:
- **Create Goal Form**: Users can set a goal name, target amount, and target date. Goal categories include "Save for College", "Emergency Fund", "First Car", "Vacation", etc.
- **Goal List**: Shows all active and completed goals with:
  - Progress bar showing percentage toward target
  - Current saved amount vs target amount
  - Days remaining until deadline
  - Contribution history
- **Educational Content**: Videos and articles about financial goal-setting strategies.`,

  '/community': `The Community page connects users with other InvestWise investors. It has multiple tabs:
- **Feed Tab**: Shows community posts, discussions, and social interactions between investors. Users can share thoughts, strategies, and celebrate wins.
- **Leaderboard Tab**: Rankings of top investors by portfolio performance. Shows usernames, profile avatars, portfolio values, and percentage gains. Users can see where they rank.
- **Trends Tab**: Shows popular/trending stocks in the community — which stocks are being most bought, discussed, and added to watchlists by other users.`,

  '/research': `The Pro Research Station is an advanced page for experienced users (Pro Mode). It contains:
- **Multi-Chart TradingView Grid**: Up to 4 simultaneous TradingView charts arranged in a configurable grid (1x1, 1x2, or 2x2 layout). Each chart has professional studies pre-loaded: RSI, Simple Moving Average, MACD, and Bollinger Bands.
- **Grid Layout Controls**: Buttons to switch between 1, 2, or 4 chart layouts.
- **Per-Chart Symbol Input**: Each chart has an overlay input to change its stock symbol independently.
- **Fullscreen Mode**: A button to enter fullscreen for immersive charting.
- **Pro Mode Toggle**: Switch between Pro Mode (Research) and normal mode (Goals).
- **Latest Headlines**: Financial news with expandable view.
- **Detailed Stock Analysis Section**: A deep-dive search where users can:
  - Search for any stock symbol
  - See comprehensive data: current price, change, high/low, open, previous close, 52-week high/low, market cap, P/E ratio, dividend yield, EPS
  - View a dedicated TradingView chart for that stock
  - Execute trades directly from the research page via an inline trade form
  - Click "More Info" to focus the main grid on that stock`,

  '/profile': `The Profile page lets users manage their account. It contains:
- **Avatar Section**: Display and edit profile photo. Users can upload a photo or use AI Avatar Generation to create a custom avatar from text prompts.
- **Username**: Display and edit username.
- **Payment Method**: Add/manage payment methods via Braintree Drop-in UI for simulated deposits.
- **Phone Verification**: Verify phone number with SMS verification codes.
- **Account Details**: Email address and account creation date.`,

  '/settings': `The Settings page provides customization options:
- **Theme Toggle**: Switch between Light and Dark mode.
- **Clear Mode**: Enable a glassmorphic/transparent UI effect.
- **Primary Color Picker**: Choose a custom accent color for the entire app (buttons, highlights, etc.) from a palette of preset colors.
- **Sidebar Orientation**: Move the navigation sidebar to the left or right side of the screen.
- **Reset Theme**: Reset all theme settings to defaults.`,

  '/certificate': `The Certificate page displays the user's InvestWise achievement certificate:
- **Personalized Certificate**: A beautifully designed certificate with the user's name, showing their InvestWise membership and investment journey achievements.
- **Download Option**: Users can download or share their certificate.`,
};

/**
 * Get a detailed description for a given route path.
 * Falls back gracefully for unknown routes.
 */
export function getPageDescription(route: string): string | null {
  // Direct match
  if (PAGE_DESCRIPTIONS[route]) {
    return PAGE_DESCRIPTIONS[route];
  }
  // Try matching the base path (e.g., /community?tab=feed → /community)
  const basePath = route.split('?')[0];
  if (PAGE_DESCRIPTIONS[basePath]) {
    return PAGE_DESCRIPTIONS[basePath];
  }
  return null;
}
