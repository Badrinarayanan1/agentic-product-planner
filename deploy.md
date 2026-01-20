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
Render will automatically detect the `render.yaml` file.
1. You will see two services identified: `smart-pm-backend` and `smart-pm-frontend`.
2. **IMPORTANT**: You must provide the `GEMINI_API_KEY` for the backend service.
   - Enter your Gemini API Key in the environment variable input field.

### 3. Deploy
1. Click **Apply**.
2. Render will build both services in parallel.
   - **Backend**: Installs Python dependencies and starts Uvicorn.
   - **Frontend**: Installs Node dependencies, builds Next.js, and starts the server.
3. The `NEXT_PUBLIC_API_URL` for the frontend will be automatically linked to the backend's URL.

## Troubleshooting

- **Build Fails?**: Check the logs. Ensure all files in `src/` are committed.
- **Frontend can't talk to Backend?**: Verify `NEXT_PUBLIC_API_URL` environment variable is set in the Frontend service settings on Render (it should be automatic via Blueprint).
