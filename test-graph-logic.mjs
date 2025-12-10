
// Simulation of portfolio-store.ts logic
const transactions = [
    {
        symbol: 'AAPL',
        action: 'buy',
        quantity: 10,
        price: 220,
        timestamp: new Date().toISOString() // Bought TODAY
    }
];

const today = new Date();
today.setHours(0, 0, 0, 0);
// Start date 1 month ago
const startDate = new Date();
startDate.setMonth(today.getMonth() - 1);
startDate.setHours(0, 0, 0, 0);

// Mock Price History (Yahoo data simulation)
// Price rises from 200 to 230 over the month
const priceHistory = {
    'AAPL': {}
};
for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    priceHistory['AAPL'][d.getTime()] = 200 + (d.getDate()); // simple mock price
}

// Logic Re-implementation (Copy-Paste form Store mostly)
function reconstruct(transactions, startDate) {
    const dailyValues = [];
    const currentPortfolio = {};
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let txIndex = 0;

    const today = new Date(); // Reset date for loop upper bound
    today.setHours(0, 0, 0, 0); // Ensure consistent end

    // Fix: the loop in store modifies 'd' in place, so startDate variable gets mutated! 
    // In simulation, we need a fresh copy of startDate for loop
    let loopDate = new Date(startDate);

    console.log(`Simulating from ${loopDate.toISOString()} to ${today.toISOString()}`);
    console.log(`Transaction Time: ${sortedTransactions[0].timestamp}`);

    for (let d = loopDate; d <= today; d.setDate(d.getDate() + 1)) {
        const dayTime = d.getTime();

        // Catch up transactions
        while (txIndex < sortedTransactions.length) {
            const tx = sortedTransactions[txIndex];
            const txTime = new Date(tx.timestamp).getTime();

            // Debug Log
            // console.log(`Checking Tx: ${tx.timestamp} vs Day: ${d.toISOString()}`);

            if (txTime <= dayTime) { // <--- CRITICAL CHECK
                console.log(`   -> Processing Tx on ${d.toISOString()}`);
                const qtyChange = tx.action === 'buy' ? tx.quantity : -tx.quantity;
                currentPortfolio[tx.symbol] = (currentPortfolio[tx.symbol] || 0) + qtyChange;
                txIndex++;
            } else {
                break;
            }
        }

        let dayValue = 0;
        for (const [symbol, qty] of Object.entries(currentPortfolio)) {
            if (qty > 0) {
                // Mock price fallback
                let price = priceHistory[symbol][dayTime] || 0;
                dayValue += qty * price;
            }
        }
        dailyValues.push({ date: new Date(dayTime), value: dayValue, qty: currentPortfolio['AAPL'] || 0 });
    }
    return dailyValues;
}

const result = reconstruct(transactions, startDate);

// Check results
const firstDay = result[0];
const lastDay = result[result.length - 1];

console.log("\nResults:");
console.log(`Day 1 (${firstDay.date.toISOString()}): Qty=${firstDay.qty}, Value=${firstDay.value}`);
console.log(`Last Day (${lastDay.date.toISOString()}): Qty=${lastDay.qty}, Value=${lastDay.value}`);

if (firstDay.value > 0) {
    console.error("FAIL: Value > 0 on first day despite purchase being Today!");
} else {
    console.log("PASS: Logic correctly shows 0 value before purchase.");
}
