interface GameStats {
  time: number;
  completed: boolean;
  mistakes: number;
}

interface Achievement {
  name: string;
  description: string;
  icon: string;
}

export async function checkAchievements(userId: string, stats: GameStats): Promise<Achievement[]> {
  const achievements: Achievement[] = [];

  if (stats.completed && stats.time <= 30) {
    achievements.push({
      name: "Velocista",
      description: "Completou o jogo em menos de 30 segundos",
      icon: "⚡"
    });
  }

  if (stats.completed && stats.mistakes === 0) {
    achievements.push({
      name: "Memória Perfeita",
      description: "Completou o jogo sem erros",
      icon: "🎯"
    });
  }

  return achievements;
}

export function calculatePoints(time: number, achievements: Achievement[]): number {
  // Base points: 1000 - (time * 10)
  let points = 1000 - (time * 10);
  
  // Bonus points for achievements (100 points each)
  points += achievements.length * 100;
  
  // Ensure minimum points is 0
  return Math.max(0, Math.round(points));
}