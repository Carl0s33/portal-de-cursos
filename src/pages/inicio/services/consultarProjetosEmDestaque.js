import { listarCursos } from '@/api/cursos.js'
import { listarProjetos, listarProjetosAprovados } from '@/api/projetos.js'

function obterTokenSessao() {
  try {
    const salva = JSON.parse(sessionStorage.getItem('portal-cursos-sessao') || 'null')
    return salva && Date.now() < salva.expiraEm ? salva.token : null
  } catch {
    return null
  }
}

export async function consultarProjetosEmDestaque(sinal) {
  const token = obterTokenSessao()
  const [dados, cursos] = await Promise.all([
    (token
      ? listarProjetos(token, sinal).catch(() => listarProjetosAprovados(sinal))
      : listarProjetosAprovados(sinal)
    ).catch(() => []),
    listarCursos(sinal).catch(() => []),
  ])

  const mapaCursos = new Map(
    (Array.isArray(cursos) ? cursos : []).map((c) => [
      String(c.id),
      c.sigla || c.acronimo || c.nome,
    ]),
  )

  return (Array.isArray(dados) ? dados : [])
    .filter((p) => !p.statusProjeto || ['PUBLICADO', 'APROVADO'].includes(p.statusProjeto))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      identificador: String(p.id),
      nome: p.nome,
      descricao: p.descricao || p.resumo,
      tipo:
        p.tipoProjeto === 'TCC'
          ? 'TCC'
          : p.tipoProjeto === 'PROJETO_INTEGRADOR'
            ? 'Projeto Integrador'
            : p.tipoProjeto === 'PROJETO_PESQUISA'
              ? 'Pesquisa'
              : p.tipoProjeto === 'PROJETO_EXTENSAO'
                ? 'Extensão'
                : p.tipoProjeto || 'Projeto',
      curso: mapaCursos.get(String(p.cursoId)) || (p.cursoId ? `#${p.cursoId}` : ''),
      orientador: (() => {
        if (p.orientador) return p.orientador
        const orientador = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
        if (orientador?.nome) return orientador.nome
        if (orientador?.professorId) return `Prof. #${orientador.professorId}`
        return 'Orientação acadêmica'
      })(),
    }))
}

export default consultarProjetosEmDestaque
