import { useEffect, useState } from 'react'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import Link from '@/shared/components/Link.jsx'
import { buscarProjetosDestaque } from '../services/buscarProjetosDestaque.js'

export default function ProjetosDestaque() {
  const [projetos, mudarProjetos] = useState([])
  const [estado, mudarEstado] = useState('carregando')

  useEffect(() => {
    const controle = new AbortController()
    buscarProjetosDestaque(controle.signal)
      .then((publicados) => {
        if (controle.signal.aborted) return
        mudarProjetos(publicados)
        mudarEstado('pronto')
      })
      .catch(() => {
        if (!controle.signal.aborted) {
          mudarProjetos([])
          mudarEstado('erro')
        }
      })
    return () => controle.abort()
  }, [])

  return (
    <section id="projetos" className="secao" aria-labelledby="titulo-projetos">
      <div className="secao__cabecalho">
        <div>
          <h2 id="titulo-projetos">Projetos publicados</h2>
          <p>Conheça trabalhos aprovados e desenvolvidos ao longo da formação.</p>
        </div>
        <Link destino="#projetos">Explorar biblioteca de projetos</Link>
      </div>
      {estado === 'carregando' ? (
        <div className="painel-vazio painel-vazio--caixa">
          <p role="status">Carregando produções acadêmicas…</p>
        </div>
      ) : estado === 'erro' ? (
        <p role="alert">
          Não foi possível carregar os projetos. Verifique se o serviço está disponível e recarregue
          a página.
        </p>
      ) : projetos.length > 0 ? (
        <ul className="lista-projetos">
          {projetos.map((projeto) => (
            <li key={projeto.identificador}>
              <ItemProjeto projeto={projeto} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="painel-vazio painel-vazio--caixa">
          <p>Os trabalhos aprovados pela coordenação aparecerão aqui assim que forem publicados.</p>
          <a className="botao-secundario botao--pequeno" href="#submeter">
            Submeter produção acadêmica
          </a>
        </div>
      )}
    </section>
  )
}
