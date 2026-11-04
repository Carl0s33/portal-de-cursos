import './informacoes-academicas.css'

export default function InformacoesAcademicas({ curso }) {
  const itens = curso.grade || []
  return (
    <section className="bloco-detalhe informacoes-academicas">
      <h2>Grade curricular</h2>
      {itens.length ? (
        <div className="informacoes-academicas__lista">
          {itens.map((item, indice) => (
            <article key={item.identificador || item.codigo || indice}>
              <h3>{item.nome}</h3>
              <p>
                {item.codigo}, {item.cargaHoraria} horas, {item.semestre}º semestre, {item.tipo}
              </p>
              <p>{item.descricao}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="informacoes-academicas__vazio">
          <h3>A matriz curricular ainda não está disponível</h3>
          <p>
            As disciplinas, cargas horárias e semestres serão exibidos após o cadastro da matriz
            curricular do curso.
          </p>
          <a className="botao-secundario" href={`#curso/${curso.identificador}`}>
            Voltar à visão geral
          </a>
        </div>
      )}
    </section>
  )
}
