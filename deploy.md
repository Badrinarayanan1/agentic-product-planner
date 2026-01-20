# Deployment Guide (Render)

This guide explains how to deploy the **Smart PM Agent** to Render using the Infrastructure-as-Code (IaC) blueprint.

## Prerequisites

- A [Render](https://render.com) account.
- This project pushed to a GitHub/GitLab repository.

## Steps

### 1. Connect Repository
1. Log in to your Render Dashboard.
2. Click **New +** and select **Blueprint**.
3. Connect your repository containing this project.

### 2. Configure Service
Render will automatically detect the `render.yaml` file and show a configuration screen.
1. You will see the services to be created (`smart-pm-backend` and `smart-pm-frontend`).
2. **Environment Variables**:
   - Render will prompt you for `GEMINI_API_KEY`.
   - **Action**: Paste your Google Gemini API key into the input field provided on this screen.
   - *Note: `sync: false` in `render.yaml` ensures your key is kept private and not committed to code.*

### 3. Deploy
1. Click **Apply**.
2. Render will build both services in parallel.
   - **Backend**: Python/Uvicorn service.
   - **Frontend**: Next.js service.
3. The Blueprint automatically configures the frontend to talk to the backend privately.
   - We use Next.js **Rewrites** to proxy `/api` calls from the frontend to the backend's internal URL (`http://<backend-host>:<port>`).
   - This avoids CORS issues and keeps communication secure within Render's private network.

## Troubleshooting

- **Build Fails?**: Check the logs. Ensure all files in `src/` are committed.
- **API Errors (404/500)?**: The frontend expects endpoints at `/api/...`.
  - Check that the backend service is healthy.
  - Verify that the `BACKEND_URL` environment variable is correctly set in the Frontend service (should be `http://smart-pm-backend:PORT`).
