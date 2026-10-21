import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.ai.ports import LLMUnavailableError
from app.api.routers import accounting, agent, ai, auth, documents, medical, reports, residents, search, staff
from app.api.routers import settings as settings_routes
from app.container import Container
from app.core.config import Settings, get_settings
from app.core.errors import DomainError

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def _error(status: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"data": None, "error": {"message": message}})


def create_app(settings: Settings | None = None, container: Container | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.container = container or Container(settings)
        app.state.container.init_db()
        app.state.container.load_saved_ai_settings()
        yield
        app.state.container.shutdown()

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True,
                       allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(DomainError)
    async def domain_error(_: Request, exc: DomainError):
        return _error(exc.status_code, exc.message)

    @app.exception_handler(LLMUnavailableError)
    async def llm_error(_: Request, exc: LLMUnavailableError):
        return _error(503, str(exc))

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        first = exc.errors()[0] if exc.errors() else {}
        field = ".".join(str(p) for p in first.get("loc", [])[1:])
        return _error(422, f"{field}: {first.get('msg', 'Invalid request')}" if field else first.get("msg", "Invalid request"))

    for module in (auth, residents, staff, medical, documents, accounting, reports, search, ai, agent, settings_routes):
        app.include_router(module.router, prefix="/api")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()
