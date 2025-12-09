"""OpenAI API integration service (Cloud.ru Foundation Models)."""

import asyncio
import logging
from openai import DefaultAioHttpClient
from openai import AsyncOpenAI
from typing import Optional
from tenacity import retry, stop_after_attempt, wait_exponential
from app.utils.exceptions import OpenAIAPIError
from app.config import settings

logger = logging.getLogger(__name__)


class OpenAIAPIService:
    """Service for interacting with Cloud.ru Foundation Models API."""

    def __init__(self):
        self.api_key = settings.openai_api_key
        self.api_url = settings.openai_api_url
        self.model = settings.openai_model

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> str:
        """
        Generate text for a single prompt.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters

        Returns:
            Generated text
        """

        messages = [{"role": "user", "content": prompt}]
        if system_prompt:
            messages.insert(0, {"role": "system", "content": system_prompt})

        async with AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.api_url,
            http_client=DefaultAioHttpClient(),
        ) as client:
            try:
                response = await client.chat.completions.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    messages=messages,
                    temperature=temperature,
                    **kwargs,
                )

                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI API error: {e}")
                raise OpenAIAPIError(detail="Failed to generate text")

    async def generate_batch(
        self, prompts: list[str], system_prompt: Optional[str] = None, **kwargs
    ) -> list[str]:
        """
        Generate text for multiple prompts in parallel.

        Args:
            prompts: List of prompts
            system_prompt: Optional system prompt
            **kwargs: Additional parameters

        Returns:
            List of generated texts
        """

        tasks = [
            self.generate(prompt, system_prompt=system_prompt, **kwargs)
            for prompt in prompts
        ]

        return await asyncio.gather(*tasks, return_exceptions=True)

    async def health_check(self) -> bool:
        """Check if OpenAI API is available."""
        try:
            async with AsyncOpenAI(
                api_key=self.api_key, base_url=self.api_url
            ) as client:
                response = await client.models.list()
                return len(response.data) > 0
        except Exception as e:
            logger.error(f"OpenAI API health check failed: {e}")
            return False
