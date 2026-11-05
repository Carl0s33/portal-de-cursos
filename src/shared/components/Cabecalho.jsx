import { useEffect, useRef, useState } from 'react'
import { basePortal, enderecoPrivado } from '@/app/rotas.js'
import Icone from './Icone.jsx'
import logoPortal from '@/assets/marca/logo-portal.png'
import './cabecalho.css'

const PAGINAS_ADMIN = ['acesso', 'acesso-administracao', 'administracao']
const PAGINAS_PROFESSOR = ['acesso', 'acesso-professor', 'professor']
const PAGINAS_ENTRADA = ['acesso', 'acesso-professor', 'acesso-administracao']

/* Links de navegação de cada papel. Adicionar um papel é adicionar uma linha. */
const LINKS_POR_PAPEL = {
  ADMIN: {
    classe: 'navegacao__admin',
    destino: 'administracao/painel',
    rotulo: 'Administração',
    ativas: PAGINAS_ADMIN,
  },
  PROFESSOR: {
    classe: 'navegacao__acesso',
    destino: 'professor/feed',
    rotulo: 'Área do Professor',
    ativas: PAGINAS_PROFESSOR,
  },
  COORDENADOR: {
    classe: 'navegacao__acesso',
    destino: 'coordenacao/painel',
    rotulo: 'Coordenação do curso',
    ativas: ['coordenacao'],
  },
  ALUNO: {
    classe: 'navegacao__acesso',
    destino: 'aluno/painel',
    rotulo: 'Meus projetos',
    ativas: ['aluno-painel'],
  },
}

function ativoSe(condicao) {
  return condicao ? 'page' : undefined
}

function obterIniciais(nome = '') {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

function IconeMenu({ aberto }) {
  return (
    <svg
      className="cabecalho__icone-menu"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {aberto ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 8h16" />
          <path d="M4 16h16" />
        </>
      )}
    </svg>
  )
}

function Avatar({ usuario }) {
  if (usuario?.foto) {
    return <img src={usuario.foto} alt="" />
  }

  if (usuario?.nome) {
    return (
      <span className="cabecalho__iniciais" aria-hidden="true">
        {obterIniciais(usuario.nome)}
      </span>
    )
  }

  return (
    <span className="avatar" aria-hidden="true">
      <Icone nome="usuario" />
    </span>
  )
}

function SeletorTema({ tema, alternarTema }) {
  const opcoes = [
    { valor: 'claro', rotulo: 'Tema claro', icone: 'sol' },
    { valor: 'escuro', rotulo: 'Tema escuro', icone: 'lua' },
  ]

  return (
    <div className="cabecalho__tema" role="group" aria-label="Tema da interface">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          className="cabecalho__opcao-tema"
          aria-pressed={tema === opcao.valor}
          title={opcao.rotulo}
          onClick={() => alternarTema(opcao.valor)}
        >
          <Icone nome={opcao.icone} />
          <span className="somente-leitores">{opcao.rotulo}</span>
        </button>
      ))}
    </div>
  )
}

export default function Cabecalho({
  tema,
  alternarTema,
  pagina = 'inicio',
  autenticado = false,
  tipoUsuario,
  areaProfessor = false,
  modoAcesso = false,
  aoSair,
  usuario,
  destinoArea = 'professor/feed',
  destinoPerfil = 'professor/perfil',
}) {
  const [menuAberto, definirMenuAberto] = useState(false)
  const [rolado, definirRolado] = useState(false)
  const botaoMenu = useRef(null)

  /* Linha inferior aparece só quando a página é rolada */
  useEffect(() => {
    function aoRolar() {
      definirRolado(window.scrollY > 8)
    }

    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  /* Escape fecha o menu e devolve o foco ao botão que o abriu */
  useEffect(() => {
    if (!menuAberto) return undefined

    function aoPressionarEscape(evento) {
      if (evento.key === 'Escape') {
        definirMenuAberto(false)
        botaoMenu.current?.focus()
      }
    }

    document.addEventListener('keydown', aoPressionarEscape)
    return () => document.removeEventListener('keydown', aoPressionarEscape)
  }, [menuAberto])

  const classes = [
    'cabecalho',
    rolado && 'cabecalho--rolado',
    areaProfessor && 'cabecalho--professor',
    modoAcesso && 'cabecalho--acesso',
  ]
    .filter(Boolean)
    .join(' ')

  const linkPapel = autenticado ? LINKS_POR_PAPEL[tipoUsuario] : undefined
  const mostrarVoltarPortal =
    modoAcesso ||
    (autenticado &&
      (areaProfessor || ['professor', 'coordenacao', 'administracao', 'aluno-painel'].includes(pagina)))

  const linkPerfil = (
    <a
      className={`cabecalho__perfil${tipoUsuario ? ` cabecalho__perfil--${tipoUsuario.toLowerCase()}` : ''}`}
      href={enderecoPrivado(destinoPerfil)}
      aria-label="Meu perfil"
      title={
        areaProfessor
          ? 'Editar meu perfil'
          : tipoUsuario === 'ADMIN'
            ? 'Painel administrativo'
            : 'Meu perfil'
      }
      aria-current={ativoSe(
        pagina === 'perfil' || pagina === 'perfil-aluno' || pagina === 'perfil-professor',
      )}
    >
      <Avatar usuario={usuario} />
    </a>
  )

  const navegacao = areaProfessor ? (
    <>
      {destinoArea && (
        <a
          href={enderecoPrivado(destinoArea)}
          aria-current={ativoSe(
            ['professor', 'coordenacao', 'administracao', 'aluno-painel'].includes(pagina),
          )}
        >
          Minha área
        </a>
      )}
      {destinoPerfil && (
        <a href={enderecoPrivado(destinoPerfil)} aria-current={ativoSe(pagina === 'perfil')}>
          Meu perfil
        </a>
      )}
      <a className="navegacao__portal" href={`${basePortal}#inicio`}>
        Voltar ao portal
      </a>
      <button className="navegacao__sair" type="button" onClick={aoSair}>
        Sair da conta
      </button>
    </>
  ) : (
    <>
      <a href={`${basePortal}#inicio`} aria-current={ativoSe(pagina === 'inicio')}>
        Início
      </a>
      <a href={`${basePortal}#cursos`} aria-current={ativoSe(pagina === 'cursos')}>
        Cursos
      </a>
      <a href={`${basePortal}#projetos`} aria-current={ativoSe(pagina === 'projetos')}>
        Projetos
      </a>
      {(!autenticado || ['ALUNO', 'COORDENADOR'].includes(tipoUsuario)) && (
        <a
          className="navegacao__submeter"
          href={`${basePortal}#submeter`}
          aria-current={ativoSe(pagina === 'submeter')}
        >
          Enviar projeto
        </a>
      )}

      {linkPapel && (
        <a
          className={linkPapel.classe}
          href={enderecoPrivado(linkPapel.destino)}
          aria-current={ativoSe(linkPapel.ativas.includes(pagina))}
        >
          {linkPapel.rotulo}
        </a>
      )}

      {mostrarVoltarPortal && !areaProfessor && (
        <a className="navegacao__portal" href={`${basePortal}#inicio`}>
          Voltar ao portal
        </a>
      )}

      {!autenticado && (
        <a
          className="navegacao__entrar-mobile"
          href={enderecoPrivado('login')}
          aria-current={ativoSe(PAGINAS_ENTRADA.includes(pagina))}
        >
          Entrar
        </a>
      )}

    </>
  )

  const acoes = modoAcesso ? (
    <a className="cabecalho__portal" href={`${basePortal}#inicio`}>
      Voltar ao portal
    </a>
  ) : areaProfessor ? (
    <>
      <a className="cabecalho__portal" href={`${basePortal}#inicio`}>
        Voltar ao portal
      </a>
      {linkPerfil}
      <button className="cabecalho__sair" type="button" onClick={aoSair}>
        Sair
      </button>
    </>
  ) : autenticado ? (
    <>
      {linkPerfil}
      <button className="cabecalho__sair" type="button" onClick={aoSair}>
        Sair
      </button>
    </>
  ) : (
    <a
      className="cabecalho__entrar"
      href={enderecoPrivado('login')}
      aria-current={ativoSe(PAGINAS_ENTRADA.includes(pagina))}
    >
      Entrar
    </a>
  )

  return (
    <header className={classes}>
      <div className="limite cabecalho__conteudo">
        <a
          className="marca marca--cabecalho"
          href={areaProfessor ? enderecoPrivado(destinoArea) : `${basePortal}#inicio`}
          aria-label={areaProfessor ? 'Portal de Cursos — Minha área' : 'Portal de Cursos — Início'}
        >
          <img className="marca__simbolo" src={logoPortal} alt="" width="28" height="28" />
          <span className="marca__texto">
            Portal de <span className="marca__cursos">Cursos</span>
          </span>
        </a>

        {!modoAcesso && (
          <nav
            id="navegacao-principal"
            className={`navegacao ${menuAberto ? 'navegacao--aberta' : ''}`}
            aria-label={areaProfessor ? 'Navegação da área autenticada' : 'Navegação principal'}
            onClick={() => definirMenuAberto(false)}
          >
            {navegacao}
          </nav>
        )}

        <div className="cabecalho__acoes">
          {acoes}
          <SeletorTema tema={tema} alternarTema={alternarTema} />
        </div>

        {!modoAcesso && (
          <button
            ref={botaoMenu}
            className="botao-menu"
            type="button"
            aria-label={menuAberto ? 'Fechar navegação' : 'Abrir navegação'}
            aria-expanded={menuAberto}
            aria-controls="navegacao-principal"
            onClick={() => definirMenuAberto((aberto) => !aberto)}
          >
            <IconeMenu aberto={menuAberto} />
          </button>
        )}
      </div>
    </header>
  )
}
