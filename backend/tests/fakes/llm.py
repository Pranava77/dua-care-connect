"""Scripted LLM for tests: each turn is a list of chunks to stream back."""

from __future__ import annotations

from collections.abc import AsyncIterator, Sequence
from typing import Any

from app.ai.schemas import LLMChunk, Message, ToolCall, ToolSpec


def call(name: str, **args: Any) -> LLMChunk:
    return LLMChunk(tool_calls=[ToolCall(id=f"call_{name}", name=name, args=args)])


def say(text: str) -> LLMChunk:
    return LLMChunk(text=text)


class FakeLLM:
    def __init__(self, turns: list[list[LLMChunk]] | None = None, structured_result: Any = None, completion: str = ""):
        self.turns = list(turns or [])
        self.structured_result = structured_result
        self.completion = completion
        self.requests: list[dict[str, Any]] = []

    async def stream(self, *, system: str, messages: Sequence[Message], tools: Sequence[ToolSpec] = ()) -> AsyncIterator[LLMChunk]:
        self.requests.append({"system": system, "messages": list(messages), "tools": [t.name for t in tools]})
        turn = self.turns.pop(0) if self.turns else [say("Done.")]
        for chunk in turn:
            yield chunk

    async def structured(self, *, system: str, prompt: str, schema, attachments=()):  # noqa: ANN001, ANN201
        self.requests.append({"system": system, "prompt": prompt, "schema": schema.__name__})
        value = self.structured_result(prompt) if callable(self.structured_result) else self.structured_result
        return schema.model_validate(value)

    async def complete(self, *, system: str, prompt: str) -> str:
        self.requests.append({"system": system, "prompt": prompt})
        return self.completion
