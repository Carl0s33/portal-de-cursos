import { nomesTiposProjeto, tiposProjeto } from '../constantes.js'

export default function EtapaSubmissaoProjeto({ formulario, erros, alterar, erroDoCampo }) {
  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-projeto">
      <div className="formulario-submissao__cabecalho">
        <span>02</span>
        <div>
          <h2 id="dados-projeto">Projeto</h2>
          <p>Descreva a produção, seu objetivo e o resultado esperado.</p>
        </div>
      </div>
      <div className="formulario-submissao__grade">
        <label>
          Tipo de produção <span aria-hidden="true">*</span>
          <select
            required
            aria-invalid={Boolean(erros.tipo)}
            aria-describedby={erroDoCampo('tipo')}
            value={formulario.tipo}
            onChange={(e) => alterar('tipo', e.target.value)}
          >
            <option value="">Selecione uma opção</option>
            {Object.keys(tiposProjeto).map((tipo) => (
              <option key={tipo} value={tipo}>
                {nomesTiposProjeto[tipo]}
              </option>
            ))}
          </select>
          {erros.tipo && (
            <small id="erro-tipo" className="formulario-submissao__erro-campo">
              {erros.tipo}
            </small>
          )}
        </label>
        <label>
          Título <span aria-hidden="true">*</span>
          <input
            required
            aria-invalid={Boolean(erros.titulo)}
            aria-describedby={erroDoCampo('titulo')}
            placeholder="Título do projeto"
            value={formulario.titulo}
            onChange={(e) => alterar('titulo', e.target.value)}
          />
          {erros.titulo && (
            <small id="erro-titulo" className="formulario-submissao__erro-campo">
              {erros.titulo}
            </small>
          )}
        </label>
        <label className="formulario-submissao__campo-largo">
          Resumo <span aria-hidden="true">*</span>
          <textarea
            required
            aria-invalid={Boolean(erros.resumo)}
            aria-describedby={erroDoCampo('resumo')}
            placeholder="Apresente o problema, a proposta e o contexto do projeto."
            rows="5"
            value={formulario.resumo}
            onChange={(e) => alterar('resumo', e.target.value)}
          />
          {erros.resumo && (
            <small id="erro-resumo" className="formulario-submissao__erro-campo">
              {erros.resumo}
            </small>
          )}
        </label>
        <label className="formulario-submissao__campo-largo">
          Objetivos e resultados <span aria-hidden="true">*</span>
          <textarea
            required
            aria-invalid={Boolean(erros.objetivos)}
            aria-describedby={erroDoCampo('objetivos')}
            placeholder="Quais resultados o projeto pretende alcançar?"
            rows="5"
            value={formulario.objetivos}
            onChange={(e) => alterar('objetivos', e.target.value)}
          />
          {erros.objetivos && (
            <small id="erro-objetivos" className="formulario-submissao__erro-campo">
              {erros.objetivos}
            </small>
          )}
        </label>
        {formulario.tipo && (
          <label className="formulario-submissao__campo-largo">
            {tiposProjeto[formulario.tipo].campoEspecifico} <span aria-hidden="true">*</span>
            <textarea
              required
              aria-invalid={Boolean(erros.informacoesEspecificas)}
              aria-describedby={erroDoCampo('informacoesEspecificas')}
              rows="5"
              value={formulario.informacoesEspecificas}
              onChange={(e) => alterar('informacoesEspecificas', e.target.value)}
            />
            {erros.informacoesEspecificas && (
              <small id="erro-informacoesEspecificas" className="formulario-submissao__erro-campo">
                {erros.informacoesEspecificas}
              </small>
            )}
          </label>
        )}
      </div>
    </section>
  )
}
