---
name: traffic-reverse-engineering
description: Analyzes .har network captures or mitmproxy mobile traffic to extract undocumented marketplace endpoints and detect schema drift.
---

# Traffic Reverse Engineering Playbook

## Invariant Rules
1. **Delegate Raw Capture:** Delegate parsing 10,000+ line .har files to a read-only Research Subagent to protect main context window.
2. **Scrub Credentials:** Redact Bearer tokens, cookies, and seller emails before storing or logging payloads.
3. **TLS Detection:** Inspect whether the endpoint checks JA3/JA4 TLS fingerprints (Cloudflare/DataDome); recommend browser TLS impersonation if blocked.
4. **Schema Diffing:** Compare new response fields against baseline schema; trigger engineer alert on renamed or missing required fields.

