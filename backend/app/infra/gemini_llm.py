from __future__ import annotations

import base64
import uuid
from collections.abc import AsyncIterator, Sequence
from typing import Any, TypeVar

from google import genai
from google.genai import errors, types
from pydantic import BaseModel

from app.ai.ports import LLMUnavailableError
from app.ai.schemas import Attachment, LLMChunk, Message, ToolCall, ToolSpec

SchemaT = TypeVar("SchemaT", bound=BaseModel)

# Prefix for call ids we generate when the API returns none; never sent back to Gemini.
LOCAL_ID = "local_"


def _clean_schema(schema: dict[str, Any]) -> dict[str, Any]:
    """Drop JSON-schema keys Gemini ignores or rejects (titles, defaults)."""
    if isinstance(schema, dict):
        return {k: _clean_schema(v) for k, v in schema.items() if k not in ("title", "default")}
    if isinstance(schema, list):
        return [_clean_schema(v) for v in schema]
    return schema


class GeminiLLM:
    """LLMProvider adapter for Google Gemini via the google-genai SDK."""

    def __init__(self, api_key: str, model: str):
        self._client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(retry_options=types.HttpRetryOptions(attempts=3)),
        )
        self.model = model

    # ---- conversion helpers -------------------------------------------------------

    @staticmethod
    def _contents(messages: Sequence[Message]) -> list[types.Content]:
        contents: list[types.Content] = []
        for m in messages:
            if m.role == "user":
                contents.append(types.Content(role="user", parts=[types.Part.from_text(text=m.content)]))
            elif m.role == "assistant":
                parts: list[types.Part] = []
                if m.content:
                    parts.append(types.Part.from_text(text=m.content))
                for call in m.tool_calls:
                    signature = call.provider_meta.get("thought_signature")
                    parts.append(types.Part(
                        function_call=types.FunctionCall(name=call.name, args=call.args, id=call.provider_meta.get("id")),
                        thought_signature=base64.b64decode(signature) if signature else None,
                    ))
                if parts:
                    contents.append(types.Content(role="model", parts=parts))
            else:  # tool result
                part = types.Part(function_response=types.FunctionResponse(
                    name=m.tool_name, response=m.tool_result or {"result": m.content},
                    id=None if (m.tool_call_id or "").startswith(LOCAL_ID) else m.tool_call_id,
                ))
                previous = contents[-1] if contents else None
                if previous and previous.role == "user" and previous.parts and previous.parts[0].function_response:
                    previous.parts.append(part)  # parallel calls answer in one turn
                else:
                    contents.append(types.Content(role="user", parts=[part]))
        return contents

    @staticmethod
    def _tools(tools: Sequence[ToolSpec]) -> list[types.Tool] | None:
        if not tools:
            return None
        return [types.Tool(function_declarations=[
            types.FunctionDeclaration(name=t.name, description=t.description,
                                      parameters_json_schema=_clean_schema(t.parameters))
            for t in tools
        ])]

    # ---- LLMProvider ----------------------------------------------------------------

    async def stream(self, *, system: str, messages: Sequence[Message], tools: Sequence[ToolSpec] = ()) -> AsyncIterator[LLMChunk]:
        config = types.GenerateContentConfig(
            system_instruction=system,
            tools=self._tools(tools),
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        )
        try:
            response = await self._client.aio.models.generate_content_stream(
                model=self.model, contents=self._contents(messages), config=config,
            )
            async for chunk in response:
                content = chunk.candidates[0].content if chunk.candidates else None
                if content is None or not content.parts:
                    continue
                text, calls = "", []
                for part in content.parts:
                    if part.function_call:
                        meta: dict[str, Any] = {}
                        if part.thought_signature:
                            meta["thought_signature"] = base64.b64encode(part.thought_signature).decode()
                        if part.function_call.id:
                            meta["id"] = part.function_call.id
                        calls.append(ToolCall(
                            id=part.function_call.id or f"{LOCAL_ID}{uuid.uuid4().hex[:12]}",
                            name=part.function_call.name or "",
                            args=dict(part.function_call.args or {}),
                            provider_meta=meta,
                        ))
                    elif part.text and not part.thought:
                        text += part.text
                if text or calls:
                    yield LLMChunk(text=text, tool_calls=calls)
        except errors.APIError as exc:
            raise LLMUnavailableError(f"Gemini request failed: {exc.message or exc}") from exc

    async def structured(self, *, system: str, prompt: str, schema: type[SchemaT],
                         attachments: Sequence[Attachment] = ()) -> SchemaT:
        parts = [types.Part.from_bytes(data=a.data, mime_type=a.mime_type) for a in attachments]
        parts.append(types.Part.from_text(text=prompt))
        try:
            response = await self._client.aio.models.generate_content(
                model=self.model,
                contents=[types.Content(role="user", parts=parts)],
                config=types.GenerateContentConfig(
                    system_instruction=system, response_mime_type="application/json", response_schema=schema,
                ),
            )
        except errors.APIError as exc:
            raise LLMUnavailableError(f"Gemini request failed: {exc.message or exc}") from exc
        if isinstance(response.parsed, schema):
            return response.parsed
        return schema.model_validate_json(response.text or "{}")

    async def complete(self, *, system: str, prompt: str) -> str:
        try:
            response = await self._client.aio.models.generate_content(
                model=self.model, contents=prompt, config=types.GenerateContentConfig(system_instruction=system),
            )
        except errors.APIError as exc:
            raise LLMUnavailableError(f"Gemini request failed: {exc.message or exc}") from exc
        return response.text or ""


class UnconfiguredLLM:
    """Placeholder used when no GEMINI_API_KEY is set: every call explains how to enable AI."""

    message = "AI features are disabled: set GEMINI_API_KEY in backend/.env and restart the API."

    async def stream(self, **_: Any) -> AsyncIterator[LLMChunk]:
        raise LLMUnavailableError(self.message)
        yield  # pragma: no cover - makes this an async generator

    async def structured(self, **_: Any):  # noqa: ANN201
        raise LLMUnavailableError(self.message)

    async def complete(self, **_: Any) -> str:
        raise LLMUnavailableError(self.message)
