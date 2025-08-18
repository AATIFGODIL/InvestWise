
export async function fetchPrice(symbol: string): Promise<number | null> {
  const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY!;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const price = parseFloat(data["Global Quote"]["05. price"]);
    return isNaN(price) ? null : price;
  } catch (err) {
    console.error("Failed to fetch price:", err);
    return null;
  }
}
