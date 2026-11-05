import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import { listarCoordenadores } from '@/api/coordenadores.js'
import './visao-geral.css'

export default function VisaoGeral({ curso }) {
  const [coordenador, definirCoordenador] = useState(null)

  useEffect(() => {
    let ativo = true
    const controle = new AbortController()

    if (curso?.id) {
      listarCoordenadores(null, { cursoId: curso.id }, controle.signal)
        .then((dados) => {
          if (!ativo) return
          if (Array.isArray(dados) && dados.length > 0) {
            definirCoordenador(dados[0])
          } else if (dados && dados.nome) {
            definirCoordenador(dados)
          }
        })
        .catch(() => {})
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

      {coordenador && (
        <div className="visao-curso__coordenador-bloco">
          <h3>Coordenação do curso</h3>
          <a
            className="detalhe-projeto__perfil-item"
            href={`#professor/${coordenador.professorId || coordenador.id}`}
            title={`Abrir perfil do coordenador ${coordenador.nome || coordenador.usuario?.nome}`}
          >
            <div className="detalhe-projeto__avatar">
              {(coordenador.nome || coordenador.usuario?.nome || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="detalhe-projeto__perfil-info">
              <strong>{coordenador.nome || coordenador.usuario?.nome}</strong>
              <small>Coordenador(a) do Curso · Ver perfil docente</small>
            </div>
            <Icone nome="seta-cursos" />
          </a>
        </div>
      )}
    </section>
  )
}
