import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
      <p className="mb-4">A página que você está procurando não existe.</p>
      <Link 
        href="/register" 
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Voltar para o início
      </Link>
    </div>
  )
}