
import fetch from 'node-fetch';

const API_KEY = 'd2icc8hr01qgfkrlm2ggd2icc8hr01qgfkrlm2h0'; // Retrieved from apphosting.yaml
const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META'];

async function testConcurrency() {
    console.log(`Testing SEQUENTIAL fetch for ${SYMBOLS.length} symbols...`);
    const start = Date.now();
    let successCount = 0;

    for (const symbol of ['AAPL']) {
        // Try Quote first to verify key
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
        try {
            const res = await fetch(quoteUrl);
            if (!res.ok) {
                console.error(`Quote Failed ${symbol}: ${res.status} ${res.statusText}`);
            } else {
                console.log(`Quote Success for ${symbol}`);
                const data = await res.json();
                console.log(data);
            }
        } catch (e) { console.error("Quote Error", e); }

        // Then try candle
        const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${Math.floor(Date.now() / 1000) - 86400 * 7}&to=${Math.floor(Date.now() / 1000)}&token=${API_KEY}`;
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`Failed ${symbol}: ${res.status} ${res.statusText}`);
            } else {
                const data = await res.json();
                if (data.s === 'no_data') console.warn(`No data for ${symbol}`);
                else successCount++;
            }
        } catch (e) {
            console.error(`Error ${symbol}:`, e);
        }
        // Delay to match implementation
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    const end = Date.now();
    console.log(`\nResults: ${successCount}/${SYMBOLS.length} successful.`);
    console.log(`Time taken: ${end - start}ms`);

    if (successCount < SYMBOLS.length) {
        // Some might fail due to "no_data" which is fine, but 403 is bad.
        // Let's assume strict success for now.
        console.error("Test FAILED.");
    } else {
        console.log("Test PASSED. All requests succeeded sequentially.");
    }
}

testConcurrency();
