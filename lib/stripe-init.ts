import stripe from './stripe';

interface StripeProducts {
  singleInterview: {
    priceId: string;
    productId: string;
  };
  packInterviews: {
    priceId: string;
    productId: string;
  };
}

export async function initializeStripeProducts(): Promise<StripeProducts> {
  try {
    // Crear o recuperar el producto de entrevista individual
    const singleProduct = await stripe.products.create({
      name: 'Entrevista Individual',
      description: 'Una entrevista de práctica con IA',
      active: true,
      default_price_data: {
        currency: 'eur',
        unit_amount: 900, // 9.00 EUR
      },
      metadata: {
        type: 'single',
        interviews: '1',
      },
    });

    // Crear o recuperar el producto de pack de entrevistas
    const packProduct = await stripe.products.create({
      name: 'Pack de 10 Entrevistas',
      description: 'Pack de 10 entrevistas de práctica con IA',
      active: true,
      default_price_data: {
        currency: 'eur',
        unit_amount: 6900, // 69.00 EUR
      },
      metadata: {
        type: 'pack',
        interviews: '10',
      },
    });

    return {
      singleInterview: {
        productId: singleProduct.id,
        priceId: singleProduct.default_price as string,
      },
      packInterviews: {
        productId: packProduct.id,
        priceId: packProduct.default_price as string,
      },
    };
  } catch (error) {
    console.error('Error initializing Stripe products:', error);
    throw error;
  }
}