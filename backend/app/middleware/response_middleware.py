from fastapi import Request, Response
from fastapi.responses import JSONResponse
import json


async def response_middleware(request: Request, call_next):
    response = await call_next(request)

    # Skip middleware for OpenAPI endpoints
    if request.url.path in ["/openapi.json", "/docs", "/redoc"]:
        return response

    # Preserve CORS headers
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
    }

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
            # Add CORS headers to original response
            for key, value in cors_headers.items():
                response.headers[key] = value
            return response  # skip formatting if not valid JSON

        # Wrap it
        formatted = {
            "success": True,
            "data": payload,
            "status": response.status_code,
        }

        # Return new JSONResponse with CORS headers
        json_response = JSONResponse(
            content=formatted, status_code=response.status_code
        )
        for key, value in cors_headers.items():
            json_response.headers[key] = value
        return json_response

    # Add CORS headers to non-JSON responses
    for key, value in cors_headers.items():
        response.headers[key] = value

    return response
