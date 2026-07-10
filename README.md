# Universal Web Scraper

Sistema completo de web scraping para sites dinamicos com Python (FastAPI + Playwright + Pandas + Matplotlib) e frontend moderno em React.

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-green)
![React](https://img.shields.io/badge/React-18%2B-61DAFB)
![Playwright](https://img.shields.io/badge/Playwright-1.40%2B-red)

## Funcionalidades

- **Scraping Universal**: Funciona com qualquer site dinamico que usa JavaScript
- **Playwright**: Renderiza paginas completamente antes de extrair dados
- **Smart Scrape**: Modo inteligente que detecta automaticamente tabelas, listas e headings
- **Pandas Integration**: Processamento e analise de dados automatico
- **Matplotlib**: Gera graficos (barras, linhas, pizza, dispersao, histograma)
- **Seletores CSS Flexiveis**: Extraia qualquer elemento por tag, classe, ID ou atributo
- **Exportacao**: JSON e CSV
- **Frontend Moderno**: React + TypeScript + Tailwind CSS

## Stack Tecnologico

### Backend
- **Python 3.8+**
- **FastAPI**: Framework web de alta performance
- **Playwright**: Automacao de browser para sites dinamicos
- **Pandas**: Manipulacao e analise de dados
- **Matplotlib**: Geracao de graficos

### Frontend
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estatica
- **Tailwind CSS**: Estilizacao utilitaria
- **Vite**: Build tool rapido
- **Lucide React**: Icones

## Instalacao Rapida

### 1. Clone o repositorio

```bash
git clone https://github.com/Colombiano/universal-scraper.git
cd universal-scraper
```

### 2. Backend (Python)

```bash
cd backend

# Crie um ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instale as dependencias
pip install -r requirements.txt

# Instale o navegador Chromium para Playwright
playwright install chromium

# Inicie o servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend (React)

```bash
cd ../frontend

# Instale as dependencias
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentacao API**: http://localhost:8000/docs

## API Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/` | Informacoes da API |
| GET | `/health` | Health check |
| POST | `/scrape` | Scrape com seletores CSS |
| POST | `/smart-scrape` | Scrape inteligente (auto-detect) |
| POST | `/table/analyze` | Analise com Pandas |
| POST | `/table/csv` | Exportar para CSV |
| POST | `/chart` | Gerar grafico com Matplotlib |

## Dicas para Sites Dinamicos

1. **Ative o scroll**: Marque a opcao "Rolar pagina" para carregar conteudo lazy-loaded
2. **Use `wait_for`**: Informe um seletor CSS que so aparece quando o conteudo carrega completamente
3. **Aumente o timeout**: Sites lentos podem precisar de mais tempo (tente 45000ms ou 60000ms)
4. **Modo Smart**: Use o Smart Scrape quando nao souber a estrutura do site

## Licenca

Este projeto esta licenciado sob a licenca MIT.
