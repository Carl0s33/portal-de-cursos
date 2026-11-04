import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import CabecalhoProjeto from './components/CabecalhoProjeto.jsx'
import ResumoProjeto from './components/ResumoProjeto.jsx'
import BarraLateralProjeto from './components/BarraLateralProjeto.jsx'
import CarregamentoDetalheProjeto from './components/CarregamentoDetalheProjeto.jsx'
import { consultarDetalhesProjeto } from './services/consultarDetalhesProjeto.js'
import './detalhes-projeto.css'

export default function PaginaDetalhesProjeto({ identificador }) {
  const [consulta, definirConsulta] = useState({
    estado: 'carregando',
    projeto: null,
    erro: null,
  })
  const [tentativa, definirTentativa] = useState(0)

  useEffect(() => {
    const controle = new AbortController()
    consultarDetalhesProjeto(identificador, controle.signal)
      .then((projeto) => {
        if (!controle.signal.aborted) {
          definirConsulta({ estado: 'pronto', projeto, erro: null })
        }
      })
      .catch((erro) => {
        if (erro?.name !== 'AbortError' && !controle.signal.aborted) {
          definirConsulta({ estado: 'erro', projeto: null, erro })
        }
      })
    return () => controle.abort()
  }, [identificador, tentativa])

  useEffect(() => {
    if (consulta.projeto?.titulo) {
      document.title = `${consulta.projeto.titulo} — Portal de Cursos`
    }
  }, [consulta.projeto])

  function tentarNovamente() {
    definirConsulta({ estado: 'carregando', projeto: null, erro: null })
    definirTentativa((valor) => valor + 1)
  }

  const { projeto, erro } = consulta
  const e404 = erro?.status === 404

  return (
    <main id="conteudo" className="limite pagina-detalhe-projeto">
      {/* 2. Caminho de navegação (Breadcrumbs) */}
      <nav className="detalhe-projeto__caminho" aria-label="Você está aqui">
        <a href="#inicio" className="detalhe-projeto__caminho-link">
          Início
        </a>
        <Icone nome="caminho-detalhe" classe="detalhe-projeto__caminho-separador" />
        <a href="#projetos" className="detalhe-projeto__caminho-link">
          Projetos
        </a>
        <Icone nome="caminho-detalhe" classe="detalhe-projeto__caminho-separador" />
        <span
          className="detalhe-projeto__caminho-atual"
          aria-current="page"
          title={projeto?.titulo || ''}
        >
          {projeto?.titulo || (consulta.estado === 'carregando' ? 'Carregando…' : 'Detalhes do projeto')}
        </span>
      </nav>

      {/* Estado: Carregando */}
      {consulta.estado === 'carregando' && <CarregamentoDetalheProjeto />}

      {/* Estado: Erro / 404 */}
      {consulta.estado === 'erro' && (
        <section className="detalhe-projeto__erro" role="alert">
          <h1>{e404 ? 'Projeto não encontrado' : 'Não foi possível carregar o projeto'}</h1>
          <p>
            {e404
              ? 'O projeto solicitado não está disponível ou não foi publicado.'
              : 'Houve uma falha ao consultar as informações. Tente novamente.'}
          </p>
          <div className="detalhe-projeto__erro-acoes">
            {!e404 && (
              <button className="botao-primario" type="button" onClick={tentarNovamente}>
                Tentar novamente
              </button>
            )}
            <a className="botao-secundario" href="#projetos">
              Voltar aos projetos
            </a>
          </div>
        </section>
      )}

      {/* Estado: Pronto */}
      {consulta.estado === 'pronto' && projeto && (
        <>
          {/* 3. Cartão de abertura em largura total */}
          <CabecalhoProjeto projeto={projeto} />

          {/* 4. Corpo em duas colunas (Esquerda: Resumo / Direita: Autores, Orientação, Documentos) */}
          <div className="detalhe-projeto__layout">
            <section className="detalhe-projeto__coluna-principal">
              <ResumoProjeto projeto={projeto} />
            </section>

            <BarraLateralProjeto projeto={projeto} />
          </div>

          {/* 5. Ação de retorno: botão "Voltar aos projetos" */}
          <div className="detalhe-projeto__rodape-acao">
            <a href="#projetos" className="detalhe-projeto__botao-voltar">
              <Icone nome="voltar" classe="detalhe-projeto__icone-voltar" />
              <span>Voltar aos projetos</span>
            </a>
          </div>
        </>
      )}
    </main>
  )
}
