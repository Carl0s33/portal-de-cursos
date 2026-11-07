import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  atualizarAreaConhecimento,
  cadastrarAreaConhecimento,
  excluirAreaConhecimento,
  listarAreasConhecimento,
} from '@/api/cursos.js'
import ConfirmacaoGestao from './ConfirmacaoGestao.jsx'
import '../estilos/gestao.css'
import '../estilos/geral.css'

function FormularioArea({ inicial, salvando, aoSalvar, aoCancelar }) {
  const [nome, mudarNome] = useState(inicial?.nome || '')
  const [descricao, mudarDescricao] = useState(inicial?.descricao || '')

  function enviar(evento) {
    evento.preventDefault()
    aoSalvar({
      nome: nome.trim(),
      descricao: descricao.trim(),
    })
  }

  return (
    <form className="gestao-formulario" onSubmit={enviar}>
      <h2>{inicial?.id ? 'Editar área do conhecimento' : 'Nova área do conhecimento'}</h2>
      <p className="gestao-formulario__orientacao">
        Informe o nome único e a descrição da área do conhecimento (RN35, RN36).
      </p>
      <div className="gestao-campos">
        <div className="gestao-campo">
          <label htmlFor="area-nome">Nome da área *</label>
          <input
            id="area-nome"
            required
            maxLength={100}
            value={nome}
            onChange={(e) => mudarNome(e.target.value)}
            placeholder="Ex.: Exatas e Tecnologia"
          />
        </div>
        <div className="gestao-campo gestao-campo-largo">
          <label htmlFor="area-descricao">Descrição *</label>
          <textarea
            id="area-descricao"
            required
            maxLength={500}
            rows={3}
            value={descricao}
            onChange={(e) => mudarDescricao(e.target.value)}
            placeholder="Descreva as formações contempladas nesta área do conhecimento."
          />
        </div>
      </div>
      <div className="gestao-acoes">
        <button className="botao-primario" type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar área'}
        </button>
        <button className="botao-secundario" type="button" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function GestaoAreas({ token }) {
  const [areas, mudarAreas] = useState([])
  const [busca, mudarBusca] = useState('')
  const [carregando, mudarCarregando] = useState(true)
  const [mensagem, mudarMensagem] = useState('')
  const [editor, mudarEditor] = useState(null)
  const [exclusao, mudarExclusao] = useState(null)
  const [salvando, mudarSalvando] = useState(false)

  const carregar = useCallback(async (sinal) => {
    mudarCarregando(true)
    try {
      const lista = await listarAreasConhecimento(sinal)
      if (!sinal?.aborted) mudarAreas(Array.isArray(lista) ? lista : [])
    } catch (falha) {
      if (!sinal?.aborted)
        mudarMensagem(falha.message || 'Não foi possível carregar as áreas do conhecimento.')
    } finally {
      if (!sinal?.aborted) mudarCarregando(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => carregar(controller.signal))
    return () => controller.abort()
  }, [carregar])

  const resultados = useMemo(
    () =>
      areas.filter((item) =>
        `${item.nome || ''} ${item.descricao || ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(busca.trim().toLocaleLowerCase('pt-BR')),
      ),
    [areas, busca],
  )

  async function salvar(dados) {
    mudarSalvando(true)
    mudarMensagem('')
    try {
      if (editor?.id) {
        await atualizarAreaConhecimento(token, editor.id, dados)
        mudarMensagem('Área do conhecimento atualizada com sucesso.')
      } else {
        await cadastrarAreaConhecimento(token, dados)
        mudarMensagem('Área do conhecimento cadastrada com sucesso.')
      }
      mudarEditor(null)
      await carregar()
    } catch (falha) {
      mudarMensagem(falha.message || 'Não foi possível salvar a área do conhecimento.')
    } finally {
      mudarSalvando(false)
    }
  }

  async function confirmarExclusao() {
    if (!exclusao || salvando) return
    mudarSalvando(true)
    mudarMensagem('')
    try {
      await excluirAreaConhecimento(token, exclusao.id)
      mudarExclusao(null)
      mudarMensagem('Área do conhecimento excluída com sucesso.')
      await carregar()
    } catch (falha) {
      mudarMensagem(
        falha.message ||
          'Não foi possível excluir a área. Verifique se não há cursos vinculados (RN38).',
      )
    } finally {
      mudarSalvando(false)
    }
  }

  return (
    <>
      <header className="painel-titulo">
        <div>
          <span className="administracao-boas-vindas__rotulo">Estrutura acadêmica</span>
          <h1>Áreas do conhecimento</h1>
          <p>Classifique os cursos do portal por grandes áreas temáticas (RF15).</p>
        </div>
        <div className="painel-titulo__acoes">
          <button
            className="botao-secundario"
            type="button"
            onClick={() => carregar()}
            disabled={carregando}
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
            {editor?.novo ? 'Fechar cadastro' : 'Nova área'}
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
          <FormularioArea
            salvando={salvando}
            aoSalvar={salvar}
            aoCancelar={() => mudarEditor(null)}
          />
        </div>
      )}

      <section className="painel-secao">
        <div className="gestao-lista-filtros">
          <label className="gestao-busca">
            Buscar área pelo nome
            <input
              type="search"
              value={busca}
              onChange={(evento) => mudarBusca(evento.target.value)}
              placeholder="Nome ou descrição da área"
            />
          </label>
        </div>
        <div
          className="tabela-submissoes"
          role="region"
          aria-label="Áreas do conhecimento cadastradas"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Descrição</th>
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
                      <th scope="row">{item.nome}</th>
                      <td>{item.descricao || '—'}</td>
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
                        <td colSpan={3}>
                          <FormularioArea
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
                        <td colSpan={3}>
                          <ConfirmacaoGestao rotulo={`excluir-area-${item.id}`}>
                            <h2 id={`excluir-area-${item.id}`}>Excluir {item.nome}?</h2>
                            <p>
                              Esta área será removida. Não é possível excluir uma área que possua
                              cursos vinculados (RN38).
                            </p>
                            <div className="gestao-acoes">
                              <button
                                type="button"
                                className="botao-secundario"
                                onClick={() => mudarExclusao(null)}
                                disabled={salvando}
                              >
                                Manter área
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
        {carregando && (
          <p className="gestao-aviso" role="status">
            Carregando áreas do conhecimento…
          </p>
        )}
        {!carregando && !resultados.length && (
          <p className="painel-vazio">Nenhuma área do conhecimento encontrada.</p>
        )}
      </section>
    </>
  )
}
