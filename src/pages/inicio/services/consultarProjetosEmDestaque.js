import { consultarProjetosPublicados } from '@/pages/projetos/services/consultarProjetosPublicados.js'

export async function consultarProjetosEmDestaque(sinal) {
  const publicados = await consultarProjetosPublicados(sinal)
  return publicados.slice(0, 2)
}

export default consultarProjetosEmDestaque
