import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import BuscaCursos from './components/BuscaCursos.jsx'
import FiltrosCursos from './components/FiltrosCursos.jsx'
import FiltrosAtivos from './components/FiltrosAtivos.jsx'
import CartaoCatalogo from './components/CartaoCatalogo.jsx'
import CarregamentoCatalogo from './components/CarregamentoCatalogo.jsx'
import CatalogoVazio from './components/CatalogoVazio.jsx'
import ErroCatalogo from './components/ErroCatalogo.jsx'
import { consultarCursos } from './services/consultarCursos.js'
import './cursos.css'

const filtrosIniciais = {
  busca: '',
  grau: '',
  modalidade: '',
  campus: '',
  areas: [],
  turnos: [],
  duracoes: [],
}

function lerFiltros() {
  try {
    const salvos = JSON.parse(sessionStorage.getItem('portal-cursos-filtros')) || {}
    return Object.fromEntries(
      Object.entries(filtrosIniciais).map(([campo, padrao]) => [
        campo,
        Array.isArray(padrao)
          ? Array.isArray(salvos[campo])
            ? salvos[campo].filter((item) => typeof item === 'string')
            : []
          : typeof salvos[campo] === 'string'
            ? salvos[campo]
            : '',
      ]),
    )
  } catch {
    return filtrosIniciais
  }
}

function normalizar(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function correspondeDuracao(curso, opcoes) {
  if (!opcoes.length) return true
  return opcoes.some((opcao) =>
    opcao === 'Até 2 anos'
      ? curso.semestres <= 4
      : opcao === '3 a 4 anos'
        ? curso.semestres >= 6 && curso.semestres <= 8
        : curso.semestres >= 8 && curso.semestres <= 10,
  )
}

export default function PaginaCursos() {
  const [consulta, mudarConsulta] = useState({
    estado: 'carregando',
    cursos: [],
    erro: null,
    ultimaTentativa: new Date(),
  })
  const [tentativa, mudarTentativa] = useState(0)
  const [filtros, mudarFiltros] = useState(lerFiltros)
  const [ordem, mudarOrdem] = useState('relevancia')
  const [filtrosAbertos, mudarFiltrosAbertos] = useState(false)

  useEffect(() => {
    const controle = new AbortController()
    consultarCursos(controle.signal)
      .then((cursos) =>
        mudarConsulta({
          estado: 'pronto',
          cursos,
          erro: null,
          ultimaTentativa: new Date(),
        }),
      )
      .catch((erro) => {
        if (erro.name !== 'AbortError')
          mudarConsulta({
            estado: 'erro',
            cursos: [],
            erro,
            ultimaTentativa: new Date(),
          })
      })
    return () => controle.abort()
  }, [tentativa])

  useEffect(() => {
    try {
      sessionStorage.setItem('portal-cursos-filtros', JSON.stringify(filtros))
    } catch {
      /* Os filtros continuam disponíveis nesta página. */
    }
  }, [filtros])

  function alterar(campo, valor) {
    mudarFiltros((anteriores) => ({ ...anteriores, [campo]: valor }))
  }
  function limpar() {
    mudarFiltros({ ...filtrosIniciais })
  }
  function tentarNovamente() {
    mudarConsulta((anterior) => ({
      ...anterior,
      estado: 'carregando',
      erro: null,
    }))
    mudarTentativa((anterior) => anterior + 1)
  }

  const resultados = consulta.cursos
    .filter((curso) => {
      const texto = normalizar(`${curso.nome} ${curso.sigla} ${curso.area || ''}`)
      return (
        texto.includes(normalizar(filtros.busca.trim())) &&
        (!filtros.grau || filtros.grau === curso.grau) &&
        (!filtros.modalidade || filtros.modalidade === curso.modalidade) &&
        (!filtros.campus || filtros.campus === curso.campus) &&
        (!filtros.areas.length || filtros.areas.includes(curso.area)) &&
        (!filtros.turnos.length || filtros.turnos.includes(curso.turno)) &&
        correspondeDuracao(curso, filtros.duracoes)
      )
    })
    .sort((primeiro, segundo) =>
      ordem === 'nome'
        ? primeiro.nome.localeCompare(segundo.nome, 'pt-BR')
        : ordem === 'duracao'
          ? primeiro.semestres - segundo.semestres
          : 0,
    )
  const bloqueado = consulta.estado !== 'pronto'

  return (
    <main id="conteudo" className="limite pagina-cursos">
      <nav className="caminho-cursos" aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <Icone nome="caminho-cursos" />
        <span aria-current="page">Cursos</span>
      </nav>
      <div className="pagina-cursos__introducao">
        <div>
          <h1>Conheça nossos cursos</h1>
          <p>Explore a formação, as disciplinas, os professores e as produções de cada curso.</p>
        </div>
        {consulta.estado === 'erro' && (
          <span className="pagina-cursos__offline">
            <Icone nome="offline-cursos" />
            Catálogo indisponível
          </span>
        )}
      </div>
      <BuscaCursos
        valor={filtros.busca}
        alterar={(valor) => alterar('busca', valor)}
        bloqueado={bloqueado}
      />
      <FiltrosAtivos filtros={filtros} alterar={alterar} limpar={limpar} />
      <div className="pagina-cursos__grade">
        <div
          className={`pagina-cursos__lateral ${filtrosAbertos ? 'pagina-cursos__lateral--aberta' : ''}`}
        >
          <button
            className="pagina-cursos__abrir-filtros"
            aria-expanded={filtrosAbertos}
            aria-controls="painel-filtros"
            onClick={() => mudarFiltrosAbertos(!filtrosAbertos)}
          >
            <Icone nome="filtrar-cursos" />
            {filtrosAbertos ? 'Recolher filtros' : 'Filtrar cursos'}
          </button>
          <div id="painel-filtros">
            <FiltrosCursos
              filtros={filtros}
              alterar={alterar}
              limpar={limpar}
              bloqueado={bloqueado}
              cursos={consulta.cursos}
            />
          </div>
        </div>
        <div className="pagina-cursos__resultados" aria-busy={consulta.estado === 'carregando'}>
          <div className="pagina-cursos__resumo">
            <p role="status" aria-live="polite">
              {consulta.estado === 'pronto' ? (
                <>
                  <strong>{resultados.length}</strong>{' '}
                  {resultados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
                </>
              ) : consulta.estado === 'carregando' ? (
                'Consultando catálogo…'
              ) : (
                'Consulta indisponível'
              )}
            </p>
            <label>
              Ordenar por:
              <select
                value={ordem}
                disabled={bloqueado}
                onChange={(evento) => mudarOrdem(evento.target.value)}
              >
                <option value="relevancia">Mais relevantes</option>
                <option value="nome">Nome de A a Z</option>
                <option value="duracao">Menor duração</option>
              </select>
            </label>
          </div>
          {consulta.estado === 'carregando' && <CarregamentoCatalogo />}
          {consulta.estado === 'erro' && (
            <ErroCatalogo
              erro={consulta.erro}
              ultimaTentativa={consulta.ultimaTentativa}
              tentarNovamente={tentarNovamente}
            />
          )}
          {consulta.estado === 'pronto' &&
            (resultados.length ? (
              <div className="grade-catalogo">
                {resultados.map((curso) => (
                  <CartaoCatalogo curso={curso} key={curso.identificador} />
                ))}
              </div>
            ) : (
              <CatalogoVazio limpar={limpar} cursos={consulta.cursos} />
            ))}
        </div>
      </div>
    </main>
  )
}
