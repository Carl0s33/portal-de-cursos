import { ErroApi, requisitarApi } from './cliente.js'

export const VERSAO = ''

const enderecoCursos =
  import.meta.env.VITE_API_CURSOS_URL ||
  import.meta.env.VITE_API_CURSOS ||
  `${import.meta.env.BASE_URL}api/cursos`
const enderecoDisciplinas =
  import.meta.env.VITE_API_DISCIPLINAS_URL ||
  import.meta.env.VITE_API_DISCIPLINAS ||
  `${import.meta.env.BASE_URL}api/disciplinas`
const enderecoCampus = `${import.meta.env.BASE_URL}api/campus`
const enderecoAreas = `${import.meta.env.BASE_URL}api/areas-conhecimento`

const rotulos = {
  grau: {
    TECNOLOGO: 'Tecnologia',
    BACHARELADO: 'Bacharelado',
    LICENCIATURA: 'Licenciatura',
    SUBSEQUENTE: 'Subsequente',
  },
  modalidade: { PRESENCIAL: 'Presencial', EAD: 'A distância', HIBRIDO: 'Híbrida' },
  turno: {
    MATUTINO: 'Matutino',
    VESPERTINO: 'Vespertino',
    NOTURNO: 'Noturno',
    MATUTINO_VESPERTINO: 'Matutino e vespertino',
  },
}

function rotuloDoEnum(valor, tipo) {
  if (!valor) return ''
  return rotulos[tipo][valor] || valor
}

function criarIdentificador(acronimo = '') {
  return acronimo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapearCurso(curso) {
  const semestres = Number(curso.duracao?.match(/\d+/)?.[0]) || 0
  const componentes = (curso.qtdDisciplinasObrigatorias || 0) + (curso.qtdDisciplinasOptativas || 0)
  return {
    ...curso,
    identificador: criarIdentificador(curso.acronimo),
    sigla: curso.acronimo,
    grau: rotuloDoEnum(curso.grau, 'grau'),
    modalidade: rotuloDoEnum(curso.modalidade, 'modalidade'),
    turno: rotuloDoEnum(curso.turno, 'turno'),
    campus: curso.campusNome,
    area: curso.areaNome,
    semestres,
    cargaHorariaValor: curso.cargaHoraria,
    cargaHoraria: curso.cargaHoraria ? `${curso.cargaHoraria.toLocaleString('pt-BR')} h` : null,
    componentes,
    obrigatorias: curso.qtdDisciplinasObrigatorias,
    optativas: curso.qtdDisciplinasOptativas,
    anos: semestres ? `${semestres / 2} anos letivos` : null,
    grade: [],
  }
}

function mapearDisciplina(disciplina) {
  const ordemSemestres = [
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
  const semestre = Number(disciplina.semestre) || ordemSemestres.indexOf(disciplina.semestre) + 1
  return {
    ...disciplina,
    semestre,
    obrigatoria: Boolean(disciplina.obrigatoria),
    tipo: disciplina.obrigatoria ? 'Obrigatória' : 'Optativa',
  }
}

async function requisitarCursos(sinal) {
  const cursos = []
  let pagina = 0
  let totalPaginas = 1

  while (pagina < totalPaginas) {
    const separador = enderecoCursos.includes('?') ? '&' : '?'
    const dados = await requisitarApi(
      `${enderecoCursos}${separador}page=${pagina}&size=100&sort=nome,asc`,
      {
        metodo: 'GET',
        sinal,
      },
    )

    if (Array.isArray(dados)) {
      cursos.push(...dados)
      break
    }
    if (!Array.isArray(dados?.content) || !Number.isInteger(dados.totalPages)) {
      throw new ErroApi('O catálogo recebido está em um formato inválido.', { status: 502 })
    }
    cursos.push(...dados.content)
    totalPaginas = dados.totalPages
    pagina += 1
  }

  return cursos.map(mapearCurso)
}

export async function listarCursos(sinal) {
  return requisitarCursos(sinal)
}

export async function obterCursoPorId(identificador, sinal) {
  const cursos = await requisitarCursos(sinal)
  const resumo = cursos.find((curso) => curso.identificador === identificador)
  if (!resumo) throw new ErroApi('Curso não encontrado.', { status: 404 })

  const [dadosCurso, disciplinas] = await Promise.all([
    requisitarApi(`${enderecoCursos.replace(/\/$/, '')}/${encodeURIComponent(resumo.id)}`, {
      metodo: 'GET',
      sinal,
    }),
    requisitarApi(
      `${enderecoDisciplinas}${enderecoDisciplinas.includes('?') ? '&' : '?'}cursoId=${encodeURIComponent(resumo.id)}`,
      { metodo: 'GET', sinal },
    ),
  ])

  if (!dadosCurso || dadosCurso.id !== resumo.id || !Array.isArray(disciplinas)) {
    throw new ErroApi('Os dados do curso estão em um formato inválido.', { status: 502 })
  }

  return { ...mapearCurso(dadosCurso), grade: disciplinas.map(mapearDisciplina) }
}

export async function cadastrarCurso(token, dados, sinal) {
  return requisitarApi(enderecoCursos, { metodo: 'POST', corpo: dados, token, sinal })
}

export async function atualizarCurso(token, id, dados, sinal) {
  return requisitarApi(`${enderecoCursos.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirCurso(token, id, sinal) {
  return requisitarApi(`${enderecoCursos.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export async function listarCampus(sinal) {
  return requisitarApi(enderecoCampus, { metodo: 'GET', sinal })
}

export async function cadastrarCampus(token, dados, sinal) {
  return requisitarApi(enderecoCampus, { metodo: 'POST', corpo: dados, token, sinal })
}

export async function atualizarCampus(token, id, dados, sinal) {
  return requisitarApi(`${enderecoCampus.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirCampus(token, id, sinal) {
  return requisitarApi(`${enderecoCampus.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export async function listarAreasConhecimento(sinal) {
  return requisitarApi(enderecoAreas, { metodo: 'GET', sinal })
}

export async function cadastrarAreaConhecimento(token, dados, sinal) {
  return requisitarApi(enderecoAreas, { metodo: 'POST', corpo: dados, token, sinal })
}

export async function atualizarAreaConhecimento(token, id, dados, sinal) {
  return requisitarApi(`${enderecoAreas.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirAreaConhecimento(token, id, sinal) {
  return requisitarApi(`${enderecoAreas.replace(/\/$/, '')}/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export const moduloCursos = {
  versao: VERSAO,
  listar: listarCursos,
  obterPorId: obterCursoPorId,
  cadastrar: cadastrarCurso,
  atualizar: atualizarCurso,
  excluir: excluirCurso,
  listarCampus,
  cadastrarCampus,
  atualizarCampus,
  excluirCampus,
  listarAreas: listarAreasConhecimento,
  cadastrarArea: cadastrarAreaConhecimento,
  atualizarArea: atualizarAreaConhecimento,
  excluirArea: excluirAreaConhecimento,
}

export default moduloCursos
