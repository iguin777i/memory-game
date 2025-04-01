"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Clock, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";

interface Achievement {
  name: string;
  description: string;
  icon: string;
}

interface Score {
  id: string;
  userId: string;
  time: number | null;
  points: number;
  completed: boolean;
  displayTime: string;
  user: {
    name: string;
    achievements?: Achievement[];
  };
}

export default function Ranking() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/scores');
        if (!response.ok) {
          throw new Error('Erro ao buscar pontuações');
        }
        const data = await response.json();
        console.log('Scores recebidos:', data); // Debug log
        setScores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar pontuações:', error);
        setError('Erro ao carregar o ranking. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Obtém o ID do usuário atual do localStorage
    const userId = localStorage.getItem('userId');
    console.log('Current User ID:', userId); // Debug log
    setCurrentUserId(userId);
  }, []);

  // Ordena os scores
  const sortedScores = [...scores].sort((a, b) => {
    // Se algum não completou, vai para o final
    if (!a.completed && b.completed) return 1;
    if (a.completed && !b.completed) return -1;
    if (!a.completed && !b.completed) return 0;
    
    // Se ambos completaram, ordena pelo tempo
    return (a.time || 0) - (b.time || 0);
  });

  // Pega os 10 primeiros
  const top10Scores = sortedScores.slice(0, 10);

  const chartData = top10Scores.map((score, index) => {
    // Se o jogador não completou, retorna pontuação zero
    if (!score.completed || !score.time) {
      return {
        name: score.user.name,
        points: 0,
        time: 0,
        achievements: score.user.achievements?.length || 0,
        position: index + 1,
        fill: "#9CA3AF",
        userId: score.userId
      };
    }

    // Para jogadores que completaram, calcula a pontuação
    return {
      name: score.user.name,
      points: score.time ? 1000 - (score.time * 10) : 0,
      time: score.time || 0,
      achievements: score.user.achievements?.length || 0,
      position: index + 1,
      fill: index < 3 ? ["#FFD700", "#C0C0C0", "#CD7F32"][index] : "#008C77",
      userId: score.userId
    };
  });

  // Encontra a pontuação do usuário atual
  const currentUserScore = scores.find(score => {
    console.log('Comparando:', {
      scoreUserId: score.userId,
      currentUserId: currentUserId,
      isMatch: score.userId === currentUserId,
      score: score
    });
    return score.userId === currentUserId;
  });
  console.log('Current User Score:', currentUserScore); // Debug log

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-8">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 28" fill="none" className="w-full h-full">
                <g clipPath="url(#clip0_914_710)">
                  <path d="M21.0159 27.9815V21.9229H9.98461L16.1403 15.8198C16.6787 15.4043 17.025 14.7624 17.025 14.0353C17.025 13.3081 16.69 12.6848 16.1629 12.2692L9.90932 6.0326H21.0121V0.0111335H3.53151C3.50139 0.0111335 3.47504 0.0074234 3.44868 0.0074234C1.54362 0.0074234 0 1.53598 0 3.41699C0 4.40016 0.421673 5.27945 1.09183 5.90275L1.0843 5.9213L9.10738 14.0167L1.0843 22.1752C0.459322 22.7948 0.0715338 23.6481 0.0715338 24.5904C0.0715338 26.4752 1.61516 28 3.51645 28C3.63316 28 3.74611 27.9926 3.85906 27.9815H21.0159Z" fill="#008C77" />
                  <path d="M24.0918 6.38876L37.0921 13.7941L24.1407 21.5556L24.1633 27.9703L44.0799 16.9291V16.9217C45.2282 16.3095 46.0037 15.126 46 13.7718C45.9962 12.3805 45.1717 11.1822 43.9707 10.5886L24.0692 0L24.0918 6.38876Z" fill="#214B63" />
                </g>
                <defs>
                  <clipPath id="clip0_914_710">
                    <rect width="46" height="28" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h1 className="hidden md:block text-3xl font-bold text-[#008C77]">Ranking</h1>
          </div>
          <Button className="bg-[#008C77]" onClick={() => router.push("/")}>
            Voltar
          </Button>
        </div>
        <div className="flex items-center justify-center flex-1 min-h-[80vh]">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-32 h-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 28" fill="none" className="w-full h-full">
              <g clipPath="url(#clip0_914_710)">
                <path d="M21.0159 27.9815V21.9229H9.98461L16.1403 15.8198C16.6787 15.4043 17.025 14.7624 17.025 14.0353C17.025 13.3081 16.69 12.6848 16.1629 12.2692L9.90932 6.0326H21.0121V0.0111335H3.53151C3.50139 0.0111335 3.47504 0.0074234 3.44868 0.0074234C1.54362 0.0074234 0 1.53598 0 3.41699C0 4.40016 0.421673 5.27945 1.09183 5.90275L1.0843 5.9213L9.10738 14.0167L1.0843 22.1752C0.459322 22.7948 0.0715338 23.6481 0.0715338 24.5904C0.0715338 26.4752 1.61516 28 3.51645 28C3.63316 28 3.74611 27.9926 3.85906 27.9815H21.0159Z" fill="#008C77" />
                <path d="M24.0918 6.38876L37.0921 13.7941L24.1407 21.5556L24.1633 27.9703L44.0799 16.9291V16.9217C45.2282 16.3095 46.0037 15.126 46 13.7718C45.9962 12.3805 45.1717 11.1822 43.9707 10.5886L24.0692 0L24.0918 6.38876Z" fill="#214B63" />
              </g>
              <defs>
                <clipPath id="clip0_914_710">
                  <rect width="46" height="28" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-[#008C77]">Ranking</h1>
          <Button className="bg-[#008C77]" onClick={() => router.push("/")}>
            Voltar
          </Button>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 28" fill="none" className="w-full h-full">
              <g clipPath="url(#clip0_914_710)">
                <path d="M21.0159 27.9815V21.9229H9.98461L16.1403 15.8198C16.6787 15.4043 17.025 14.7624 17.025 14.0353C17.025 13.3081 16.69 12.6848 16.1629 12.2692L9.90932 6.0326H21.0121V0.0111335H3.53151C3.50139 0.0111335 3.47504 0.0074234 3.44868 0.0074234C1.54362 0.0074234 0 1.53598 0 3.41699C0 4.40016 0.421673 5.27945 1.09183 5.90275L1.0843 5.9213L9.10738 14.0167L1.0843 22.1752C0.459322 22.7948 0.0715338 23.6481 0.0715338 24.5904C0.0715338 26.4752 1.61516 28 3.51645 28C3.63316 28 3.74611 27.9926 3.85906 27.9815H21.0159Z" fill="#008C77" />
                <path d="M24.0918 6.38876L37.0921 13.7941L24.1407 21.5556L24.1633 27.9703L44.0799 16.9291V16.9217C45.2282 16.3095 46.0037 15.126 46 13.7718C45.9962 12.3805 45.1717 11.1822 43.9707 10.5886L24.0692 0L24.0918 6.38876Z" fill="#214B63" />
              </g>
              <defs>
                <clipPath id="clip0_914_710">
                  <rect width="46" height="28" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h1 className="hidden md:block text-3xl font-bold text-[#008C77]">Ranking</h1>
        </div>
        <div className="flex gap-4">
          <Button className="bg-[#008C77]" onClick={() => router.push("/game")}>
            Jogar Novamente
          </Button>
          <Button className="bg-[#008C77]" onClick={() => router.push("/")}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Mostra o tempo do jogador atual */}
      {currentUserId && (
        <Card className="mb-6 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#008C77]" />
                <span className="font-medium">Seu tempo:</span>
                <span className={`font-bold ${currentUserScore?.completed ? 'text-[#008C77]' : 'text-red-500'}`}>
                  {currentUserScore?.completed ? `${currentUserScore.time}s` : 'Não completou'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {currentUserScore?.completed ? 'Parabéns! Você completou o jogo!' : 'Continue tentando!'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-[#FFD700]" />
                Ranking de Jogadores
              </CardTitle>
              <CardDescription>Top 10 Melhores Pontuações</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <Chart data={chartData} onSelectUser={setSelectedUser} />
              ) : (
                <p className="text-center text-gray-500">Nenhuma pontuação registrada ainda.</p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Atualizado automaticamente a cada 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Clique em um jogador para ver suas conquistas</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold text-[#008C77] mb-4">Conquistas</h2>
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {scores
                .find(s => s.userId === selectedUser)
                ?.user.achievements?.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </motion.div>
                )) || (
                <p className="text-gray-500">Nenhuma conquista ainda</p>
              )}
            </motion.div>
          ) : (
            <p className="text-gray-500">Selecione um jogador para ver suas conquistas</p>
          )}
        </div>
      </div>
    </div>
  );
}