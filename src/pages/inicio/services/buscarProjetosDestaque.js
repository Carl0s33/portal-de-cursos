import { buscarProjetosPublicados } from '@/pages/projetos/services/buscarProjetosPublicados.js'

export async function buscarProjetosDestaque(sinal) {
  const publicados = await buscarProjetosPublicados(sinal)
  return publicados.slice(0, 2)
}

export default buscarProjetosDestaque
