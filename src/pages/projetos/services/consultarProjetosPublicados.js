import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '@/api/professores.js'
import { listarProjetos, listarProjetosAprovados } from '@/api/projetos.js'

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

export async function consultarProjetosPublicados(sinal) {
  const token = obterTokenSessao()
  const [dadosProjetos, dadosCursos, dadosProfessores] = await Promise.all([
    (token
      ? listarProjetos(token, sinal).catch(() => listarProjetosAprovados(sinal))
      : listarProjetosAprovados(sinal)
    ).catch(() => []),
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

  return dadosProjetos
    .filter((p) => ['PUBLICADO', 'APROVADO'].includes(p.statusProjeto || p.status))
    .map((p) => {
      const infoCurso = mapaCursos.get(String(p.cursoId))
      const orientadorVinculo = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
      const idProf =
        orientadorVinculo?.professorId || p.orientadorId || p.professores?.[0]?.professorId
      const nomeOrientador =
        p.orientador ||
        (idProf && mapaProfessores.get(String(idProf))) ||
        orientadorVinculo?.nome ||
        'Não informado'

      return {
        id: p.id,
        identificador: String(p.id),
        nome: p.nome,
        descricao: p.descricao || p.resumo || '',
        tipo: ROTULOS_TIPO[p.tipoProjeto] || p.tipoProjeto || '',
        curso:
          infoCurso?.sigla ||
          infoCurso?.acronimo ||
          infoCurso?.nome ||
          (p.cursoId ? `Curso #${p.cursoId}` : ''),
        autores:
          Array.isArray(p.autores) && p.autores.length
            ? p.autores.map((a) => (typeof a === 'string' ? a : a.nome)).join(', ')
            : 'Não informado',
        orientador: nomeOrientador,
        status: p.statusProjeto || 'PUBLICADO',
      }
    })
}
