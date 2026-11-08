import { pegarBaseApi, chamarApi } from './cliente.js'

export const VERSAO = ''

function urlCoordenadores() {
  return `${pegarBaseApi('usuarios', VERSAO)}/coordenadores`
}

export async function listarCoordenadores(token, filtros = {}, sinal) {
  const parametros = new URLSearchParams()
  if (filtros.nome?.trim()) parametros.set('nome', filtros.nome.trim())
  if (filtros.cursoId !== undefined && filtros.cursoId !== null && filtros.cursoId !== '') {
    parametros.set('cursoId', String(filtros.cursoId))
  }
  const query = parametros.size ? `?${parametros}` : ''
  return chamarApi(`${urlCoordenadores()}/buscar${query}`, { metodo: 'GET', token, sinal })
}

export async function buscarCoordenadorPorId(token, id, sinal) {
  return chamarApi(`${urlCoordenadores()}/${encodeURIComponent(id)}`, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export async function cadastrarCoordenador(token, dados, sinal) {
  return chamarApi(urlCoordenadores(), { metodo: 'POST', corpo: dados, token, sinal })
}

export async function atualizarCoordenador(token, id, dados, sinal) {
  return chamarApi(`${urlCoordenadores()}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function atualizarMeuPerfilCoordenador(token, dados, sinal) {
  return chamarApi(`${urlCoordenadores()}/me`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirCoordenador(token, id, sinal) {
  return chamarApi(`${urlCoordenadores()}/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export const moduloCoordenadores = {
  versao: VERSAO,
  listar: listarCoordenadores,
  obterPorId: buscarCoordenadorPorId,
  cadastrar: cadastrarCoordenador,
  atualizar: atualizarCoordenador,
  atualizarMeuPerfil: atualizarMeuPerfilCoordenador,
  excluir: excluirCoordenador,
}

export default moduloCoordenadores
