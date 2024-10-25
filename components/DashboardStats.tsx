"use client";

import { Building2, MessageSquare, Code2, BrainCircuit } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

function DashboardStats() {
  const { totalInterviews, uniqueCompanies, lastInterview, topSkills, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Entrevistas Realizadas */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Entrevistas Realizadas</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalInterviews || 0}</h3>
            <div className="flex items-center mt-1">
              <Building2 className="h-3 w-3 text-blue-500 mr-1" />
              <p className="text-xs text-gray-500">{uniqueCompanies || 0} empresas diferentes</p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Última Entrevista */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Última Entrevista</p>
            {lastInterview ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{lastInterview.position}</h3>
                <div className="flex items-center mt-1">
                  <Building2 className="h-3 w-3 text-green-500 mr-1" />
                  <p className="text-xs text-gray-500">
                    en {lastInterview.company}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Sin entrevistas</h3>
                <div className="flex items-center mt-1">
                  <Building2 className="h-3 w-3 text-gray-500 mr-1" />
                  <p className="text-xs text-gray-500">Realiza tu primera entrevista</p>
                </div>
              </>
            )}
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <Code2 className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Skills</p>
            {topSkills && topSkills.length > 0 ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {topSkills.map(skill => skill.name).join(', ')}
                </h3>
                <div className="flex items-center mt-1">
                  <BrainCircuit className="h-3 w-3 text-purple-500 mr-1" />
                  <p className="text-xs text-gray-500">
                    Mencionados en {topSkills[0]?.count || 0} entrevistas
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Pendiente de análisis</h3>
                <div className="flex items-center mt-1">
                  <BrainCircuit className="h-3 w-3 text-gray-500 mr-1" />
                  <p className="text-xs text-gray-500">Disponible después de algunas entrevistas</p>
                </div>
              </>
            )}
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;