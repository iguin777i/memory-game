import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, role, company, generateNewPassword } = await request.json()
    
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        scores: {
          orderBy: {
            time: 'asc'
          },
          take: 1,
          where: {
            completed: true
          }
        }
      }
    })

    // Se o usuário existe e está solicitando uma nova senha
    if (existingUser && generateNewPassword) {
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      const randomNumbers = Math.floor(Math.random() * 100).toString().padStart(2, '0')
      const newPassword = `${randomLetter}-${randomNumbers}`

      // Atualiza a senha do usuário
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: newPassword }
      })

      return NextResponse.json({ 
        success: true,
        password: newPassword,
        userId: updatedUser.id,
        isExisting: true
      })
    }

    // Se o usuário existe e uma senha foi fornecida
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário já existe',
        isExisting: true
      }, { status: 409 })
    }

    // Se o usuário não existe, cria um novo
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const randomNumbers = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    const generatedPassword = `${randomLetter}-${randomNumbers}`

    const user = await prisma.user.create({
      data: { name, email, role, company, password: generatedPassword },
    })

    return NextResponse.json({ 
      success: true, 
      password: generatedPassword,
      userId: user.id,
      isExisting: false
    })

  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a requisição'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
