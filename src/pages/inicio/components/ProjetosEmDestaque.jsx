import { useEffect, useState } from 'react'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import Ligacao from '@/shared/components/Ligacao.jsx'
import { consultarProjetosEmDestaque } from '../services/consultarProjetosEmDestaque.js'

export default function ProjetosEmDestaque() {
  const [projetos, definirProjetos] = useState([])
  const [estado, definirEstado] = useState('carregando')

  useEffect(() => {
    const controle = new AbortController()
    consultarProjetosEmDestaque(controle.signal)
      .then((publicados) => {
        if (controle.signal.aborted) return
        definirProjetos(publicados)
        definirEstado('pronto')
      })
      .catch(() => {
        if (!controle.signal.aborted) definirEstado('pronto')
      })
    return () => controle.abort()
  }, [])

  return (
    <section id="projetos" className="secao" aria-labelledby="titulo-projetos">
      <div className="secao__cabecalho">
        <div>
          <h2 id="titulo-projetos">O conhecimento ganha forma aqui</h2>
          <p>Conheça trabalhos aprovados e desenvolvidos ao longo da formação.</p>
        </div>
        <Ligacao destino="#projetos">Explorar biblioteca de projetos</Ligacao>
      </div>
      {estado === 'carregando' ? (
        <div className="painel-vazio painel-vazio--caixa">
          <p role="status">Carregando produções acadêmicas…</p>
        </div>
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
