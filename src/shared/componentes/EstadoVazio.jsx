export default function EstadoVazio({ titulo, descricao, acao, destino, aoAcionar, idAcao }) {
  return (
    <div className="estado-vazio" role="status">
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      {acao &&
        (destino ? (
          <a id={idAcao} className="botao-primario" href={destino}>
            {acao}
          </a>
        ) : aoAcionar ? (
          <button id={idAcao} className="botao-secundario" type="button" onClick={aoAcionar}>
            {acao}
          </button>
        ) : null)}
    </div>
  )
}
