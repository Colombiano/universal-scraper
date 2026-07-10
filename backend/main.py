"""
Universal Web Scraper API
FastAPI backend with Playwright, Pandas, and Matplotlib support.
"""

import asyncio
import json
import base64
import io
import traceback
from typing import Optional, List, Dict, Any
from datetime import datetime
from contextlib import asynccontextmanager

import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from playwright.async_api import async_playwright, Browser, BrowserContext, Page


# ─── Lifespan Manager ──────────────────────────────────────────────────

browser_pool: Optional[Browser] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global browser_pool
    playwright = await async_playwright().start()
    browser_pool = await playwright.chromium.launch(headless=True)
    print(f"[{datetime.now()}] Browser pool started")
    yield
    await browser_pool.close()
    await playwright.stop()
    print(f"[{datetime.now()}] Browser pool stopped")


# ─── FastAPI App ───────────────────────────────────────────────────────

app = FastAPI(
    title="Universal Web Scraper API",
    description="Scrape any dynamic website with Playwright, process with Pandas, and visualize with Matplotlib.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic Models ───────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    url: str = Field(..., description="URL do site a ser scrapeado")
    selectors: List[Dict[str, str]] = Field(
        ...,
        description="Lista de seletores CSS com nome e seletor",
        example=[{"name": "titulo", "selector": "h1"}, {"name": "preco", "selector": ".price"}]
    )
    wait_for: Optional[str] = Field(None, description="Seletor CSS para aguardar antes de extrair")
    scroll: bool = Field(False, description="Se deve rolar a pagina para carregar conteudo lazy")
    timeout: int = Field(30000, description="Timeout em milissegundos")


class TableRequest(BaseModel):
    data: List[Dict[str, Any]] = Field(..., description="Dados para criar DataFrame")
    operations: Optional[List[str]] = Field(
        None,
        description="Operacoes: 'describe', 'info', 'head', 'tail', 'value_counts:<col>'"
    )


class ChartRequest(BaseModel):
    data: List[Dict[str, Any]] = Field(..., description="Dados para o grafico")
    chart_type: str = Field("bar", description="Tipo: bar, line, pie, scatter, hist")
    x_column: str = Field(..., description="Coluna para eixo X")
    y_column: Optional[str] = Field(None, description="Coluna para eixo Y (opcional para pie)")
    title: str = Field("Grafico", description="Titulo do grafico")
    color: Optional[str] = Field("#4F46E5", description="Cor principal")


# ─── Helper Functions ──────────────────────────────────────────────────

async def scrape_page(
    url: str,
    selectors: List[Dict[str, str]],
    wait_for: Optional[str] = None,
    scroll: bool = False,
    timeout: int = 30000
) -> Dict[str, Any]:
    """Scrape a web page using Playwright."""
    if not browser_pool:
        raise HTTPException(500, "Browser pool nao inicializado")

    context: BrowserContext = None
    page: Page = None

    try:
        context = await browser_pool.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        # Navigate to URL
        await page.goto(url, wait_until="networkidle", timeout=timeout)

        # Wait for specific element if requested
        if wait_for:
            await page.wait_for_selector(wait_for, timeout=timeout)

        # Scroll to load lazy content
        if scroll:
            for _ in range(5):
                await page.evaluate("window.scrollBy(0, window.innerHeight)")
                await asyncio.sleep(0.5)
            await asyncio.sleep(1)

        # Extract data using selectors
        results = {}
        for sel in selectors:
            name = sel.get("name", "unnamed")
            selector = sel.get("selector", "")
            attribute = sel.get("attribute", "text")

            if not selector:
                continue

            try:
                elements = await page.query_selector_all(selector)
                extracted = []

                for el in elements:
                    if attribute == "text":
                        text = await el.text_content()
                        extracted.append(text.strip() if text else "")
                    elif attribute == "href":
                        href = await el.get_attribute("href")
                        extracted.append(href or "")
                    elif attribute == "src":
                        src = await el.get_attribute("src")
                        extracted.append(src or "")
                    else:
                        attr_val = await el.get_attribute(attribute)
                        extracted.append(attr_val or "")

                results[name] = extracted
            except Exception as e:
                results[name] = {"error": str(e)}

        # Also get page metadata
        title = await page.title()
        page_url = page.url

        await page.close()
        await context.close()

        return {
            "success": True,
            "metadata": {
                "title": title,
                "url": page_url,
                "scraped_at": datetime.now().isoformat(),
            },
            "data": results,
            "count": {k: len(v) if isinstance(v, list) else 0 for k, v in results.items()},
        }

    except Exception as e:
        if page:
            await page.close()
        if context:
            await context.close()
        raise HTTPException(500, f"Erro no scraping: {str(e)}")


def create_dataframe(data: List[Dict[str, Any]]) -> pd.DataFrame:
    """Create a pandas DataFrame from scraped data."""
    if not data:
        raise HTTPException(400, "Dados vazios")
    return pd.DataFrame(data)


def dataframe_to_records(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Convert DataFrame to JSON-serializable records."""
    df_clean = df.copy()
    # Convert NaN to None for JSON serialization
    df_clean = df_clean.where(pd.notnull(df_clean), None)
    return df_clean.to_dict(orient="records")


# ─── API Endpoints ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "Universal Web Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "scrape": "POST /scrape - Scrape a website",
            "health": "GET /health - Check API health",
            "table/analyze": "POST /table/analyze - Analyze data with Pandas",
            "table/csv": "POST /table/csv - Export data to CSV",
            "chart": "POST /chart - Generate chart with Matplotlib",
        }
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "browser_ready": browser_pool is not None,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/scrape")
async def scrape(request: ScrapeRequest):
    """
    Scrape a website using Playwright with CSS selectors.
    Returns extracted data as JSON.
    """
    result = await scrape_page(
        url=request.url,
        selectors=request.selectors,
        wait_for=request.wait_for,
        scroll=request.scroll,
        timeout=request.timeout,
    )
    return result


@app.post("/table/analyze")
async def analyze_table(request: TableRequest):
    """
    Analyze scraped data using Pandas.
    Supports: describe, head, tail, value_counts.
    """
    try:
        df = create_dataframe(request.data)

        results = {
            "shape": list(df.shape),
            "columns": list(df.columns),
            "records": dataframe_to_records(df),
        }

        if request.operations:
            for op in request.operations:
                if op == "describe":
                    desc = df.describe(include="all").to_dict()
                    results["describe"] = desc
                elif op == "head":
                    results["head"] = dataframe_to_records(df.head(10))
                elif op == "tail":
                    results["tail"] = dataframe_to_records(df.tail(10))
                elif op.startswith("value_counts:"):
                    col = op.split(":", 1)[1]
                    if col in df.columns:
                        vc = df[col].value_counts().to_dict()
                        results[f"value_counts_{col}"] = vc

        return {"success": True, "results": results}

    except Exception as e:
        raise HTTPException(500, f"Erro na analise: {str(e)}")


@app.post("/table/csv")
async def export_csv(request: TableRequest):
    """Export data to CSV format."""
    try:
        df = create_dataframe(request.data)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False, encoding="utf-8-sig")
        csv_content = csv_buffer.getvalue()

        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=data.csv"}
        )
    except Exception as e:
        raise HTTPException(500, f"Erro ao exportar CSV: {str(e)}")


@app.post("/chart")
async def generate_chart(request: ChartRequest):
    """
    Generate a chart using Matplotlib.
    Returns base64-encoded PNG image.
    """
    try:
        df = pd.DataFrame(request.data)

        if request.x_column not in df.columns:
            raise HTTPException(400, f"Coluna X '{request.x_column}' nao encontrada")

        fig, ax = plt.subplots(figsize=(10, 6))

        if request.chart_type == "bar":
            if request.y_column and request.y_column in df.columns:
                df.plot(kind="bar", x=request.x_column, y=request.y_column, ax=ax, color=request.color)
            else:
                df[request.x_column].value_counts().plot(kind="bar", ax=ax, color=request.color)

        elif request.chart_type == "line":
            if request.y_column and request.y_column in df.columns:
                df.plot(kind="line", x=request.x_column, y=request.y_column, ax=ax, color=request.color, marker='o')
            else:
                df[request.x_column].plot(kind="line", ax=ax, color=request.color)

        elif request.chart_type == "pie":
            counts = df[request.x_column].value_counts()
            counts.plot(kind="pie", ax=ax, autopct='%1.1f%%', colors=plt.cm.Set3.colors)
            ax.set_ylabel("")

        elif request.chart_type == "scatter":
            if request.y_column and request.y_column in df.columns:
                df.plot(kind="scatter", x=request.x_column, y=request.y_column, ax=ax, c=request.color)
            else:
                raise HTTPException(400, "Scatter requer y_column")

        elif request.chart_type == "hist":
            if request.y_column and request.y_column in df.columns:
                df[request.y_column].plot(kind="hist", ax=ax, color=request.color, bins=20)
            else:
                df[request.x_column].plot(kind="hist", ax=ax, color=request.color, bins=20)

        ax.set_title(request.title)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()

        # Save to buffer
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        plt.close(fig)

        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')

        return {
            "success": True,
            "chart": f"data:image/png;base64,{img_base64}",
            "type": request.chart_type,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erro ao gerar grafico: {str(e)}")


@app.post("/smart-scrape")
async def smart_scrape(request: ScrapeRequest):
    """
    Scrape a website and automatically detect tables and structured data.
    Uses Playwright to find tables, lists, and other structured elements.
    """
    if not browser_pool:
        raise HTTPException(500, "Browser pool nao inicializado")

    context = None
    page = None

    try:
        context = await browser_pool.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        await page.goto(request.url, wait_until="networkidle", timeout=request.timeout)

        if request.wait_for:
            await page.wait_for_selector(request.wait_for, timeout=request.timeout)

        if request.scroll:
            for _ in range(5):
                await page.evaluate("window.scrollBy(0, window.innerHeight)")
                await asyncio.sleep(0.5)

        # Extract all tables
        tables_data = await page.evaluate("""
            () => {
                const results = [];
                const tables = document.querySelectorAll('table');
                tables.forEach((table, idx) => {
                    const rows = [];
                    const headers = [];
                    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
                    if (headerRow) {
                        headerRow.querySelectorAll('th, td').forEach(cell => {
                            headers.push(cell.textContent.trim());
                        });
                    }
                    const dataRows = table.querySelectorAll('tbody tr, tr');
                    dataRows.forEach(row => {
                        const rowData = {};
                        row.querySelectorAll('td, th').forEach((cell, i) => {
                            const key = headers[i] || `col_${i}`;
                            rowData[key] = cell.textContent.trim();
                        });
                        if (Object.keys(rowData).length > 0) {
                            rows.push(rowData);
                        }
                    });
                    if (rows.length > 0) {
                        results.push({ table_index: idx, headers, rows });
                    }
                });
                return results;
            }
        """)

        # Extract all lists
        lists_data = await page.evaluate("""
            () => {
                const results = [];
                const lists = document.querySelectorAll('ul, ol');
                lists.forEach((list, idx) => {
                    const items = [];
                    list.querySelectorAll('li').forEach(item => {
                        items.push(item.textContent.trim());
                    });
                    if (items.length > 0) {
                        results.push({ list_index: idx, items });
                    }
                });
                return results;
            }
        """)

        # Extract headings
        headings = await page.evaluate("""
            () => {
                const results = [];
                document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
                    results.push({
                        level: h.tagName,
                        text: h.textContent.trim()
                    });
                });
                return results;
            }
        """)

        title = await page.title()

        await page.close()
        await context.close()

        return {
            "success": True,
            "metadata": {
                "title": title,
                "url": request.url,
                "scraped_at": datetime.now().isoformat(),
            },
            "tables": tables_data,
            "lists": lists_data,
            "headings": headings,
        }

    except Exception as e:
        if page:
            await page.close()
        if context:
            await context.close()
        raise HTTPException(500, f"Erro no smart scrape: {str(e)}")


# ─── Error Handler ─────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "detail": traceback.format_exc(),
        },
    )


# ─── Entry Point ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
