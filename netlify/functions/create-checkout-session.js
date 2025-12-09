import Stripe from "stripe";

export async function handler(event) {
  try {
    const { priceId } = JSON.parse(event.body);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // or "payment" for one-time
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://your-site.com/success",
      cancel_url: "https://your-site.com/cancel",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
