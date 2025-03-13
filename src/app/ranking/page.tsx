"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Score {
  id: string;
  userId: string;
  time: number | null;
  completed: boolean;
  displayTime: string;
  user: {
    name: string;
  };
}

export default function Ranking() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
    return () => clearInterval(interval);
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
        <p>Carregando...</p>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tempo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((score) => (
            <TableRow key={score.id} className={!score.completed ? "text-gray-500" : ""}>
              <TableCell>{score.user.name}</TableCell>
              <TableCell>{score.displayTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}