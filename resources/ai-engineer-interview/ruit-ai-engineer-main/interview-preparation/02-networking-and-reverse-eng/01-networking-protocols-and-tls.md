# 01 — Networking Protocols, HTTP Clients & TLS Fingerprinting

> **From Luis's Email Cheat Sheet:** *"http clients and tls ... some low level networking and difrerent protocols (http, ws, etc.) and their peculiarities"*

---

## 1. Low-Level Networking: TCP vs. UDP vs. DNS

- **Layer 4 (Transport) vs. Layer 7 (Application):**
  - An HTTP `401` or `429` is an Application response (the remote server received the request).
  - A connection timeout, connection reset, or TLS handshake failure is a Transport-layer network failure.
- **TCP (Transmission Control Protocol):**
  - Reliable and ordered. **3-Way Handshake:** `SYN` $\rightarrow$ `SYN-ACK` $\rightarrow$ `ACK` (costs 1 network round-trip time).
  - **`TIME_WAIT` Socket Exhaustion:** When connections close, the OS keeps sockets in `TIME_WAIT` state for 60s. Opening 500 new connections/sec without connection pooling exhausts local ephemeral ports.
- **UDP (User Datagram Protocol):**
  - Connectionless, fire-and-forget, zero handshake overhead. Used for DNS queries and HTTP/3 QUIC.
- **DNS Resolution:**
  - App cache $\rightarrow$ OS resolver $\rightarrow$ Recursive DNS (1.1.1.1) $\rightarrow$ Authoritative nameserver (returns IP + TTL).
  - Always reuse an HTTP client session to keep DNS resolutions warm and avoid 20–100ms latency overhead on every request.

---

## 2. Protocols Comparison & Their Peculiarities

- **HTTP/1.1:** 1 request at a time per TCP connection (`keep-alive` reuses the connection sequentially). Head-of-line blocking on the connection.
- **HTTP/2:** Multiplexes many requests over 1 single TCP connection using binary frames and `HPACK` header compression. *Peculiarity:* TCP head-of-line blocking—if 1 packet drops, all streams pause.
- **HTTP/3 (QUIC over UDP):** Streams are independent over UDP. A dropped packet only delays that single request.
- **WebSockets (`ws://`, `wss://`):**
  - Upgrades an HTTP connection (`101 Switching Protocols`) into a persistent, bidirectional TCP socket.
  - *Quirks:* Send **Ping/Pong heartbeats** every 25s to drop dead Wi-Fi connections; scale across multiple backend servers using **Redis Pub/Sub**; handle backpressure if clients read slowly.
- **Server-Sent Events (SSE):** Lightweight 1-way text stream (`text/event-stream`) over standard HTTP. Ideal for live inventory updates or LLM token streaming.
- **Webhooks:** Marketplace pushes HTTP `POST` to Ruit; verify HMAC signatures and return `200 OK` within 2 seconds while offloading work to background job queues.

---

## 3. HTTP Clients, Connection Pooling & TLS Fingerprinting (JA3/JA4)

- **Connection Pooling & Timeouts:**
  - Reuse client sessions to keep TCP/TLS connections warm. Always configure explicit connect and read timeouts (never leave default unbounded timeouts).
- **TLS Fingerprinting (JA3 / JA4) & Anti-Bot Protection:**
  - Marketplaces like Vinted, Wallapop, and Depop use **Cloudflare** or **DataDome** to block automated scrapers.
  - When connecting via HTTPS, the `TLS ClientHello` packet lists cipher suites and extensions in a specific order. Anti-bot systems hash this into a **JA3/JA4 fingerprint**.
  - Real Chrome uses Google's **BoringSSL** library; standard HTTP libraries use default OpenSSL. Cloudflare detects the mismatch and blocks the request with `403 Forbidden`.
  - **The Fix (`curl-impersonate` / `curl_cffi`):** Use clients that mimic Chrome's exact BoringSSL handshake and HTTP/2 settings on the wire.
- **Status Codes Quick Reference:**
  - `401 Unauthorized`: Expired token $\rightarrow$ Do not retry; prompt seller to log in.
  - `403 Forbidden`: Bot blocked or permission missing.
  - `404 Not Found`: In delist workers, treat as already delisted (success).
  - `429 Too Many Requests`: Rate limit hit $\rightarrow$ Parse `Retry-After` header and back off with jitter.
  - `502 Bad Gateway` vs. `504 Gateway Timeout`: `502` means reverse proxy got bad response; `504` means upstream timed out.
