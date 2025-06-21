from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from datetime import date, datetime, timezone
import re
import secrets
import aiohttp
import asyncio
from typing import Optional, Dict, Any, Literal
import logging

from sqlalchemy import inspect

logger = logging.getLogger(__name__)


class FormatResponse:
    def __init__(self, message: str, data: dict | list = None, status_code: int = 200):
        self.message = message
        self.data = data
        self.status_code = status_code

    def __call__(self):
        return JSONResponse(
            content=jsonable_encoder(
                {"message": self.message, "data": self.data, "status": self.status_code}
            ),
            status_code=self.status_code,
        )


def current_time():
    """
    Returns the current time in ISO 8601 format.
    """
    return datetime.now().now(timezone.utc)


def validate_email(email):
    """
    Validates an email address using a regular expression.

    Args:
        email (str): The email address string to validate.
    Returns:
        bool: True if the email address is valid, False otherwise.
    """
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if re.match(email_regex, email):
        return True
    return False


def validate_mobile(mobile):
    """
    Validates a mobile number by checking if it contains only digits.

    Args:
        mobile (str): The mobile number string to validate.
    Returns:
        bool: True if the mobile number contains only digits, False otherwise.
    """
    # Allow '+' at the start of the number
    if mobile.startswith("+"):
        mobile = mobile[1:]
    for digit in mobile:
        if not digit.isdigit():
            return False
    return True


def validate_password(password):
    """
    Validates a password based on the following criteria:
    - Minimum 8 characters in length
    - Contains at least one letter (uppercase or lowercase)
    - Contains at least one digit
    - Contains at least one special character from @$!%*#?&

    Args:
        password (str): The password string to validate.

    Returns:
        bool: True if the password meets the criteria, False otherwise.
    """
    password_regex = r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
    if re.match(password_regex, password):
        return True
    return False


def generate_otp(length):
    """
    Generates a random numeric OTP of the specified length.
    Args:
        length (int): The length of the OTP to generate.
    Returns:
        str: The generated OTP string.
    """
    otp = ""
    for _ in range(length):
        otp = otp + str(secrets.randbelow(10))
    return otp


def serialize_model(instance):
    """
    Serialize a SQLAlchemy model instance to a dictionary, including datetime handling.
    """
    if instance is None:
        return None

    serialized = {}
    for column in inspect(instance).mapper.column_attrs:
        value = getattr(instance, column.key)
        if isinstance(value, (datetime, date)):
            serialized[column.key] = value.isoformat()
        else:
            serialized[column.key] = value

    return serialized


async def call_api_async(
    url: str,
    method: Literal["GET", "POST", "PATCH"] = "GET",
    headers: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, str]] = None,
    json_data: Optional[Dict[str, Any]] = None,
    retries: int = 2,
) -> Optional[Dict[str, Any]]:
    """
    Call an external API asynchronously with retries and timeouts.

    :param url: API endpoint URL
    :param method: HTTP method (GET, POST, etc.)
    :param headers: Request headers
    :param params: Query parameters
    :param json_data: JSON payload for POST/PUT requests
    :param retries: Number of retries on failure
    :return: Response JSON or None if failed
    """
    async with aiohttp.ClientSession() as session:
        for attempt in range(retries):
            try:
                async with session.request(
                    method,
                    url,
                    headers=headers,
                    params=params,
                    json=json_data,
                    timeout=aiohttp.ClientTimeout(total=30),  # Total timeout
                ) as response:
                    response.raise_for_status()  # Raise HTTPError for bad responses
                    return await response.json()  # Parse JSON response
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt == retries - 1:
                    logger.error(f"API call failed after {retries} retries: {e}")
                    return None
                await asyncio.sleep(2**attempt)
