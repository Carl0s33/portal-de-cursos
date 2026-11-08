const classesVariante = {
  default: 'botao-primario',
  outline: 'botao-secundario',
  ghost: 'botao-discreto',
}

const classesTamanho = {
  sm: 'botao--pequeno',
  default: '',
  lg: 'botao--grande',
}

export function Botao({
  as: Elemento = 'button',
  variant = 'default',
  size = 'default',
  className = '',
  ...resto
}) {
  const classeVariante = classesVariante[variant] || classesVariante.default
  const classeTamanho = classesTamanho[size] || classesTamanho.default
  const classes = [classeVariante, classeTamanho, className].filter(Boolean).join(' ')

  return <Elemento className={classes} {...resto} />
}

export default Botao
