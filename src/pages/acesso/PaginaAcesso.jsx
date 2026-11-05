import PainelInstitucional from '@/shared/components/PainelInstitucional.jsx'
import { useEffect, useRef, useState } from 'react'
import { autenticarConta } from './services/autenticarConta.js'
import { basePortal, enderecoPrivado } from '@/app/rotas.js'
import logoPortal from '@/assets/marca/logo-portal.png'
import Icone from '@/shared/components/Icone.jsx'
import './acesso.css'

const TEMPO_LIMITE_MS = 15000
const MOTIVO_TEMPO_ESGOTADO = 'tempo-esgotado'
const MOTIVO_DESMONTADO = 'desmontado'

function validarFormulario(identificacao, senha) {
  const erros = {}

  if (!identificacao.trim()) {
    erros.identificacao = 'Informe seu e-mail.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identificacao.trim())) {
    erros.identificacao = 'Informe um e-mail válido.'
  }

  if (!senha) {
    erros.senha = 'Informe sua senha.'
  }

  return erros
}

function MensagemErro({ id, texto }) {
  if (!texto) return null
  return (
    <p className="acesso-erro-campo" id={id}>
      <Icone nome="erro-cursos" classe="acesso-erro-campo__icone" />
      <span>{texto}</span>
    </p>
  )
}

export default function PaginaAcesso({
  aoEntrar,
  sessaoExpirada = false,
  perfil = 'institucional',
}) {
  const [identificacao, definirIdentificacao] = useState('')
  const [senha, definirSenha] = useState('')
  const [mostrarSenha, definirMostrarSenha] = useState(false)
  const [enviando, definirEnviando] = useState(false)
  const [erroGeral, definirErroGeral] = useState('')
  const [erros, definirErros] = useState({})
  const [cadastroConcluido] = useState(
    () => new URLSearchParams(window.location.search).get('cadastro') === 'sucesso',
  )
  const enviandoRef = useRef(false)
  const requisicao = useRef(null)
  const campoIdentificacao = useRef(null)
  const campoSenha = useRef(null)
  const avisoGeral = useRef(null)

  /* Remove o parâmetro da URL depois de exibir o aviso, para ele não reaparecer ao recarregar */
  useEffect(() => {
    if (cadastroConcluido) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    }
  }, [cadastroConcluido])

  /* Cancela a requisição se o usuário sair da tela */
  useEffect(() => {
    return () => requisicao.current?.abort(MOTIVO_DESMONTADO)
  }, [])

  function alterarCampo(campo, valor) {
    if (campo === 'identificacao') {
      definirIdentificacao(valor)
    } else {
      definirSenha(valor)
    }
    definirErros((anteriores) => ({ ...anteriores, [campo]: undefined }))
    definirErroGeral('')
  }

  async function entrar(evento) {
    evento.preventDefault()
    if (enviandoRef.current) return

    const novosErros = validarFormulario(identificacao, senha)
    definirErros(novosErros)
    definirErroGeral('')

    if (Object.keys(novosErros).length) {
      const campo = novosErros.identificacao ? campoIdentificacao.current : campoSenha.current
      campo?.focus()
      return
    }

    enviandoRef.current = true
    definirEnviando(true)

    const controle = new AbortController()
    requisicao.current = controle
    const limite = window.setTimeout(() => controle.abort(MOTIVO_TEMPO_ESGOTADO), TEMPO_LIMITE_MS)
    let concluido = false

    try {
      const sessao = await autenticarConta(identificacao.trim(), senha, controle.signal)
      concluido = true
      definirSenha('')
      aoEntrar(sessao)
    } catch (falha) {
      if (controle.signal.reason === MOTIVO_DESMONTADO) return

      definirErroGeral(
        controle.signal.reason === MOTIVO_TEMPO_ESGOTADO
          ? 'O serviço demorou para responder. Tente novamente.'
          : falha.message,
      )
      definirSenha('')
      window.requestAnimationFrame(() => avisoGeral.current?.focus())
    } finally {
      window.clearTimeout(limite)

      /* Após sucesso, o botão continua bloqueado até a navegação acontecer */
      if (!concluido) {
        enviandoRef.current = false
        if (controle.signal.reason !== MOTIVO_DESMONTADO) definirEnviando(false)
      }
    }
  }

  const rotuloPerfil =
    perfil === 'aluno'
      ? 'Portal do Aluno'
      : perfil === 'professor'
        ? 'Portal Docente'
        : perfil === 'administracao'
          ? 'Gestão Institucional'
          : 'Acesso Institucional'

  return (
    <main id="conteudo" className={`limite pagina-acesso acesso-login acesso-login--${perfil}`}>
      <div className="acesso-login__coluna">
        <section
          className="acesso-login__cartao layout-autenticacao"
          aria-labelledby="titulo-entrar"
        >
          <div className="acesso-login__conteudo">
            <div className="acesso-login__topo">
              <div className="acesso-login__marca">
                <span className="acesso-login__logo">
                  <img src={logoPortal} alt="" width="28" height="28" />
                </span>
                <div className="acesso-login__marca-textos">
                  <strong>Portal de Cursos</strong>
                  <span>{rotuloPerfil}</span>
                </div>
              </div>
            </div>

            <div className="acesso-login__cabecalho">
              <h1 id="titulo-entrar">
                {perfil === 'aluno'
                  ? 'Acesse sua conta de aluno'
                  : perfil === 'professor'
                    ? 'Acesso do professor'
                    : perfil === 'administracao'
                      ? 'Acesso administrativo'
                      : 'Entre na sua conta'}
              </h1>
              <p className="acesso-login__subtitulo">
                {perfil === 'aluno'
                  ? 'Acompanhe seus projetos e cada etapa da avaliação.'
                  : perfil === 'professor'
                    ? 'Acesse as submissões e acompanhe seus orientandos.'
                    : perfil === 'administracao'
                      ? 'Gerencie os cursos e acompanhe a produção acadêmica.'
                      : 'Acompanhe seus projetos e cada etapa da avaliação.'}
              </p>
            </div>

            {cadastroConcluido && (
              <p className="acesso-aviso acesso-aviso--sucesso" role="status">
                <Icone nome="confirmacao-cursos" classe="acesso-aviso__icone" />
                <span>Conta criada com sucesso. Entre com seu e-mail e senha.</span>
              </p>
            )}

            {sessaoExpirada && (
              <p className="acesso-aviso" role="status">
                <Icone nome="informacao-cursos" classe="acesso-aviso__icone" />
                <span>Sua sessão expirou. Entre novamente para continuar.</span>
              </p>
            )}

            <form onSubmit={entrar} noValidate aria-busy={enviando}>
              <div className="acesso-campo">
                <label htmlFor="identificacao">E-mail institucional</label>
                <div className="acesso-entrada">
                  <span className="acesso-entrada__icone" aria-hidden="true">
                    <Icone nome="email" />
                  </span>
                  <input
                    ref={campoIdentificacao}
                    id="identificacao"
                    type="email"
                    inputMode="email"
                    name="username"
                    placeholder="voce@instituicao.edu.br"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    value={identificacao}
                    onChange={(evento) => alterarCampo('identificacao', evento.target.value)}
                    readOnly={enviando}
                    aria-invalid={erros.identificacao ? true : undefined}
                    aria-describedby={erros.identificacao ? 'erro-identificacao' : undefined}
                  />
                </div>
                <MensagemErro id="erro-identificacao" texto={erros.identificacao} />
              </div>

              <div className="acesso-campo">
                <label htmlFor="senha">Senha</label>
                <div className="acesso-senha">
                  <span className="acesso-entrada__icone" aria-hidden="true">
                    <Icone nome="senha" />
                  </span>
                  <input
                    ref={campoSenha}
                    id="senha"
                    name="password"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(evento) => alterarCampo('senha', evento.target.value)}
                    readOnly={enviando}
                    aria-invalid={erros.senha ? true : undefined}
                    aria-describedby={erros.senha ? 'erro-senha' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => definirMostrarSenha((mostrando) => !mostrando)}
                    aria-controls="senha"
                    aria-pressed={mostrarSenha}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Icone nome={mostrarSenha ? 'ocultar' : 'mostrar'} />
                  </button>
                </div>
                <MensagemErro id="erro-senha" texto={erros.senha} />
              </div>

              {erroGeral && (
                <p
                  ref={avisoGeral}
                  className="acesso-aviso acesso-aviso--erro"
                  role="alert"
                  tabIndex={-1}
                >
                  <Icone nome="aviso-projetos-detalhe" classe="acesso-aviso__icone" />
                  <span>{erroGeral}</span>
                </p>
              )}

              <button className="botao-primario acesso-entrar" type="submit" disabled={enviando}>
                <span>{enviando ? 'Entrando…' : 'Acessar conta'}</span>
              </button>

              <span className="somente-leitores" role="status">
                {enviando ? 'Verificando seus dados de acesso.' : ''}
              </span>
            </form>

            <div className="acesso-login__aluno">
              <div className="acesso-login__aluno-texto">
                <strong>Primeiro acesso?</strong>
                <span>Exclusivo para estudantes matriculados</span>
              </div>
              <a href={enderecoPrivado('aluno/cadastro')}>
                <Icone nome="cadastro-aluno" />
                <span>Crie sua conta de aluno</span>
              </a>
            </div>
          </div>

          <PainelInstitucional />
        </section>

        <p className="acesso-login__ajuda">
          Professores, coordenadores e administradores acessam com as credenciais fornecidas pela
          coordenação. <a href={basePortal}>Voltar ao portal</a>
        </p>
      </div>
    </main>
  )
}
