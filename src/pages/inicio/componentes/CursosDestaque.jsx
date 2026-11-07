import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import CardCurso from '@/shared/componentes/CardCurso.jsx'
import Link from '@/shared/componentes/Link.jsx'

export default function CursosDestaque() {
  const [cursos, mudarCursos] = useState([])
  const [estado, mudarEstado] = useState('carregando')

  useEffect(() => {
    const controle = new AbortController()
    listarCursos(controle.signal)
      .then((resultado) => {
        mudarCursos(resultado.slice(0, 3))
        mudarEstado('pronto')
      })
      .catch((erro) => {
        if (erro.name !== 'AbortError') mudarEstado('erro')
      })
    return () => controle.abort()
  }, [])

  return (
    <section id="cursos" className="secao" aria-labelledby="titulo-cursos">
      <div className="secao__cabecalho">
        <div>
          <h2 id="titulo-cursos">Cursos disponíveis</h2>
          <p>Conheça a estrutura e as possibilidades de cada formação.</p>
        </div>
        <Link destino="#cursos">Ver todos os cursos</Link>
      </div>
      {estado === 'carregando' && <p role="status">Carregando cursos…</p>}
      {estado === 'erro' && (
        <p role="status">
          Não foi possível carregar os cursos agora. Consulte o catálogo completo.
        </p>
      )}
      {estado === 'pronto' &&
        (cursos.length ? (
          <div className="grade-cursos">
            {cursos.map((curso) => (
              <CardCurso key={curso.identificador} curso={curso} />
            ))}
          </div>
        ) : (
          <p role="status">Nenhum curso está disponível no momento.</p>
        ))}
    </section>
  )
}
