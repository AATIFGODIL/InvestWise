
import { create } from 'zustand';

interface MarketState {
  isMarketOpen: boolean | null;
  isLoading: boolean;
  error: string | null;
  fetchMarketStatus: () => void;
}

const holidays2025 = new Set([
  '2025-01-01', // New Year’s Day
  '2025-01-20', // Martin Luther King, Jr. Day
  '2025-02-17', // Washington's Birthday
  '2025-04-18', // Good Friday
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving Day
  '2025-12-25', // Christmas Day
]);

/**
 * Checks if the market is open based on a specific schedule.
 * Market is open Mon-Fri, 7:00 PM IST to 1:30 AM IST, excluding holidays.
 * @returns {boolean} - True if the market is open, false otherwise.
 */
function checkMarketStatus(): boolean {
  // Get current time in IST (UTC+5:30)
  const now = new Date();
  const utcOffset = now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 3600000;
  const istDate = new Date(now.getTime() + utcOffset + istOffset);

  const dayOfWeek = istDate.getDay(); // Sunday is 0, Saturday is 6
  const hour = istDate.getHours();
  const minute = istDate.getMinutes();
  const dateString = istDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if it's a weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Check if it's a holiday
  if (holidays2025.has(dateString)) {
    return false;
  }
  
  // Check the time window (7:00 PM to 1:30 AM IST)
  // This window spans across two days in UTC, so we handle it carefully.
  const timeInMinutes = hour * 60 + minute;
  const openTimeInMinutes = 19 * 60; // 7:00 PM
  const closeTimeInMinutes = 1 * 60 + 30; // 1:30 AM

  // The market is open if it's after 7 PM or before 1:30 AM on a weekday.
  const isOpen = timeInMinutes >= openTimeInMinutes || timeInMinutes < closeTimeInMinutes;
  
  return isOpen;
}


export const useMarketStore = create<MarketState>((set) => ({
  isMarketOpen: null,
  isLoading: false,
  error: null,

  fetchMarketStatus: () => {
    // Replace API call with custom logic
    const marketStatus = checkMarketStatus();
    set({ isMarketOpen: marketStatus, isLoading: false, error: null });
  },
}));
