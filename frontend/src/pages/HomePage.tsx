import { Link } from 'react-router-dom'
import { ArrowRight, Globe, Database, BarChart3, Zap, Shield, Code2 } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Scraping Universal',
    description: 'Funciona com qualquer site dinamico que usa JavaScript. Playwright renderiza a pagina completamente antes de extrair os dados.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Database,
    title: 'Pandas Integration',
    description: 'Processamento de dados automatico com Pandas. Limpeza, analise estatistica e exportacao para CSV.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BarChart3,
    title: 'Visualizacao com Matplotlib',
    description: 'Gere graficos automaticos dos dados extraidos. Barras, linhas, pizza, dispersao e histogramas.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Smart Scrape',
    description: 'Modo inteligente que detecta automaticamente tabelas, listas e estruturas de dados na pagina.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Headless Browser',
    description: 'Usa Chromium em modo headless com user-agent real. Evita bloqueios de bot.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Code2,
    title: 'API REST',
    description: 'Backend em FastAPI com documentacao automatica. Facil integracao com qualquer frontend.',
    color: 'from-indigo-500 to-blue-600',
  },
]

const steps = [
  { num: '01', title: 'Insira a URL', desc: 'Digite o endereco do site dinamico que deseja scrapear' },
  { num: '02', title: 'Defina Seletores', desc: 'Informe os seletores CSS para extrair os dados desejados' },
  { num: '03', title: 'Execute', desc: 'O Playwright renderiza a pagina e extrai os dados automaticamente' },
  { num: '04', title: 'Analise', desc: 'Visualize os dados com Pandas e gere graficos com Matplotlib' },
]

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            Scraping de sites dinamicos com Python
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 animate-fade-in">
            Extraia dados de{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              qualquer site
            </span>{' '}
            dinamico
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Sistema completo de web scraping com Playwright, Pandas e Matplotlib.
            Frontend moderno em React com backend Python de alta performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              to="/scraper"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <Zap className="w-5 h-5" />
              Comecar a Scrapar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/docs"
              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              <Code2 className="w-5 h-5" />
              Documentacao
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Como Funciona</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Processo simples e direto para extrair dados de qualquer site dinamico
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow animate-slide-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl font-bold text-blue-100 mb-3">{step.num}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Recursos</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Stack completa para scraping, processamento e visualizacao de dados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Stack Tecnologico</h2>
            <p className="text-slate-600">Tecnologias modernas e robustas</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Python', 'FastAPI', 'Playwright', 'Pandas', 'Matplotlib', 'React', 'TypeScript', 'Tailwind CSS', 'Vite'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 sm:p-16 text-center shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Pronto para comecar?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Extraia dados de qualquer site dinamico em segundos com nossa ferramenta completa.
              </p>
              <Link
                to="/scraper"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Zap className="w-5 h-5" />
                Iniciar Scraping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
