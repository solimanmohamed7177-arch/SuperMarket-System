from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.core.config import settings
from app.database import test_connection, Base, engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(levelname)s — %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}")

    # Register all models
    import app.models.branch
    import app.models.department
    import app.models.role
    import app.models.user
    import app.models.category
    import app.models.product
    import app.models.customer
    import app.models.loyalty
    import app.models.supplier
    import app.models.shift
    import app.models.discount
    import app.models.inventory
    import app.models.sale
    import app.models.sale_return
    import app.models.purchase_order

    if test_connection():
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Tables ready")
        except Exception as e:
            logger.error(f"Table error: {e}")
    else:
        logger.warning("Database not connected — check .env")

    yield
    logger.info("Shutdown")


app = FastAPI(
    title    = settings.APP_NAME,
    version  = settings.APP_VERSION,
    docs_url = "/docs",
    lifespan = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.origins_list,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


@app.middleware("http")
async def timing(request: Request, call_next):
    start    = time.time()
    response = await call_next(request)
    ms       = round((time.time() - start) * 1000, 2)
    response.headers["X-Process-Time"] = f"{ms}ms"
    return response


@app.exception_handler(Exception)
async def global_error(request: Request, exc: Exception):
    logger.error(f"Error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ===== IMPORT ROUTERS =====
from app.routers.auth          import router as auth_router
from app.routers.products      import router as products_router
from app.routers.categories    import router as categories_router
from app.routers.sales         import router as sales_router
from app.routers.sales_returns import router as returns_router
from app.routers.shifts        import router as shifts_router
from app.routers.inventory     import router as inventory_router
from app.routers.customers     import router as customers_router
from app.routers.loyalty       import router as loyalty_router
from app.routers.discounts     import router as discounts_router
from app.routers.employees     import router as employees_router
from app.routers.suppliers     import router as suppliers_router
from app.routers.reports       import router as reports_router

API = "/api/v1"
app.include_router(auth_router,       prefix=API)
app.include_router(products_router,   prefix=API)
app.include_router(categories_router, prefix=API)
app.include_router(sales_router,      prefix=API)
app.include_router(returns_router,    prefix=API)
app.include_router(shifts_router,     prefix=API)
app.include_router(inventory_router,  prefix=API)
app.include_router(customers_router,  prefix=API)
app.include_router(loyalty_router,    prefix=API)
app.include_router(discounts_router,  prefix=API)
app.include_router(employees_router,  prefix=API)
app.include_router(suppliers_router,  prefix=API)
app.include_router(reports_router,    prefix=API)


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "docs": "/docs"}


@app.get("/health")
def health():
    ok = test_connection()
    return {"status": "healthy" if ok else "degraded", "database": "connected" if ok else "disconnected"}