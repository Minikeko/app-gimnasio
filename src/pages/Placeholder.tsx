import type { ReactNode } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'

export function Placeholder({ titulo, icono, texto }: { titulo: string; icono: ReactNode; texto: string }) {
  return (
    <>
      <PageHeader title={titulo} />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <Card className="text-center py-10">
          <div className="flex justify-center text-gray-500 mb-3">{icono}</div>
          <p className="text-gray-400 text-sm">{texto}</p>
        </Card>
      </main>
    </>
  )
}
