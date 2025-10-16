# For more information, please refer to https://aka.ms/vscode-docker-python

FROM python:3.11-slim

ENV APP_ENV=production

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Set the working directory to /app
WORKDIR /app

# Install UV for 10-100x faster package installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files for better caching
COPY pyproject.toml uv.lock ./

# Install packages from pyproject.toml for reproducible builds
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy the rest of the application code
COPY . .

RUN ls -la /app
RUN ls -la ./

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# During development, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi"]
