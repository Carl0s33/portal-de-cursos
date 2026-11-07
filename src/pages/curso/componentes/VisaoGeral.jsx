import { useEffect, useState } from 'react'
import Icone from '@/shared/componentes/Icone.jsx'
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
    <section
      className="bloco-detalhe visao-curso visao-curso__apresentacao"
      aria-labelledby="titulo-visao-geral"
    >
      <div>
        <p className="visao-curso__rotulo">Informações do curso</p>
        <h2 id="titulo-visao-geral">Sobre o curso</h2>
        <p>{curso.descricao}</p>
      </div>

      {coordenador?.nome && coordenador.professorId && (
        <div className="visao-curso__coordenador-bloco">
          <h3>Coordenação do curso</h3>
          <a
            className="detalhe-projeto__perfil-item"
            href={`#professor/${coordenador.professorId || coordenador.id}`}
            title={`Abrir perfil de ${coordenador.nome}`}
          >
            <div className="detalhe-projeto__avatar">
              {coordenador.nome.charAt(0).toUpperCase()}
            </div>
            <div className="detalhe-projeto__perfil-info">
              <strong>{coordenador.nome}</strong>
              <small>Coordenação do curso · Ver perfil docente</small>
            </div>
            <Icone nome="seta-cursos" />
          </a>
        </div>
      )}
    </section>
  )
}
