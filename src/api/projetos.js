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

/**
 * Lista os projetos aprovados/publicados para o catálogo público (sem token)
 */
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

/**
 * Lista os projetos em análise pelo professor orientador
 */
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

/**
 * Lista todos os projetos acadêmicos cadastrados no microsserviço
 */
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

/**
 * Busca os dados de um projeto específico por ID
 */
export async function obterProjetoPorId(id, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return requisitarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })
}

/**
 * Cadastra um novo projeto no microsserviço de projetos
 * @param {Object} projeto - DTO com { cursoId, orientadorId, autores, disciplinaIds, nome, descricao, tipoProjeto, arquivoPdf }
 */
export async function cadastrarProjeto(projeto, token = null, sinal = null) {
  const url = obterUrlBaseProjetos()
  return requisitarApi(url, {
    metodo: 'POST',
    corpo: projeto,
    token,
    sinal,
  })
}

/**
 * Atualiza os dados de um projeto existente
 */
export async function atualizarProjeto(id, projeto, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return requisitarApi(url, {
    metodo: 'PUT',
    corpo: projeto,
    token,
    sinal,
  })
}

/**
 * Altera o status de avaliação ou publicação de um projeto (PATCH /api/v1/projetos/{id}/status)
 * @param {number|string} id
 * @param {string} status - Um dos valores de STATUS_PROJETO
 */
export async function atualizarStatusProjeto(id, status, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}/status`
  return requisitarApi(url, {
    metodo: 'PATCH',
    corpo: { statusProjeto: status },
    token,
    sinal,
  })
}

/**
 * Remove um projeto pelo ID
 */
export async function excluirProjeto(id, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(id)}`
  return requisitarApi(url, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

/**
 * Envia um arquivo PDF associado a um projeto (POST /api/projetos/{projetoId}/documentos)
 */
export async function enviarDocumentoProjeto(projetoId, arquivo, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos`
  const formData = new FormData()
  formData.append('arquivo', arquivo)

  return requisitarApi(url, {
    metodo: 'POST',
    corpo: formData,
    token,
    sinal,
  })
}

/**
 * Lista os documentos de um projeto (GET /api/projetos/{projetoId}/documentos)
 */
export async function listarDocumentosProjeto(projetoId, token = null, sinal = null) {
  const url = `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos`
  return requisitarApi(url, {
    metodo: 'GET',
    token,
    sinal,
  })
}

/**
 * Retorna a URL de download de um documento
 */
export function obterUrlDownloadDocumento(projetoId, documentoId) {
  return `${obterUrlBaseProjetos()}/${encodeURIComponent(projetoId)}/documentos/${encodeURIComponent(documentoId)}/download`
}

/**
 * Exclui um documento de um projeto (DELETE /api/projetos/{projetoId}/documentos/{documentoId})
 */
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
