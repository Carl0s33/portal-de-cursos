import './etapas-submissao.css'

const passos = [
  { titulo: 'Aluno', descricao: 'Prepara as informações e envia o projeto.' },
  {
    titulo: 'Professor orientador',
    descricao: 'Analisa o projeto e registra a avaliação inicial.',
  },
  {
    titulo: 'Coordenador do curso',
    descricao: 'Realiza a avaliação final e decide sobre a publicação.',
  },
]

export default function EtapasSubmissao({ status, compact = false }) {
  const concluido = ['Aprovado', 'Publicado'].includes(status)
  const atual = ['Aprovado pelo orientador', 'Aguardando Coordenação', 'Em análise'].includes(
    status,
  )
    ? 2
    : ['Aguardando Orientador', 'Recusado pelo orientador'].includes(status)
      ? 1
      : status === 'Publicação recusada'
        ? 2
        : status === 'Precisa de revisão'
          ? 0
          : 0
  const devolvido = [
    'Recusado pelo orientador',
    'Publicação recusada',
    'Precisa de revisão',
  ].includes(status)

  return (
    <ol
      className={compact ? 'etapas etapas--compactas' : 'etapas'}
      aria-label="Fluxo de avaliação da submissão"
    >
      {passos.map((passo, indice) => {
        const feito = concluido || indice < atual
        const emAndamento = !concluido && indice === atual
        const estado = feito
          ? 'Etapa concluída'
          : emAndamento
            ? devolvido
              ? 'Devolvido ao aluno'
              : indice === 0
                ? 'Em preparação'
                : 'Em avaliação'
            : 'Aguardando etapa anterior'
        return (
          <li
            key={passo.titulo}
            className={`etapas__passo${feito ? ' etapas__passo--concluido' : emAndamento ? ' etapas__passo--atual' : ''}`}
            aria-current={emAndamento ? 'step' : undefined}
          >
            <span className="etapas__marcador" aria-hidden="true">
              {feito ? '✓' : indice + 1}
            </span>
            <div className="etapas__conteudo">
              <strong>{passo.titulo}</strong>
              {!compact && <span className="etapas__descricao">{passo.descricao}</span>}
              <span className="etapas__estado">{estado}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
