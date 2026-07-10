import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ScraperPage from './pages/ScraperPage'
import AnalysisPage from './pages/AnalysisPage'
import DocsPage from './pages/DocsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scraper" element={<ScraperPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
