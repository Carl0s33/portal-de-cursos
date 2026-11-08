export const configuracoes = {
  cursos: {
    singular: 'curso',
    titulo: 'Cursos',
    descricao: 'Organize a apresentação e as informações das formações.',
    campos: [
      ['nome', 'Nome do curso'],
      ['sigla', 'Sigla'],
      ['cargaHoraria', 'Carga horária (horas)'],
      ['disciplinasObrigatorias', 'Matérias obrigatórias'],
      ['disciplinasOptativas', 'Matérias optativas'],
      ['descricao', 'Descrição', 'textarea'],
      ['grau', 'Tipo de formação', ['Subsequente', 'Tecnologia', 'Bacharelado', 'Licenciatura']],
      ['duracao', 'Duração (semestres)'],
      ['modalidade', 'Formato das aulas', ['Presencial', 'A distância', 'Híbrida']],
      [
        'turno',
        'Período das aulas',
        ['Matutino', 'Vespertino', 'Noturno', 'Matutino e vespertino'],
      ],
      ['campusId', 'Unidade', 'campus'],
      ['areaId', 'Área de estudo', 'areas'],
    ],
  },
  disciplinas: {
    singular: 'matéria',
    titulo: 'Disciplinas',
    descricao: 'Banco unificado de disciplinas de todos os cursos.',
    campos: [
      ['nome', 'Nome da matéria'],
      ['codigo', 'Código da matéria'],
      ['cargaHoraria', 'Carga horária (horas)'],
      [
        'semestre',
        'Semestre em que acontece',
        [
          ['PRIMEIRO', '1º semestre'],
          ['SEGUNDO', '2º semestre'],
          ['TERCEIRO', '3º semestre'],
          ['QUARTO', '4º semestre'],
          ['QUINTO', '5º semestre'],
          ['SEXTO', '6º semestre'],
          ['SETIMO', '7º semestre'],
          ['OITAVO', '8º semestre'],
          ['NONO', '9º semestre'],
          ['DECIMO', '10º semestre'],
        ].map(([valor, rotulo]) => ({ valor, rotulo })),
      ],
      ['descricao', 'Descrição', 'textarea'],
      ['cursoId', 'Curso', 'cursos'],
      [
        'obrigatoria',
        'Tipo',
        [
          { valor: 'true', rotulo: 'Obrigatória' },
          { valor: 'false', rotulo: 'Optativa' },
        ],
      ],
    ],
  },
  projetos: {
    singular: 'projeto',
    titulo: 'Projetos',
    descricao: 'Revise as produções acadêmicas apresentadas no portal.',
    campos: [
      ['nome', 'Título'],
      ['resumo', 'Resumo', 'optional'],
      ['descricao', 'Descrição', 'textarea'],
      ['tipo', 'Tipo de produção', ['TCC', 'Projeto integrador', 'Pesquisa', 'Extensão']],
      ['cursoId', 'Curso', 'cursos'],
      ['professorIds', 'Professores orientadores', 'professores'],
      ['alunoIds', 'Alunos participantes', 'alunos'],
      ['disciplinaIds', 'Disciplinas relacionadas', 'disciplinas'],
    ],
  },
}

export const explicacoesCampos = {
  cursos: {
    nome: 'Escreva o nome completo que aparecerá para estudantes. Ex.: Técnico em Informática.',
    sigla: 'Use uma abreviação curta para identificar o curso. Ex.: TADS.',
    cargaHoraria: 'Informe o total de horas do curso, somente com números. Ex.: 2400.',
    disciplinasObrigatorias:
      'Quantas matérias obrigatórias fazem parte do curso. Se ainda não souber, informe 0.',
    disciplinasOptativas:
      'Quantas matérias opcionais fazem parte do curso. Se ainda não souber, informe 0.',
    descricao: 'Conte, em poucas frases, o que se aprende e para quem o curso é indicado.',
    grau: 'Escolha o tipo de formação oferecida.',
    duracao:
      'Informe quantos semestres são necessários para concluir. Ex.: 6 semestres (cerca de 3 anos).',
    modalidade: 'Indique se as aulas são presenciais, a distância ou combinam os dois formatos.',
    turno: 'Escolha os períodos em que as aulas acontecem.',
    campusId: 'Escolha a unidade onde o curso é oferecido.',
    areaId: 'Escolha a área de estudo mais próxima do conteúdo do curso.',
  },
  disciplinas: {
    nome: 'Escreva o nome da matéria como os estudantes a conhecem.',
    codigo: 'Informe o código usado para identificar esta matéria. Ex.: INF101.',
    cargaHoraria: 'Informe quantas horas de aula a matéria tem, somente com números. Ex.: 60.',
    semestre: 'Escolha em qual semestre do curso a matéria costuma ser oferecida.',
    descricao: 'Resuma os principais assuntos estudados nesta matéria.',
    cursoId: 'Escolha a formação à qual esta matéria pertence.',
    obrigatoria:
      'Obrigatória: todos os estudantes precisam cursá-la. Optativa: é uma opção de escolha.',
  },
  projetos: {
    nome: 'Escreva o título do trabalho.',
    resumo: 'Faça uma apresentação curta do trabalho. Este campo é opcional.',
    descricao: 'Explique o objetivo e o conteúdo do trabalho.',
    tipo: 'Escolha a categoria que melhor descreve o trabalho.',
    cursoId: 'Escolha a formação relacionada ao trabalho.',
    professorIds:
      'Selecione os professores que orientam o trabalho. Use Ctrl ou Command para escolher mais de um.',
    alunoIds:
      'Selecione os estudantes participantes. Use Ctrl ou Command para escolher mais de um.',
    disciplinaIds:
      'Selecione as matérias relacionadas. Use Ctrl ou Command para escolher mais de uma.',
  },
}

export const gruposFormulario = {
  cursos: [
    {
      titulo: 'Sobre a formação',
      descricao: 'Nome e informações principais que ajudam estudantes a reconhecer o curso.',
      campos: ['nome', 'sigla', 'grau', 'duracao'],
    },
    {
      titulo: 'Como o curso funciona',
      descricao: 'Local, horários e informações importantes para quem quer estudar aqui.',
      campos: [
        'modalidade',
        'turno',
        'cargaHoraria',
        'disciplinasObrigatorias',
        'disciplinasOptativas',
        'campusId',
        'areaId',
        'descricao',
      ],
    },
  ],
  disciplinas: [
    {
      titulo: 'Sobre a matéria',
      descricao: 'Nome, código, duração das aulas e semestre em que ela acontece.',
      campos: ['nome', 'codigo', 'cargaHoraria', 'semestre', 'descricao'],
    },
    {
      titulo: 'Formação e tipo da matéria',
      descricao: 'Escolha a formação e diga se a matéria é obrigatória ou optativa.',
      campos: ['cursoId', 'obrigatoria'],
    },
  ],
  projetos: [
    {
      titulo: 'Sobre o projeto',
      descricao: 'Apresente o trabalho e sua área.',
      campos: ['nome', 'tipo', 'resumo', 'descricao'],
    },
    {
      titulo: 'Vínculo acadêmico',
      descricao: 'Curso e disciplinas relacionadas.',
      campos: ['cursoId', 'disciplinaIds'],
    },
    {
      titulo: 'Equipe do projeto',
      descricao: 'Um ou mais professores e os alunos participantes, se houver.',
      campos: ['professorIds', 'alunoIds'],
    },
  ],
}
