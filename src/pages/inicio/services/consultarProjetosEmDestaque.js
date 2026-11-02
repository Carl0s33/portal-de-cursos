import { consultarProjetosPublicados } from '@/pages/projetos/services/consultarProjetosPublicados.js'

export async function consultarProjetosEmDestaque(sinal) {
  const publicados = await consultarProjetosPublicados(sinal)
  return publicados.slice(0, 3)
}

export default consultarProjetosEmDestaque
