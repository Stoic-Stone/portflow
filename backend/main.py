from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    print("Root endpoint hit!")
    return {"message": "Welcome to PortFlow API"}

@app.get("/predictions/traffic")
async def proxy_traffic_predictions(days_ahead: int = 7):
    PREDICTION_SERVICE_URL = "http://127.0.0.1:8001"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{PREDICTION_SERVICE_URL}/predictions/traffic?days_ahead={days_ahead}")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            return {"error": f"An error occurred while requesting {exc.request.url!r}."}
        except httpx.HTTPStatusError as exc:
            return {"error": f"Error response {exc.response.status_code} while requesting {exc.request.url!r}."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 