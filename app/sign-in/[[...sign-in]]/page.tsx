'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Lado izquierdo - Información de la startup */}
    <div className="hidden lg:flex w-1/2 bg-blue-600 text-white p-12 flex-col justify-center items-center">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">hackthejob.ai</h1>
        <Image 
        src="/login.png" 
        alt="Ilustración de crecimiento y comunicación" 
        className="w-full max-w-md mb-2"
        width={500}
        height={500}
        />
        
        <p className="text-lg font-semibold mb-12 text-center">
        Impulsa tu carrera con IA. Domina tus entrevistas, consigue el trabajo de tus sueños.
        </p>
      </div>
    </div>

      {/* Lado derecho - Formulario de inicio de sesión usando Clerk */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md">
          <SignIn.Root>
            <SignIn.Step
              name="start"
              className="bg-white w-full rounded-2xl py-10 px-8 shadow-lg border border-purple-200 space-y-6"
            >
              <h2 className="text-3xl font-bold text-center to-blue-600 mb-6">Bienvenido</h2>
              
              {/* Botones de inicio de sesión social */}
              <div className="flex justify-center mb-6">
                <Clerk.Connection
                  name="google"
                  className="flex items-center justify-center w-full font-medium border border-gray-300 shadow-sm py-2 px-3 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Clerk.Icon className="size-4 mr-2" />
                  Google
                </Clerk.Connection>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              {/* Campo de email */}
              <Clerk.Field name="identifier" className="space-y-2">
                <Clerk.Label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </Clerk.Label>
                <Clerk.Input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <Clerk.FieldError className="block text-red-500 text-sm" />
              </Clerk.Field>

              {/* Botón para continuar */}
              <SignIn.Action
                submit
                className="w-full bg-blue-600 text-white rounded-md py-2 px-4 font-medium hover:bg-blue-700 transition-colors"
              >
                Continuar
              </SignIn.Action>

              <div className="text-center text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </SignIn.Step>
          </SignIn.Root>
        </div>
      </div>
    </div>
  );
}
