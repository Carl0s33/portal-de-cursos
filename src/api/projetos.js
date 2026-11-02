import { ErroApi, requisitarApi } from './cliente.js'

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

function obterUrlBaseProjetos() {
  const custom = import.meta.env.VITE_API_PROJETOS_URL
  if (custom) {
    return custom.replace(/\/$/, '')
  }
  const basePortal = import.meta.env.BASE_URL || '/'
  const baseLimpa = basePortal.endsWith('/') ? basePortal : `${basePortal}/`
  const segmentoVersao = VERSAO ? `${VERSAO}/` : ''
  return `${window.location.origin}${baseLimpa}api/${segmentoVersao}projetos`
}

export async function listarProjetosAprovados(sinal = null) {
  const url = `${obterUrlBaseProjetos()}/aprovados`
  const dados = await requisitarApi(url, {
    metodo: 'GET',
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A resposta da listagem de projetos aprovados é inválida.', { status: 502 })
  }

  return dados
}

export async function listarProjetosEmAnalise(token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/em-analise`
  const dados = await requisitarApi(url, {
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
  const url = obterUrlBaseProjetos()
  const dados = await requisitarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A resposta da listagem de projetos é inválida.', { status: 502 })
  }

  return dados
}

export async function obterProjetoPorId(id, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return requisitarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export async function cadastrarProjeto(projeto, token = null, sinal = null) {
  const url = obterUrlBaseProjetos()
  return requisitarApi(url, {
    metodo: 'POST',
    corpo: projeto,
    token,
    sinal,
  })
}

export async function atualizarProjeto(id, projeto, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return requisitarApi(url, {
    metodo: 'PUT',
    corpo: projeto,
    token,
    sinal,
  })
}

export async function atualizarStatusProjeto(id, status, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}/status`
  return requisitarApi(url, {
    metodo: 'PATCH',
    corpo: { statusProjeto: status },
    token,
    sinal,
  })
}

export async function excluirProjeto(id, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return requisitarApi(url, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export async function enviarDocumentoProjeto(projetoId, arquivo, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos`
  const formData = new FormData()
  formData.append('arquivo', arquivo)

  const resposta = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: sinal,
  })
  if (!resposta.ok) {
    throw new ErroApi('Não foi possível enviar o documento.', { status: resposta.status })
  }
  return resposta.json()
}

export async function listarDocumentosProjeto(projetoId, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos`
  return requisitarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export function obterUrlDownloadDocumento(projetoId, documentoId) {
  return `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos/${encodeURIComponent(documentoId)}/download`
}

export async function baixarDocumentoBlob(projetoId, documentoId, token = null, sinal = null) {
  const url = obterUrlDownloadDocumento(projetoId, documentoId)
  const cabecalhos = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const resposta = await fetch(url, {
    method: 'GET',
    headers: cabecalhos,
    signal: sinal,
  })

  if (!resposta.ok) {
    throw new ErroApi('Não foi possível obter o documento.', { status: resposta.status })
  }

  const blob = await resposta.blob()
  return window.URL.createObjectURL(blob)
}

export async function excluirDocumentoProjeto(projetoId, documentoId, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos/${encodeURIComponent(documentoId)}`
  return requisitarApi(url, {
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
  obterPorId: obterProjetoPorId,
  cadastrar: cadastrarProjeto,
  atualizar: atualizarProjeto,
  atualizarStatus: atualizarStatusProjeto,
  excluir: excluirProjeto,
  enviarDocumento: enviarDocumentoProjeto,
  listarDocumentos: listarDocumentosProjeto,
  obterUrlDownload: obterUrlDownloadDocumento,
  excluirDocumento: excluirDocumentoProjeto,
}

export default moduloProjetos
