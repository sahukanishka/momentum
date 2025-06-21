from fastapi import Request, Response
from fastapi.responses import JSONResponse
import json


async def response_middleware(request: Request, call_next):
    response = await call_next(request)

    if response.status_code in (200, 201) and response.headers.get(
        "content-type", ""
    ).startswith("application/json"):
        # Extract original body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        # Parse JSON body
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return response  # skip formatting if not valid JSON

        # Wrap it
        formatted = {
            "success": True,
            "data": payload,
            "status": response.status_code,
        }

        # Return new JSONResponse
        return JSONResponse(content=formatted, status_code=response.status_code)

    return response
