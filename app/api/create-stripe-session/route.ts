import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { initializeStripeProducts } from "@/lib/stripe-init";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { priceType } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Obtener o crear los productos
    const products = await initializeStripeProducts();
    
    // Seleccionar el precio correcto
    const priceId = priceType === "single" 
      ? products.singleInterview.priceId 
      : products.packInterviews.priceId;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?canceled=true`,
      metadata: {
        userId,
        interviews: priceType === "single" ? "1" : "10",
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}