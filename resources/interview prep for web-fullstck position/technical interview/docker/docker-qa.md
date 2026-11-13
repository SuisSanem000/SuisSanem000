# Docker Basics - Interview Q&A

> Targeted at: "I'm familiar with Docker and have used it for local development on Windows."

---

## 1. What is Docker?

Docker is a platform that packages applications into **containers** — lightweight, standalone units that include everything needed to run: code, runtime, libraries, and system tools. It ensures your app runs the same everywhere (your laptop, CI/CD, production).

**Key point:** Docker eliminates "it works on my machine" problems.

---

## 2. Container vs Virtual Machine (VM)

| Feature        | Container                      | VM                              |
| -------------- | ------------------------------ | ------------------------------- |
| OS             | Shares host kernel             | Full guest OS per VM            |
| Startup        | Seconds                        | Minutes                         |
| Size           | MBs                            | GBs                             |
| Isolation      | Process-level (namespaces)     | Hardware-level (hypervisor)     |
| Performance    | Near-native                    | Overhead from full OS           |
| Use case       | Microservices, dev environments | Running different OS, strong isolation |

**Interview tip:** Containers are NOT small VMs. They're isolated processes that share the host OS kernel.

---

## 3. Docker Architecture

Docker uses a **client-server** architecture:

- **Docker Client (`docker`)** — CLI tool you type commands into. Sends commands to the daemon via REST API.
- **Docker Daemon (`dockerd`)** — Runs on the host, does the heavy lifting: builds images, runs containers, manages networks/volumes.
- **Docker Desktop (Windows)** — Installs both client + daemon, plus Docker Compose, Kubernetes, and a GUI. Uses **WSL 2** backend on Windows.
- **Docker Registry (Docker Hub)** — Cloud storage for images. `docker pull` fetches from here, `docker push` uploads to here.

---

## 4. What is a Docker Image?

A **read-only template** used to create containers. Built from a `Dockerfile`.

- Images are made of **layers** — each instruction in a Dockerfile creates a layer.
- Layers are **cached** — only changed layers rebuild (faster builds).
- You can base images on other images (e.g., `node:18-alpine` is Node.js on Alpine Linux).

---

## 5. What is a Docker Container?

A **running instance** of an image. You can:

- Create, start, stop, restart, delete containers
- Connect them to networks
- Attach volumes for persistent storage
- Inspect logs and exec into them for debugging

**Key:** When a container is removed, any changes NOT saved to a volume are **lost**.

---

## 6. What is a Dockerfile?

A text file with instructions to build an image. Common instructions:

| Instruction  | Purpose                                          |
| ------------ | ------------------------------------------------ |
| `FROM`       | Base image (e.g., `node:18-alpine`)              |
| `WORKDIR`    | Set the working directory inside the container   |
| `COPY`       | Copy files from host to container                |
| `RUN`        | Execute commands during build (install deps)     |
| `EXPOSE`     | Document which port the app uses                 |
| `CMD`        | Default command when container starts            |
| `ENV`        | Set environment variables                        |
| `ENTRYPOINT` | Like CMD but harder to override                  |

**Interview tip:** `CMD` can be overridden at runtime; `ENTRYPOINT` is the fixed part, `CMD` provides default arguments.

---

## 7. What is Docker Compose?

A tool to define and run **multi-container** applications using a `docker-compose.yml` file.

**Use case:** Your app needs Node.js + PostgreSQL + Redis → define all three as services in one file, bring them all up with one command.

Key features:
- Define services, networks, and volumes in YAML
- Start everything: `docker compose up`
- Stop everything: `docker compose down`
- Environment-specific configs with `.env` files

---

## 8. Docker Networking

Docker creates isolated networks for containers:

| Network Type | Description                                        |
| ------------ | -------------------------------------------------- |
| `bridge`     | Default. Containers on same bridge can talk to each other |
| `host`       | Container shares the host's network (Linux only)   |
| `none`       | No networking                                      |

**In Compose:** Services on the same Compose file can reach each other by **service name** (e.g., `db:5432`).

---

## 9. Docker Volumes

Volumes provide **persistent storage** that survives container restarts and removals.

| Type          | Description                                       |
| ------------- | ------------------------------------------------- |
| Named volume  | Managed by Docker, best for databases             |
| Bind mount    | Maps a host folder to container folder — great for dev (live code reload) |
| tmpfs mount   | In-memory only, not persisted                     |

**Interview tip:** For development on Windows, bind mounts let you edit code on your host and see changes reflected inside the container instantly.

---

## 10. Docker on Windows — How It Works

- **Docker Desktop** runs a lightweight Linux VM via **WSL 2** (Windows Subsystem for Linux).
- Windows containers exist but are rarely used in web dev — you almost always use **Linux containers**.
- File performance is better when project files live inside WSL filesystem rather than `/mnt/c/` (the mounted Windows drive).
- Docker Desktop provides both CLI and a GUI dashboard for managing containers.

---

## 11. .dockerignore File

Similar to `.gitignore`. Prevents files from being sent to the Docker daemon during build:

```
node_modules
.git
.env
dist
*.log
```

**Why it matters:** Smaller build context = faster builds, and you avoid leaking secrets into images.

---

## 12. Common Interview Questions (Quick Answers)

**Q: How do you debug a running container?**
→ `docker exec -it <container> sh` — gives you a shell inside the container.

**Q: How do you see container logs?**
→ `docker logs <container>` or `docker logs -f <container>` for live streaming.

**Q: What happens when a container crashes?**
→ By default it stays stopped. Use `--restart=always` or `restart: always` in Compose to auto-restart.

**Q: How do you pass environment variables?**
→ Via `-e` flag, `--env-file`, or `environment:` in Compose.

**Q: What is a multi-stage build?**
→ Use multiple `FROM` statements in a Dockerfile to separate build and runtime. Final image only contains what's needed to run the app (smaller, more secure).

**Q: What's the difference between `COPY` and `ADD`?**
→ `COPY` just copies files. `ADD` can also extract archives and fetch URLs. Prefer `COPY` for clarity.

---

## Practice Checklist

- [ ] Pull and run a container (`docker run nginx`)
- [ ] Write a Dockerfile for a Node.js app
- [ ] Build an image and tag it
- [ ] Run a container with port mapping and volume mount
- [ ] Write a `docker-compose.yml` with app + database
- [ ] Use `docker exec` to inspect a running container
- [ ] Understand build caching and layer optimization
- [ ] Clean up unused images and containers
