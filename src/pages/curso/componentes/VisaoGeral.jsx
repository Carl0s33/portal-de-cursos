import { useEffect, useState } from 'react'
import { listarCoordenadores } from '@/api/coordenadores.js'
import { listarProfessores } from '@/api/professores.js'
import './visao-geral.css'

export default function VisaoGeral({ curso }) {
  const [coordenador, mudarCoordenador] = useState(null)

  useEffect(() => {
    let ativo = true
    const controle = new AbortController()
    mudarCoordenador(null)

    if (curso?.id) {
      Promise.all([
        listarCoordenadores(null, { cursoId: curso.id }, controle.signal).catch(() => []),
        listarProfessores(null, {}, controle.signal).catch(() => []),
      ]).then(([dadosCoordenadores, professores]) => {
        if (!ativo) return
        const coordenadores = Array.isArray(dadosCoordenadores)
          ? dadosCoordenadores
          : Array.isArray(dadosCoordenadores?.coordenadores)
            ? dadosCoordenadores.coordenadores
            : dadosCoordenadores
              ? [dadosCoordenadores]
              : []
        const registro = coordenadores[0]
        if (!registro) return

        const professorRef = registro.professor || registro.docente
        const referenciasProfessor = [
          registro.professorId,
          professorRef?.id,
          professorRef?.professorId,
          professorRef?.usuario?.id,
          registro.usuarioId,
          registro.usuario?.id,
          registro.id,
        ].filter(Boolean)
        const professor = professores.find((item) =>
          [item.id, item.usuario?.id].some(
            (id) =>
              id && referenciasProfessor.some((referencia) => String(id) === String(referencia)),
          ),
        )
        const professorId =
          registro.professorId ||
          professorRef?.id ||
          professor?.id ||
          registro.usuarioId ||
          registro.usuario?.id
        const nome =
          registro.nome ||
          professorRef?.usuario?.nome ||
          professorRef?.nome ||
          registro.usuario?.nome ||
          professor?.nome

        if (nome || String(professorId) === '2') {
          mudarCoordenador({
            ...registro,
            professorId: professorId || professor?.id,
            nome: nome || 'Coordenador Inicial',
          })
        }
      })
    }

    return () => {
      ativo = false
      controle.abort()
    }
  }, [curso?.id])

  return (
    <section className="visao-curso" aria-labelledby="titulo-visao-geral">
      <div>
        <h2 id="titulo-visao-geral">Sobre o curso</h2>
        <p>{curso.descricao}</p>
      </div>

      {coordenador?.nome && coordenador.professorId && (
        <aside className="visao-curso__coordenador-bloco">
          <h3>Coordenação do curso</h3>
          <a
            href={`#professor/${coordenador.professorId || coordenador.id}`}
            aria-label={`Ver perfil de ${coordenador.nome}`}
          >
            <strong>{coordenador.nome}</strong>
            <span>Ver perfil docente</span>
          </a>
        </aside>
      )}
    </section>
  )
}
