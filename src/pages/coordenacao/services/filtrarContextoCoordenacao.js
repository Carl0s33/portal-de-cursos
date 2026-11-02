function pertenceAoCurso(item, cursoId, curso) {
  if (String(item.identificadorCurso ?? item.cursoId ?? '') === String(cursoId)) return true
  return Boolean(curso && [curso.sigla, curso.nome].includes(item.curso))
}

export function filtrarContextoCoordenacao({ cursos = [], sessao, submissoes = [] }) {
  const cursoId = sessao?.usuario?.cursoId
  const referenciaCurso = sessao?.usuario?.curso

  const curso = cursos.find((item) =>
    [item.identificador, item.id, item.sigla, item.nome].some((valor) =>
      [
        cursoId,
        referenciaCurso?.id,
        referenciaCurso?.identificador,
        referenciaCurso?.sigla,
        referenciaCurso?.nome,
      ]
        .filter(Boolean)
        .some((referencia) => String(referencia) === String(valor)),
    ),
  )

  const idsDoCurso = [
    cursoId,
    referenciaCurso?.id,
    referenciaCurso?.identificador,
    curso?.id,
    curso?.identificador,
  ].filter((id) => id !== undefined && id !== null)

  const cursosDaCoordenacao = cursos.filter((item) =>
    idsDoCurso.some((id) =>
      [item.id, item.identificador].some((valor) => String(valor) === String(id)),
    ),
  )

  const submissoesDoCurso = submissoes.filter((item) =>
    idsDoCurso.some((id) => pertenceAoCurso(item, id, curso)),
  )

  return {
    cursoId,
    curso,
    cursosDaCoordenacao,
    submissoesDoCurso,
    indicadores: {
      total: submissoesDoCurso.length,
      emAnaliseCoord: submissoesDoCurso.filter((s) => s.status === 'Em análise').length,
      aguardandoOrientador: submissoesDoCurso.filter((s) => s.status === 'Aguardando Orientador')
        .length,
      publicados: submissoesDoCurso.filter((s) => s.status === 'Aprovado').length,
    },
  }
}
