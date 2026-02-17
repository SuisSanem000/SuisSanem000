#!/bin/bash
# =====================================================
# DOCKER COMMANDS CHEATSHEET — Interview Quick Reference
# =====================================================
# Aimed at: "I use Docker on Windows (Docker Desktop + WSL 2)
# for local development with Node.js / full-stack apps."
# =====================================================


# ─────────────────────────────────────────────────────
# 1. BASIC CONTAINER OPERATIONS
# ─────────────────────────────────────────────────────

# Run a container (pulls image if not local)
docker run nginx

# Run in detached mode (background) with port mapping
docker run -d -p 8080:80 --name my-nginx nginx
# → Host port 8080 maps to container port 80
# → Visit http://localhost:8080

# Run with environment variables
docker run -d -e NODE_ENV=development -e DB_HOST=localhost my-app

# Run with a bind mount (live code sync for development)
docker run -d -p 3000:3000 -v $(pwd):/app my-node-app
# On Windows PowerShell: -v ${PWD}:/app

# List running containers
docker ps

# List ALL containers (including stopped)
docker ps -a

# Stop a container
docker stop my-nginx

# Start a stopped container
docker start my-nginx

# Restart a container
docker restart my-nginx

# Remove a container (must be stopped first)
docker rm my-nginx

# Force remove a running container
docker rm -f my-nginx

# Remove all stopped containers
docker container prune


# ─────────────────────────────────────────────────────
# 2. IMAGE OPERATIONS
# ─────────────────────────────────────────────────────

# Pull an image from Docker Hub
docker pull node:18-alpine

# List local images
docker images

# Build an image from a Dockerfile in current directory
docker build -t my-app:1.0 .

# Build with a specific Dockerfile
docker build -f Dockerfile.dev -t my-app:dev .

# Tag an image (for pushing to a registry)
docker tag my-app:1.0 myusername/my-app:1.0

# Push an image to Docker Hub
docker push myusername/my-app:1.0

# Remove an image
docker rmi my-app:1.0

# Remove all unused images
docker image prune -a


# ─────────────────────────────────────────────────────
# 3. DEBUGGING & INSPECTION
# ─────────────────────────────────────────────────────

# View container logs
docker logs my-nginx

# Stream logs in real-time (follow)
docker logs -f my-nginx

# Show last 50 lines of logs
docker logs --tail 50 my-nginx

# Open a shell INSIDE a running container
docker exec -it my-nginx sh
# For containers with bash:
docker exec -it my-nginx bash

# Run a one-off command in a container
docker exec my-nginx cat /etc/nginx/nginx.conf

# Inspect container details (IP, mounts, env, etc.)
docker inspect my-nginx

# View resource usage (CPU, memory)
docker stats

# View port mappings
docker port my-nginx


# ─────────────────────────────────────────────────────
# 4. VOLUMES (Persistent Storage)
# ─────────────────────────────────────────────────────

# Create a named volume
docker volume create my-data

# Run container with named volume (data survives restarts)
docker run -d -v my-data:/var/lib/postgresql/data postgres:15

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect my-data

# Remove unused volumes
docker volume prune


# ─────────────────────────────────────────────────────
# 5. NETWORKING
# ─────────────────────────────────────────────────────

# Create a custom network
docker network create my-network

# Run containers on the same network (they can reach each other by name)
docker run -d --name api --network my-network my-api
docker run -d --name db  --network my-network postgres:15
# → Inside "api" container, connect to postgres at "db:5432"

# List networks
docker network ls

# Inspect a network
docker network inspect my-network


# ─────────────────────────────────────────────────────
# 6. CLEANUP COMMANDS
# ─────────────────────────────────────────────────────

# Remove everything unused (containers, images, networks, volumes)
docker system prune -a --volumes

# Show disk usage
docker system df


# =====================================================
# 7. SAMPLE DOCKERFILE — Node.js App
# =====================================================
# File: Dockerfile
# ---
# # Stage 1: Use official Node.js Alpine image (small ~50MB)
# FROM node:18-alpine
#
# # Set working directory inside container
# WORKDIR /app
#
# # Copy package files first (leverages Docker layer caching)
# COPY package*.json ./
#
# # Install dependencies
# RUN npm ci --only=production
#
# # Copy the rest of the application code
# COPY . .
#
# # Document the port (does NOT actually expose it)
# EXPOSE 3000
#
# # Default command to run the app
# CMD ["node", "server.js"]
# ---
# Build:  docker build -t my-node-app .
# Run:    docker run -d -p 3000:3000 my-node-app


# =====================================================
# 8. SAMPLE MULTI-STAGE DOCKERFILE (Smaller production image)
# =====================================================
# File: Dockerfile
# ---
# # --- Build Stage ---
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# # --- Production Stage ---
# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package*.json ./
# RUN npm ci --only=production
# EXPOSE 3000
# CMD ["node", "dist/server.js"]
# ---
# Why? Build tools (TypeScript, Webpack) stay in builder stage.
# Final image only has production code → smaller & more secure.


# =====================================================
# 9. SAMPLE docker-compose.yml — Full-Stack Dev Setup
# =====================================================
# File: docker-compose.yml
# ---
# version: '3.8'
#
# services:
#   app:
#     build: .
#     ports:
#       - "3000:3000"
#     volumes:
#       - .:/app              # Bind mount for live code reload
#       - /app/node_modules   # Prevent overwriting node_modules
#     environment:
#       - NODE_ENV=development
#       - DATABASE_URL=postgres://user:pass@db:5432/mydb
#     depends_on:
#       - db
#       - redis
#
#   db:
#     image: postgres:15
#     ports:
#       - "5432:5432"
#     environment:
#       POSTGRES_USER: user
#       POSTGRES_PASSWORD: pass
#       POSTGRES_DB: mydb
#     volumes:
#       - pgdata:/var/lib/postgresql/data   # Persist DB data
#
#   redis:
#     image: redis:7-alpine
#     ports:
#       - "6379:6379"
#
# volumes:
#   pgdata:       # Named volume for PostgreSQL data
# ---
# Start:  docker compose up -d
# Stop:   docker compose down
# Logs:   docker compose logs -f app
# Rebuild after code change:  docker compose up -d --build


# =====================================================
# 10. DOCKER COMPOSE COMMANDS
# =====================================================

# Start all services (detached)
docker compose up -d

# Start and rebuild images
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes too
docker compose down -v

# View logs for a specific service
docker compose logs -f app

# Run a one-off command in a service
docker compose exec app sh

# List running services
docker compose ps

# Scale a service (run 3 instances of "app")
docker compose up -d --scale app=3


# =====================================================
# 11. SAMPLE .dockerignore
# =====================================================
# File: .dockerignore
# ---
# node_modules
# npm-debug.log
# .git
# .gitignore
# .env
# dist
# coverage
# *.md
# .vscode
# .idea
# ---
