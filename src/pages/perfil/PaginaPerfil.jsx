import { useEffect, useRef, useState } from 'react'
import { enderecoPrivado } from '../../app/rotas.js'
import Icone from '@/shared/components/Icone.jsx'
import './perfil.css'

export default function PaginaPerfil({ usuario, aoSalvar, destinoVoltar = 'professor/feed' }) {
  const [nome, mudarNome] = useState(usuario.nome || '')
  const [titulacao, mudarTitulacao] = useState(usuario.titulacao || '')
  const [descricao, mudarDescricao] = useState(usuario.descricao || '')
  const [foto, mudarFoto] = useState(usuario.foto || '')
  const [erro, mudarErro] = useState('')
  const [mensagem, mudarMensagem] = useState('')
  const [carregandoFoto, mudarCarregandoFoto] = useState(false)
  const leitor = useRef(null)
  const entradaFoto = useRef(null)
  useEffect(() => () => leitor.current?.abort(), [])

  function selecionarFoto(evento) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    mudarErro('')
    mudarMensagem('')
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) ||
      arquivo.size > 2 * 1024 * 1024
    ) {
      mudarErro('Escolha uma foto JPG, PNG ou WebP de até 2 MB.')
      evento.target.value = ''
      return
    }
    leitor.current?.abort()
    const leitura = new FileReader()
    leitor.current = leitura
    mudarCarregandoFoto(true)
    leitura.onload = () => {
      mudarFoto(leitura.result)
      mudarCarregandoFoto(false)
    }
    leitura.onerror = () => {
      mudarErro('Não foi possível abrir esta foto. Escolha outro arquivo.')
      mudarCarregandoFoto(false)
    }
    leitura.readAsDataURL(arquivo)
    evento.target.value = ''
  }
  function salvar(evento) {
    evento.preventDefault()
    if (!nome.trim()) {
      mudarErro('Informe seu nome.')
      return
    }
    aoSalvar({ nome: nome.trim(), titulacao: titulacao.trim(), descricao: descricao.trim(), foto })
    mudarErro('')
    mudarMensagem(
      'Perfil atualizado nesta sessão. As alterações ainda não são enviadas ao servidor.',
    )
  }
  function cancelar() {
    leitor.current?.abort()
    mudarCarregandoFoto(false)
    mudarNome(usuario.nome || '')
    mudarTitulacao(usuario.titulacao || '')
    mudarDescricao(usuario.descricao || '')
    mudarFoto(usuario.foto || '')
    mudarErro('')
    mudarMensagem('Alterações descartadas.')
  }
  return (
    <main id="conteudo" className="limite pagina-perfil">
      <a className="perfil-voltar" href={enderecoPrivado(destinoVoltar)}>
        ←{' '}
        {destinoVoltar.startsWith('administracao/')
          ? 'Voltar para a administração'
          : 'Voltar para o feed'}
      </a>
      <header className="perfil-titulo">
        <h1>Meu perfil</h1>
        <p>Suas informações e foto de apresentação.</p>
      </header>
      <form className="perfil-formulario" onSubmit={salvar}>
        <section className="perfil-foto" aria-labelledby="titulo-foto">
          <div className="perfil-foto__imagem">
            {foto ? (
              <img
                src={foto}
                alt="Prévia da foto de perfil"
                onError={() => {
                  mudarFoto('')
                  mudarErro('A imagem não pôde ser exibida. Escolha outra foto.')
                }}
              />
            ) : (
              <Icone nome="usuario" />
            )}
          </div>
          <div>
            <h2 id="titulo-foto">Foto de perfil</h2>
            <p>JPG, PNG ou WebP. Até 2 MB.</p>
            <div className="perfil-foto__acoes">
              <button
                type="button"
                onClick={() => entradaFoto.current.click()}
                disabled={carregandoFoto}
              >
                {carregandoFoto ? 'Preparando foto…' : 'Escolher foto'}
              </button>
              {foto && (
                <button type="button" onClick={() => mudarFoto('')}>
                  Remover foto
                </button>
              )}
            </div>
            <input
              ref={entradaFoto}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selecionarFoto}
              aria-label="Escolher arquivo de foto"
              hidden
            />
          </div>
        </section>
        <div className="perfil-campos">
          <label htmlFor="perfil-nome">
            Nome
            <input
              id="perfil-nome"
              autoComplete="name"
              maxLength={120}
              value={nome}
              onChange={(e) => mudarNome(e.target.value)}
              required
            />
          </label>
          <label htmlFor="perfil-email">
            <span id="rotulo-email-perfil">E-mail</span>
            <input
              aria-labelledby="rotulo-email-perfil"
              id="perfil-email"
              type="email"
              value={usuario.email || ''}
              readOnly
              aria-describedby="perfil-email-ajuda"
            />
            <small id="perfil-email-ajuda">E-mail utilizado para entrar no portal.</small>
          </label>
          <label htmlFor="perfil-titulacao">
            Titulação
            <input
              id="perfil-titulacao"
              maxLength={100}
              value={titulacao}
              onChange={(e) => mudarTitulacao(e.target.value)}
            />
          </label>
          <label htmlFor="perfil-descricao">
            <span id="rotulo-apresentacao">Apresentação</span>
            <textarea
              aria-labelledby="rotulo-apresentacao"
              id="perfil-descricao"
              maxLength={600}
              rows={4}
              value={descricao}
              onChange={(e) => mudarDescricao(e.target.value)}
            />
            <small>{descricao.length}/600 caracteres</small>
          </label>
        </div>
        <p className="perfil-nota">
          As edições e a foto ficam apenas nesta sessão. Ao sair ou recarregar a página, elas serão
          descartadas.
        </p>
        {erro && (
          <p className="perfil-aviso" role="alert">
            {erro}
          </p>
        )}
        {mensagem && (
          <p className="perfil-aviso" role="status">
            {mensagem}
          </p>
        )}
        <div className="perfil-acoes">
          <button className="botao-primario" type="submit" disabled={carregandoFoto}>
            Salvar nesta sessão
          </button>
          <button type="button" onClick={cancelar}>
            Descartar alterações
          </button>
        </div>
      </form>
    </main>
  )
}
