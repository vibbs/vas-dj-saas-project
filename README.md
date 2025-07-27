# Django SaaS Backend

This project serves as a robust and scalable backend foundation for a Software as a Service (SaaS) application, built with Python and the Django framework. It includes essential features like user authentication, multi-tenancy preparation, background task processing, and a RESTful API.

## Overview

The goal of this project is to provide a production-ready starting point for building SaaS applications. By handling the common boilerplate and setup, developers can focus on implementing the unique business logic of their product.

The architecture is designed to be modular, making it easy to extend and customize.

---

## Core Features

*   **RESTful API**: A comprehensive API built with [Django REST Framework](https://www.django-rest-framework.org/) for frontend communication.
*   **Token-based Authentication**: Secure user authentication using JSON Web Tokens (JWT) via the [dj-rest-auth](https://dj-rest-auth.readthedocs.io/en/latest/) library.
*   **User & Organization Management**: Pre-configured models for Users and Organizations, laying the groundwork for multi-tenancy.
*   **Asynchronous Background Tasks**: Integrated [Celery](https://docs.celeryq.dev/en/stable/) with [Redis](https://redis.io/) for handling long-running tasks like sending emails or processing data without blocking the API.
*   **Environment-based Configuration**: Securely manage settings and secrets using environment variables with [python-decouple](https://pypi.org/project/python-decouple/).
*   **Containerized Development**: Full [Docker](https://www.docker.com/) and `docker-compose` setup for consistent development, testing, and production environments.
*   **Automated API Documentation**: Auto-generated, interactive API documentation using Swagger/OpenAPI.

---

## Technology Stack

*   **Backend**: Python 3.11+, Django 5.0+
*   **API**: Django REST Framework
*   **Database**: PostgreSQL
*   **Async Tasks**: Celery & Redis
*   **Containerization**: Docker

---

## Project Structure

```
django-saas-backend/
├── .envs/              # Directory for environment variable files
│   ├── .dev.db
│   └── .dev.env
├── core/               # Core Django project configuration
│   ├── settings.py
│   └── urls.py
├── users/              # Django app for user models and authentication
├── organizations/      # Django app for organization/tenant models
├── tasks/              # Celery task definitions
├── docker-compose.yml  # Docker service definitions
├── Dockerfile          # Dockerfile for the Django application
└── manage.py           # Django's command-line utility
```

---

## Getting Started

### Prerequisites

*   Docker
*   Docker Compose

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd django-saas-backend
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file.
    ```bash
    cp .envs/.dev.env .env
    ```
    Update the `.env` file with your desired settings, especially the `SECRET_KEY`.

3.  **Build and run the containers:**
    This command will build the Docker images and start the Django application, PostgreSQL database, and Redis services.
    ```bash
    docker-compose up --build -d
    ```

---

## Usage

### Running Migrations

After the containers are running, apply the database migrations:
```bash
docker-compose exec web python manage.py migrate
```

### Creating a Superuser

```bash
docker-compose exec web python manage.py createsuperuser
```

### Accessing the Application

*   **API**: `http://localhost:8000/api/`
*   **Admin Panel**: `http://localhost:8000/admin/`
*   **API Documentation**: `http://localhost:8000/api/docs/`

### Running Celery Worker

The Celery worker starts automatically with `docker-compose up`. You can view its logs with:
```bash
docker-compose logs -f celeryworker
```

