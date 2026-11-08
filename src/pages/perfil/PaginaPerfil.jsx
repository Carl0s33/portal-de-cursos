import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import { atualizarMeuPerfilAluno } from '@/api/alunos.js'
import { atualizarMeuPerfilProfessor } from '@/api/professores.js'
import { atualizarMeuPerfilCoordenador } from '@/api/coordenadores.js'
import { atualizarMeuUsuario } from '@/api/usuarios.js'
import { enderecoPrivado } from '../../app/rotas.js'
import './perfil.css'

const titulacoes = {
  GRADUACAO: 'Graduação',
  ESPECIALIZACAO: 'Especialização',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado',
  POS_DOUTORADO: 'Pós-doutorado',
}

export default function PaginaPerfil({ usuario, tipoUsuario, token, aoSalvar, destinoVoltar }) {
  const professor = tipoUsuario === 'PROFESSOR'
  const coordenador = tipoUsuario === 'COORDENADOR'
  const [nome, mudarNome] = useState(usuario.nome || '')
  const [senha, mudarSenha] = useState('')
  const [titulacao, mudarTitulacao] = useState(usuario.titulacao || '')
  const [descricao, mudarDescricao] = useState(usuario.descricao || '')
  const [cursoId, mudarCursoId] = useState('')
  const [cursos, mudarCursos] = useState([])
  const [erro, mudarErro] = useState('')
  const [mensagem, mudarMensagem] = useState('')
  const [salvando, mudarSalvando] = useState(false)

  useEffect(() => {
    if (!coordenador) return
    const controle = new AbortController()
    listarCursos(controle.signal)
      .then(mudarCursos)
      .catch(() => {
        if (!controle.signal.aborted) mudarErro('Não foi possível carregar os cursos.')
      })
    return () => controle.abort()
  }, [coordenador])

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return
    mudarErro('')
    mudarMensagem('')
    mudarSalvando(true)
    try {
      const dadosUsuario = { nome: nome.trim(), email: usuario.email, senha }
      if (coordenador) {
        const salvo = await atualizarMeuPerfilCoordenador(token, {
          professorId: usuario.professorId,
          cursoId: Number(cursoId),
        })
        aoSalvar({ cursoId: salvo.cursoId })
      } else if (professor) {
        const salvo = await atualizarMeuPerfilProfessor(token, {
          usuario: dadosUsuario,
          cursoId: usuario.cursoId,
          titulacao,
          descricao: descricao.trim(),
        })
        aoSalvar({ nome: salvo.nome, titulacao: salvo.titulacao, descricao: salvo.descricao })
      } else if (tipoUsuario === 'ALUNO') {
        const salvo = await atualizarMeuPerfilAluno(token, {
          usuario: dadosUsuario,
          cursoId: usuario.cursoId,
        })
        aoSalvar({ nome: salvo.usuario.nome })
      } else if (tipoUsuario === 'ADMIN') {
        const salvo = await atualizarMeuUsuario(token, dadosUsuario)
        aoSalvar({ nome: salvo.nome })
      }
      mudarSenha('')
      mudarMensagem('Perfil atualizado com sucesso.')
    } catch (falha) {
      mudarErro(falha.message || 'Não foi possível salvar o perfil.')
    } finally {
      mudarSalvando(false)
    }
  }

  function cancelar() {
    mudarNome(usuario.nome || '')
    mudarSenha('')
    mudarTitulacao(usuario.titulacao || '')
    mudarDescricao(usuario.descricao || '')
    mudarCursoId('')
    mudarErro('')
    mudarMensagem('Alterações descartadas.')
  }

  return (
    <main id="conteudo" className="limite pagina-perfil">
      <a className="perfil-voltar" href={enderecoPrivado(destinoVoltar)}>
        ← Voltar para minha área
      </a>
      <header className="perfil-titulo">
        <h1>Meu perfil</h1>
      </header>
      <form className="perfil-formulario" onSubmit={salvar}>
        <fieldset className="perfil-campos" disabled={salvando}>
          <label>
            Nome
            <input
              autoComplete="name"
              maxLength={100}
              value={nome}
              readOnly={coordenador}
              onChange={(evento) => mudarNome(evento.target.value)}
              required
            />
          </label>
          <label>
            E-mail
            <input type="email" value={usuario.email || ''} readOnly />
          </label>
          {coordenador ? (
            <label>
              Curso da coordenação
              <select
                value={cursoId}
                onChange={(evento) => mudarCursoId(evento.target.value)}
                required
              >
                <option value="">Selecione o curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Senha para salvar
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                value={senha}
                onChange={(evento) => mudarSenha(evento.target.value)}
                required
              />
              <small>
                Digite a senha atual para mantê-la ou digite a nova senha que deseja usar.
              </small>
            </label>
          )}
          {professor && (
            <>
              <label>
                Titulação
                <select
                  value={titulacao}
                  onChange={(evento) => mudarTitulacao(evento.target.value)}
                  required
                >
                  <option value="">Selecione a titulação</option>
                  {Object.entries(titulacoes).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Apresentação
                <textarea
                  maxLength={500}
                  rows={4}
                  value={descricao}
                  onChange={(evento) => mudarDescricao(evento.target.value)}
                  required
                />
              </label>
            </>
          )}
        </fieldset>
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
          <button className="botao-primario" type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar alterações'}
          </button>
          <button type="button" onClick={cancelar} disabled={salvando}>
            Descartar alterações
          </button>
        </div>
      </form>
    </main>
  )
}
