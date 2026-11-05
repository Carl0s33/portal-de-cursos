import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import CartaoCurso from '@/shared/components/CartaoCurso.jsx'
import Ligacao from '@/shared/components/Ligacao.jsx'

export default function CursosEmDestaque() {
  const [cursos, definirCursos] = useState([])
  const [estado, definirEstado] = useState('carregando')

  useEffect(() => {
    const controle = new AbortController()
    listarCursos(controle.signal)
      .then((resultado) => {
        definirCursos(resultado.slice(0, 3))
        definirEstado('pronto')
      })
      .catch((erro) => {
        if (erro.name !== 'AbortError') definirEstado('erro')
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
        <Ligacao destino="#cursos">Ver todos os cursos</Ligacao>
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
              <CartaoCurso key={curso.identificador} curso={curso} />
            ))}
          </div>
        ) : (
          <p role="status">Nenhum curso está disponível no momento.</p>
        ))}
    </section>
  )
}
