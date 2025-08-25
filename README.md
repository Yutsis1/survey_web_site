This is the My pet project for learning purposes. I would like to write simple wbsite which allow user to make thier own surveys
.

# Pre-install
* [node v22.8.0](https://nodejs.org/en/download) or higher

# Getting Started

To install all dependencies for the project
```bash
npm ci
```
To run project
```bash
npm start
```

## Backend

The backend is built with FastAPI.

### Environment variables
- `MONGODB_URI`: MongoDB connection string.
- `MONGODB_DB`: Name of the database.

### Run locally
Install Python dependencies and start the development server:
```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

### Docker
Build and run the backend in Docker:
```bash
docker build -t survey-backend -f backend/Dockerfile .
docker run -p 8000:8000 --env MONGODB_URI=<your-uri> --env MONGODB_DB=<db-name> survey-backend
```
