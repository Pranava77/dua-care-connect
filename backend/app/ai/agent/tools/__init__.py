from app.ai.agent.registry import ToolRegistry
from app.ai.agent.tools import accounting, documents, hr, medical, reports, residents, retrieval


def default_registry() -> ToolRegistry:
    return ToolRegistry([
        *retrieval.TOOLS, *residents.TOOLS, *medical.TOOLS, *accounting.TOOLS,
        *hr.TOOLS, *documents.TOOLS, *reports.TOOLS,
    ])
