import { listarProjetos, buscarProjetoPorId } from './projetos.js'

export const VERSAO = ''

// Aliases mantidos para compatibilidade; as chamadas ficam centralizadas em projetos.js.
export const listarSubmissoes = listarProjetos
export const buscarSubmissaoPorId = buscarProjetoPorId

export const moduloSubmissoes = {
  versao: VERSAO,
  listar: listarSubmissoes,
  obterPorId: buscarSubmissaoPorId,
}

export default moduloSubmissoes
