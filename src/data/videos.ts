// InvestWise - A modern stock trading and investment education platform for young investors

export interface Video {
  title: string;
  description: string;
  youtubeUrl: string;
  /** A link to a channel rather than a single video. */
  isChannel?: boolean;
  /** Artwork for channel links. */
  imageUrl?: string;
}

/** Shown on the Goals page and the Portfolio page's Goals tab. */
export const goalVideos: Video[] = [
  {
    title: "Setting SMART Financial Goals",
    description: "Learn how to set Specific, Measurable, Achievable, Relevant, and Time-bound goals for your financial future.",
    youtubeUrl: "https://www.youtube.com/watch?v=UwTxtkGplUs",
  },
  {
    title: "The Psychology of Trading",
    description: "Understand the emotional and psychological aspects of trading to maintain discipline and make better decisions.",
    youtubeUrl: "https://www.youtube.com/watch?v=sauPy2JHzI0",
  },
];

/** Shown on the Trade page. */
export const tradingVideos: Video[] = [
  {
    title: "Finance & Trading (Combined)",
    description: "An in-depth look at finance and trading for beginners.",
    youtubeUrl: "https://www.youtube.com/watch?v=BUCPPCXOHbs",
  },
  {
    title: "Reading Stock Charts for Beginners",
    description: "An introduction to candlestick charts, volume, and identifying simple trends.",
    youtubeUrl: "https://www.youtube.com/watch?v=sWTnFS10tdQ",
  },
];

/** Shown on the Community page. */
export const expertChannels: Video[] = [
  {
    title: "Bear Bull Traders",
    description: "Learn from Bear Bull Traders, one of the leading voices in financial education.",
    youtubeUrl: "https://www.youtube.com/channel/UCfO2yCpx6_XU-xovhpJuaYw",
    isChannel: true,
    imageUrl: "/bull.jpg",
  },
  {
    title: "Adam Khoo",
    description: "Trading strategies and market analysis from Adam Khoo, a professional investor and trader.",
    youtubeUrl: "https://www.youtube.com/@AdamKhoo",
    isChannel: true,
    imageUrl: "/adam-khoo.jpg",
  },
];
