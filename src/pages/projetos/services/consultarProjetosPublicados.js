import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '@/api/professores.js'
import { listarProjetos, listarProjetosAprovados } from '@/api/projetos.js'

const ROTULOS_TIPO = {
  TCC: 'TCC',
  PROJETO_INTEGRADOR: 'Projeto integrador',
  PROJETO_PESQUISA: 'Pesquisa',
  PROJETO_EXTENSAO: 'Extensão',
}

// Funcao de validacao de projetos para exibicao publica
function ehProjetoValido(p) {
  const nome = (p.nome || '').trim().toLowerCase()
  const resumo = (p.resumo || p.descricao || '').trim()

  // Elimina rascunhos invalidos
  if (['dgdg', 'teste', 'meu primeiro proeto', 'projeto teste', 'drgdrgdrg'].includes(nome))
    return false
  if (nome.length < 5) return false
  if (resumo.length < 10) return false
  return true
}

export async function consultarProjetosPublicados(sinal) {
  try {
    localStorage.removeItem('portal-cursos-publicados-cache')
  } catch {
    /* Cache limpo */
  }

  const [dadosAprovados, dadosCursos, dadosProfessores] = await Promise.all([
    listarProjetosAprovados(sinal).catch(() => listarProjetos(null, sinal).catch(() => [])),
    listarCursos(sinal).catch(() => []),
    listarProfessores(null, {}, sinal).catch(() => []),
  ])

  const mapaCursos = new Map(
    (Array.isArray(dadosCursos) ? dadosCursos : []).map((c) => [String(c.id), c]),
  )
  const mapaProfessores = new Map(
    (Array.isArray(dadosProfessores) ? dadosProfessores : []).map((prof) => [
      String(prof.id),
      prof.nome || prof.usuario?.nome || '',
    ]),
  )

  const listaBruta = Array.isArray(dadosAprovados) ? dadosAprovados : []
  const publicadosValidos = listaBruta
    .filter((p) => {
      const status = p.statusProjeto || p.status
      return (status === 'PUBLICADO' || status === 'APROVADO') && ehProjetoValido(p)
    })
    .map((p) => {
      const idCurso = p.cursoId ? String(p.cursoId) : null
      const infoCurso = idCurso ? mapaCursos.get(idCurso) : null

      let nomeCurso = ''
      if (infoCurso?.sigla) nomeCurso = infoCurso.sigla
      else if (infoCurso?.acronimo) nomeCurso = infoCurso.acronimo
      else if (infoCurso?.nome) nomeCurso = infoCurso.nome
      else if (p.curso && !/^#?\d+$/.test(String(p.curso).trim())) {
        nomeCurso = String(p.curso)
          .replace(/^Curso\s*#?/i, '')
          .trim()
      } else if (idCurso) {
        nomeCurso = `Curso ${idCurso}`
      }

      const orientadorVinculo = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
      const idProf =
        orientadorVinculo?.professorId || p.orientadorId || p.professores?.[0]?.professorId
      const nomeOrientador =
        p.orientador ||
        (idProf && mapaProfessores.get(String(idProf))) ||
        orientadorVinculo?.nome ||
        'Orientação acadêmica'

      return {
        id: p.id,
        identificador: String(p.id),
        nome: p.nome,
        descricao: p.descricao || p.resumo || '',
        resumo: p.resumo || p.descricao || '',
        tipo: ROTULOS_TIPO[p.tipoProjeto] || p.tipoProjeto || 'TCC',
        curso: nomeCurso || 'Geral',
        autores:
          Array.isArray(p.autores) && p.autores.length
            ? p.autores.map((a) => (typeof a === 'string' ? a : a.nome)).join(', ')
            : 'Não informado',
        orientador: nomeOrientador,
        status: 'PUBLICADO',
      }
    })

  // Retorna diretamente da API do backend sem usar mocks ou sementes falsas
  return publicadosValidos
}
