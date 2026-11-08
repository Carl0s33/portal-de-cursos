import { pegarEnderecoRecurso } from './enderecos.js'
import { chamarApi } from './cliente.js'

export const VERSAO = ''
const enderecoDisciplinas = pegarEnderecoRecurso('disciplinas')

export async function listarDisciplinasPorCurso(cursoId, token, sinal) {
  const query = new URLSearchParams({ cursoId: String(cursoId) })
  const dados = await chamarApi(`${enderecoDisciplinas}?${query}`, {
    metodo: 'GET',
    token,
    sinal,
  })
  if (!Array.isArray(dados)) return []
  const semestres = [
    'PRIMEIRO',
    'SEGUNDO',
    'TERCEIRO',
    'QUARTO',
    'QUINTO',
    'SEXTO',
    'SETIMO',
    'OITAVO',
    'NONO',
    'DECIMO',
  ]
  return dados.map((disciplina) => ({
    ...disciplina,
    cursoId: disciplina.cursoId ?? Number(cursoId),
    identificador: String(disciplina.id),
    semestreNumero: semestres.indexOf(disciplina.semestre) + 1,
    tipo: disciplina.obrigatoria ? 'Obrigatória' : 'Optativa',
  }))
}

export async function filtrarDisciplinas(filtros = {}, token, sinal) {
  const query = new URLSearchParams()
  if (filtros.cursoId) query.set('cursoId', String(filtros.cursoId))
  if (filtros.semestre) query.set('semestre', String(filtros.semestre))
  if (filtros.obrigatoria !== undefined && filtros.obrigatoria !== null) {
    query.set('obrigatoria', String(filtros.obrigatoria))
  }
  const dados = await chamarApi(`${enderecoDisciplinas}/filtros?${query}`, {
    metodo: 'GET',
    token,
    sinal,
  })
  if (!Array.isArray(dados)) return []
  return dados
}

export async function cadastrarDisciplina(token, dados, sinal) {
  return chamarApi(enderecoDisciplinas, { metodo: 'POST', corpo: dados, token, sinal })
}

export async function atualizarDisciplina(token, id, dados, sinal) {
  return chamarApi(`${enderecoDisciplinas.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirDisciplina(token, id, sinal) {
  return chamarApi(`${enderecoDisciplinas.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export const moduloDisciplinas = {
  versao: VERSAO,
  listarPorCurso: listarDisciplinasPorCurso,
  filtrar: filtrarDisciplinas,
  cadastrar: cadastrarDisciplina,
  atualizar: atualizarDisciplina,
  excluir: excluirDisciplina,
}

export default moduloDisciplinas
