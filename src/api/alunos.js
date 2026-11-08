import { pegarBaseApi, chamarApi } from './cliente.js'

export const VERSAO = ''

function urlAlunos() {
  return `${pegarBaseApi('usuarios', VERSAO)}/alunos`
}

export async function listarAlunos(token, filtros = {}, sinal) {
  const parametros = new URLSearchParams()
  if (filtros.nome?.trim()) parametros.set('nome', filtros.nome.trim())
  if (filtros.cursoId !== undefined && filtros.cursoId !== null && filtros.cursoId !== '') {
    parametros.set('cursoId', String(filtros.cursoId))
  }
  const query = parametros.size ? `?${parametros}` : ''
  return chamarApi(`${urlAlunos()}/buscar${query}`, { metodo: 'GET', token, sinal })
}

export async function buscarAlunoPorId(token, id, sinal) {
  return chamarApi(`${urlAlunos()}/${encodeURIComponent(id)}`, { metodo: 'GET', token, sinal })
}

export async function cadastrarAluno(dados, sinal) {
  return chamarApi(urlAlunos(), { metodo: 'POST', corpo: dados, sinal })
}

export async function atualizarAluno(token, id, dados, sinal) {
  return chamarApi(`${urlAlunos()}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function atualizarMeuPerfilAluno(token, dados, sinal) {
  return chamarApi(`${urlAlunos()}/me`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirAluno(token, id, sinal) {
  return chamarApi(`${urlAlunos()}/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export const moduloAlunos = {
  versao: VERSAO,
  listar: listarAlunos,
  obterPorId: buscarAlunoPorId,
  cadastrar: cadastrarAluno,
  atualizar: atualizarAluno,
  atualizarMeuPerfil: atualizarMeuPerfilAluno,
  excluir: excluirAluno,
}

export default moduloAlunos
