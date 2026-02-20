## AI Resume & Portfolio Builder – Backend

Backend API for **AI Resume & Portfolio Builder**, built with Express.

### Folder structure

- `server.js` – Express app entrypoint (JSON parsing, CORS, error handling, health route).
- `routes/` – Route definitions (e.g. `healthRoutes.js`).
- `controllers/` – Request handlers / business logic (e.g. `healthController.js`).
- `middleware/` – Cross-cutting middleware (e.g. `errorHandler.js`).
- `utils/` – Reusable helpers (e.g. `logger.js`).

### Getting started

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Run in development mode:

   ```bash
   npm run dev
   ```

4. Run in production mode:

   ```bash
   npm start
   ```

### Health check

- **Endpoint**: `GET /api/health`
- **Response**:
  - `200 OK` with JSON payload that includes service name, version, and timestamp.

