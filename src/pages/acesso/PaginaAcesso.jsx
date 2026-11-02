import { useEffect, useRef, useState } from 'react'
import { autenticarConta } from './services/autenticarConta.js'
import { basePortal, enderecoPrivado } from '@/app/rotas.js'
import logoPortal from '@/assets/marca/logo-portal.png'
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
      {texto}
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

  return (
    <main id="conteudo" className={`limite pagina-acesso acesso-login acesso-login--${perfil}`}>
      <div className="acesso-login__coluna">
        <section className="acesso-login__cartao" aria-labelledby="titulo-entrar">
          <div className="acesso-login__conteudo">
            <div className="acesso-login__marca">
              <span className="acesso-login__logo">
                <img src={logoPortal} alt="" width="26" height="26" />
              </span>
              <span>Portal de Cursos</span>
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
                Conta criada. Entre com seu e-mail e senha.
              </p>
            )}

            {sessaoExpirada && (
              <p className="acesso-aviso" role="status">
                Sua sessão expirou. Entre novamente para continuar.
              </p>
            )}

            <form onSubmit={entrar} noValidate aria-busy={enviando}>
              <div className="acesso-campo">
                <label htmlFor="identificacao">E-mail</label>
                <input
                  ref={campoIdentificacao}
                  id="identificacao"
                  type="email"
                  inputMode="email"
                  name="username"
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
                <MensagemErro id="erro-identificacao" texto={erros.identificacao} />
              </div>

              <div className="acesso-campo">
                <label htmlFor="senha">Senha</label>
                <div className="acesso-senha">
                  <input
                    ref={campoSenha}
                    id="senha"
                    name="password"
                    type={mostrarSenha ? 'text' : 'password'}
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
                  >
                    {mostrarSenha ? 'Ocultar' : 'Mostrar'}
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
                  {erroGeral}
                </p>
              )}

              <button className="botao-primario acesso-entrar" type="submit" disabled={enviando}>
                {enviando ? 'Entrando…' : 'Entrar'}
              </button>

              <span className="somente-leitores" role="status">
                {enviando ? 'Verificando seus dados de acesso.' : ''}
              </span>
            </form>

            <div className="acesso-login__aluno">
              <span>Primeiro acesso?</span>
              <a href={enderecoPrivado('aluno/cadastro')}>Crie sua conta de aluno</a>
            </div>
          </div>
          <aside className="acesso-login__vitrine" aria-label="Conheça os projetos do portal">
            <article className="acesso-login__projetos">
              <header>
                <div>
                  <strong>Tipos de projeto</strong>
                  <span>Publicados após aprovação do orientador</span>
                </div>
                <b>4 tipos</b>
              </header>
              <div className="acesso-login__projeto acesso-login__projeto--tcc">
                <span aria-hidden="true">T</span>
                <div>
                  <strong>TCC</strong>
                  <small>Trabalho de conclusão de curso</small>
                </div>
              </div>
              <div className="acesso-login__projeto acesso-login__projeto--integrador">
                <span aria-hidden="true">P</span>
                <div>
                  <strong>Projeto Integrador</strong>
                  <small>Soluções aplicadas ao curso</small>
                </div>
              </div>
              <div className="acesso-login__projeto acesso-login__projeto--pesquisa">
                <span aria-hidden="true">I</span>
                <div>
                  <strong>Pesquisa</strong>
                  <small>Conhecimento em construção</small>
                </div>
              </div>
              <div className="acesso-login__projeto acesso-login__projeto--extensao">
                <span aria-hidden="true">E</span>
                <div>
                  <strong>Extensão</strong>
                  <small>Projetos conectados à comunidade</small>
                </div>
              </div>
              <footer>
                <span>PRODUÇÃO ACADÊMICA</span>
                <b>Seu próximo projeto começa aqui.</b>
              </footer>
            </article>
          </aside>
        </section>

        <p className="acesso-login__ajuda">
          Professores, coordenadores e administradores acessam com as credenciais fornecidas pela
          coordenação. <a href={basePortal}>Voltar ao portal</a>
        </p>
      </div>
    </main>
  )
}
