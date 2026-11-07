import { pegarEnderecoRecurso } from './enderecos.js'
import { ErroApi, chamarApi } from './cliente.js'

export const VERSAO = ''

const pegarUrlBaseProjetos = () => pegarEnderecoRecurso('projetos')

export async function listarSubmissoes(token = null, sinal = null) {
  const endpoint = pegarUrlBaseProjetos()
  const dados = await chamarApi(endpoint, {
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

export async function buscarSubmissaoPorId(id, token = null, sinal = null) {
  const endpoint = pegarUrlBaseProjetos()
  return chamarApi(`${endpoint}/${encodeURIComponent(id)}`, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export const moduloSubmissoes = {
  versao: VERSAO,
  listar: listarSubmissoes,
  obterPorId: buscarSubmissaoPorId,
}

export default moduloSubmissoes
