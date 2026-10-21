from fastapi import APIRouter, Depends, Query

from app.api.deps import current_user, get_container
from app.api.schemas import ok
from app.container import Container
from app.domain.users.schemas import AuthUser

router = APIRouter(prefix="/search", tags=["ai"])


@router.get("/semantic")
def semantic_search(q: str = Query(..., min_length=1, max_length=500), k: int = Query(8, ge=1, le=25),
                    user: AuthUser = Depends(current_user), container: Container = Depends(get_container)):
    hits = container.search.search(q, permissions=user.permissions, k=k)
    return ok([h.model_dump() for h in hits], count=True)
