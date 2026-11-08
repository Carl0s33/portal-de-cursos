import { pegarEnderecoRecurso } from './enderecos.js'
import { ErroApi, chamarApi } from './cliente.js'

export const VERSAO = ''

export const STATUS_PROJETO = {
  EM_ANALISE: 'EM_ANALISE',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
  ANALISE_PUBLICACAO: 'ANALISE_PUBLICACAO',
  PUBLICADO: 'PUBLICADO',
  RECUSADO_PUBLICACAO: 'RECUSADO_PUBLICACAO',
  REVISAO: 'REVISAO',
}

export const TIPO_PROJETO = {
  TCC: 'TCC',
  PROJETO_INTEGRADOR: 'PROJETO_INTEGRADOR',
  PROJETO_PESQUISA: 'PROJETO_PESQUISA',
  PROJETO_EXTENSAO: 'PROJETO_EXTENSAO',
  OUTROS: 'OUTROS',
}

const pegarUrlBaseProjetos = () => pegarEnderecoRecurso('projetos')

export async function listarProjetosAprovados(sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/aprovados`
  const dados = await chamarApi(url, {
    metodo: 'GET',
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A resposta da listagem de projetos aprovados é inválida.', { status: 502 })
  }

  return dados
}

export async function listarProjetosEmAnalise(token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/em-analise`
  const dados = await chamarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A resposta da listagem de projetos em análise é inválida.', { status: 502 })
  }

  return dados
}

export async function listarProjetos(token = null, sinal = null) {
  const url = pegarUrlBaseProjetos()
  const dados = await chamarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A resposta da listagem de projetos é inválida.', { status: 502 })
  }

  return dados
}

export async function buscarProjetoPorId(id, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return chamarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export async function cadastrarProjeto(projeto, token = null, sinal = null) {
  const url = pegarUrlBaseProjetos()
  return chamarApi(url, {
    metodo: 'POST',
    corpo: projeto,
    token,
    sinal,
  })
}

export async function atualizarProjeto(id, projeto, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return chamarApi(url, {
    metodo: 'PUT',
    corpo: projeto,
    token,
    sinal,
  })
}

export async function atualizarStatusProjeto(id, status, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(id)}/status`
  return chamarApi(url, {
    metodo: 'PATCH',
    corpo: { statusProjeto: status },
    token,
    sinal,
  })
}

export async function encaminharProjetoParaCoordenacao(id, token = null, sinal = null) {
  let projeto = await buscarProjetoPorId(id, token, sinal)
  let status = projeto.statusProjeto

  if (status === 'EM_ANALISE') {
    projeto = await atualizarStatusProjeto(id, 'APROVADO', token, sinal)
    status = projeto.statusProjeto
  }

  if (status === 'APROVADO') {
    projeto = await atualizarStatusProjeto(id, 'ANALISE_PUBLICACAO', token, sinal)
    status = projeto.statusProjeto
  }

  if (status !== 'ANALISE_PUBLICACAO') {
    throw new ErroApi('O projeto não pôde ser encaminhado para avaliação da coordenação.', {
      status: 409,
    })
  }

  return projeto
}

export async function excluirProjeto(id, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return chamarApi(url, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export async function enviarDocumentoProjeto(projetoId, arquivo, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos`
  const formData = new FormData()
  formData.append('arquivo', arquivo)

  return chamarApi(url, { metodo: 'POST', corpo: formData, token, sinal })
}

export async function listarDocumentosProjeto(projetoId, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos`
  return chamarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export function pegarUrlDownload(projetoId, documentoId) {
  return `${pegarUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos/${encodeURIComponent(documentoId)}/download`
}

export async function baixarDocumentoBlob(projetoId, documentoId, token = null, sinal = null) {
  const url = pegarUrlDownload(projetoId, documentoId)
  const blob = await chamarApi(url, {
    token,
    sinal,
    formatoResposta: 'blob',
    headers: { Accept: 'application/octet-stream' },
  })
  return window.URL.createObjectURL(blob)
}

export async function excluirDocumentoProjeto(projetoId, documentoId, token = null, sinal = null) {
  const url = `${pegarUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos/${encodeURIComponent(documentoId)}`
  return chamarApi(url, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export const moduloProjetos = {
  versao: VERSAO,
  listarAprovados: listarProjetosAprovados,
  listarEmAnalise: listarProjetosEmAnalise,
  listar: listarProjetos,
  obterPorId: buscarProjetoPorId,
  cadastrar: cadastrarProjeto,
  atualizar: atualizarProjeto,
  atualizarStatus: atualizarStatusProjeto,
  encaminharParaCoordenacao: encaminharProjetoParaCoordenacao,
  excluir: excluirProjeto,
  enviarDocumento: enviarDocumentoProjeto,
  listarDocumentos: listarDocumentosProjeto,
  obterUrlDownload: pegarUrlDownload,
  excluirDocumento: excluirDocumentoProjeto,
}

export default moduloProjetos
