"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const socket = io({
      path: '/api/socket',
    });

    socket.on('scoreUpdate', (newScores) => {
      setScores(prev => {
        // Anima quando um jogador ultrapassa outro
        const changes = newScores.map((score: Score, index: number) => {
          const oldIndex = prev.findIndex(s => s.id === score.id);
          return { score, oldIndex, newIndex: index };
        });
        return newScores;
      });
    });

    const fetchScores = async () => {
      try {
        const response = await fetch('/api/scores');
        const data = await response.json();
        setScores(data);
      } catch (error) {
        console.error('Erro ao buscar pontuações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();

    // Atualiza o ranking a cada 5 segundos
    const interval = setInterval(fetchScores, 5000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-[#003087]">Ranking</h1>
          <Button 
            className="bg-[#003087]" 
            onClick={() => router.push("/")}
          >
            Voltar
          </Button>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg"
        >
          Carregando...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#003087]">Ranking</h1>
        <div className="flex gap-4">
          <Button 
            className="bg-[#003087]" 
            onClick={() => router.push("/game")}
          >
            Jogar Novamente
          </Button>
          <Button 
            className="bg-[#003087]" 
            onClick={() => router.push("/")}
          >
            Voltar
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {scores.map((score, index) => (
                  <motion.tr
                    key={score.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      cursor-pointer
                      ${!score.completed ? "text-gray-500" : ""}
                      ${index < 3 ? "bg-[#003087] bg-opacity-10" : ""}
                      ${selectedUser === score.userId ? "bg-blue-100" : ""}
                    `}
                    onClick={() => setSelectedUser(score.userId)}
                  >
                    <TableCell>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {score.user.name}
                      {score.user.achievements?.map((achievement, i) => (
                        <span key={i} className="ml-2" title={achievement.description}>
                          {achievement.icon}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>{score.displayTime}</TableCell>
                    <TableCell>{score.points}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold text-[#003087] mb-4">Conquistas</h2>
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