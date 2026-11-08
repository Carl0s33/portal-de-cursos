import './painel-institucional.css'

export default function PainelInstitucional() {
  return (
    <aside className="painel-institucional" aria-labelledby="titulo-acesso-institucional">
      <h2 id="titulo-acesso-institucional">Seu projeto, do envio à publicação</h2>
      <p>Um espaço para apresentar seu trabalho e acompanhar cada etapa da avaliação.</p>
      <ol>
        <li>
          <strong>Envie o projeto</strong>
          <span>Informe o resumo, os integrantes e a documentação solicitada.</span>
        </li>
        <li>
          <strong>Acompanhe a avaliação</strong>
          <span>Consulte o parecer do professor orientador e da coordenação.</span>
        </li>
        <li>
          <strong>Consulte o resultado</strong>
          <span>Veja a decisão e as orientações registradas na sua submissão.</span>
        </li>
      </ol>
    </aside>
  )
}
