import React from 'react';
import Link from "next/link";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";
import Particles from "@/components/ui/particles";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { MagicCard } from "@/components/ui/magic-card";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";
import Marquee from "@/components/ui/marquee";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import AnimatedNumberTicker from '@/components/AnimatedNumberTicket';
import PricingPage from "@/components/Pricing";

const features = [
  {
    name: "Respuestas adaptadas a ti",
    description: "El co-pilot analiza tu CV para personalizar las respuestas, alineándolas con tu experiencia y habilidades.",
    icon: BrainCogIcon,
  },
  {
    name: "Respuestas inmediatas y certeras",
    description: "Responde a las preguntas en tiempo real, proporcionando respuestas inteligentes al instante.",
    icon: ZapIcon,
  },
  {
    name: "Contexto continuo",
    description: "Nuestro co-pilot recuerda hasta 10 preguntas anteriores para mantener la coherencia en la entrevista.",
    icon: ServerCogIcon,
  },
  {
    name: "Información relevante al alcance",
    description: "El scraping web te ofrece datos clave de la empresa, para que siempre tengas un argumento a favor.",
    icon: EyeIcon,
  },
  {
    name: "Automatización sin complicaciones",
    description: "Todo se activa de manera automática para que te centres en lo importante: tus respuestas.",
    icon: GlobeIcon,
  },
  {
    name: "Acceso en cualquier dispositivo",
    description: "Desde tu portátil hasta tu móvil, el co-pilot se adapta a cualquier pantalla.",
    icon: MonitorSmartphoneIcon,
  },
];

const reviews = [
  {
    id: 1,
    name: "Carlos",
    username: "@carlos",
    comment: "Hackthejob.ai me ayudó a mantener la calma y sentirme más seguro con mis respuestas. No fue magia, pero definitivamente marcó la diferencia para mí.",
    avatarColor: "bg-gradient-to-br from-green-400 to-blue-500",
  },
  {
    id: 2,
    name: "María",
    username: "@maria",
    comment: "Las sugerencias de respuestas eran útiles, pero lo que más me ayudó fue la confianza que me dio durante la conversación.",
    avatarColor: "bg-gradient-to-br from-yellow-400 to-green-500",
  },
  {
    id: 3,
    name: "Luis",
    username: "@luis",
    comment: "El co-pilot no solo me recordó puntos importantes que había olvidado, sino que me ayudó a mantenerme enfocado.",
    avatarColor: "bg-gradient-to-br from-purple-400 to-pink-500",
  },
  {
    id: 4,
    name: "Ana",
    username: "@ana",
    comment: "Me permitió hacer preguntas más relevantes durante la entrevista. No me hizo conseguir el trabajo automáticamente, pero me ayudó a destacar de una forma más natural.",
    avatarColor: "bg-gradient-to-br from-blue-400 to-green-500",
  },
  {
    id: 5,
    name: "Javier",
    username: "@javier",
    comment: "Fue como tener a alguien que me cubría la espalda durante la entrevista. Me permitió concentrarme en comunicarme mejor.",
    avatarColor: "bg-gradient-to-br from-red-400 to-yellow-500",
  },
];

const faqs = [
  {
    question: "¿Cómo me ayuda hackthejob.ai a estar mejor preparado?",
    answer: "Hackthejob.ai analiza tu CV y adapta las respuestas en tiempo real para que se ajusten perfectamente a tu experiencia y habilidades."
  },
  {
    question: "¿Hackthejob.ai es adecuado para entrevistas técnicas?",
    answer: "Sí, hackthejob.ai te ayuda a responder preguntas técnicas y de comportamiento, brindándote apoyo en tiempo real."
  },
  {
    question: "¿Cómo se diferencia hackthejob.ai de otras herramientas de preparación?",
    answer: "Hackthejob.ai ofrece asistencia en tiempo real durante entrevistas reales, adaptándose a tu perfil y a la empresa específica."
  },
  {
    question: "¿Cómo mejora mis posibilidades de éxito en una entrevista?",
    answer: "Con hackthejob.ai, reduces el estrés y obtienes respuestas personalizadas y coherentes, adaptándote a preguntas inesperadas."
  },
  {
    question: "¿Es ético usar hackthejob.ai en una entrevista real?",
    answer: "Hackthejob.ai está diseñado para mejorar tu preparación y confianza, complementando tus conocimientos y habilidades, no sustituyéndolos."
  }
];

export default function Home() {
  return (
    <main className="flex-1 overflow-hidden bg-gradient-to-bl from-white to-blue-600">
      <div className="relative bg-white rounded-md shadow-2xl">
        <Particles
          className="absolute inset-0"
          quantity={100}
          staticity={50}
          ease={60}
          size={1}
          refresh={false}
          color="#4f46e5"
          vx={1}
          vy={1}
        />
        
        {/* Hero Section */}
        <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <AnimatedShinyText>Tu co-pilot de IA para entrevistas</AnimatedShinyText>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Responde con <span className="text-blue-600">confianza</span> en cada entrevista
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              ¿Te sientes nervioso antes de una entrevista? ¿O te preocupa no estar lo suficientemente preparado?
              <br />
              Con <span className="font-bold text-blue-600">hackthejob.ai</span>, no solo reducirás el estrés, sino que también tendrás respuestas precisas, adaptadas a ti y a cada situación.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/dashboard">Empieza Ahora</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/watch?v=WUJIYgdCaxA"
            thumbnailSrc="/app-screenshot.png"
            thumbnailAlt="App screenshot"
            className="max-w-5xl mx-auto rounded-lg shadow-lg"
          />
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Características principales</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {features.map((feature) => (
                <MagicCard
                  key={feature.name}
                  className="p-6 rounded-xl bg-white shadow-sm transition-transform duration-300 ease-in-out hover:scale-105"
                  gradientColor="rgba(245, 245, 255, 1)"
                  gradientOpacity={0.9}
                  gradientSize={150}
                >
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5 text-blue-600"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-gray-500">{feature.description}</dd>
                  </div>
                </MagicCard>
              ))}
            </dl>
          </div>
        </section>

        {/* Stats Section */}
        <section id="number-ticker-section" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center">
              <span className="text-6xl font-extrabold text-blue-600 mr-2">+</span>
              <AnimatedNumberTicker value={2000} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Horas ahorradas en preparación de entrevistas
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Con hackthejob.ai, te ayudamos a ahorrar tiempo valioso en la preparación para tus entrevistas.
            </p>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Lo que dicen nuestros usuarios</h2>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
              <Marquee className="py-4" pauseOnHover={true}>
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6 m-2 w-64 flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-full ${review.avatarColor} mr-3`}></div>
                      <div>
                        <div className="font-semibold">{review.name}</div>
                        <div className="text-gray-500 text-sm">{review.username}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm flex-grow">{review.comment}</p>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Prueba co-pilot y supera tu próxima entrevista</Link>
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Preguntas Frecuentes</h2>
            <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingPage />
      </div>
    </main>
  );
}