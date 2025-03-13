"use client";

// src/app/game/page.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type CardType = { id: number; value: string; flipped: boolean; matched: boolean };

export default function Game() {
  const [cards, setCards] = useState<CardType[]>(generateCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário está logado
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/register');
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          // Quando o tempo acabar, salva com completed = false
          saveScore(60, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cards.every((card) => card.matched)) {
      const timeTaken = 60 - timeLeft;
      // Quando completar o jogo, salva com completed = true
      saveScore(timeTaken, true);
      setGameOver(true);
    }
  }, [cards, timeLeft]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || gameOver) return;
    const newCards = cards.map((card) =>
      card.id === id && !card.flipped && !card.matched ? { ...card, flipped: true } : card
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);

    if (flippedCards.length === 1) {
      const [firstCardId] = flippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === id);
      if (firstCard?.value === secondCard?.value) {
        setCards((prev) =>
          prev.map((card) => (card.id === firstCardId || card.id === id ? { ...card, matched: true } : card))
        );
      }
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) => (card.flipped && !card.matched ? { ...card, flipped: false } : card))
        );
        setFlippedCards([]);
      }, 1000);
    }
  };

  const saveScore = async (time: number, completed: boolean) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Usuário não encontrado');
      }

      console.log('Enviando score:', { userId, time, completed }); // Debug

      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId, // Não converte para número
          time,
          completed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro detalhado:', errorData); // Debug
        throw new Error('Erro ao salvar pontuação');
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);
    } catch (error) {
      console.error('Erro ao salvar pontuação:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-[#003087] mb-4">Jogo da Memória</h1>
      <p className="text-lg">Tempo restante: {timeLeft}s</p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`h-24 flex items-center justify-center cursor-pointer ${
              card.flipped || card.matched ? "bg-[#003087] text-white" : "bg-white"
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            {card.flipped || card.matched ? card.value : "?"}
          </Card>
        ))}
      </div>
      {gameOver && (
        <Button className="mt-4 bg-[#003087]" onClick={() => router.push("/ranking")}>
          Ver Ranking
        </Button>
      )}
    </div>
  );
}

function generateCards(): CardType[] {
  const values = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const doubled = [...values, ...values].sort(() => Math.random() - 0.5);
  return doubled.map((value, index) => ({
    id: index,
    value,
    flipped: false,
    matched: false,
  }));
}