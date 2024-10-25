"use client";

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { Document } from '@/types';

interface Skill {
  name: string;
  count: number;
  context: string[];
}

interface Stats {
  totalInterviews: number;
  uniqueCompanies: number;
  lastInterview: {
    position: string;
    company: string;
    date: Date;
  } | null;
  topSkills: Skill[];
  isLoading: boolean;
}

export function useStats() {
  const { user } = useUser();
  const [stats, setStats] = useState<Stats>({
    totalInterviews: 0,
    uniqueCompanies: 0,
    lastInterview: null,
    topSkills: [],
    isLoading: true,
  });

  async function analyzeSkills(messages: string[]): Promise<Skill[]> {
    const skillsMap = new Map<string, { count: number; context: Set<string> }>();
    
    // Skills técnicos con variantes
    const skillPatterns = {
      'React': /\b(react|reactjs|react\.js)\b/gi,
      'TypeScript': /\b(typescript|ts)\b/gi,
      'JavaScript': /\b(javascript|js|es6)\b/gi,
      'Node.js': /\b(node|nodejs|node\.js)\b/gi,
      'Python': /\b(python|py)\b/gi,
      'SQL': /\b(sql|mysql|postgresql|postgres)\b/gi,
      'AWS': /\b(aws|amazon web services|cloud)\b/gi,
      'Docker': /\b(docker|containerization)\b/gi,
      'Git': /\b(git|github|version control)\b/gi,
      'API': /\b(api|rest|graphql|endpoints)\b/gi,
      'Angular': /\b(angular|ng)\b/gi,
      'Vue.js': /\b(vue|vuejs|vue\.js)\b/gi,
      'Express': /\b(express|expressjs|express\.js)\b/gi,
      'MongoDB': /\b(mongodb|mongo|nosql)\b/gi,
      'Testing': /\b(testing|jest|cypress|unit test|e2e)\b/gi,
      'CI/CD': /\b(ci\/cd|jenkins|github actions|pipeline)\b/gi,
      'Agile': /\b(agile|scrum|kanban|sprint)\b/gi,
      'Frontend': /\b(frontend|front-end|ui|ux)\b/gi,
      'Backend': /\b(backend|back-end|server-side|api)\b/gi,
      'DevOps': /\b(devops|deployment|infrastructure)\b/gi
    };

    messages.forEach(message => {
      // Dividir el mensaje en oraciones para mejor contexto
      const sentences = message.split(/[.!?]+/).filter(Boolean);
      
      sentences.forEach(sentence => {
        for (const [skill, pattern] of Object.entries(skillPatterns)) {
          if (pattern.test(sentence)) {
            const existing = skillsMap.get(skill) || { count: 0, context: new Set() };
            
            // Solo guardar contexto si la oración es relevante y no muy larga
            const trimmedSentence = sentence.trim();
            if (trimmedSentence.length > 10 && trimmedSentence.length < 150) {
              existing.context.add(trimmedSentence);
            }
            
            existing.count++;
            skillsMap.set(skill, existing);
          }
        }
      });
    });

    // Convertir el Map a array y ordenar por frecuencia
    return Array.from(skillsMap.entries())
      .map(([name, { count, context }]) => ({
        name,
        count,
        context: Array.from(context)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);  // Top 3 skills
  }

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;

      try {
        // Obtener documentos ordenados por fecha
        const filesRef = collection(db, 'users', user.id, 'files');
        const q = query(filesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Document[];

        // Calcular estadísticas básicas
        const totalInterviews = documents.length;
        const companies = new Set(documents.map(doc => doc.companyName));
        const uniqueCompanies = companies.size;

        // Obtener última entrevista
        const lastInterview = documents[0] ? {
          position: documents[0].jobPosition,
          company: documents[0].companyName,
          date: documents[0].createdAt,
        } : null;

        // Analizar skills de las últimas 10 entrevistas
        const allMessages: string[] = [];
        const recentDocs = documents.slice(0, 10);

        for (const doc of recentDocs) {
          const chatRef = collection(db, 'users', user.id, 'files', doc.id, 'chat');
          const chatSnapshot = await getDocs(chatRef);
          
          chatSnapshot.docs.forEach(msg => {
            const data = msg.data();
            // Solo analizar mensajes del candidato y la IA
            if (['candidate', 'ai', 'user'].includes(data.role)) {
              allMessages.push(data.message);
            }
          });
        }

        const topSkills = await analyzeSkills(allMessages);

        setStats({
          totalInterviews,
          uniqueCompanies,
          lastInterview,
          topSkills,
          isLoading: false,
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchStats();
  }, [user?.id]);

  return stats;
}