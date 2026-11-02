import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '@/api/professores.js'
import { listarProjetos, listarProjetosAprovados } from '@/api/projetos.js'

const CHAVE_CACHE_PUBLICADOS = 'portal-cursos-publicados-cache'

const ROTULOS_TIPO = {
  TCC: 'TCC',
  PROJETO_INTEGRADOR: 'Projeto integrador',
  PROJETO_PESQUISA: 'Pesquisa',
  PROJETO_EXTENSAO: 'Extensão',
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

function salvarCachePublicados(itens) {
  try {
    localStorage.setItem(CHAVE_CACHE_PUBLICADOS, JSON.stringify(itens))
  } catch {
    /* Cache público opcional. */
  }
}

export async function consultarProjetosPublicados(sinal) {
  const token = obterTokenSessao()
  const [dadosProjetos, dadosCursos, dadosProfessores] = await Promise.all([
    listarProjetos(token, sinal)
      .then((lista) => {
        const publicados = (Array.isArray(lista) ? lista : []).filter(
          (p) => (p.statusProjeto || p.status) === 'PUBLICADO',
        )
        salvarCachePublicados(publicados)
        return publicados
      })
      .catch(async () => {
        const aprovadosEndpoint = await listarProjetosAprovados(sinal).catch(() => [])
        const publicadosEndpoint = (
          Array.isArray(aprovadosEndpoint) ? aprovadosEndpoint : []
        ).filter((p) => (p.statusProjeto || p.status) === 'PUBLICADO')
        if (publicadosEndpoint.length > 0) {
          salvarCachePublicados(publicadosEndpoint)
          return publicadosEndpoint
        }
        return lerCachePublicados()
      }),
    listarCursos(sinal).catch(() => []),
    token ? listarProfessores(token, {}, sinal).catch(() => []) : Promise.resolve([]),
  ])

  if (!Array.isArray(dadosProjetos)) return []

  const mapaCursos = new Map(
    (Array.isArray(dadosCursos) ? dadosCursos : []).map((c) => [String(c.id), c]),
  )
  const mapaProfessores = new Map(
    (Array.isArray(dadosProfessores) ? dadosProfessores : []).map((prof) => [
      String(prof.id),
      prof.nome || prof.usuario?.nome || '',
    ]),
  )
  const cacheAnterior = new Map(
    lerCachePublicados().map((item) => [String(item.id), item.orientador || '']),
  )

  return dadosProjetos
    .filter((p) => (p.statusProjeto || p.status) === 'PUBLICADO')
    .map((p) => {
      const infoCurso = mapaCursos.get(String(p.cursoId))
      const orientadorVinculo = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
      const idProf =
        orientadorVinculo?.professorId || p.orientadorId || p.professores?.[0]?.professorId
      const nomeOrientador =
        p.orientador ||
        (idProf && mapaProfessores.get(String(idProf))) ||
        orientadorVinculo?.nome ||
        cacheAnterior.get(String(p.id)) ||
        'Orientação acadêmica'

      return {
        id: p.id,
        identificador: String(p.id),
        nome: p.nome,
        descricao: p.descricao || p.resumo || '',
        tipo: ROTULOS_TIPO[p.tipoProjeto] || p.tipoProjeto || 'TCC',
        curso:
          infoCurso?.sigla ||
          infoCurso?.acronimo ||
          p.curso ||
          infoCurso?.nome ||
          (p.cursoId ? `Curso #${p.cursoId}` : ''),
        autores:
          Array.isArray(p.autores) && p.autores.length
            ? p.autores.map((a) => (typeof a === 'string' ? a : a.nome)).join(', ')
            : 'Não informado',
        orientador: nomeOrientador,
        status: 'PUBLICADO',
      }
    })
}
