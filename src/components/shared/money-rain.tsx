
'use client';

import { DollarSign } from 'lucide-react';

interface MoneyRainProps {
  isActive: boolean;
}

export default function MoneyRain({ isActive }: MoneyRainProps) {
  if (!isActive) {
    return null;
  }

  // Create an array to render multiple bills
  const bills = Array.from({ length: 50 });

  return (
    <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-[9999]">
      {bills.map((_, i) => (
        <div
          key={i}
          className="absolute text-green-500 money-rain-animate"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDuration: `${Math.random() * 2 + 3}s`, // 3s to 5s duration
            animationDelay: `${Math.random() * 5}s`, // Stagger the start
            fontSize: `${Math.random() * 1 + 0.75}rem`, // 0.75rem to 1.75rem
          }}
        >
          <DollarSign style={{ transform: `rotate(${Math.random() * 90}deg)`}} />
        </div>
      ))}
    </div>
  );
}
