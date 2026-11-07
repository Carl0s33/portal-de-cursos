import Icone from '@/shared/componentes/Icone.jsx'

export default function ChamadaEnviar() {
  return (
    <section className="convite" aria-labelledby="titulo-convite">
      <div>
        <h2 id="titulo-convite">Envie seu projeto para avaliação</h2>
        <p>
          Compartilhe seu projeto com a comunidade acadêmica. Após a avaliação, os trabalhos
          aprovados passam a fazer parte do acervo público do portal.
        </p>
        <small>Em caso de recusa, o estudante recebe o motivo da decisão.</small>
      </div>
      <a className="botao-primario" href="#submeter">
        <Icone nome="adicionar" />
        Enviar projeto
      </a>
    </section>
  )
}
