
export async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/price?symbol=${symbol}`);
    
    if (!res.ok) {
        const errorData = await res.json();
        console.error(`Error fetching price for ${symbol}:`, errorData.error);
        return null;
    }
    
    const data = await res.json();

    if (data.error) {
      console.error(`API returned an error for ${symbol}:`, data.error);
      return null;
    }

    return parseFloat(data.price);
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
}
