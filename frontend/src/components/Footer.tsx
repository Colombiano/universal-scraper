import { Github, Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>usando Python + Playwright + React</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Colombiano/universal-scraper"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
