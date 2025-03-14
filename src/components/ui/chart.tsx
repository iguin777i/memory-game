"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LabelList, Tooltip } from "recharts"

interface ChartDataItem {
  name: string;
  points: number;
  time: number;
  achievements: number;
  position: number;
  fill: string;
  userId: string;
}

interface ChartProps {
  data: ChartDataItem[]
  onSelectUser: (userId: string) => void
}

export function Chart({ data, onSelectUser }: ChartProps) {
  // Altura fixa de 600px para garantir que todos os 10 colocados apareçam
  return (
    <ResponsiveContainer width="100%" height={600}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 10 }}>
        <XAxis 
          type="number" 
          domain={[0, 1000]}
          hide 
        />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value, index) => {
            const position = index + 1
            const medal = position <= 3 ? ["🥇", "🥈", "🥉"][index] : `${position}.`
            return `${medal} ${value}`
          }}
        />
        <Bar
          dataKey="points"
          fill="#003087"
          radius={[0, 4, 4, 0]}
          className="cursor-pointer"
          onClick={(data: ChartDataItem) => onSelectUser(data.userId)}
          minPointSize={5}
        >
          <LabelList
            dataKey="time"
            position="right"
            formatter={(value: number) => value > 0 ? `${value.toFixed(1)}s` : "Não completou"}
            style={{ fill: "#666", fontSize: "12px" }}
          />
        </Bar>
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null

            const data = payload[0].payload as ChartDataItem

            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{data.name}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {data.time > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span>Pontos:</span>
                          <span className="font-medium">{data.points}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Tempo:</span>
                          <span className="font-medium">{data.time.toFixed(1)}s</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">Jogo não completado</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>Conquistas:</span>
                      <span className="font-medium">{data.achievements} 🏆</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
} 