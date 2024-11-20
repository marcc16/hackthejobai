"use client";

import DocumentsClient from "@/components/DocumentsClient";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import useSubscription from "@/hooks/useSuscription";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const subscription = useSubscription();
  const router = useRouter();

  const handleNewInterview = () => {
    if (!subscription || subscription.availableInterviews === 0) {
      router.push('/dashboard/upgrade');
    } else {
      router.push('/dashboard/upload');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Copilot™
            </h1>
            <p className="text-gray-600">
              Tu asistente de IA para entrevistas técnicas
            </p>
          </div>
          <div className="flex items-center gap-4">
            
            {subscription?.availableInterviews !== undefined && (
              <span className="text-sm text-gray-600">
                {subscription.availableInterviews} entrevistas disponibles
              </span>
            )}
            <Button 
              onClick={handleNewInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white transform transition-transform duration-200 hover:scale-105"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Entrevista
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <DashboardStats />

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Historial de Entrevistas
              </h2>
              <p className="text-sm text-gray-500">
                Revisa y analiza tus entrevistas anteriores
              </p>
            </div>
          </div>
          <div className="p-6">
            <DocumentsClient />
          </div>
        </div>
      </div>
    </div>
  );
}