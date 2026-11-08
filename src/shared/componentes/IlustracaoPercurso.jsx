export default function IlustracaoPercurso() {
  return (
    <svg
      className="ilustracao-percurso"
      viewBox="0 0 460 220"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ilustracao-superficie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--azul-suave, #182238)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--fundo-card, #0e1e38)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="ilustracao-fundo-cartao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--azul-suave, #182238)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--fundo-card, #0e1e38)" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="ilustracao-destaque" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--azul, #2563eb)" />
          <stop offset="100%" stopColor="var(--azul-vivo, #3b82f6)" />
        </linearGradient>
      </defs>

      {/* Cartão de fundo inclinado */}
      <g transform="rotate(-6 130 110)">
        <rect
          x="35"
          y="25"
          width="190"
          height="160"
          rx="18"
          fill="url(#ilustracao-fundo-cartao)"
          stroke="var(--borda-suave, rgba(255, 255, 255, 0.12))"
          strokeWidth="1.2"
        />
        <rect
          x="55"
          y="45"
          width="70"
          height="8"
          rx="4"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.4"
        />
        <rect
          x="55"
          y="62"
          width="110"
          height="6"
          rx="3"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.25"
        />
        <rect
          x="55"
          y="76"
          width="85"
          height="6"
          rx="3"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.25"
        />
      </g>

      {/* Cartão principal em destaque */}
      <g transform="translate(110, 16)">
        <rect
          width="215"
          height="188"
          rx="20"
          fill="url(#ilustracao-superficie)"
          stroke="var(--borda, rgba(255, 255, 255, 0.2))"
          strokeWidth="1.2"
        />

        {/* Cabeçalho do documento */}
        <rect x="18" y="18" width="30" height="30" rx="8" fill="url(#ilustracao-destaque)" />
        <path
          d="M28 27h6l4 4v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M34 27v4h4" stroke="#fff" strokeWidth="1.6" fill="none" />

        <rect
          x="58"
          y="22"
          width="95"
          height="9"
          rx="4.5"
          fill="var(--branco, #ffffff)"
          opacity="0.9"
        />
        <rect
          x="58"
          y="36"
          width="60"
          height="7"
          rx="3.5"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.8"
        />

        {/* Prévia gráfica / métrica */}
        <rect
          x="18"
          y="60"
          width="179"
          height="58"
          rx="12"
          fill="var(--azul-vivo, #3b82f6)"
          opacity="0.15"
        />
        <path
          d="M18 102c32-20 54 8 85-8s50-18 76-8v20a12 12 0 0 1-12 12H30a12 12 0 0 1-12-12z"
          fill="var(--azul, #2563eb)"
          opacity="0.2"
        />
        <rect
          x="34"
          y="90"
          width="12"
          height="20"
          rx="3"
          fill="var(--azul-vivo, #3b82f6)"
          opacity="0.5"
        />
        <rect
          x="56"
          y="80"
          width="12"
          height="30"
          rx="3"
          fill="var(--azul-vivo, #3b82f6)"
          opacity="0.75"
        />
        <rect
          x="78"
          y="86"
          width="12"
          height="24"
          rx="3"
          fill="var(--azul-vivo, #3b82f6)"
          opacity="0.55"
        />
        <rect x="100" y="72" width="12" height="38" rx="3" fill="var(--azul, #2563eb)" />

        {/* Linhas de resumo */}
        <rect
          x="18"
          y="130"
          width="150"
          height="6"
          rx="3"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.5"
        />
        <rect
          x="18"
          y="142"
          width="105"
          height="6"
          rx="3"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.35"
        />

        {/* Integrantes e barra de status */}
        <g stroke="var(--superficie, #0f172a)" strokeWidth="2">
          <circle cx="30" cy="166" r="10" fill="var(--azul, #2563eb)" />
          <circle cx="46" cy="166" r="10" fill="var(--azul-vivo, #60a5fa)" />
          <circle cx="62" cy="166" r="10" fill="var(--texto-institucional, #bfdbfe)" />
        </g>
        <rect
          x="88"
          y="163"
          width="108"
          height="6"
          rx="3"
          fill="var(--borda, rgba(255, 255, 255, 0.15))"
        />
        <rect x="88" y="163" width="75" height="6" rx="3" fill="var(--azul, #2563eb)" />
      </g>

      {/* Cartão de parecer do orientador */}
      <g transform="translate(265, 88)">
        <rect
          width="155"
          height="80"
          rx="16"
          fill="url(#ilustracao-superficie)"
          stroke="var(--borda, rgba(255, 255, 255, 0.22))"
          strokeWidth="1.2"
        />
        {/* Avatar orientador */}
        <circle cx="28" cy="27" r="12" fill="var(--texto-institucional, #bfdbfe)" />
        <circle cx="28" cy="23" r="4.5" fill="var(--marinho, #0f172a)" />
        <path d="M19.5 33a8.5 7 0 0 1 17 0z" fill="var(--marinho, #0f172a)" />

        <rect
          x="47"
          y="20"
          width="65"
          height="7"
          rx="3.5"
          fill="var(--branco, #ffffff)"
          opacity="0.9"
        />
        <rect
          x="47"
          y="32"
          width="85"
          height="5"
          rx="2.5"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.7"
        />

        <rect
          x="18"
          y="50"
          width="118"
          height="5"
          rx="2.5"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.4"
        />
        <rect
          x="18"
          y="60"
          width="80"
          height="5"
          rx="2.5"
          fill="var(--papel-inativo, #94a3b8)"
          opacity="0.3"
        />
      </g>

      {/* Selo de status "Aprovado" */}
      <g transform="translate(24, 154)">
        <rect
          width="134"
          height="38"
          rx="19"
          fill="var(--superficie, #062820)"
          stroke="var(--verde, #2FBF85)"
          strokeWidth="1.4"
        />
        <circle cx="20" cy="19" r="11" fill="var(--verde, #2FBF85)" />
        <path
          d="m15 19 3.5 3.5 7-7.5"
          stroke="var(--marinho, #0f172a)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <text
          x="39"
          y="24"
          fontFamily="Manrope, sans-serif"
          fontSize="13"
          fontWeight="700"
          fill="var(--verde, #2FBF85)"
          letterSpacing="0.02em"
        >
          Aprovado
        </text>
      </g>
    </svg>
  )
}
