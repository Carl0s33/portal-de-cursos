import Icone from '@/shared/componentes/Icone.jsx'
import Botao from '@/shared/componentes/Botao.jsx'

export default function ChamadaEnviar() {
  return (
    <section className="faixa-envio" aria-labelledby="titulo-convite">
      <div>
        <h2 id="titulo-convite">Envie seu projeto para avaliação</h2>
        <p>
          Compartilhe seu projeto com a comunidade acadêmica. Após a avaliação, os trabalhos
          aprovados passam a fazer parte do acervo público do portal.
        </p>
        <small>Em caso de recusa, o estudante recebe o motivo da decisão.</small>
      </div>
      <Botao as="a" href="#submeter">
        <Icone nome="adicionar" />
        Enviar projeto
      </Botao>
    </section>
  )
}
