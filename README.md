<!-- InvestWise - A modern stock trading and investment education platform for young investors -->

# InvestWise 📈

A modern, full-stack stock trading and investment education platform designed for young investors. Built with Next.js 16, Firebase, and AI-powered insights.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)

## 🌟 Features

### Trading & Portfolio
- **Paper Trading** - Practice buying and selling stocks with virtual currency
- **Real-time Quotes** - Live stock prices via Finnhub API
- **Portfolio Tracking** - Track holdings, P&L, and historical performance
- **Interactive Charts** - Visualize stock and portfolio performance over time

### Research & Analysis
- **Stock Research** - Detailed company information and metrics
- **AI Chatbot** - Gemini-powered investment assistant for questions and guidance
- **News Feed** - Latest market news and updates

### Learning & Community
- **Onboarding Flow** - Educational introduction for new investors
- **Investment Goals** - Set and track financial goals
- **Community Leaderboard** - Compare performance with other users
- **Shareable Certificates** - Generate achievement certificates

### Pro Mode 🔥
- **Advanced Analytics** - Enhanced charts and technical indicators
- **Priority Features** - Early access to new capabilities

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| State Management | Zustand |
| Authentication | Firebase Auth |
| Database | Cloud Firestore |
| Hosting | Firebase App Hosting |
| AI | Google Gemini (via Genkit) |
| Charts | Recharts |
| Animations | Framer Motion |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AATIFGODIL/InvestWise.git
   cd InvestWise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys (Firebase, Finnhub, etc.)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:9002](http://localhost:9002) in your browser.

## 📁 Project Structure

```
src/
├── ai/              # Genkit AI flows and configuration
├── app/             # Next.js App Router pages
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # Main dashboard
│   ├── portfolio/   # Portfolio management
│   ├── trade/       # Trading interface
│   ├── research/    # Stock research
│   └── ...
├── components/      # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   └── ...
├── firebase/        # Firebase configuration
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── store/           # Zustand state stores
└── types/           # TypeScript types
```

## 🔐 Security

- Firestore Security Rules enforce user-ownership model
- API keys are managed via Firebase Secret Manager
- Authentication required for sensitive operations

## 📄 License

This project is for educational and portfolio demonstration purposes.

## 👨‍💻 Author

**Aatif Godil**

---

Built with ❤️ for young investors
