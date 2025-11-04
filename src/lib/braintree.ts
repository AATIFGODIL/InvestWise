
import braintree, { type BraintreeGateway } from "braintree";

// This is a global variable that will be cached across invocations
// in a serverless environment.
let gateway: BraintreeGateway;

function initializeBraintreeGateway(): BraintreeGateway {
  // If the gateway is already initialized, return it.
  if (gateway) {
    return gateway;
  }
  
  const BRAINTREE_MERCHANT_ID = process.env.BRAINTREE_MERCHANT_ID;
  const BRAINTREE_PUBLIC_KEY = process.env.BRAINTREE_PUBLIC_KEY;
  const BRAINTREE_PRIVATE_KEY = process.env.BRAINTREE_PRIVATE_KEY;

  if (!BRAINTREE_MERCHANT_ID || !BRAINTREE_PUBLIC_KEY || !BRAINTREE_PRIVATE_KEY) {
    throw new Error("Braintree credentials are not set in environment variables. Cannot initialize Braintree Gateway.");
  }
  
  const environment = process.env.NODE_ENV === "production" 
    ? braintree.Environment.Production 
    : braintree.Environment.Sandbox;

  // Initialize the gateway
  gateway = new braintree.BraintreeGateway({
    environment: environment,
    merchantId: BRAINTREE_MERCHANT_ID,
    publicKey: BRAINTREE_PUBLIC_KEY,
    privateKey: BRAINTREE_PRIVATE_KEY,
  });

  console.log("Braintree Gateway Initialized.");
  return gateway;
}

// Export a function that initializes and returns the gateway.
// This ensures the initialization logic runs only when the gateway is first accessed.
export function getBraintreeGateway() {
    return initializeBraintreeGateway();
}
