
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key is not configured on the server." }, { status: 500 });
  }
  
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const res = await fetch(url, {
      next: {
        // Revalidate every 60 seconds to respect API limits and reduce costs
        revalidate: 60,
      }
    });
    const data = await res.json();

    const quote = data["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      console.error("No data found in Alpha Vantage response for symbol:", symbol, "Response:", data);
      return NextResponse.json({ error: "No data found for the symbol." }, { status: 404 });
    }

    const price = quote["05. price"];

    if (!price) {
      console.error("Price not found in Alpha Vantage quote for symbol:", symbol, "Quote:", quote);
      return NextResponse.json({ error: "Price could not be determined." }, { status: 500 });
    }

    return NextResponse.json({ symbol, price: parseFloat(price) });
  } catch (err) {
    console.error("Failed to fetch price from Alpha Vantage:", err);
    return NextResponse.json({ error: "Failed to fetch price from external service." }, { status: 500 });
  }
}
