import { useEffect, useMemo, useState } from 'react'
import './informacoes-academicas.css'

function formatarCarga(valor) {
  const carga = Number(valor)
  return Number.isFinite(carga) && carga > 0 ? `${carga.toLocaleString('pt-BR')} h` : 'A informar'
}

function TabelaDisciplinas({ disciplinas, rotulo }) {
  if (!disciplinas.length) return null
  return (
    <div
      className="informacoes-academicas__tabela-wrap"
      role="region"
      aria-label={rotulo}
      tabIndex={0}
    >
      <table className="informacoes-academicas__tabela">
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Disciplina</th>
            <th scope="col" className="informacoes-academicas__numero">
              Carga horária
            </th>
          </tr>
        </thead>
        <tbody>
          {disciplinas.map((disciplina, indice) => (
            <tr key={disciplina.id || disciplina.codigo || `${disciplina.nome}-${indice}`}>
              <td className="informacoes-academicas__codigo">{disciplina.codigo || '—'}</td>
              <th scope="row">{disciplina.nome}</th>
              <td className="informacoes-academicas__numero">
                {formatarCarga(disciplina.cargaHoraria)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function InformacoesAcademicas({ curso }) {
  const itens = useMemo(() => curso.grade || [], [curso.grade])
  const [filtroTipo, mudarFiltroTipo] = useState('todos')
  const [semestreAtivo, mudarSemestreAtivo] = useState('')
  const obrigatorias = itens.filter((disciplina) => disciplina.obrigatoria)
  const optativas = itens.filter((disciplina) => !disciplina.obrigatoria)
  const cargaObrigatoria = obrigatorias.reduce(
    (total, disciplina) => total + (Number(disciplina.cargaHoraria) || 0),
    0,
  )
  const cargaOptativa = optativas.reduce(
    (total, disciplina) => total + (Number(disciplina.cargaHoraria) || 0),
    0,
  )
  const totalCarga = cargaObrigatoria + cargaOptativa

  const grupos = useMemo(() => {
    const conjunto =
      filtroTipo === 'obrigatorias'
        ? itens.filter((item) => item.obrigatoria)
        : filtroTipo === 'optativas'
          ? itens.filter((item) => !item.obrigatoria)
          : itens
    return [...new Set(conjunto.map((item) => Number(item.semestre) || 0))]
      .filter((semestre) => semestre > 0)
      .sort((a, b) => a - b)
      .map((semestre) => ({
        semestre,
        itens: conjunto.filter((item) => Number(item.semestre) === semestre),
      }))
  }, [filtroTipo, itens])

  useEffect(() => {
    if (!grupos.length || typeof IntersectionObserver === 'undefined') return undefined
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visivel) mudarSemestreAtivo(visivel.target.id)
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    )
    const secoes = document.querySelectorAll('[data-indice-semestre]')
    secoes.forEach((secao) => observador.observe(secao))
    return () => observador.disconnect()
  }, [grupos, filtroTipo])

  const obrigatoriasVisiveis = filtroTipo !== 'optativas'
  const optativasVisiveis = filtroTipo !== 'obrigatorias'
  const eletivas = optativas.filter((item) => !Number(item.semestre))
  const larguraObrigatoria = totalCarga ? cargaObrigatoria / totalCarga : 0.5
  const larguraOptativa = totalCarga ? cargaOptativa / totalCarga : 0.5

  return (
    <section className="informacoes-academicas" aria-labelledby="titulo-matriz">
      <header className="informacoes-academicas__cabecalho">
        <div>
          <h2 id="titulo-matriz">Matriz curricular</h2>
          <p>Disciplinas e cargas horárias organizadas por semestre.</p>
        </div>
      </header>

      {itens.length > 0 ? (
        <>
          <div
            className="informacoes-academicas__proporcao"
            role="img"
            aria-label={`${obrigatorias.length} disciplinas obrigatórias, ${cargaObrigatoria.toLocaleString('pt-BR')} horas; ${optativas.length} optativas, ${cargaOptativa.toLocaleString('pt-BR')} horas`}
          >
            <span style={{ flexGrow: larguraObrigatoria }} />
            <span style={{ flexGrow: larguraOptativa }} />
          </div>
          <p className="informacoes-academicas__explicacao">
            A barra mostra como a carga horária total se divide entre disciplinas obrigatórias e
            optativas.
          </p>
          <ul className="informacoes-academicas__legenda">
            <li>
              <span className="informacoes-academicas__marcador informacoes-academicas__marcador--obrigatoria" aria-hidden="true" />
              <span>
                <strong>Obrigatórias</strong>
                {obrigatorias.length} disciplinas · {cargaObrigatoria.toLocaleString('pt-BR')} h
              </span>
            </li>
            <li>
              <span className="informacoes-academicas__marcador informacoes-academicas__marcador--optativa" aria-hidden="true" />
              <span>
                <strong>Optativas</strong>
                {optativas.length} disciplinas · {cargaOptativa.toLocaleString('pt-BR')} h
              </span>
            </li>
          </ul>

          <nav className="informacoes-academicas__indice" aria-label="Navegar pelos semestres">
            {grupos.map(({ semestre }) => (
              <a
                key={semestre}
                href={`#matriz-semestre-${semestre}`}
                aria-current={
                  semestreAtivo === `matriz-semestre-${semestre}` ? 'location' : undefined
                }
              >
                {semestre}º semestre
              </a>
            ))}
            {optativasVisiveis && eletivas.length > 0 && <a href="#matriz-eletivas">Eletivas</a>}
          </nav>

          <nav className="informacoes-academicas__filtro-abas" aria-label="Filtrar disciplinas">
            {[
              ['todos', 'Todas', itens.length],
              ['obrigatorias', 'Obrigatórias', obrigatorias.length],
              ['optativas', 'Optativas', optativas.length],
            ].map(([valor, titulo, quantidade]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={filtroTipo === valor}
                className={filtroTipo === valor ? 'informacoes-academicas__aba--ativa' : ''}
                onClick={() => mudarFiltroTipo(valor)}
              >
                {titulo} <span>{quantidade}</span>
              </button>
            ))}
          </nav>

          {grupos.map(({ semestre, itens: disciplinas }) => {
            const doGrupo = disciplinas.filter(
              (item) =>
                filtroTipo === 'todos' ||
                (filtroTipo === 'obrigatorias' ? item.obrigatoria : !item.obrigatoria),
            )
            return (
              <section
                className="informacoes-academicas__semestre"
                id={`matriz-semestre-${semestre}`}
                data-indice-semestre
                key={semestre}
                aria-labelledby={`titulo-semestre-${semestre}`}
              >
                <h3 id={`titulo-semestre-${semestre}`}>
                  {semestre}º semestre <small>{doGrupo.length} disciplinas</small>
                </h3>
                {obrigatoriasVisiveis && (
                  <>
                    {filtroTipo === 'todos' && <h4>Obrigatórias</h4>}
                    <TabelaDisciplinas
                      disciplinas={doGrupo.filter((item) => item.obrigatoria)}
                      rotulo={`Disciplinas obrigatórias do ${semestre}º semestre`}
                    />
                  </>
                )}
                {optativasVisiveis && (
                  <>
                    {filtroTipo === 'todos' && doGrupo.some((item) => !item.obrigatoria) && (
                      <h4>Optativas</h4>
                    )}
                    <TabelaDisciplinas
                      disciplinas={doGrupo.filter((item) => !item.obrigatoria)}
                      rotulo={`Disciplinas optativas do ${semestre}º semestre`}
                    />
                  </>
                )}
              </section>
            )
          })}

          {optativasVisiveis && eletivas.length > 0 && (
            <section
              className="informacoes-academicas__semestre"
              id="matriz-eletivas"
              data-indice-semestre
              aria-labelledby="titulo-eletivas"
            >
              <h3 id="titulo-eletivas">
                Eletivas <small>{eletivas.length} disciplinas</small>
              </h3>
              <TabelaDisciplinas disciplinas={eletivas} rotulo="Disciplinas eletivas" />
            </section>
          )}
        </>
      ) : (
        <div className="informacoes-academicas__vazio">
          <h3>A matriz curricular ainda não está disponível</h3>
          <p>
            As disciplinas, cargas horárias e semestres serão exibidos após o cadastro da matriz
            curricular.
          </p>
          <a className="botao-secundario" href={`#curso/${curso.identificador}`}>
            Voltar à visão geral
          </a>
        </div>
      )}
    </section>
  )
}
