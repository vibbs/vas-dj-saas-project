.PHONY: build start stop clean

build:
	docker compose -f ./docker/docker-compose.yml  build

start:
	docker compose -f ./docker/docker-compose.yml up

stop:
	docker compose -f ./docker/docker-compose.yml down

clean:
	docker compose -f ./docker/docker-compose.yml down --volumes --rmi all
	docker volume prune -f
	docker network prune -f
	docker system prune -f

migrations:
	docker compose -f ./docker/docker-compose.yml run --rm web python manage.py makemigrations

migrate:
	docker compose -f ./docker/docker-compose.yml run --rm web python manage.py migrate