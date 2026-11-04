import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '@/api/professores.js'
import {
  listarProjetos,
  listarProjetosAprovados,
  obterProjetoPorId,
  listarDocumentosProjeto,
} from '@/api/projetos.js'

const CHAVE_CACHE_PUBLICADOS = 'portal-cursos-publicados-cache'

const ROTULOS_TIPO = {
  TCC: 'Trabalho de Conclusão de Curso (TCC)',
  PROJETO_INTEGRADOR: 'Projeto Integrador',
  PROJETO_PESQUISA: 'Projeto de Pesquisa',
  PROJETO_EXTENSAO: 'Projeto de Extensão',
  OUTROS: 'Outros Projetos Acadêmicos',
}

function obterTokenSessao() {
  try {
    const salva = JSON.parse(sessionStorage.getItem('portal-cursos-sessao') || 'null')
    return salva && Date.now() < salva.expiraEm ? salva.token : null
  } catch {
    return null
  }
}

function lerCachePublicados() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_CACHE_PUBLICADOS) || '[]')
    return Array.isArray(bruto) ? bruto : []
  } catch {
    return []
  }
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function formatarDataExtenso(dataIso) {
  if (!dataIso) return ''
  const [ano, mes, dia] = String(dataIso).split('T')[0].split('-').map(Number)
  if (!ano || !mes || !dia || mes > 12) return String(dataIso)
  return `${dia} de ${MESES[mes - 1].toLocaleLowerCase('pt-BR')} de ${ano}`
}

function formatarDataBR(dataIso) {
  if (!dataIso) return ''
  try {
    const dataLimpa = String(dataIso).split('T')[0]
    const partes = dataLimpa.split('-')
    if (partes.length === 3) {
      const [ano, mes, dia] = partes
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`
    }
    return new Date(dataIso).toLocaleDateString('pt-BR')
  } catch {
    return String(dataIso)
  }
}

function extrairExtensao(nomeArquivo = '') {
  const partes = nomeArquivo.split('.')
  if (partes.length > 1) {
    return partes.pop().toUpperCase()
  }
  return 'PDF'
}

export async function consultarDetalhesProjeto(identificador, sinal = null) {
  const token = obterTokenSessao()
  const idProjeto = identificador

  // 1. Tentar obter o projeto pela API de projetos por ID
  let projetoBruto = null
  let documentosBrutos = []

  try {
    const [projetoRes, docsRes] = await Promise.all([
      obterProjetoPorId(idProjeto, token, sinal),
      listarDocumentosProjeto(idProjeto, token, sinal).catch(() => []),
    ])
    projetoBruto = projetoRes
    documentosBrutos = Array.isArray(docsRes) ? docsRes : []
  } catch (erroPrincipal) {
    // Se a chamada direta falhar ou der erro, tentar o cache de publicados
    const cache = lerCachePublicados()
    const doCache = cache.find(
      (item) =>
        String(item.id) === String(idProjeto) ||
        String(item.identificador) === String(idProjeto),
    )

    if (doCache) {
      projetoBruto = doCache
      documentosBrutos = doCache.documentos || []
    } else {
      try {
        const publicados = await listarProjetosAprovados(sinal).catch(() =>
          listarProjetos(token, sinal),
        )
        const encontrado = (Array.isArray(publicados) ? publicados : []).find(
          (p) => String(p.id) === String(idProjeto),
        )
        if (encontrado) {
          projetoBruto = encontrado
          documentosBrutos = encontrado.documentos || []
        } else {
          const err404 = new Error('Projeto não encontrado')
          err404.status = 404
          throw err404
        }
      } catch (errFallback) {
        if (errFallback.status === 404) throw errFallback
        if (erroPrincipal.status === 404) throw erroPrincipal
        throw erroPrincipal || errFallback
      }
    }
  }

  if (!projetoBruto) {
    const err = new Error('Projeto não encontrado')
    err.status = 404
    throw err
  }

  // Mesclar documentos do projeto se houver no payload principal
  if (Array.isArray(projetoBruto.documentos) && documentosBrutos.length === 0) {
    documentosBrutos = projetoBruto.documentos
  }

  // 2. Buscar cursos e professores para enriquecimento de nomes
  const [cursos, professores] = await Promise.all([
    listarCursos(sinal).catch(() => []),
    token ? listarProfessores(token, {}, sinal).catch(() => []) : Promise.resolve([]),
  ])

  const mapaCursos = new Map(
    (Array.isArray(cursos) ? cursos : []).map((c) => [String(c.id), c]),
  )
  const mapaProfessores = new Map(
    (Array.isArray(professores) ? professores : []).map((prof) => [
      String(prof.id),
      prof.nome || prof.usuario?.nome || '',
    ]),
  )

  const infoCurso = mapaCursos.get(String(projetoBruto.cursoId))

  // Identificar orientador(es) e coorientador(es)
  const vinculosProf = Array.isArray(projetoBruto.professores)
    ? projetoBruto.professores
    : []

  const listaOrientadores = []

  for (const prof of vinculosProf) {
    const nome =
      prof.nome ||
      (prof.professorId && mapaProfessores.get(String(prof.professorId))) ||
      prof.usuario?.nome ||
      (prof.professorId ? `Prof. Dr. ${prof.professorId}` : null)

    const papel = prof.papel || (prof.papelProjeto ? String(prof.papelProjeto) : '')
    if (nome) {
      listaOrientadores.push({
        id: prof.id || prof.professorId,
        nome,
        papel: papel === 'COORIENTADOR' || papel === 'PARTICIPANTE' ? 'Coorientadora' : 'Orientador',
      })
    }
  }

  // Fallbacks de orientador se não houver vinculação detalhada
  if (listaOrientadores.length === 0) {
    const nomeOrientador =
      projetoBruto.orientador ||
      (projetoBruto.orientadorId && mapaProfessores.get(String(projetoBruto.orientadorId))) ||
      null

    if (nomeOrientador) {
      listaOrientadores.push({
        id: 'orientador-padrao',
        nome: nomeOrientador,
        papel: 'Orientador',
      })
    }

    if (projetoBruto.coorientador) {
      listaOrientadores.push({
        id: 'coorientador-padrao',
        nome: projetoBruto.coorientador,
        papel: 'Coorientador(a)',
      })
    }
  }

  const cursoSigla =
    infoCurso?.sigla ||
    infoCurso?.acronimo ||
    projetoBruto.curso ||
    (projetoBruto.cursoId ? `CURSO-${projetoBruto.cursoId}` : '')

  const cursoNomeCompleto =
    infoCurso?.nome ||
    projetoBruto.cursoCompleto ||
    cursoSigla ||
    'Não informado'

  // Formatar autores com curso vinculado
  let autoresLista = []
  if (Array.isArray(projetoBruto.autores) && projetoBruto.autores.length > 0) {
    autoresLista = projetoBruto.autores.map((autor, idx) => {
      if (typeof autor === 'string') {
        return { id: idx, nome: autor, curso: cursoNomeCompleto }
      }
      return {
        id: autor.id || idx,
        nome: autor.nome || autor.usuario?.nome || 'Não informado',
        email: autor.email || autor.usuario?.email || '',
        curso: autor.curso || cursoNomeCompleto,
      }
    })
  } else if (projetoBruto.autor) {
    autoresLista = [{ id: 1, nome: projetoBruto.autor, curso: cursoNomeCompleto }]
  }

  // Formatar documentos e links externos
  const documentos = (documentosBrutos || []).map((doc, idx) => {
    const objeto = typeof doc === 'object' && doc !== null
    const nome = objeto
      ? doc.nomeArquivo || doc.nome || `Documento ${idx + 1}`
      : String(doc)
    const localizacao = objeto ? doc.localizacao : null
    const tipoDocumento = objeto ? doc.tipoDocumento : null

    // Sanitização e validação de URL segura
    let urlSegura = null
    let ehUrl = false
    if (localizacao && /^https?:\/\//i.test(localizacao.trim())) {
      urlSegura = localizacao.trim()
      ehUrl = true
    }

    const ehMemoria =
      Boolean(ehUrl) ||
      /memoria|link|externo/i.test(tipoDocumento || '') ||
      /memoria/i.test(nome)

    const extensao = extrairExtensao(nome)
    const tipoRotulo = ehMemoria ? 'Link externo' : extensao

    return {
      id: objeto ? doc.id : idx,
      nome,
      tipoDocumento: tipoRotulo,
      extensao,
      localizacao: urlSegura,
      ehUrl,
      ehMemoria,
      subtitulo: ehMemoria
        ? 'Repositório Institucional'
        : `${extensao} • Documento do projeto`,
      dataEnvio: objeto?.dataEnvio ? formatarDataBR(objeto.dataEnvio) : null,
    }
  })

  const tipoFormatado =
    ROTULOS_TIPO[projetoBruto.tipoProjeto] ||
    projetoBruto.tipo ||
    projetoBruto.tipoProjeto ||
    'Trabalho de Conclusão de Curso (TCC)'

  return {
    id: projetoBruto.id,
    identificador: String(projetoBruto.id),
    titulo: projetoBruto.nome || projetoBruto.titulo || 'Sem título',
    descricao: projetoBruto.descricao || projetoBruto.resumo || '',
    resumo: projetoBruto.resumo || projetoBruto.descricao || '',
    tipo: tipoFormatado,
    tipoCodigo: projetoBruto.tipoProjeto || 'TCC',
    cursoId: projetoBruto.cursoId,
    cursoSigla,
    cursoNome: cursoNomeCompleto,
    dataPostagemTexto: formatarDataExtenso(projetoBruto.dataInicio) || 'Não informada',
    autores: autoresLista,
    orientadores: listaOrientadores,
    documentos,
  }
}

export default consultarDetalhesProjeto
