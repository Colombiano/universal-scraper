import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Upload, Table, Download, Play, Loader2,
  AlertCircle, CheckCircle2, TrendingUp, Hash, Type,
  PieChart, BarChart4, LineChart, ScatterChart, Activity
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AnalysisResult {
  success: boolean
  results: {
    shape: number[]
    columns: string[]
    records: Record<string, any>[]
    describe?: Record<string, any>
    head?: Record<string, any>[]
    tail?: Record<string, any>[]
    [key: string]: any
  }
}

const chartTypes = [
  { id: 'bar', label: 'Barras', icon: BarChart4 },
  { id: 'line', label: 'Linhas', icon: LineChart },
  { id: 'pie', label: 'Pizza', icon: PieChart },
  { id: 'scatter', label: 'Dispersao', icon: ScatterChart },
  { id: 'hist', label: 'Histograma', icon: Activity },
]

export default function AnalysisPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialData = location.state?.data || []

  const [jsonInput, setJsonInput] = useState(
    initialData.length > 0 ? JSON.stringify(initialData, null, 2) : '[\n  {"nome": "Exemplo 1", "valor": 100},\n  {"nome": "Exemplo 2", "valor": 200}\n]'
  )
  const [operations, setOperations] = useState<string[]>(['describe', 'head'])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [chartType, setChartType] = useState('bar')
  const [xColumn, setXColumn] = useState('')
  const [yColumn, setYColumn] = useState('')
  const [chartTitle, setChartTitle] = useState('Grafico')
  const [chartColor, setChartColor] = useState('#4F46E5')
  const [chartImage, setChartImage] = useState('')
  const [chartLoading, setChartLoading] = useState(false)

  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    setError('')
    setAnalysisResult(null)

    try {
      let data: any[]
      try {
        data = JSON.parse(jsonInput)
      } catch {
        throw new Error('JSON invalido. Verifique a sintaxe.')
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Os dados devem ser um array nao vazio')
      }

      const response = await fetch(`${API_URL}/table/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, operations }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Erro na analise')

      setAnalysisResult(result)

      if (result.results.columns.length > 0) {
        setXColumn(result.results.columns[0])
        if (result.results.columns.length > 1) {
          setYColumn(result.results.columns[1])
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [jsonInput, operations])

  const handleGenerateChart = useCallback(async () => {
    if (!analysisResult) return

    setChartLoading(true)
    setChartImage('')

    try {
      const response = await fetch(`${API_URL}/chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: analysisResult.results.records.slice(0, 100),
          chart_type: chartType,
          x_column: xColumn,
          y_column: yColumn || null,
          title: chartTitle,
          color: chartColor,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Erro ao gerar grafico')

      setChartImage(result.chart)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setChartLoading(false)
    }
  }, [analysisResult, chartType, xColumn, yColumn, chartTitle, chartColor])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        try {
          const json = JSON.parse(text)
          setJsonInput(JSON.stringify(json, null, 2))
        } catch {
          const lines = text.split('\n').filter(l => l.trim())
          const headers = lines[0].split(',').map(h => h.trim())
          const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim())
            const obj: Record<string, string> = {}
            headers.forEach((h, i) => {
              obj[h] = values[i] || ''
            })
            return obj
          })
          setJsonInput(JSON.stringify(rows, null, 2))
        }
      } catch {
        setError('Nao foi possivel ler o arquivo')
      }
    }
    reader.readAsText(file)
  }

  const downloadCSV = async () => {
    try {
      const data = JSON.parse(jsonInput)
      const response = await fetch(`${API_URL}/table/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Erro ao exportar CSV')
    }
  }

  const toggleOperation = (op: string) => {
    setOperations(prev =>
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    )
  }

  const getColumnType = (col: string): string => {
    if (!analysisResult?.results.records.length) return 'unknown'
    const val = analysisResult.results.records[0][col]
    if (typeof val === 'number') return 'number'
    return 'string'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Analise de Dados
        </h1>
        <p className="text-slate-600 mt-2">
          Analise dados com Pandas e gere graficos com Matplotlib
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Dados (JSON)</h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Carregar
                  <input type="file" accept=".json,.csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-mono bg-slate-50"
              placeholder='[{"coluna": "valor"}]'
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Operacoes Pandas</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'describe', label: 'Describe', icon: TrendingUp },
                { id: 'head', label: 'Head (10)', icon: Table },
                { id: 'tail', label: 'Tail (10)', icon: Table },
              ].map(op => {
                const Icon = op.icon
                const isActive = operations.includes(op.id)
                return (
                  <button
                    key={op.id}
                    onClick={() => toggleOperation(op.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {op.label}
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                )
              })}
            </div>

            {analysisResult && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Value Counts:</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.results.columns.map(col => (
                    <button
                      key={col}
                      onClick={() => toggleOperation(`value_counts:${col}`)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        operations.includes(`value_counts:${col}`)
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Hash className="w-3 h-3" />
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Analisar com Pandas
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {!analysisResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Nenhuma analise realizada
              </h3>
              <p className="text-slate-500 max-w-sm">
                Insira os dados e clique em analisar para ver estatisticas do Pandas
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200 bg-white">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">Processando...</h3>
              <p className="text-slate-500 text-sm">Pandas esta analisando os dados</p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Resumo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.results.shape[0]}</div>
                    <div className="text-xs text-blue-600/70 mt-1">Linhas</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{analysisResult.results.shape[1]}</div>
                    <div className="text-xs text-emerald-600/70 mt-1">Colunas</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.results.records.length}
                    </div>
                    <div className="text-xs text-purple-600/70 mt-1">Registros</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Colunas</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.results.columns.map(col => (
                    <span
                      key={col}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        getColumnType(col) === 'number'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {getColumnType(col) === 'number' ? (
                        <Hash className="w-3 h-3" />
                      ) : (
                        <Type className="w-3 h-3" />
                      )}
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {analysisResult.results.describe && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Estatisticas (Describe)</h3>
                  </div>
                  <div className="overflow-x-auto p-4">
                    <table className="data-table text-sm">
                      <thead>
                        <tr>
                          <th>Metrica</th>
                          {analysisResult.results.describe && Object.keys(analysisResult.results.describe).map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map(metric => (
                          <tr key={metric}>
                            <td className="font-medium text-slate-700">{metric}</td>
                            {analysisResult.results.describe && Object.keys(analysisResult.results.describe).map(col => {
                              const val = analysisResult.results.describe?.[col]?.[metric]
                              return (
                                <td key={col} className="text-slate-600">
                                  {val !== undefined && val !== null ? (typeof val === 'number' ? val.toFixed(2) : String(val)) : '-'}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(analysisResult.results.head || analysisResult.results.records) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Visualizacao dos Dados</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table text-sm">
                      <thead>
                        <tr>
                          {analysisResult.results.columns.map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(analysisResult.results.head || analysisResult.results.records.slice(0, 10)).map((row, i) => (
                          <tr key={i}>
                            {analysisResult.results.columns.map(col => (
                              <td key={col} className="max-w-xs truncate">
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-500" />
                  Gerar Grafico (Matplotlib)
                </h3>

                <div className="grid grid-cols-5 gap-2">
                  {chartTypes.map(ct => {
                    const Icon = ct.icon
                    return (
                      <button
                        key={ct.id}
                        onClick={() => setChartType(ct.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all ${
                          chartType === ct.id
                            ? 'bg-violet-50 text-violet-600 border border-violet-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {ct.label}
                      </button>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Eixo X</label>
                    <select
                      value={xColumn}
                      onChange={(e) => setXColumn(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm"
                    >
                      {analysisResult.results.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Eixo Y</label>
                    <select
                      value={yColumn}
                      onChange={(e) => setYColumn(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm"
                    >
                      <option value="">Auto</option>
                      {analysisResult.results.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Titulo</label>
                    <input
                      type="text"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Cor</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={chartColor}
                        onChange={(e) => setChartColor(e.target.value)}
                        className="w-10 h-9 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <span className="text-xs text-slate-500">{chartColor}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateChart}
                  disabled={chartLoading || !xColumn}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {chartLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Gerar Grafico
                    </>
                  )}
                </button>

                {chartImage && (
                  <div className="mt-4 animate-fade-in">
                    <img
                      src={chartImage}
                      alt="Grafico gerado"
                      className="w-full rounded-xl border border-slate-200 shadow-sm"
                    />
                    <div className="flex justify-center mt-3">
                      <a
                        href={chartImage}
                        download="chart.png"
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Baixar PNG
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
