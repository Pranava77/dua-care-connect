from __future__ import annotations

from collections.abc import Sequence

from google import genai
from google.genai import types

BATCH = 100


class GeminiEmbeddings:
    """EmbeddingProvider backed by the Gemini embeddings API."""

    def __init__(self, api_key: str, model: str, dims: int):
        self._client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(retry_options=types.HttpRetryOptions(attempts=4)),
        )
        self.model = model
        self.dims = dims
        self.name = f"{model}-{dims}"

    def _embed(self, texts: Sequence[str], task_type: str) -> list[list[float]]:
        vectors: list[list[float]] = []
        for i in range(0, len(texts), BATCH):
            response = self._client.models.embed_content(
                model=self.model,
                contents=list(texts[i:i + BATCH]),
                config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=self.dims),
            )
            vectors += [list(e.values or []) for e in response.embeddings or []]
        return vectors

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        return self._embed(texts, "RETRIEVAL_DOCUMENT")

    def embed_query(self, text: str) -> list[float]:
        return self._embed([text], "RETRIEVAL_QUERY")[0]
