import { obterEnderecoRecurso } from './enderecos.js'
import { ErroApi, requisitarApi } from './cliente.js'

export const VERSAO = ''

const obterUrlBaseProjetos = () => obterEnderecoRecurso('projetos')

export async function listarSubmissoes(token = null, sinal = null) {
  const endpoint = obterUrlBaseProjetos()
  const dados = await requisitarApi(endpoint, {
    metodo: 'GET',
    token,
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A lista de submissões recebida está em um formato inválido.', {
      status: 502,
    })
  }

  return dados
}

export async function obterSubmissaoPorId(id, token = null, sinal = null) {
  const endpoint = obterUrlBaseProjetos()
  return requisitarApi(`${endpoint}/${encodeURIComponent(id)}`, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export const moduloSubmissoes = {
  versao: VERSAO,
  listar: listarSubmissoes,
  obterPorId: obterSubmissaoPorId,
}

export default moduloSubmissoes
