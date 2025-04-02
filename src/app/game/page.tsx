// Indica que este é um componente do lado do cliente
"use client";

// Importações necessárias do React e Next.js
import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Image from "next/image";

// Define o tipo de uma carta do jogo
type CardType = { id: number; value: string; flipped: boolean; matched: boolean };

// Mapeamento de valores para imagens PNG
const cardImages: { [key: string]: string } = {
  'A': '/peças - jogo interativo/peças_Gestão estratégica.png',
  'B': '/peças - jogo interativo/peças_Cloud .png',
  'C': '/peças - jogo interativo/peças_Paperless1.png',
  'D': '/peças - jogo interativo/peças_Transformação digital .png',
  'E': '/peças - jogo interativo/peças_Faturamento.png',
  'F': '/peças - jogo interativo/peças_Conexão.png',
  'G': '/peças - jogo interativo/peças_Interoperabilidade .png',
  'H': '/peças - jogo interativo/peças_Saúde digital.png'
};

// Função para pré-carregar as imagens
function preloadImages() {
  Object.values(cardImages).forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });
}

// Função para gerar as cartas do jogo em ordem fixa
function generateCards(): CardType[] {
  const values = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const doubled = [...values, ...values];
  return doubled.map((value, index) => ({
    id: index,
    value,
    flipped: false,
    matched: false,
  }));
}

// Componente principal do jogo
export default function Game() {
  // Estados do jogo
  const [cards, setCards] = useState<CardType[]>(generateCards()); // Array de cartas
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // IDs das cartas viradas
  const [timeLeft, setTimeLeft] = useState(60); // Tempo restante em segundos
  const [gameOver, setGameOver] = useState(false); // Estado de fim de jogo
  const [isChecking, setIsChecking] = useState(false); // Estado de verificação de cartas
  const [scoreSaved, setScoreSaved] = useState(false); // Estado de salvamento da pontuação
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

  // Referências para timers e sons
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Timer para virar cartas
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Timer do jogo
  const matchSoundRef = useRef<HTMLAudioElement | null>(null); // Som de match
  const tickRef = useRef<HTMLAudioElement | null>(null); // Som do relógio
  const alarmRef = useRef<HTMLAudioElement | null>(null); // Som do alarme
  const router = useRouter();

  // Função para embaralhar cartas
  const shuffleCards = useCallback(() => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, []);

  // Shuffle cards on client-side only
  useEffect(() => {
    shuffleCards();
  }, [shuffleCards]);

  // Pré-carrega as imagens ao montar o componente
  useEffect(() => {
    preloadImages();
  }, []);

  // Função para salvar a pontuação do jogador
  const saveScore = useCallback(async (time: number, completed: boolean) => {
    try {
      // Verifica se o usuário está logado
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('UserId não encontrado no localStorage');
        router.push('/register');
        return;
      }

      // Prepara os dados da pontuação
      const scoreData = {
        userId,
        time: Number(time.toFixed(1)),
        completed,
        mistakes: 0
      };

      // Envia a pontuação para a API
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      // Trata erros da API
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar pontuação');
      }

      // Redireciona para a página de ranking
      setIsLoading(true);
      setTimeout(() => {
        router.push("/ranking");
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar pontuação:', error);
    }
  }, [router]);

  // Verifica se o usuário está logado ao iniciar
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/register');
    }
  }, [router]);

  // Timer do jogo
  useEffect(() => {
    if (gameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    // Atualiza o tempo a cada segundo
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setGameOver(true);
          if (!scoreSaved) {
            setScoreSaved(true);
            saveScore(60, false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpa o timer ao desmontar o componente
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameOver, saveScore]);

  // Verifica se todas as cartas foram combinadas
  useEffect(() => {
    if (cards.every((card) => card.matched) && !scoreSaved) {
      const timeTaken = 60 - timeLeft;
      setGameOver(true);
      setScoreSaved(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      saveScore(timeTaken, true).then(() => {
        setIsLoading(true);
        setTimeout(() => {
          router.push("/ranking");
        }, 1500);
      });
    }
  }, [cards, timeLeft, router, saveScore]);

  // Inicializa os sons do jogo
  useEffect(() => {
    matchSoundRef.current = new Audio('/select-sound-121244.mp3');
    tickRef.current = new Audio('/ticking-clock-1-wav-edition-264449.mp3');
    alarmRef.current = new Audio('/alarm-sound-37359.mp3');
    
    // Configura os volumes e carrega os sons
    if (matchSoundRef.current) {
      matchSoundRef.current.volume = 1.0;
      matchSoundRef.current.load();
    }

    if (tickRef.current) {
      tickRef.current.loop = true;
      tickRef.current.volume = 0.2;
      tickRef.current.play().catch(() => console.log('Aguardando interação do usuário para tocar o som'));
    }
    
    // Limpa os sons ao desmontar o componente
    return () => {
      if (matchSoundRef.current) {
        matchSoundRef.current.pause();
        matchSoundRef.current.currentTime = 0;
      }
      if (tickRef.current) {
        tickRef.current.pause();
        tickRef.current.currentTime = 0;
      }
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
      }
    };
  }, []);

  // Gerencia os sons baseado no tempo
  useEffect(() => {
    if (gameOver || timeLeft === 0) {
      if (tickRef.current) {
        tickRef.current.pause();
        tickRef.current.currentTime = 0;
      }
      if (timeLeft === 0 && alarmRef.current) {
        alarmRef.current.play().catch(() => console.log('Erro ao tocar alarme'));
      }
    }
  }, [timeLeft, gameOver]);

  // Função para lidar com o clique nas cartas
  const handleCardClick = useCallback((id: number) => {
    if (flippedCards.length === 2 || gameOver || isChecking) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Vira a carta clicada
    const newCards = cards.map((card) =>
      card.id === id && !card.flipped && !card.matched ? { ...card, flipped: true } : card
    );
    setCards(newCards);
    
    // Atualiza as cartas viradas
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Verifica se há duas cartas viradas
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === secondCardId);

      // Verifica se as cartas combinam
      if (firstCard?.value === secondCard?.value) {
        setCards((prev) =>
          prev.map((card) => (card.id === firstCardId || card.id === secondCardId ? { ...card, matched: true } : card))
        );
        // Toca o som de match
        if (matchSoundRef.current) {
          try {
            matchSoundRef.current.currentTime = 0;
            const playPromise = matchSoundRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => {
                console.error('Erro ao tocar som de match:', e);
                setTimeout(() => matchSoundRef.current?.play(), 100);
              });
            }
          } catch (error) {
            console.error('Erro ao tocar som de match:', error);
          }
        }
        setIsChecking(false);
        setFlippedCards([]);
      } else {
        // Vira as cartas de volta se não combinarem
        timeoutRef.current = setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.flipped && !card.matched ? { ...card, flipped: false } : card))
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, gameOver, isChecking]);

  // Renderização do componente
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-2 md:p-10">
      {isLoading && <LoadingScreen />}
      <h1 className="text-2xl md:text-3xl font-bold text-[#003087] mb-2 md:mb-4">Jogo da Memória</h1>
      <p className={`text-base md:text-lg mb-2 md:mb-6 ${timeLeft <= 10 ? 'text-red-600 font-bold animate-pulse' : ''}`}>
        Tempo restante: {timeLeft}s
      </p>
      {/* Grid de cartas */}
      <div className="grid grid-cols-4 gap-1 md:gap-6 mt-2 md:mt-4 w-[98%] md:w-full md:max-w-4xl mx-auto">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`aspect-square w-full md:max-w-[160px] cursor-pointer transition-all duration-300 transform hover:scale-105 perspective-1000 p-0 ${
              isChecking ? "pointer-events-none" : ""
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              card.flipped || card.matched ? 'rotate-y-180' : ''
            }`}>
              {/* Frente da carta (logo) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg flex items-center justify-center p-4">
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
              {/* Verso da carta (imagem) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                <div className="w-full h-full">
                  <Image
                    src={cardImages[card.value]}
                    alt={`Card ${card.value}`}
                    fill
                    className="object-contain rounded-lg"
                    onError={(e) => {
                      console.error(`Erro ao carregar imagem: ${cardImages[card.value]}`);
                      e.currentTarget.src = '/placeholder.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Estilos CSS globais */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
} 