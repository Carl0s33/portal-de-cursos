import { ErroApi, pegarBaseApi, chamarApi } from './cliente.js'

export const VERSAO = ''

export function formatarPerfilProfessor(item) {
  return {
    id: item.id,
    nome: item.usuario?.nome || 'Sem nome',
    email: item.usuario?.email || '',
    cursoId: item.cursoId,
    titulacao: item.titulacao || '',
    descricao: item.descricao || '',
  }
}

export async function listarProfessores(token, filtros = {}, sinal) {
  if (typeof filtros?.addEventListener === 'function' && sinal === undefined) {
    sinal = filtros
    filtros = {}
  }
  const base = pegarBaseApi('usuarios', VERSAO)
  const parametros = new URLSearchParams()
  if (filtros.nome?.trim()) parametros.set('nome', filtros.nome.trim())
  if (filtros.titulacao) parametros.set('titulacao', filtros.titulacao)
  const query = parametros.size ? `?${parametros}` : ''
  const dados = await chamarApi(`${base}/professores/buscar${query}`, {
    metodo: 'GET',
    token,
    sinal,
  })

  if (!Array.isArray(dados)) {
    throw new ErroApi('A lista de professores recebida é inválida.', { status: 502 })
  }

  return dados.map(formatarPerfilProfessor)
}

export async function buscarProfessorPorId(token, id, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/professores/${encodeURIComponent(id)}`, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export async function cadastrarProfessor(token, dados, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  const resposta = await chamarApi(`${base}/professores`, {
    metodo: 'POST',
    corpo: dados,
    token,
    sinal,
  })

  return formatarPerfilProfessor(resposta)
}

export async function excluirProfessor(token, id, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/professores/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export async function atualizarProfessor(token, id, dados, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  const resposta = await chamarApi(`${base}/professores/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
  return formatarPerfilProfessor(resposta)
}

export async function atualizarMeuPerfilProfessor(token, dados, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  const resposta = await chamarApi(`${base}/professores/me`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
  return formatarPerfilProfessor(resposta)
}

export const moduloProfessores = {
  versao: VERSAO,
  listar: listarProfessores,
  obterPorId: buscarProfessorPorId,
  cadastrar: cadastrarProfessor,
  atualizar: atualizarProfessor,
  atualizarMeuPerfil: atualizarMeuPerfilProfessor,
  excluir: excluirProfessor,
  formatarPerfil: formatarPerfilProfessor,
}

export default moduloProfessores
