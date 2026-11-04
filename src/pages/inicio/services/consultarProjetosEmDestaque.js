import { consultarProjetosPublicados } from '@/pages/projetos/services/consultarProjetosPublicados.js'

export async function consultarProjetosEmDestaque(sinal) {
  const publicados = await consultarProjetosPublicados(sinal)
  // Retorna os mais recentes primeiro (ordenados por id decrescente)
  const ordenados = [...publicados].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
  return ordenados.slice(0, 6)
}

export default consultarProjetosEmDestaque
