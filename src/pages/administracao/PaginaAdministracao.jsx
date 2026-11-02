import { useCallback, useEffect, useState } from 'react'
import { listarAreasConhecimento, listarCampus, listarCursos } from '@/api/cursos.js'
import { listarDisciplinasPorCurso } from '@/api/disciplinas.js'
import { enderecoPrivado } from '../../app/rotas.js'
import GestaoConteudos from './components/GestaoConteudos.jsx'
import GestaoCampus from './components/GestaoCampus.jsx'
import GestaoProfessores from './components/GestaoProfessores.jsx'
import GestaoUsuarios from './components/GestaoUsuarios.jsx'
import TabelaSubmissoes from './components/TabelaSubmissoes.jsx'
import '@/shared/styles/painel.css'
import './administracao.css'

function IconeIndicador({ tipo }) {
  const desenho = {
    cursos: <path d="m3 9 9-5 9 5-9 5-9-5Zm4 2.2v4.5c3.2 2.5 6.8 2.5 10 0v-4.5M21 9v6" />,
    disciplinas: (
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22V4.5Zm0 13A2.5 2.5 0 0 1 7.5 15H20M9 6h7M9 9h6" />
    ),
    campus: <path d="M4 21V5l8-3 8 3v16M2 21h20M8 8h1m6 0h1m-8 4h1m6 0h1m-7 9v-4h4v4" />,
    areas: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
  }[tipo]
  return (
    <span
      className={`administracao-indicador__icone administracao-indicador__icone--${tipo}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {desenho}
      </svg>
    </span>
  )
}

function PainelAdministracao({ token }) {
  const [resumo, definirResumo] = useState(null)
  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState('')

  const carregar = useCallback(
    async (sinal) => {
      definirCarregando(true)
      definirErro('')
      try {
        const [cursos, campus, areas] = await Promise.all([
          listarCursos(sinal),
          listarCampus(sinal),
          listarAreasConhecimento(sinal),
        ])
        const disciplinasPorCurso = await Promise.all(
          cursos.map((curso) => listarDisciplinasPorCurso(curso.id, token, sinal)),
        )
        definirResumo({
          cursos,
          disciplinas: disciplinasPorCurso.flat(),
          campus,
          areas,
        })
      } catch (falha) {
        if (!sinal?.aborted)
          definirErro(falha.message || 'Não foi possível carregar os dados acadêmicos.')
      } finally {
        if (!sinal?.aborted) definirCarregando(false)
      }
    },
    [token],
  )

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => carregar(controller.signal))
    return () => controller.abort()
  }, [carregar])

  return (
    <>
      <header className="painel-titulo administracao-boas-vindas">
        <div>
          <span className="administracao-boas-vindas__rotulo">Visão acadêmica</span>
          <h1>Gestão do portal</h1>
          <p>
            {resumo
              ? `${resumo.cursos.length} cursos e ${resumo.disciplinas.length} disciplinas cadastrados.`
              : 'Acompanhe a estrutura acadêmica cadastrada no portal.'}
          </p>
        </div>
        <div className="administracao-boas-vindas__acoes">
          <a className="botao-secundario" href={enderecoPrivado('administracao/cursos')}>
            Ver cursos <span aria-hidden="true">↗</span>
          </a>
          <button className="botao-primario" onClick={() => carregar()} disabled={carregando}>
            {carregando ? 'Atualizando…' : 'Atualizar dados'}
          </button>
        </div>
      </header>
      {erro && (
        <div className="gestao-aviso" role="alert">
          <p>
            Não foi possível carregar as informações agora. Confira se o sistema está disponível e
            tente de novo.
          </p>
          <button className="botao-secundario" onClick={() => carregar()} disabled={carregando}>
            Tentar novamente
          </button>
        </div>
      )}
      {carregando && !resumo ? (
        <p className="gestao-aviso" role="status">
          Carregando as informações…
        </p>
      ) : resumo ? (
        <>
          <section className="administracao-indicadores" aria-label="Resumo da instituição">
            {[
              ['Cursos', resumo.cursos.length, 'cursos', 'administracao/cursos'],
              [
                'Disciplinas',
                resumo.disciplinas.length,
                'disciplinas',
                'administracao/disciplinas',
              ],
              ['Campus', resumo.campus.length, 'campus', 'administracao/campus'],
              ['Áreas de conhecimento', resumo.areas.length, 'areas', null],
            ].map(([rotulo, total, tipo, destino]) => {
              const conteudo = (
                <>
                  <IconeIndicador tipo={tipo} />
                  <span className="administracao-indicador__texto">
                    <span>{rotulo}</span>
                    <strong>{total}</strong>
                  </span>
                  {destino && (
                    <span className="administracao-indicador__seta" aria-hidden="true">
                      →
                    </span>
                  )}
                </>
              )
              return destino ? (
                <a className="administracao-indicador" href={enderecoPrivado(destino)} key={rotulo}>
                  {conteudo}
                </a>
              ) : (
                <div className="administracao-indicador" key={rotulo}>
                  {conteudo}
                </div>
              )
            })}
          </section>
          <section
            className="painel-secao administracao-registros"
            aria-labelledby="cursos-recentes"
          >
            <header>
              <div>
                <h2 id="cursos-recentes">Cursos cadastrados</h2>
                <p>Dados acadêmicos disponíveis no portal.</p>
              </div>
              <a href={enderecoPrivado('administracao/cursos')}>
                Ver todos os cursos <span aria-hidden="true">→</span>
              </a>
            </header>
            {resumo.cursos.length ? (
              <div
                className="tabela-submissoes"
                role="region"
                aria-label="Formações cadastradas"
                tabIndex={0}
              >
                <table>
                  <caption className="somente-leitores">Cursos disponíveis no portal</caption>
                  <thead>
                    <tr>
                      <th scope="col">Curso</th>
                      <th scope="col">Grau</th>
                      <th scope="col">Turno</th>
                      <th scope="col">Modalidade</th>
                      <th scope="col">Carga horária</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.cursos.slice(0, 8).map((curso) => (
                      <tr key={curso.id}>
                        <th scope="row">
                          {curso.nome}
                          <span>{curso.sigla || curso.acronimo}</span>
                        </th>
                        <td>{curso.grau}</td>
                        <td>{curso.turno || '—'}</td>
                        <td>{curso.modalidade || '—'}</td>
                        <td>{curso.cargaHoraria || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="administracao-vazio">
                <strong>Ainda não há formações cadastradas.</strong>
                <p>Adicione a primeira formação para começar a organizar as matérias.</p>
                <a className="botao-primario" href={enderecoPrivado('administracao/cursos')}>
                  Cadastrar formação
                </a>
              </div>
            )}
          </section>
          <section className="administracao-secao-atalhos">
            <header>
              <div>
                <h2>O que você quer fazer?</h2>
                <p>Escolha uma tarefa para continuar.</p>
              </div>
            </header>
            <div className="administracao-categorias">
              {[
                [
                  'Pessoas',
                  [
                    ['usuarios', 'Contas de acesso', 'Gerencie quem pode entrar no portal'],
                    ['professores', 'Professores', 'Cadastre e atualize quem dá aula'],
                  ],
                ],
                [
                  'Formações e matérias',
                  [
                    ['cursos', 'Formações', `${resumo.cursos.length} no portal · ver e organizar`],
                    [
                      'disciplinas',
                      'Matérias',
                      `${resumo.disciplinas.length} no portal · ver e organizar`,
                    ],
                    ['projetos', 'Trabalhos acadêmicos', 'Consulte os trabalhos cadastrados'],
                  ],
                ],
              ].map(([titulo, itens]) => (
                <section className="administracao-categoria" key={titulo}>
                  <h3>{titulo}</h3>
                  <ul>
                    {itens.map(([destino, nome, descricao]) => (
                      <li key={destino}>
                        <a href={enderecoPrivado(`administracao/${destino}`)}>
                          <span className="administracao-categoria__texto">
                            <strong>{nome}</strong>
                            <small>{descricao}</small>
                          </span>
                          <svg aria-hidden="true" viewBox="0 0 16 16">
                            <path d="M3 8h9M8 3l5 5-5 5" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </>
  )
}

export default function PaginaAdministracao({
  secao,
  identificador,
  sessao,
  rascunhos,
  aoAlterar,
  submissoes,
}) {
  if (secao === 'campus')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoCampus identificador={identificador} />
      </main>
    )
  if (secao === 'usuarios')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoUsuarios token={sessao.token} />
      </main>
    )
  if (secao === 'professores')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoProfessores token={sessao.token} />
      </main>
    )
  if (['cursos', 'disciplinas', 'projetos'].includes(secao))
    return (
      <main
        id="conteudo"
        className={`pagina-painel pagina-painel--administracao pagina-painel--${secao}`}
      >
        <GestaoConteudos
          key={secao}
          dominio={secao}
          itens={rascunhos[secao]}
          cursos={rascunhos.cursos}
          disciplinas={rascunhos.disciplinas}
          token={sessao.token}
          aoAlterar={(itens) => aoAlterar(secao, itens)}
        />
      </main>
    )
  if (secao === 'submissoes')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <header className="painel-titulo administracao-boas-vindas">
          <div>
            <span className="administracao-boas-vindas__rotulo">Acompanhamento acadêmico</span>
            <h1>Submissões do portal</h1>
            <p>Consulte as produções submetidas pelos estudantes em todos os cursos.</p>
          </div>
        </header>
        <section className="painel-secao administracao-registros">
          <header>
            <div>
              <h2>Todas as submissões</h2>
              <p>{submissoes.length} produções registradas no portal.</p>
            </div>
          </header>
          <TabelaSubmissoes itens={submissoes} />
        </section>
      </main>
    )
  return (
    <main id="conteudo" className="pagina-painel pagina-painel--administracao">
      <PainelAdministracao token={sessao.token} />
    </main>
  )
}
