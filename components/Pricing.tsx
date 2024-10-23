"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

function PricingPage() {
  return (
    <div>
      <div className="bg-white py-24 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Precios
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Paga por uso sin compromisos
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-2xl px-10 text-center text-lg leading-8 text-gray-600">
          Elige lo que mejor se adapte a tus necesidades. Paga solo por las
          entrevistas que utilices, sin suscripciones ni compromisos.
        </p>

        <div className="max-w-md mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 md:max-w-2xl gap-8 lg:max-w-4xl">
          {/* PACK DE 1 ENTREVISTA */}
          <div className="ring-1 ring-gray-200 p-8 h-fit pb-12 rounded-3xl transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">
              Prueba hackthejob.ai
            </h3>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                €9
              </span>
              <span className="text-sm font-semibold leading-6 text-gray-600">
                / por entrevista
              </span>
            </p>

            <ul
              role="list"
              className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
            >
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Respuestas personalizadas con tu CV
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Respuestas automáticas basadas en IA
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Respuestas avanzadas con IA y memoria de contexto
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Función de análisis de empresas desde URL
              </li>
            </ul>
          </div>

          {/* PACK DE 10 ENTREVISTAS */}
          <div className="ring-2 ring-blue-600 rounded-3xl p-8 transform transition-transform duration-300 hover:scale-105 hover:ring-4 hover:ring-blue-700 hover:shadow-lg hover:bg-blue-50">
            <h3 className="text-lg font-semibold leading-8 text-blue-600">
              Pack de 10 Entrevistas
            </h3>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                €6,9
              </span>
              <span className="text-sm font-semibold leading-6 text-gray-600">
                / por entrevista 
              </span>
            </p>

            <Button className="bg-blue-600 w-full text-white shadow-sm hover:bg-blue-500 mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              Consigue el Pack de 10 Entrevistas
            </Button>

            <ul
              role="list"
              className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
            >
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Respuestas personalizadas con tu CV
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Respuestas automáticas basadas en IA
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Respuestas avanzadas con IA y memoria de contexto
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-blue-600" />
                Función de análisis de empresas desde URL
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
