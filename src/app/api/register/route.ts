import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()
    
    // Gera uma letra maiúscula aleatória (A-Z)
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    // Gera dois números aleatórios (00-99)
    const randomNumbers = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    const generatedPassword = `${randomLetter}-${randomNumbers}`

    const user = await prisma.user.create({
      data: { name, email, phone, password: generatedPassword },
    })

    // Fecha a conexão após a operação
    await prisma.$disconnect()

    return NextResponse.json({ 
      success: true, 
      password: generatedPassword,
      userId: user.id
    })
  } catch (error) {
    console.error('Erro:', error)
    // Fecha a conexão mesmo em caso de erro
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar usuário' 
    }, { status: 500 })
  }
}
