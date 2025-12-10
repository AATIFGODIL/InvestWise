
import fetch from 'node-fetch';

async function testYahooRange() {
    const symbol = 'AAPL';
    console.log(`Testing Yahoo Finance 1Y Range for ${symbol}...`);

    // 1 Year, Daily Interval
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed ${symbol}: ${res.status} ${res.statusText}`);
            process.exit(1);
        }
        const data = await res.json();
        const result = data.chart.result[0];

        if (result && result.timestamp && result.indicators.quote[0].close) {
            const count = result.timestamp.length;
            console.log(`Success! Retrieved ${count} data points.`);
            console.log(`First Date: ${new Date(result.timestamp[0] * 1000).toISOString()}`);
            console.log(`Last Date: ${new Date(result.timestamp[count - 1] * 1000).toISOString()}`);

            if (count > 200) {
                console.log("PASS: Sufficient data for 1 Year graph.");
            } else {
                console.log("WARN: Data points seem low for 1 Year (expected ~250).");
            }

        } else {
            console.error("Structure mismatch or no data.");
        }

    } catch (e) {
        console.error(`Error:`, e);
    }
}

testYahooRange();
