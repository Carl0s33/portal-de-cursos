import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import { buscarDetalhesCurso } from './services/buscarDetalhesCurso.js'
import ResumoCurso from './components/ResumoCurso.jsx'
import AbasCurso from './components/AbasCurso.jsx'
import VisaoGeral from './components/VisaoGeral.jsx'
import CarregamentoDetalhe from './components/CarregamentoDetalhe.jsx'
import InformacoesAcademicas from './components/InformacoesAcademicas.jsx'
import './detalhes-curso.css'

const abasValidas = ['visao-geral', 'grade-curricular']

export default function PaginaCurso({ identificador, aba = 'visao-geral' }) {
  const [consulta, mudarConsulta] = useState({ estado: 'carregando', curso: null, erro: null })
  const [tentativa, mudarTentativa] = useState(0)
  const selecionada = abasValidas.includes(aba) ? aba : 'visao-geral'

  useEffect(() => {
    const controle = new AbortController()
    buscarDetalhesCurso(identificador, controle.signal)
      .then((curso) => mudarConsulta({ estado: 'pronto', curso, erro: null }))
      .catch((erro) => {
        if (erro.name !== 'AbortError') mudarConsulta({ estado: 'erro', curso: null, erro })
      })
    return () => controle.abort()
  }, [identificador, tentativa])

  useEffect(() => {
    if (consulta.curso) document.title = `${consulta.curso.nome} — Portal de Cursos`
  }, [consulta.curso])

  function selecionarAba(destino) {
    window.location.hash = `curso/${identificador}${destino === 'visao-geral' ? '' : `/${destino}`}`
  }
  function tentarNovamente() {
    mudarConsulta({ estado: 'carregando', curso: null, erro: null })
    mudarTentativa((valor) => valor + 1)
  }
  const { curso } = consulta

  return (
    <main id="conteudo" className="limite pagina-detalhe-curso">
      <nav className="detalhe-curso__caminho" aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <Icone nome="caminho-detalhe" />
        <a href="#cursos">Cursos</a>
        <Icone nome="caminho-detalhe" />
        <span aria-current="page">{curso?.sigla || 'Detalhes do curso'}</span>
      </nav>
      {consulta.estado === 'carregando' && <CarregamentoDetalhe />}
      {consulta.estado === 'erro' && (
        <section className="bloco-detalhe detalhe-curso__erro" role="alert">
          <h1>
            {consulta.erro.status === 404
              ? 'Curso não encontrado'
              : 'Não foi possível carregar o curso'}
          </h1>
          <p>
            {consulta.erro.status === 404
              ? 'O curso solicitado não está disponível no catálogo.'
              : 'Houve uma falha ao consultar as informações. Tente novamente.'}
          </p>
          <div>
            {consulta.erro.status !== 404 && (
              <button className="botao-primario" onClick={tentarNovamente}>
                Tentar novamente
              </button>
            )}
            <a className="botao-secundario" href="#cursos">
              Voltar aos cursos
            </a>
          </div>
        </section>
      )}
      {consulta.estado === 'pronto' && (
        <>
          <ResumoCurso curso={curso} />
          <AbasCurso selecionada={selecionada} selecionar={selecionarAba} />
          <div
            role="tabpanel"
            id={`painel-curso-${selecionada}`}
            aria-labelledby={`aba-curso-${selecionada}`}
            tabIndex={0}
          >
            {selecionada === 'visao-geral' && <VisaoGeral curso={curso} />}
            {selecionada === 'grade-curricular' && <InformacoesAcademicas curso={curso} />}
          </div>
        </>
      )}
    </main>
  )
}
