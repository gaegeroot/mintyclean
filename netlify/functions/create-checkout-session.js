import Stripe from "stripe";

export async function handler(event) {
    const allowedOrigins = [
        "http://localhost:8080",
        "https://mintyclean.netlify.app",
        "https://callminty.com",
        "https://www.callminty.com"
    ];


    const origin = event.headers.origin;

    const corsHeaders = {
        "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
            ? origin
            : "https://mintyclean.netlify.app",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Handle preflight request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: "",
        };
    }

    try {
        const { priceId } = JSON.parse(event.body);

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
            mode: "subscription", // or "payment"
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: "https://your-site.com/success",
            cancel_url: "https://your-site.com/cancel",
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ url: session.url }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message }),
        };
    }
}
