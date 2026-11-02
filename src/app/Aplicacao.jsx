import { useEffect, useState } from 'react'
import { basePortal, enderecoPrivado, lerRota, navegar, retornoAutenticado } from './rotas.js'
import EstruturaProfessor from '@/pages/professor/components/EstruturaProfessor.jsx'
import Cabecalho from '@/shared/components/Cabecalho.jsx'
import Rodape from '@/shared/components/Rodape.jsx'
import PaginaInicial from '@/pages/inicio/PaginaInicial.jsx'
import PaginaCursos from '@/pages/cursos/PaginaCursos.jsx'
import PaginaDetalhesCurso from '@/pages/detalhes-curso/PaginaDetalhesCurso.jsx'
import PaginaProjetos from '@/pages/projetos/PaginaProjetos.jsx'
import PaginaSubmissao from '@/pages/submissao/PaginaSubmissao.jsx'
import PaginaAcesso from '../pages/acesso/PaginaAcesso.jsx'
import PaginaLoginAluno from '@/pages/acesso/PaginaLoginAluno.jsx'
import PaginaLoginProfessor from '@/pages/acesso/PaginaLoginProfessor.jsx'
import PaginaLoginAdministracao from '@/pages/acesso/PaginaLoginAdministracao.jsx'
import PaginaPerfil from '../pages/perfil/PaginaPerfil.jsx'
import PaginaProfessor from '@/pages/professor/PaginaProfessor.jsx'
import PaginaAdministracao from '../pages/administracao/PaginaAdministracao.jsx'
import PaginaCoordenacao from '../pages/coordenacao/PaginaCoordenacao.jsx'
import PaginaCadastroAluno from '@/pages/cadastro-aluno/PaginaCadastroAluno.jsx'
import PaginaPainelAluno from '@/pages/painel-aluno/PaginaPainelAluno.jsx'
import PaginaDetalhesSubmissao from '@/pages/professor/PaginaDetalhesSubmissao.jsx'
import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '@/api/professores.js'
import { atualizarStatusProjeto, excluirProjeto } from '@/api/projetos.js'
import { listarSubmissoes } from '@/api/submissoes.js'
import { limparDadosLocais } from './limparDadosLocais.js'

function identificarPagina(rota) {
  if (['projetos', 'biblioteca'].includes(rota)) return 'projetos'
  if (['acesso', 'acesso-professor', 'acesso-administracao'].includes(rota)) return 'acesso'
  if (rota === 'aluno/cadastro') return 'aluno-cadastro'
  if (rota === 'aluno/painel') return 'aluno-painel'
  if (rota === 'administracao' || rota.startsWith('administracao/')) return 'administracao'
  if (rota === 'coordenacao' || rota.startsWith('coordenacao/')) return 'coordenacao'
  if (rota === 'submeter') return 'submissao'
  if (
    rota === 'professor' ||
    rota === 'professor/painel' ||
    rota === 'professor/perfil' ||
    rota.startsWith('professor/submissao/')
  )
    return 'professor'
  if (rota.startsWith('curso/')) return 'detalhes-curso'
  if (['cursos', 'catalogo'].includes(rota)) return 'cursos'
  if (!rota || rota === 'inicio') return 'inicio'
  return null
}

function lerTema() {
  try {
    const salvo = localStorage.getItem('portal-cursos-tema')
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    /* A navegação continua sem armazenamento local. */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

export default function Aplicacao() {
  const [sessao, definirSessao] = useState(() => {
    try {
      const salva = JSON.parse(sessionStorage.getItem('portal-cursos-sessao') || 'null')
      return salva && Date.now() < salva.expiraEm ? salva : null
    } catch {
      return null
    }
  })
  const [decisoes, definirDecisoes] = useState({})
  const [listaSubmissoes, definirListaSubmissoes] = useState([])
  const [rascunhos, definirRascunhos] = useState({ cursos: [], projetos: [], disciplinas: [] })
  const [sessaoExpirada, definirSessaoExpirada] = useState(false)
  const [tema, definirTema] = useState(lerTema)
  const [rota, definirRota] = useState(lerRota)
  const [pagina, definirPagina] = useState(() => identificarPagina(lerRota()) || 'inicio')
  const [rotaCurso, definirRotaCurso] = useState(() =>
    window.location.hash.startsWith('#curso/') ? window.location.hash.slice(1) : '',
  )
  useEffect(() => {
    try {
      if (sessao) sessionStorage.setItem('portal-cursos-sessao', JSON.stringify(sessao))
      else sessionStorage.removeItem('portal-cursos-sessao')
    } catch {
      /* A sessão permanece disponível em memória quando o armazenamento está bloqueado. */
    }
  }, [sessao])
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try {
      localStorage.setItem('portal-cursos-tema', tema)
    } catch {
      /* Preferência mantida nesta sessão. */
    }
  }, [tema])
  useEffect(() => {
    const acompanharRota = () => {
      const destino = lerRota()
      definirRota(destino)
      const proximaPagina = identificarPagina(destino)
      if (proximaPagina) {
        definirPagina(proximaPagina)
        if (destino.startsWith('curso/')) definirRotaCurso(destino)
        if (!destino.startsWith('curso/') || destino.split('/').length === 2)
          window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
    function acompanharLink(evento) {
      const link = evento.target.closest('a')
      if (
        !link ||
        evento.defaultPrevented ||
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey ||
        link.target ||
        link.hasAttribute('download')
      )
        return
      const url = new URL(link.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.hash === '#conteudo') return
      const privado =
        url.pathname === enderecoPrivado('login') ||
        url.pathname === enderecoPrivado('professor/login') ||
        url.pathname === enderecoPrivado('administracao/login') ||
        url.pathname.startsWith(enderecoPrivado('professor')) ||
        url.pathname.startsWith(enderecoPrivado('administracao')) ||
        url.pathname.startsWith(enderecoPrivado('coordenacao')) ||
        url.pathname.startsWith(enderecoPrivado('aluno'))
      const sairDoPainel =
        [
          'acesso-professor',
          'acesso-administracao',
          'professor',
          'administracao',
          'coordenacao',
          'aluno-cadastro',
          'aluno-painel',
        ].includes(identificarPagina(lerRota())) && url.pathname === basePortal
      if (privado || sairDoPainel) {
        evento.preventDefault()
        navegar(url.pathname + url.search + url.hash)
      }
    }
    window.addEventListener('hashchange', acompanharRota)
    window.addEventListener('popstate', acompanharRota)
    document.addEventListener('click', acompanharLink)
    return () => {
      window.removeEventListener('hashchange', acompanharRota)
      window.removeEventListener('popstate', acompanharRota)
      document.removeEventListener('click', acompanharLink)
    }
  }, [])
  useEffect(() => {
    if (pagina !== 'detalhes-curso')
      document.title =
        pagina === 'projetos'
          ? 'Projetos — Portal de Cursos'
          : pagina === 'cursos'
            ? 'Cursos — Portal de Cursos'
            : pagina === 'submissao'
              ? 'Submeter projeto — Portal de Cursos'
              : pagina === 'administracao'
                ? 'Administração — Portal de Cursos'
                : pagina === 'acesso'
                  ? 'Entrar — Portal de Cursos'
                  : pagina === 'professor'
                    ? sessao
                      ? 'Avaliações — Portal de Cursos'
                      : 'Entrar — Portal de Cursos'
                    : 'Portal de Cursos — Formação e produção acadêmica'
  }, [pagina, sessao])
  useEffect(() => {
    if (!sessao) return
    function verificarValidade() {
      if (Date.now() >= sessao.expiraEm) {
        definirSessao(null)
        definirSessaoExpirada(true)
        limparDadosLocais()
      }
    }
    const temporizador = window.setTimeout(
      verificarValidade,
      Math.max(0, sessao.expiraEm - Date.now()),
    )
    window.addEventListener('focus', verificarValidade)
    document.addEventListener('visibilitychange', verificarValidade)
    return () => {
      window.clearTimeout(temporizador)
      window.removeEventListener('focus', verificarValidade)
      document.removeEventListener('visibilitychange', verificarValidade)
    }
  }, [sessao])

  useEffect(() => {
    if (!sessao?.token) return
    const controller = new AbortController()

    async function sincronizarSubmissoes() {
      try {
        const [dados, cursosCadastrados, professoresCadastrados] = await Promise.all([
          listarSubmissoes(sessao.token, controller.signal),
          listarCursos(controller.signal).catch(() => []),
          listarProfessores(sessao.token, {}, controller.signal).catch(() => []),
        ])

        if (Array.isArray(dados) && dados.length > 0) {
          const mapaCursos = new Map(
            (Array.isArray(cursosCadastrados) ? cursosCadastrados : []).map((c) => [
              String(c.id),
              c,
            ]),
          )
          const mapaProfessores = new Map(
            (Array.isArray(professoresCadastrados) ? professoresCadastrados : []).map((prof) => [
              String(prof.id),
              prof.nome || prof.usuario?.nome || '',
            ]),
          )

          const mapeadas = dados.map((p) => {
            const orientadorObj = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
            const primeiroAutor =
              Array.isArray(p.autores) && p.autores.length > 0 ? p.autores[0] : null
            const nomeAutor =
              primeiroAutor?.nome ||
              (typeof primeiroAutor === 'string' ? primeiroAutor : '') ||
              'Aluno'
            const dataFormatada = p.dataInicio
              ? new Date(p.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')
              : ''
            const infoCurso = mapaCursos.get(String(p.cursoId))
            const nomeProfessorReal = orientadorObj?.professorId
              ? mapaProfessores.get(String(orientadorObj.professorId)) ||
                orientadorObj?.nome ||
                `Professor ${orientadorObj.professorId}`
              : ''

            return {
              identificador: String(p.id),
              id: p.id,
              cursoId: p.cursoId,
              campusId: p.campusId,
              curso:
                infoCurso?.sigla || infoCurso?.acronimo || (p.cursoId ? `Curso #${p.cursoId}` : ''),
              cursoCompleto: infoCurso?.nome || (p.cursoId ? `Curso #${p.cursoId}` : ''),
              titulo: p.nome,
              tipo:
                p.tipoProjeto === 'TCC'
                  ? 'TCC'
                  : p.tipoProjeto === 'PROJETO_INTEGRADOR'
                    ? 'Projeto Integrador'
                    : p.tipoProjeto === 'PROJETO_PESQUISA'
                      ? 'Pesquisa'
                      : p.tipoProjeto === 'PROJETO_EXTENSAO'
                        ? 'Extensão'
                        : p.tipoProjeto || '',
              orientador: nomeProfessorReal,
              orientadorId: orientadorObj?.professorId || null,
              autor: nomeAutor,
              autores: Array.isArray(p.autores) ? p.autores : [],
              enviadoEm: dataFormatada,
              dataInicio: p.dataInicio,
              dataFim: p.dataFim,
              documentos: Array.isArray(p.documentos) ? p.documentos : [],
              status:
                p.statusProjeto === 'EM_ANALISE'
                  ? 'Aguardando Orientador'
                  : p.statusProjeto === 'APROVADO'
                    ? 'Em análise'
                    : p.statusProjeto === 'ANALISE_PUBLICACAO'
                      ? 'Em análise'
                      : p.statusProjeto === 'PUBLICADO'
                        ? 'Aprovado'
                        : p.statusProjeto === 'RECUSADO'
                          ? 'Recusado'
                          : p.statusProjeto,
              resumo: p.resumo,
              objetivo: p.descricao,
              tipoAutor: 'ALUNO',
            }
          })
          definirListaSubmissoes(mapeadas)
        } else if (Array.isArray(dados)) {
          definirListaSubmissoes([])
        }
      } catch {
        /* Mantém as submissões já existentes */
      }
    }

    sincronizarSubmissoes()
    return () => controller.abort()
  }, [sessao?.token])

  function entrar(novaSessao) {
    definirSessao(novaSessao)
    definirSessaoExpirada(false)
    if (novaSessao.tipoUsuario === 'ALUNO') {
      navegar(enderecoPrivado('aluno/painel'), true)
    } else {
      navegar(enderecoPrivado(retornoAutenticado(novaSessao.tipoUsuario)), true)
    }
  }
  function sair() {
    definirSessao(null)
    definirSessaoExpirada(false)
    definirDecisoes({})
    definirListaSubmissoes([])
    definirRascunhos({ cursos: [], projetos: [], disciplinas: [] })
    limparDadosLocais()
    navegar(enderecoPrivado('login'), true)
  }
  useEffect(() => {
    const noSitePublico = window.location.pathname === basePortal
    const ePaginaLogin = pagina === 'acesso'
    const areaDaSessao =
      sessao?.tipoUsuario === 'ADMIN'
        ? 'administracao'
        : sessao?.tipoUsuario === 'COORDENADOR'
          ? 'coordenacao'
          : sessao?.tipoUsuario === 'ALUNO'
            ? 'aluno-painel'
            : 'professor'
    if (['administracao', 'coordenacao', 'professor', 'aluno-painel'].includes(pagina) && !sessao) {
      const destino =
        pagina === 'administracao'
          ? rota === 'administracao'
            ? 'administracao/painel'
            : rota
          : pagina === 'coordenacao'
            ? rota === 'coordenacao'
              ? 'coordenacao/painel'
              : rota
            : pagina === 'aluno-painel'
              ? 'aluno/painel'
              : rota.startsWith('professor/submissao/') ||
                  ['professor/perfil', 'professor/painel'].includes(rota)
                ? rota
                : 'professor/feed'
      const login = 'login'
      navegar(`${enderecoPrivado(login)}?retorno=${encodeURIComponent(destino)}`, true)
    } else if (ePaginaLogin && sessao) {
      const destino = new URLSearchParams(window.location.search).get('retorno')
      navegar(enderecoPrivado(destino || retornoAutenticado(sessao.tipoUsuario)), true)
    } else if (
      sessao &&
      ['professor', 'administracao', 'coordenacao', 'aluno-painel'].includes(pagina) &&
      pagina !== areaDaSessao
    ) {
      navegar(
        enderecoPrivado(
          areaDaSessao === 'professor'
            ? 'professor/feed'
            : areaDaSessao === 'aluno-painel'
              ? 'aluno/painel'
              : `${areaDaSessao}/painel`,
        ),
        true,
      )
    } else if (
      sessao &&
      pagina === 'professor' &&
      window.location.pathname.endsWith('/professor/painel')
    ) {
      navegar(enderecoPrivado('professor/feed'), true)
    } else if (ePaginaLogin && noSitePublico) {
      navegar(enderecoPrivado('login'), true)
    } else if (pagina === 'professor' && noSitePublico) {
      navegar(enderecoPrivado(rota === 'professor' ? 'professor/feed' : rota), true)
    }
  }, [pagina, rota, sessao])
  const [, identificador, aba] = rotaCurso.split('/')
  const identificadorSubmissao =
    rota.startsWith('professor/submissao/') || rota.startsWith('coordenacao/submissao/')
      ? rota.split('/')[2]
      : ''
  const secaoAtiva =
    rota === 'biblioteca' || rota.startsWith('projeto/')
      ? 'projetos'
      : rota === 'submeter'
        ? 'submeter'
        : pagina === 'acesso'
          ? pagina
          : pagina === 'detalhes-curso'
            ? 'cursos'
            : pagina
  const ePaginaLogin = pagina === 'acesso'
  const caminhoLogin = window.location.pathname.slice(basePortal.length).replace(/^\//, '')
  const PaginaDeLogin =
    caminhoLogin === 'aluno/login'
      ? PaginaLoginAluno
      : ['professor/login', 'login/professor'].includes(caminhoLogin)
        ? PaginaLoginProfessor
        : ['administracao/login', 'admin/login', 'login/admin'].includes(caminhoLogin)
          ? PaginaLoginAdministracao
          : PaginaAcesso
  if (pagina === 'aluno-cadastro') {
    return (
      <>
        <a className="pular-conteudo" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Cabecalho modoAcesso tema={tema} alternarTema={definirTema} pagina="acesso" />
        <PaginaCadastroAluno />
        <Rodape pagina="acesso" />
      </>
    )
  }
  if (
    ePaginaLogin ||
    ['professor', 'administracao', 'coordenacao', 'aluno-painel'].includes(pagina)
  ) {
    const administrador = sessao?.tipoUsuario === 'ADMIN'
    const coordenador = sessao?.tipoUsuario === 'COORDENADOR'
    const aluno = sessao?.tipoUsuario === 'ALUNO'
    const areaDaSessao = administrador
      ? 'administracao'
      : coordenador
        ? 'coordenacao'
        : aluno
          ? 'aluno-painel'
          : 'professor'
    if (sessao && (ePaginaLogin || pagina !== areaDaSessao))
      return (
        <main id="conteudo" className="limite pagina-painel">
          <p role="status">Abrindo sua área…</p>
        </main>
      )
    return (
      <EstruturaProfessor
        administrador={administrador}
        coordenador={coordenador}
        aluno={aluno}
        rota={rota}
        perfilAtivo={['professor/perfil', 'administracao/perfil', 'coordenacao/perfil'].includes(
          rota,
        )}
        usuario={sessao?.usuario}
        aoSair={sair}
        tema={tema}
        alternarTema={definirTema}
      >
        <a className="pular-conteudo" href="#conteudo">
          Pular para o conteúdo
        </a>
        {!sessao ? (
          <PaginaDeLogin aoEntrar={entrar} sessaoExpirada={sessaoExpirada} />
        ) : ['professor/perfil', 'administracao/perfil', 'coordenacao/perfil'].includes(rota) ? (
          <PaginaPerfil
            destinoVoltar={
              areaDaSessao === 'professor'
                ? 'professor/feed'
                : areaDaSessao === 'aluno-painel'
                  ? 'aluno/painel'
                  : `${areaDaSessao}/painel`
            }
            usuario={sessao.usuario}
            aoSalvar={(perfil) =>
              definirSessao((atual) => ({ ...atual, usuario: { ...atual.usuario, ...perfil } }))
            }
          />
        ) : administrador ? (
          <PaginaAdministracao
            secao={rota.split('/')[1] || 'painel'}
            identificador={rota.split('/')[2]}
            sessao={sessao}
            rascunhos={rascunhos}
            aoAlterar={(dominio, itens) =>
              definirRascunhos((atual) => ({ ...atual, [dominio]: itens }))
            }
            submissoes={listaSubmissoes.map((item) => ({
              ...item,
              status:
                decisoes[item.identificador]?.status || decisoes[item.identificador] || item.status,
            }))}
          />
        ) : aluno && pagina === 'aluno-painel' ? (
          <PaginaPainelAluno
            sessao={sessao}
            submissoes={listaSubmissoes.map((item) => ({
              ...item,
              status: decisoes[item.identificador]?.status || item.status,
            }))}
            aoSubmeter={(novaSubmissao) =>
              definirListaSubmissoes((atuais) => [novaSubmissao, ...atuais])
            }
          />
        ) : coordenador && !identificadorSubmissao ? (
          <PaginaCoordenacao
            secao={rota.split('/')[1] || 'painel'}
            sessao={sessao}
            rascunhos={rascunhos}
            aoAlterar={(dominio, itens) =>
              definirRascunhos((atual) => ({ ...atual, [dominio]: itens }))
            }
            submissoes={listaSubmissoes.map((item) => ({
              ...item,
              status:
                decisoes[item.identificador]?.status || decisoes[item.identificador] || item.status,
            }))}
          />
        ) : identificadorSubmissao ? (
          <PaginaDetalhesSubmissao
            key={identificadorSubmissao}
            item={listaSubmissoes.find((item) => item.identificador === identificadorSubmissao)}
            tipoUsuario={sessao.tipoUsuario}
            usuario={sessao.usuario}
            token={sessao.token}
            cursoId={sessao.usuario.cursoId}
            decisao={decisoes[identificadorSubmissao]}
            aoDecidir={(status, justificativa) => {
              const submissao = listaSubmissoes.find(
                (item) => item.identificador === identificadorSubmissao,
              )

              // Sincroniza com o backend via PATCH /api/projetos/{id}/status
              if (submissao?.id && sessao?.token) {
                let statusBackend = null
                if (sessao.tipoUsuario === 'PROFESSOR') {
                  if (status === 'Em análise' || status === 'Aceito') statusBackend = 'APROVADO'
                  else if (status === 'Recusado') statusBackend = 'RECUSADO'
                } else if (sessao.tipoUsuario === 'COORDENADOR') {
                  if (status === 'Aprovado') {
                    atualizarStatusProjeto(submissao.id, 'ANALISE_PUBLICACAO', sessao.token)
                      .then(() => atualizarStatusProjeto(submissao.id, 'PUBLICADO', sessao.token))
                      .catch(() => {})
                  } else if (status === 'Recusado') {
                    statusBackend = 'RECUSADO'
                  }
                }
                if (statusBackend) {
                  atualizarStatusProjeto(submissao.id, statusBackend, sessao.token).catch(() => {})
                }
              }

              definirListaSubmissoes((atuais) =>
                atuais.map((item) =>
                  item.identificador === identificadorSubmissao ? { ...item, status } : item,
                ),
              )

              definirDecisoes((atuais) => ({
                ...atuais,
                [identificadorSubmissao]: {
                  status,
                  justificativa,
                  papel: sessao.tipoUsuario,
                  usuarioId: sessao.usuario.id,
                  cursoId: submissao?.identificadorCurso || submissao?.cursoId || submissao?.curso,
                  registradoEm: new Date().toISOString(),
                },
              }))
            }}
            aoEditar={(alteracoes) => {
              definirListaSubmissoes((itens) =>
                itens.map((item) =>
                  item.identificador === identificadorSubmissao ? { ...item, ...alteracoes } : item,
                ),
              )
            }}
            aoRemover={() => {
              const submissao = listaSubmissoes.find(
                (item) => item.identificador === identificadorSubmissao,
              )
              if (submissao?.id && sessao?.token) {
                excluirProjeto(submissao.id, sessao.token).catch(() => {})
              }
              definirListaSubmissoes((itens) =>
                itens.filter((item) => item.identificador !== identificadorSubmissao),
              )
              definirDecisoes((atuais) => {
                const proxima = { ...atuais }
                delete proxima[identificadorSubmissao]
                return proxima
              })
            }}
          />
        ) : (
          <PaginaProfessor
            usuario={sessao.usuario}
            submissoes={listaSubmissoes.map((item) => ({
              ...item,
              status:
                decisoes[item.identificador]?.status || decisoes[item.identificador] || item.status,
            }))}
          />
        )}
      </EstruturaProfessor>
    )
  }
  return (
    <>
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho
        destinoArea={
          sessao?.tipoUsuario === 'ADMIN'
            ? 'administracao/painel'
            : sessao?.tipoUsuario === 'COORDENADOR'
              ? 'coordenacao/painel'
              : 'professor/feed'
        }
        destinoPerfil={
          sessao?.tipoUsuario === 'ADMIN'
            ? 'administracao/perfil'
            : sessao?.tipoUsuario === 'COORDENADOR'
              ? 'coordenacao/perfil'
              : 'professor/perfil'
        }
        tipoUsuario={sessao?.tipoUsuario}
        usuario={sessao?.usuario}
        aoSair={sair}
        pagina={secaoAtiva}
        autenticado={Boolean(sessao)}
        tema={tema}
        alternarTema={(proximoTema) => definirTema(proximoTema)}
      />
      {pagina === 'cursos' && <PaginaCursos />}
      {pagina === 'projetos' && <PaginaProjetos />}
      {pagina === 'detalhes-curso' && (
        <PaginaDetalhesCurso key={identificador} identificador={identificador} aba={aba} />
      )}
      {pagina === 'submissao' && (
        <PaginaSubmissao
          sessao={sessao}
          aoSubmeter={(novaSubmissao) =>
            definirListaSubmissoes((atuais) => [novaSubmissao, ...atuais])
          }
        />
      )}
      {pagina === 'aluno-cadastro' && <PaginaCadastroAluno />}
      {pagina === 'inicio' && <PaginaInicial />}
      <Rodape pagina={pagina} />
    </>
  )
}
