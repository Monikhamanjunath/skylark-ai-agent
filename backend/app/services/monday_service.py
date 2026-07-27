import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings


class MondayService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.MONDAY_API_KEY
        self.api_url = settings.MONDAY_API_URL
        self.last_synced_at: Optional[datetime] = None
        self.is_connected: bool = False
        self.error_message: Optional[str] = None

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
            "API-Version": "2023-10",
        }

    async def fetch_boards_and_items(self) -> Dict[str, Any]:
        """
        Dynamically fetches all boards and their items from Monday.com GraphQL.
        Never falls back to CSV. Returns degraded state dict if unavailable.
        """
        if not self.api_key:
            return {
                "status": "UNAVAILABLE",
                "is_live": False,
                "error": "Monday API Key is missing. Set MONDAY_API_KEY in backend/.env",
                "boards": [],
                "last_synced_at": None,
            }

        query = """
        query {
            boards (limit: 10) {
                id
                name
                state
                updated_at
                columns {
                    id
                    title
                    type
                }
                items_page (limit: 100) {
                    items {
                        id
                        name
                        created_at
                        updated_at
                        column_values {
                            id
                            text
                            value
                        }
                    }
                }
            }
        }
        """

        try:
            async with httpx.AsyncClient(timeout=settings.DEFAULT_TIMEOUT) as client:
                response = await client.post(
                    self.api_url,
                    json={"query": query},
                    headers=self._get_headers(),
                )

            if response.status_code == 401:
                self.is_connected = False
                self.error_message = "Monday API key is invalid or expired."
                return self._degraded(self.error_message)

            if response.status_code == 429:
                self.is_connected = False
                self.error_message = "Monday API rate limit exceeded. Please wait before retrying."
                return self._degraded(self.error_message)

            if response.status_code != 200:
                self.is_connected = False
                self.error_message = f"Monday API returned HTTP {response.status_code}."
                return self._degraded(self.error_message)

            data = response.json()

            if "errors" in data:
                self.is_connected = False
                self.error_message = data["errors"][0].get("message", "Monday GraphQL error.")
                return self._degraded(self.error_message)

            boards_data = data.get("data", {}).get("boards", [])
            self.last_synced_at = datetime.utcnow()
            self.is_connected = True
            self.error_message = None

            return {
                "status": "LIVE",
                "is_live": True,
                "error": None,
                "boards": boards_data,
                "last_synced_at": self.last_synced_at.isoformat() + "Z",
            }

        except httpx.TimeoutException:
            self.is_connected = False
            self.error_message = "Monday.com connection timed out. Please check your network."
            return self._degraded(self.error_message)

        except httpx.RequestError as exc:
            self.is_connected = False
            self.error_message = f"Network error connecting to Monday.com: {str(exc)}"
            return self._degraded(self.error_message)

        except Exception as exc:
            self.is_connected = False
            self.error_message = f"Unexpected error during Monday sync: {str(exc)}"
            return self._degraded(self.error_message)

    def _degraded(self, error: str) -> Dict[str, Any]:
        """Returns a professional degraded state payload (never crashes the app)."""
        return {
            "status": "UNAVAILABLE",
            "is_live": False,
            "error": error,
            "boards": [],
            "last_synced_at": (
                self.last_synced_at.isoformat() + "Z"
                if self.last_synced_at
                else None
            ),
        }


# Singleton instance
monday_service = MondayService()
