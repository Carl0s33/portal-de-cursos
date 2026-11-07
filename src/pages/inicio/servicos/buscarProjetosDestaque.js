import { buscarProjetosPublicados } from '@/pages/projetos/servicos/buscarProjetosPublicados.js'

export async function buscarProjetosDestaque(sinal) {
  const publicados = await buscarProjetosPublicados(sinal)
  return publicados
}

export default buscarProjetosDestaque
