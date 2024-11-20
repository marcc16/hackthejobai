"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

function PricingPage() {
  const [isLoading, setIsLoading] = useState<"single" | "pack" | null>(null);

  const handleCheckout = async (priceType: "single" | "pack") => {
    try {
      setIsLoading(priceType);
      
      const response = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceType,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();

      // Redirigir al checkout de Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="py-24 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Precios
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Paga por uso sin compromisos
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Elige lo que mejor se adapte a tus necesidades. Paga solo por las
              entrevistas que utilices, sin suscripciones ni compromisos.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2">
            {/* Plan Individual */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">
                    Entrevista Individual
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  Perfecta para probar el servicio o para necesidades puntuales
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    €9
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">
                    /entrevista
                  </span>
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                >
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    20 minutos de entrevista
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Feedback personalizado
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Transcripción completa
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Análisis de respuestas
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => handleCheckout("single")}
                disabled={isLoading !== null}
                className="mt-8 w-full"
              >
                {isLoading === "single" ? "Procesando..." : "Comprar 1 Entrevista"}
              </Button>
            </div>

            {/* Plan Pack */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Más Popular
              </div>
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">
                    Pack de 10 Entrevistas
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  Ahorra un 23% preparándote a fondo para tu búsqueda
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    €6,90
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">
                    /entrevista
                  </span>
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                >
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Todo lo del plan individual
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Ahorra un 23%
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Válido por 1 año
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    Soporte prioritario
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => handleCheckout("pack")}
                disabled={isLoading !== null}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading === "pack" ? "Procesando..." : "Comprar Pack de 10"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;