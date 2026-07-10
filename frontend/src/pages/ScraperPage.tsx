import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Trash2, Play, Loader2, Globe, Code2, Table,
  List, AlertCircle, CheckCircle2, Download, BarChart3, Sparkles
} from 'lucide-react'

interface Selector {
  id: string
  name: string
  selector: string
  attribute: string
}

interface ScrapeResult {
  success: boolean
  metadata: {
    title: string
    url: string
    scraped_at: string
  }
  data: Record<string, string[]>
  count: Record<string, number>
}

interface SmartResult {
  success: boolean
  metadata: {
    title: string
    url: string
    scraped_at: string
  }
  tables: Array<{
    table_index: number
    headers: string[]
    rows: Record<string, string>[]
  }>
  lists: Array<{
    list_index: number
    items: string[]
  }>
  headings: Array<{
    level: string
    text: string
  }>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ScraperPage() {
  const [url, setUrl] = useState('')
  const [selectors, setSelectors] = useState<Selector[]>([
    { id: '1', name: '', selector: '', attribute: 'text' }
  ])
  const [waitFor, setWaitFor] = useState('')
  const [scroll, setScroll] = useState(false)
  const [timeout, setTimeout] = useState(30000)
  const [mode, setMode] = useState<'custom' | 'smart'>('custom')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [smartResult, setSmartResult] = useState<SmartResult | null>(null)

  const addSelector = () => {
    setSelectors([...selectors, {
      id: Date.now().toString(),
      name: '',
      selector: '',
      attribute: 'text'
    }])
  }

  const removeSelector = (id: string) => {
    if (selectors.length > 1) {
      setSelectors(selectors.filter(s => s.id !== id))
    }
  }

  const updateSelector = (id: string, field: keyof Selector, value: string) => {
    setSelectors(selectors.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const handleScrape = async () => {
    if (!url) {
      setError('Por favor, insira uma URL')
      return
    }

    if (mode === 'custom' && selectors.some(s => !s.name || !s.selector)) {
      setError('Preencha todos os seletores com nome e seletor CSS')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setSmartResult(null)

    try {
      if (mode === 'smart') {
        const response = await fetch(`${API_URL}/smart-scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            selectors: [],
            wait_for: waitFor || null,
            scroll,
            timeout,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Erro no scraping')
        setSmartResult(data)
      } else {
        const response = await fetch(`${API_URL}/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            selectors: selectors.map(s => ({
              name: s.name,
              selector: s.selector,
              attribute: s.attribute,
            })),
            wait_for: waitFor || null,
            scroll,
            timeout,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Erro no scraping')
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const convertToTableData = (data: Record<string, string[]>): Record<string, string>[] => {
    const keys = Object.keys(data)
    if (keys.length === 0) return []
    const maxLen = Math.max(...keys.map(k => data[k].length))
    const rows: Record<string, string>[] = []
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, string> = {}
      keys.forEach(k => {
        row[k] = data[k][i] || ''
      })
      rows.push(row)
    }
    return rows
  }

  const downloadJSON = () => {
    const data = result || smartResult
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scraped-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          Web Scraper
        </h1>
        <p className="text-slate-600 mt-2 ml-13">
          Extraia dados de qualquer site usando seletores CSS ou modo inteligente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setMode('custom')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  mode === 'custom'
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Seletores CSS
              </button>
              <button
                onClick={() => setMode('smart')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  mode === 'smart'
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Smart Scrape
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                URL do Site
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Aguardar Elemento (opcional)
              </label>
              <input
                type="text"
                value={waitFor}
                onChange={(e) => setWaitFor(e.target.value)}
                placeholder=".content-loaded"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scroll}
                  onChange={(e) => setScroll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Rolar pagina (lazy load)</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {mode === 'custom' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Seletores CSS</h3>
                <button
                  onClick={addSelector}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-3">
                {selectors.map((sel, idx) => (
                  <div key={sel.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">#{idx + 1}</span>
                      {selectors.length > 1 && (
                        <button
                          onClick={() => removeSelector(sel.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={sel.name}
                      onChange={(e) => updateSelector(sel.id, 'name', e.target.value)}
                      placeholder="Nome do campo (ex: titulo)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={sel.selector}
                      onChange={(e) => updateSelector(sel.id, 'selector', e.target.value)}
                      placeholder="Seletor CSS (ex: h1, .preco)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                    />
                    <select
                      value={sel.attribute}
                      onChange={(e) => updateSelector(sel.id, 'attribute', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                    >
                      <option value="text">Texto</option>
                      <option value="href">Link (href)</option>
                      <option value="src">Imagem (src)</option>
                      <option value="data-src">Data Src</option>
                      <option value="title">Titulo</option>
                      <option value="alt">Alt</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'smart' && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-900">Modo Inteligente</h3>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                Detecta automaticamente tabelas, listas e headings da pagina.
                Nao e necessario definir seletores manualmente.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={handleScrape}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {mode === 'smart' ? 'Smart Scrape' : 'Iniciar Scraping'}
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {!result && !smartResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Nenhum dado extraido ainda
              </h3>
              <p className="text-slate-500 max-w-sm">
                Configure os parametros ao lado e clique em iniciar para extrair dados do site
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200 bg-white">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <Globe className="absolute inset-0 m-auto w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Extraindo dados...</h3>
              <p className="text-slate-500 text-sm">Playwright esta renderizando a pagina</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-900">Scraping Concluido</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadJSON}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      JSON
                    </button>
                    <Link
                      to="/analysis"
                      state={{ data: convertToTableData(result.data) }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analisar
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Titulo</span>
                    <p className="font-medium text-slate-900 truncate">{result.metadata.title}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">URL</span>
                    <p className="font-medium text-slate-900 truncate">{result.metadata.url}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Data</span>
                    <p className="font-medium text-slate-900">
                      {new Date(result.metadata.scraped_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {Object.keys(result.data).length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-slate-900">Dados Extraidos</h3>
                    </div>
                    <span className="text-xs text-slate-500">
                      {Object.keys(result.data).length} campos
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th className="w-16">#</th>
                          {Object.keys(result.data).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const keys = Object.keys(result.data)
                          const maxLen = Math.max(...keys.map(k => result.data[k].length))
                          return Array.from({ length: Math.min(maxLen, 50) }).map((_, i) => (
                            <tr key={i}>
                              <td className="text-slate-400 text-xs">{i + 1}</td>
                              {keys.map(key => (
                                <td key={key} className="max-w-xs truncate">
                                  {result.data[key][i] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {Object.values(result.count)[0] > 50 && (
                    <div className="p-3 text-center text-sm text-slate-500 border-t border-slate-100">
                      Mostrando 50 de {Object.values(result.count)[0]} registros
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {smartResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-900">Smart Scrape Concluido</h3>
                  </div>
                  <button
                    onClick={downloadJSON}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Titulo</span>
                    <p className="font-medium text-slate-900 truncate">{smartResult.metadata.title}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Tabelas</span>
                    <p className="font-medium text-slate-900">{smartResult.tables.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Listas</span>
                    <p className="font-medium text-slate-900">{smartResult.lists.length}</p>
                  </div>
                </div>
              </div>

              {smartResult.tables.map((table) => (
                <div key={table.table_index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-slate-900">Tabela #{table.table_index + 1}</h3>
                    </div>
                    <span className="text-xs text-slate-500">{table.rows.length} linhas</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {table.headers.map((h, i) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.slice(0, 50).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="max-w-xs truncate">{val as string}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {table.rows.length > 50 && (
                    <div className="p-3 text-center text-sm text-slate-500 border-t border-slate-100">
                      Mostrando 50 de {table.rows.length} linhas
                    </div>
                  )}
                </div>
              ))}

              {smartResult.lists.map((list) => (
                <div key={list.list_index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <List className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-semibold text-slate-900">Lista #{list.list_index + 1}</h3>
                    </div>
                    <span className="text-xs text-slate-500">{list.items.length} itens</span>
                  </div>
                  <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {list.items.map((item, i) => (
                      <li key={i} className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {smartResult.headings.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Titulos Encontrados</h3>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {smartResult.headings.map((h, i) => (
                      <li key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {h.level}
                        </span>
                        <span className="text-sm text-slate-700">{h.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
