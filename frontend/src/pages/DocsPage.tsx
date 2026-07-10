import { useState } from 'react'
import { BookOpen, Server, Code2, Zap, Database, BarChart3, GitBranch, Rocket } from 'lucide-react'

interface SectionData {
  icon: React.ElementType
  title: string
  content: string
}

const sections: SectionData[] = [
  {
    icon: Rocket,
    title: 'Instalacao Rapida',
    content: `
## Backend (Python)

\`\`\`bash
# Clone o repositorio
git clone https://github.com/Colombiano/universal-scraper.git
cd universal-scraper/backend

# Instale as dependencias
pip install -r requirements.txt

# Instale o navegador Playwright
playwright install chromium

# Inicie o servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

## Frontend (React)

\`\`\`bash
cd ../frontend
npm install
npm run dev
\`\`\`

O frontend estara em http://localhost:5173 e o backend em http://localhost:8000.
    `,
  },
  {
    icon: Server,
    title: 'API Endpoints',
    content: `
## Endpoints Disponiveis

### Health Check
- **GET** /health - Verifica se a API esta funcionando

### Scraping
- **POST** /scrape - Scrape com seletores CSS personalizados
- **POST** /smart-scrape - Scrape inteligente (detecta tabelas e listas)

### Analise
- **POST** /table/analyze - Analise de dados com Pandas
- **POST** /table/csv - Exporta dados para CSV

### Visualizacao
- **POST** /chart - Gera graficos com Matplotlib
    `,
  },
  {
    icon: Code2,
    title: 'Seletores CSS',
    content: `
## Guia de Seletores

| Seletor | Descricao | Exemplo |
|---------|-----------|---------|
| tag | Por tag HTML | h1, p, a |
| .classe | Por classe CSS | .produto, .preco |
| #id | Por ID | #header, #conteudo |
| [attr] | Por atributo | [data-item] |
| A > B | Filho direto | ul > li |
| A B | Descendente | .produto .titulo |
| :nth-child() | Posicao | tr:nth-child(3) |

## Atributos Disponiveis

| Atributo | Descricao |
|----------|-----------|
| text | Texto do elemento |
| href | Link (para tags a) |
| src | URL da imagem |
| data-src | URL lazy-load |
| title | Titulo do elemento |
| alt | Texto alternativo |
    `,
  },
  {
    icon: Zap,
    title: 'Dicas e Truques',
    content: `
## Sites Dinamicos

Para sites que carregam conteudo via JavaScript:

1. **Ative o scroll** - Marque a opcao "Rolar pagina" para carregar conteudo lazy
2. **Use wait_for** - Informe um seletor CSS que so aparece quando o conteudo carrega
3. **Aumente o timeout** - Sites lentos podem precisar de mais tempo (60000ms)

## Modo Smart Scrape

O modo inteligente detecta automaticamente:
- Todas as tabelas HTML (<table>)
- Todas as listas (<ul>, <ol>)
- Todos os titulos (<h1> a <h6>)

Ideal quando voce nao conhece a estrutura do site.
    `,
  },
  {
    icon: Database,
    title: 'Pandas Operations',
    content: `
## Operacoes de Analise

| Operacao | Descricao |
|----------|-----------|
| describe | Estatisticas descritivas (count, mean, std, min, max) |
| head | Primeiros 10 registros |
| tail | Ultimos 10 registros |
| value_counts:col | Contagem de valores unicos na coluna |

## Exportacao

Os dados podem ser exportados para JSON e CSV.
    `,
  },
  {
    icon: BarChart3,
    title: 'Tipos de Graficos',
    content: `
## Graficos Suportados

| Tipo | Descricao | Requisitos |
|------|-----------|------------|
| bar | Grafico de barras | Coluna X obrigatoria |
| line | Grafico de linhas | Colunas X e Y |
| pie | Grafico de pizza | Apenas coluna X |
| scatter | Dispersao | Colunas X e Y |
| hist | Histograma | Coluna numerica |

## Dicas

- Para graficos de pizza, use colunas categoricas no eixo X
- Para scatter, ambas as colunas devem ser numericas
- O histograma funciona melhor com colunas numericas
- A cor pode ser qualquer codigo hexadecimal valido
    `,
  },
  {
    icon: GitBranch,
    title: 'Estrutura do Projeto',
    content: `
## Arquivos e Diretorios

universal-scraper/
- backend/
  - main.py              (API FastAPI principal)
  - requirements.txt     (Dependencias Python)
  - install.sh           (Script de instalacao)
- frontend/
  - src/
    - main.tsx         (Entry point)
    - App.tsx          (Router e layout)
    - index.css        (Estilos globais)
    - components/      (Componentes reutilizaveis)
      - Header.tsx
      - Footer.tsx
      - Layout.tsx
    - pages/           (Paginas)
      - HomePage.tsx
      - ScraperPage.tsx
      - AnalysisPage.tsx
      - DocsPage.tsx
  - package.json
  - vite.config.ts
  - tailwind.config.js
  - tsconfig.json
    `,
  },
]

function DocSection({ section, defaultOpen }: { section: SectionData; defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const Icon = section.icon

  const renderMarkdown = (content: string) => {
    const lines = content.trim().split('\n')
    const elements: JSX.Element[] = []
    let key = 0

    let i = 0
    while (i < lines.length) {
      const line = lines[i]

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-xl font-bold text-slate-900 mt-6 mb-3">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('```')) {
        const lang = line.replace('```', '').trim()
        const codeLines: string[] = []
        i++
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        elements.push(
          <div key={key++} className="my-4">
            {lang && <div className="text-xs text-slate-500 mb-1">{lang}</div>}
            <pre className="code-block overflow-x-auto">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        )
      } else if (line.startsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].startsWith('|')) {
          tableLines.push(lines[i])
          i++
        }
        i--

        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim())
          const rows = tableLines.slice(2).map(row =>
            row.split('|').filter(c => c.trim()).map(c => c.trim())
          )

          elements.push(
            <div key={key++} className="overflow-x-auto my-4">
              <table className="data-table text-sm">
                <thead>
                  <tr>
                    {headers.map((h, j) => (
                      <th key={j}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      } else if (line.trim() === '') {
        // skip
      } else {
        elements.push(
          <p key={key++} className="text-sm text-slate-700 my-2 leading-relaxed">
            {line}
          </p>
        )
      }

      i++
    }

    return elements
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-4">
          {renderMarkdown(section.content)}
        </div>
      )}
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          Documentacao
        </h1>
        <p className="text-slate-600 mt-2">
          Guia completo de uso e referencia da API
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <DocSection key={section.title} section={section} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  )
}
