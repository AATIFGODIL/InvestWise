
import braintree from "braintree";

const environment = process.env.NODE_ENV === "production" 
    ? braintree.Environment.Production 
    : braintree.Environment.Sandbox;

if (!process.env.BRAINTREE_MERCHANT_ID || !process.env.BRAINTREE_PUBLIC_KEY || !process.env.BRAINTREE_PRIVATE_KEY) {
    throw new Error("Braintree credentials are not set in the environment variables.");
}

export const gateway = new braintree.BraintreeGateway({
  environment: environment,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
