import { useEffect, useRef, useState } from 'react'
import { basePortal } from '@/app/rotas.js'
import logoPortal from '@/assets/marca/logo-portal.png'
import { listarCursos } from '@/api/cursos.js'
import { cadastrarAluno } from '@/api/alunos.js'
import { ErroApi } from '@/api/cliente.js'
import Icone from '@/shared/components/Icone.jsx'
import '@/pages/acesso/acesso.css'
import './cadastro-aluno.css'

const CAMPOS = ['nome', 'email', 'curso', 'senha', 'confirmarSenha']
const IDS_CAMPOS = {
  nome: 'aluno-nome',
  email: 'aluno-email',
  curso: 'aluno-curso',
  senha: 'aluno-senha',
  confirmarSenha: 'aluno-confirmar-senha',
}
const VALORES_INICIAIS = { nome: '', email: '', curso: '', senha: '', confirmarSenha: '' }
const TAMANHO_MINIMO_SENHA = 8
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Retorna a mensagem de erro de um campo, ou '' se o campo estiver válido. */
function mensagemDoCampo(campo, valores) {
  switch (campo) {
    case 'nome':
      return valores.nome.trim() ? '' : 'Informe seu nome completo.'

    case 'email':
      if (!valores.email.trim()) return 'Informe seu e-mail.'
      return REGEX_EMAIL.test(valores.email.trim())
        ? ''
        : 'Informe um e-mail válido, como nome@instituicao.edu.br.'

    case 'curso':
      return valores.curso ? '' : 'Selecione seu curso.'

    case 'senha':
      if (!valores.senha) return 'Defina uma senha.'
      return valores.senha.length >= TAMANHO_MINIMO_SENHA
        ? ''
        : `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`

    case 'confirmarSenha':
      if (!valores.confirmarSenha) return 'Confirme sua senha.'
      return valores.confirmarSenha === valores.senha ? '' : 'As senhas não coincidem.'

    default:
      return ''
  }
}

/* Só mostra erro em campos que o usuário já tocou. */
function calcularErros(valores, tocados) {
  return CAMPOS.reduce((acumulado, campo) => {
    const mensagem = tocados[campo] ? mensagemDoCampo(campo, valores) : ''
    return mensagem ? { ...acumulado, [campo]: mensagem } : acumulado
  }, {})
}

function calcularTodosErros(valores) {
  const todosTocados = Object.fromEntries(CAMPOS.map((campo) => [campo, true]))
  return calcularErros(valores, todosTocados)
}

/* Junta os ids de descrição que existem, para aria-describedby. */
function descrever(...ids) {
  const existentes = ids.filter(Boolean)
  return existentes.length ? existentes.join(' ') : undefined
}

function MensagemErro({ id, texto }) {
  if (!texto) return null
  return (
    <p className="acesso-erro-campo" id={id}>
      {texto}
    </p>
  )
}

function IconeCampo({ tipo }) {
  const mapaTipo = {
    usuario: 'usuario',
    email: 'email',
    curso: 'formacao-cursos',
    senha: 'senha',
  }

  return <Icone nome={mapaTipo[tipo] || 'ponto'} classe="cadastro-aluno__icone-campo" />
}

export default function PaginaCadastroAluno() {
  const [cursos, definirCursos] = useState([])
  const [carregandoCursos, definirCarregandoCursos] = useState(true)
  const [erroCursos, definirErroCursos] = useState('')
  const [tentativaCursos, definirTentativaCursos] = useState(0)
  const [valores, definirValores] = useState(VALORES_INICIAIS)
  const [tocados, definirTocados] = useState({})
  const [erros, definirErros] = useState({})
  const [mostrarSenha, definirMostrarSenha] = useState(false)
  const [enviando, definirEnviando] = useState(false)
  const [erroGeral, definirErroGeral] = useState('')
  const resumoErro = useRef(null)

  useEffect(() => {
    const controle = new AbortController()

    listarCursos(controle.signal)
      .then((lista) => {
        if (!controle.signal.aborted) definirCursos(lista)
      })
      .catch(() => {
        if (!controle.signal.aborted) {
          definirErroCursos('Não foi possível carregar os cursos agora.')
        }
      })
      .finally(() => {
        if (!controle.signal.aborted) definirCarregandoCursos(false)
      })

    return () => controle.abort()
  }, [tentativaCursos])

  function tentarNovamenteCursos() {
    definirErroCursos('')
    definirCarregandoCursos(true)
    definirTentativaCursos((numero) => numero + 1)
  }

  function alterar(campo, valor) {
    const proximos = { ...valores, [campo]: valor }
    definirValores(proximos)
    definirErroGeral('')
    definirErros(calcularErros(proximos, tocados))
  }

  function sairDoCampo(campo) {
    const marcados = { ...tocados, [campo]: true }
    definirTocados(marcados)
    definirErros(calcularErros(valores, marcados))
  }

  async function cadastrar(evento) {
    evento.preventDefault()

    const novosErros = calcularTodosErros(valores)
    definirTocados(Object.fromEntries(CAMPOS.map((campo) => [campo, true])))
    definirErros(novosErros)

    const primeiroInvalido = CAMPOS.find((campo) => novosErros[campo])
    if (primeiroInvalido) {
      definirErroGeral('Revise os campos destacados para continuar.')
      window.requestAnimationFrame(() =>
        document.getElementById(IDS_CAMPOS[primeiroInvalido])?.focus(),
      )
      return
    }

    definirErroGeral('')
    definirEnviando(true)

    try {
      await cadastrarAluno({
        cursoId: Number(valores.curso),
        usuario: {
          nome: valores.nome.trim(),
          email: valores.email.trim(),
          senha: valores.senha,
        },
      })
      window.location.assign(`${basePortal}login?cadastro=sucesso`)
    } catch (falha) {
      definirErroGeral(
        falha instanceof ErroApi
          ? falha.message
          : 'Não foi possível criar sua conta agora. Tente novamente.',
      )
      definirEnviando(false)
      window.requestAnimationFrame(() => resumoErro.current?.focus())
    }
  }

  const tipoSenha = mostrarSenha ? 'text' : 'password'

  return (
    <main id="conteudo" className="limite pagina-acesso cadastro-aluno">
      <div className="cadastro-aluno__cartao">
        <section className="cadastro-aluno__conteudo" aria-labelledby="titulo-cadastro">
          <div className="cadastro-aluno__marca">
            <span className="cadastro-aluno__logo">
              <img src={logoPortal} alt="" width="30" height="30" />
            </span>
            <span>Portal de Cursos</span>
          </div>
          <div className="cadastro-aluno__cabecalho">
            <h1 id="titulo-cadastro">Crie sua conta</h1>
            <p>Cadastre-se para submeter seus projetos acadêmicos.</p>
          </div>

          {erroGeral && (
            <p
              ref={resumoErro}
              className="acesso-aviso acesso-aviso--erro"
              role="alert"
              tabIndex={-1}
            >
              {erroGeral}
            </p>
          )}

          <form onSubmit={cadastrar} noValidate aria-busy={enviando}>
            <div className="acesso-campo cadastro-aluno__campo">
              <label htmlFor="aluno-nome">
                Nome completo
              </label>
              <div className="acesso-entrada">
                <IconeCampo tipo="usuario" />
                <input
                  id="aluno-nome"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  maxLength={120}
                  placeholder="Nome completo"
                  value={valores.nome}
                  onChange={(evento) => alterar('nome', evento.target.value)}
                  onBlur={() => sairDoCampo('nome')}
                  readOnly={enviando}
                  aria-invalid={erros.nome ? true : undefined}
                  aria-describedby={descrever(erros.nome && 'erro-nome')}
                />
              </div>
              <MensagemErro id="erro-nome" texto={erros.nome} />
            </div>

            <div className="acesso-campo cadastro-aluno__campo">
              <label htmlFor="aluno-email">
                E-mail institucional
              </label>
              <div className="acesso-entrada">
                <IconeCampo tipo="email" />
                <input
                  id="aluno-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  placeholder="E-mail institucional"
                  value={valores.email}
                  onChange={(evento) => alterar('email', evento.target.value)}
                  onBlur={() => sairDoCampo('email')}
                  readOnly={enviando}
                  aria-invalid={erros.email ? true : undefined}
                  aria-describedby={descrever(erros.email && 'erro-email')}
                />
              </div>
              <MensagemErro id="erro-email" texto={erros.email} />
            </div>

            <div className="acesso-campo cadastro-aluno__campo">
              <label htmlFor="aluno-curso">
                Curso
              </label>
              <div className="acesso-entrada">
                <IconeCampo tipo="curso" />
                <div className="acesso-select">
                  <select
                    id="aluno-curso"
                    value={valores.curso}
                    onChange={(evento) => alterar('curso', evento.target.value)}
                    onBlur={() => sairDoCampo('curso')}
                    disabled={
                      enviando || carregandoCursos || Boolean(erroCursos) || cursos.length === 0
                    }
                    aria-invalid={erros.curso ? true : undefined}
                    aria-describedby={descrever(
                      erros.curso && 'erro-curso',
                      erroCursos && 'erro-cursos',
                    )}
                  >
                    <option value="">
                      {carregandoCursos ? 'Carregando cursos…' : 'Selecione seu curso'}
                    </option>
                    {cursos.map((curso) => (
                      <option key={curso.id} value={String(curso.id)}>
                        {curso.nome}
                        {curso.sigla ? ` (${curso.sigla})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {erroCursos && (
                <div id="erro-cursos" className="acesso-erro-carregamento" role="status">
                  <span>{erroCursos}</span>
                  <button
                    type="button"
                    className="acesso-link-acao"
                    onClick={tentarNovamenteCursos}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {!carregandoCursos && !erroCursos && cursos.length === 0 && (
                <p className="acesso-ajuda-campo">Nenhum curso disponível no momento.</p>
              )}

              <MensagemErro id="erro-curso" texto={erros.curso} />
            </div>

            <div className="acesso-campo cadastro-aluno__campo">
              <label htmlFor="aluno-senha">
                Senha
              </label>
              <div className="acesso-entrada">
                <IconeCampo tipo="senha" />
                <div className="acesso-senha">
                  <input
                    id="aluno-senha"
                    name="password"
                    type={tipoSenha}
                    autoComplete="new-password"
                    placeholder="Crie uma senha"
                    value={valores.senha}
                    onChange={(evento) => alterar('senha', evento.target.value)}
                    onBlur={() => sairDoCampo('senha')}
                    readOnly={enviando}
                    aria-invalid={erros.senha ? true : undefined}
                    aria-describedby={descrever('ajuda-senha', erros.senha && 'erro-senha')}
                  />
                  <button
                    type="button"
                    onClick={() => definirMostrarSenha(!mostrarSenha)}
                    aria-controls="aluno-senha aluno-confirmar-senha"
                    aria-pressed={mostrarSenha}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Icone nome={mostrarSenha ? 'ocultar' : 'mostrar'} />
                  </button>
                </div>
              </div>
              <p id="ajuda-senha" className="acesso-ajuda-campo cadastro-aluno__dica">
                Use pelo menos {TAMANHO_MINIMO_SENHA} caracteres.
              </p>
              <MensagemErro id="erro-senha" texto={erros.senha} />
            </div>

            <div className="acesso-campo cadastro-aluno__campo">
              <label htmlFor="aluno-confirmar-senha">
                Confirmar senha
              </label>
              <div className="acesso-entrada">
                <IconeCampo tipo="senha" />
                <input
                  id="aluno-confirmar-senha"
                  type={tipoSenha}
                  autoComplete="new-password"
                  placeholder="Confirmar senha"
                  value={valores.confirmarSenha}
                  onChange={(evento) => alterar('confirmarSenha', evento.target.value)}
                  onBlur={() => sairDoCampo('confirmarSenha')}
                  readOnly={enviando}
                  aria-invalid={erros.confirmarSenha ? true : undefined}
                  aria-describedby={descrever(erros.confirmarSenha && 'erro-confirmarSenha')}
                />
              </div>
              <MensagemErro id="erro-confirmarSenha" texto={erros.confirmarSenha} />
            </div>

            <button
              className="botao-primario acesso-entrar cadastro-aluno__enviar"
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Criando conta…' : 'Criar conta'}
            </button>

            <span className="somente-leitores" role="status">
              {enviando ? 'Criando sua conta, aguarde.' : ''}
            </span>
          </form>

          <p className="cadastro-aluno__links">
            Já tem uma conta? <a href={`${basePortal}login`}>Entrar</a>
            <span>
              Só quer conhecer os cursos?{' '}
              <a href={`${basePortal}#cursos`}>Explorar como visitante</a>
            </span>
          </p>
        </section>
        <aside className="cadastro-aluno__vitrine" aria-label="Conheça os projetos acadêmicos">
          <article className="cadastro-aluno__projetos">
            <header>
              <div>
                <strong>Tipos de projeto</strong>
                <span>Publicados após aprovação do orientador</span>
              </div>
              
            </header>
            <div className="cadastro-aluno__projeto">
              <span className="cadastro-aluno__projeto-icone cadastro-aluno__projeto-icone--tcc">
                <Icone nome="formacao-cursos" />
              </span>
              <div>
                <strong>TCC</strong>
                <small>Trabalho de conclusão de curso</small>
              </div>
            </div>
            <div className="cadastro-aluno__projeto">
              <span className="cadastro-aluno__projeto-icone cadastro-aluno__projeto-icone--integrador">
                <Icone nome="projetos-cursos" />
              </span>
              <div>
                <strong>Projeto Integrador</strong>
                <small>Une conteúdos de várias disciplinas</small>
              </div>
            </div>
            <div className="cadastro-aluno__projeto">
              <span className="cadastro-aluno__projeto-icone cadastro-aluno__projeto-icone--pesquisa">
                <Icone nome="laboratorio" />
              </span>
              <div>
                <strong>Projeto de Pesquisa</strong>
                <small>Investigação científica orientada</small>
              </div>
            </div>
            <div className="cadastro-aluno__projeto">
              <span className="cadastro-aluno__projeto-icone cadastro-aluno__projeto-icone--extensao">
                <Icone nome="docentes-detalhe" />
              </span>
              <div>
                <strong>Projeto de Extensão</strong>
                <small>Ações junto à comunidade</small>
              </div>
            </div>
          </article>
          <div className="cadastro-aluno__mensagem">
            <h2>Crie sua conta e publique seus projetos.</h2>
            <p>
              Envie seu TCC, Projeto Integrador, de Pesquisa ou de Extensão para avaliação do
              orientador.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
