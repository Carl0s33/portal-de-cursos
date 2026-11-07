import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  atualizarCampus,
  cadastrarCampus,
  excluirCampus,
  listarCampus,
  listarCursos,
} from '@/api/cursos.js'
import { enderecoPrivado } from '@/app/rotas.js'
import Icone from '@/shared/components/Icone.jsx'
import ConfirmacaoGestao from './ConfirmacaoGestao.jsx'
import '../estilos/campus.css'
import '../estilos/gestao.css'
import '../estilos/geral.css'

function iniciais(valor = '') {
  return valor
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toLocaleUpperCase('pt-BR')
}

function FormularioCampus({ inicial, salvando, aoSalvar, aoCancelar }) {
  const [nome, mudarNome] = useState(inicial?.nome || '')
  const [acronimo, mudarAcronimo] = useState(inicial?.acronimo || '')
  const [cidade, mudarCidade] = useState(inicial?.cidade || '')
  const [endereco, mudarEndereco] = useState(inicial?.endereco || '')

  function enviar(evento) {
    evento.preventDefault()
    aoSalvar({
      nome: nome.trim(),
      acronimo: acronimo.trim(),
      cidade: cidade.trim(),
      endereco: endereco.trim(),
    })
  }

  return (
    <form className="gestao-formulario" onSubmit={enviar}>
      <h2>{inicial?.id ? 'Editar campus' : 'Novo campus'}</h2>
      <p className="gestao-formulario__orientacao">
        Preencha todos os campos obrigatórios da unidade acadêmica (RN33).
      </p>
      <div className="gestao-campos">
        <div className="gestao-campo">
          <label htmlFor="campus-nome">Nome do campus *</label>
          <input
            id="campus-nome"
            required
            maxLength={100}
            value={nome}
            onChange={(e) => mudarNome(e.target.value)}
            placeholder="Ex.: Campus Nova Cruz"
          />
        </div>
        <div className="gestao-campo">
          <label htmlFor="campus-acronimo">Acrônimo (Sigla) *</label>
          <input
            id="campus-acronimo"
            required
            maxLength={10}
            value={acronimo}
            onChange={(e) => mudarAcronimo(e.target.value)}
            placeholder="Ex.: NC"
          />
        </div>
        <div className="gestao-campo">
          <label htmlFor="campus-cidade">Cidade *</label>
          <input
            id="campus-cidade"
            required
            maxLength={100}
            value={cidade}
            onChange={(e) => mudarCidade(e.target.value)}
            placeholder="Ex.: Nova Cruz"
          />
        </div>
        <div className="gestao-campo">
          <label htmlFor="campus-endereco">Endereço *</label>
          <input
            id="campus-endereco"
            required
            maxLength={200}
            value={endereco}
            onChange={(e) => mudarEndereco(e.target.value)}
            placeholder="Ex.: Av. José Rodrigues de Aquino Filho, 640"
          />
        </div>
      </div>
      <div className="gestao-acoes">
        <button className="botao-primario" type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar campus'}
        </button>
        <button className="botao-secundario" type="button" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function GestaoCampus({ identificador, token }) {
  const [campus, mudarCampus] = useState([])
  const [cursos, mudarCursos] = useState(null)
  const [busca, mudarBusca] = useState('')
  const [cidadeFiltro, mudarCidadeFiltro] = useState('todas')
  const [estado, mudarEstado] = useState('carregando')
  const [erro, mudarErro] = useState('')
  const [mensagem, mudarMensagem] = useState('')
  const [editor, mudarEditor] = useState(null)
  const [exclusao, mudarExclusao] = useState(null)
  const [salvando, mudarSalvando] = useState(false)

  const carregar = useCallback(async (sinal) => {
    mudarEstado('carregando')
    mudarErro('')
    try {
      const [itensCampus, itensCursos] = await Promise.all([
        listarCampus(sinal),
        listarCursos(sinal).catch(() => null),
      ])
      if (sinal?.aborted) return
      if (!Array.isArray(itensCampus)) throw new Error('A lista de campus recebida é inválida.')
      mudarCampus(itensCampus)
      mudarCursos(itensCursos)
      mudarEstado('pronto')
    } catch (falha) {
      if (!sinal?.aborted) {
        mudarErro(falha.message || 'Não foi possível carregar os campus.')
        mudarEstado('erro')
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => carregar(controller.signal))
    return () => controller.abort()
  }, [carregar])

  const cidades = useMemo(
    () => [...new Set(campus.map((item) => item.cidade).filter(Boolean))].sort(),
    [campus],
  )

  const resultados = useMemo(
    () =>
      campus.filter(
        (item) =>
          (cidadeFiltro === 'todas' || item.cidade === cidadeFiltro) &&
          `${item.nome || ''} ${item.acronimo || ''} ${item.cidade || ''} ${item.endereco || ''}`
            .toLocaleLowerCase('pt-BR')
            .includes(busca.trim().toLocaleLowerCase('pt-BR')),
      ),
    [busca, campus, cidadeFiltro],
  )

  async function salvar(dados) {
    mudarSalvando(true)
    mudarMensagem('')
    try {
      if (editor?.id) {
        await atualizarCampus(token, editor.id, dados)
        mudarMensagem('Campus atualizado com sucesso.')
      } else {
        await cadastrarCampus(token, dados)
        mudarMensagem('Campus cadastrado com sucesso.')
      }
      mudarEditor(null)
      await carregar()
    } catch (falha) {
      mudarMensagem(falha.message || 'Não foi possível salvar o campus.')
    } finally {
      mudarSalvando(false)
    }
  }

  async function confirmarExclusao() {
    if (!exclusao || salvando) return
    mudarSalvando(true)
    mudarMensagem('')
    try {
      await excluirCampus(token, exclusao.id)
      mudarExclusao(null)
      mudarMensagem('Campus excluído com sucesso.')
      await carregar()
    } catch (falha) {
      mudarMensagem(
        falha.message ||
          'Não foi possível excluir o campus. Verifique se não há cursos vinculados (RN38).',
      )
    } finally {
      mudarSalvando(false)
    }
  }

  if (estado === 'carregando' && !campus.length)
    return (
      <p className="gestao-aviso" role="status">
        Carregando campus…
      </p>
    )
  if (estado === 'erro')
    return (
      <div className="gestao-aviso" role="alert">
        <p>{erro}</p>
        <button className="botao-secundario" onClick={() => carregar()}>
          Tentar novamente
        </button>
      </div>
    )

  const selecionado = identificador
    ? campus.find((item) => String(item.id) === identificador)
    : null

  if (identificador && !selecionado)
    return (
      <section className="painel-secao campus-vazio">
        <h1>Campus não encontrado</h1>
        <p>Não foi possível localizar esta unidade nos dados disponíveis.</p>
        <a className="botao-secundario" href={enderecoPrivado('administracao/campus')}>
          Voltar para Campus
        </a>
      </section>
    )

  if (selecionado) {
    const cursosVinculados =
      cursos?.filter((curso) => String(curso.campusId ?? '') === String(selecionado.id)) || []
    return (
      <>
        <nav className="campus-caminho" aria-label="Caminho da página">
          <a href={enderecoPrivado('administracao/cursos')}>Estrutura acadêmica</a>
          <span aria-hidden="true">›</span>
          <a href={enderecoPrivado('administracao/campus')}>Campus</a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{selecionado.nome}</span>
        </nav>
        <a className="campus-voltar" href={enderecoPrivado('administracao/campus')}>
          <span aria-hidden="true">←</span> Voltar para Campus
        </a>
        <header className="painel-titulo campus-detalhe-titulo">
          <div>
            <span className="administracao-boas-vindas__rotulo">
              Campus{selecionado.id != null ? ` · #${selecionado.id}` : ''}
            </span>
            <h1>{selecionado.nome}</h1>
            {selecionado.cidade && <p>{selecionado.cidade}</p>}
          </div>
          {selecionado.acronimo && <span className="campus-sigla">{selecionado.acronimo}</span>}
        </header>
        <div className="campus-detalhe-grade">
          <section className="campus-detalhe-cartao">
            <header>
              <span className="campus-detalhe-icone">
                <Icone nome="formacao-cursos" />
              </span>
              <div>
                <h2>Cursos vinculados</h2>
                <p>Formações associadas a esta unidade.</p>
              </div>
            </header>
            <strong className="campus-detalhe-valor">{cursosVinculados.length}</strong>
          </section>
          <section className="campus-detalhe-cartao">
            <header>
              <span className="campus-detalhe-icone">
                <Icone nome="localizacao" />
              </span>
              <div>
                <h2>Localização e identificação</h2>
                <p>Dados cadastrados para esta unidade.</p>
              </div>
            </header>
            <dl>
              <div>
                <dt>Nome</dt>
                <dd>{selecionado.nome}</dd>
              </div>
              <div>
                <dt>Acrônimo</dt>
                <dd>{selecionado.acronimo || '—'}</dd>
              </div>
              <div>
                <dt>Cidade</dt>
                <dd>{selecionado.cidade || '—'}</dd>
              </div>
              <div>
                <dt>Endereço</dt>
                <dd>{selecionado.endereco || '—'}</dd>
              </div>
            </dl>
          </section>
        </div>
        {cursosVinculados.length > 0 && (
          <section className="painel-secao">
            <header>
              <div>
                <h2>Cursos ofertados neste campus</h2>
                <p>{cursosVinculados.length} curso(s) vinculado(s) à unidade.</p>
              </div>
            </header>
            <div className="tabela-submissoes" role="region" aria-label="Cursos do campus">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Curso</th>
                    <th scope="col">Grau</th>
                    <th scope="col">Turno</th>
                    <th scope="col">Modalidade</th>
                  </tr>
                </thead>
                <tbody>
                  {cursosVinculados.map((curso) => (
                    <tr key={curso.id}>
                      <th scope="row">
                        {curso.nome}
                        <span>{curso.sigla || curso.acronimo}</span>
                      </th>
                      <td>{curso.grau || '—'}</td>
                      <td>{curso.turno || '—'}</td>
                      <td>{curso.modalidade || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </>
    )
  }

  return (
    <>
      <header className="painel-titulo">
        <div>
          <span className="administracao-boas-vindas__rotulo">Estrutura acadêmica</span>
          <h1>Campus</h1>
          <p>Gerencie as unidades físicas e polos onde os cursos são oferecidos.</p>
        </div>
        <div className="painel-titulo__acoes">
          <button
            className="botao-secundario"
            type="button"
            onClick={() => carregar()}
            disabled={estado === 'carregando'}
          >
            Atualizar lista
          </button>
          <button
            className="botao-primario"
            type="button"
            onClick={() => {
              mudarEditor((atual) => (atual?.novo ? null : { novo: true }))
              mudarExclusao(null)
              mudarMensagem('')
            }}
          >
            {editor?.novo ? 'Fechar cadastro' : 'Novo campus'}
          </button>
        </div>
      </header>

      {mensagem && (
        <p className="gestao-aviso" role="status">
          {mensagem}
        </p>
      )}

      {editor?.novo && (
        <div className="gestao-expansao gestao-expansao--novo">
          <FormularioCampus
            salvando={salvando}
            aoSalvar={salvar}
            aoCancelar={() => mudarEditor(null)}
          />
        </div>
      )}

      <section className="painel-secao campus-lista">
        <div className="gestao-lista-filtros">
          <label className="gestao-busca">
            Buscar campus por nome
            <input
              type="search"
              value={busca}
              onChange={(evento) => mudarBusca(evento.target.value)}
              placeholder="Nome, acrônimo, cidade ou endereço"
            />
          </label>
          {cidades.length > 0 && (
            <div className="gestao-filtro-cursos" role="group" aria-label="Filtrar por cidade">
              <button
                type="button"
                aria-pressed={cidadeFiltro === 'todas'}
                onClick={() => mudarCidadeFiltro('todas')}
              >
                Todas as cidades <span>{campus.length}</span>
              </button>
              {cidades.map((cidade) => (
                <button
                  type="button"
                  key={cidade}
                  aria-pressed={cidadeFiltro === cidade}
                  onClick={() => mudarCidadeFiltro(cidade)}
                >
                  {cidade} <span>{campus.filter((item) => item.cidade === cidade).length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="tabela-submissoes"
          role="region"
          aria-label="Campus cadastrados"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Acrônimo</th>
                <th scope="col">Cidade</th>
                <th scope="col">Endereço</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item) => {
                const editando = editor && !editor.novo && String(editor.id) === String(item.id)
                const confirmando = exclusao && String(exclusao.id) === String(item.id)
                return (
                  <Fragment key={item.id ?? item.nome}>
                    <tr>
                      <th scope="row">
                        <a
                          href={enderecoPrivado(
                            `administracao/campus/${encodeURIComponent(item.id)}`,
                          )}
                        >
                          {item.nome}
                        </a>
                      </th>
                      <td>
                        <span className="campus-lista-sigla">
                          {item.acronimo || iniciais(item.nome)}
                        </span>
                      </td>
                      <td>{item.cidade || '—'}</td>
                      <td>{item.endereco || '—'}</td>
                      <td>
                        <div className="gestao-acoes">
                          <button
                            type="button"
                            onClick={() => {
                              mudarEditor(editando ? null : item)
                              mudarExclusao(null)
                              mudarMensagem('')
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="gestao-excluir"
                            onClick={() => {
                              mudarExclusao(confirmando ? null : item)
                              mudarEditor(null)
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editando && (
                      <tr className="gestao-linha-expandida">
                        <td colSpan={5}>
                          <FormularioCampus
                            inicial={item}
                            salvando={salvando}
                            aoSalvar={salvar}
                            aoCancelar={() => mudarEditor(null)}
                          />
                        </td>
                      </tr>
                    )}
                    {confirmando && (
                      <tr className="gestao-linha-expandida">
                        <td colSpan={5}>
                          <ConfirmacaoGestao rotulo={`excluir-campus-${item.id}`}>
                            <h2 id={`excluir-campus-${item.id}`}>Excluir {item.nome}?</h2>
                            <p>
                              Este campus será removido. Não é possível excluir um campus que possua
                              cursos vinculados (RN38).
                            </p>
                            <div className="gestao-acoes">
                              <button
                                type="button"
                                className="botao-secundario"
                                onClick={() => mudarExclusao(null)}
                                disabled={salvando}
                              >
                                Manter campus
                              </button>
                              <button
                                type="button"
                                className="gestao-excluir"
                                onClick={confirmarExclusao}
                                disabled={salvando}
                              >
                                {salvando ? 'Excluindo…' : 'Confirmar exclusão'}
                              </button>
                            </div>
                          </ConfirmacaoGestao>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        {!resultados.length && <p className="painel-vazio">Nenhum campus encontrado.</p>}
        <p className="campus-lista-contagem">
          {resultados.length} de {campus.length} campus
        </p>
      </section>
    </>
  )
}
