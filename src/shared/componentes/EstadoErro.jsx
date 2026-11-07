import './estado-erro.css'

export default function EstadoErro({
  titulo = 'Não foi possível carregar os dados',
  mensagem,
  aoTentarNovamente,
  carregando = false,
}) {
  return (
    <div className="estado-erro" role="alert">
      <div>
        <h2>{titulo}</h2>
        <p>{mensagem || 'Confira sua conexão e tente carregar os dados novamente.'}</p>
      </div>
      {aoTentarNovamente && (
        <button
          className="botao-secundario"
          type="button"
          onClick={aoTentarNovamente}
          disabled={carregando}
        >
          {carregando ? 'Carregando dados…' : 'Tentar carregar novamente'}
        </button>
      )}
    </div>
  )
}
