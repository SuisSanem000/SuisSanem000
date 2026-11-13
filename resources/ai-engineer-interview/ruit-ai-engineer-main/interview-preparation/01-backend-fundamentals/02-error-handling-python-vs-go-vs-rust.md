# 02 — Error Handling Philosophy: Python vs. Go vs. Rust

> **Why This Question:** Founding Engineer Alonso Veliz Garcia works with Python and **Rust**. Understanding how different languages handle errors demonstrates backend engineering maturity.

---

## 1. Comparing Error Handling Philosophies

| Dimension | Python / JavaScript | Go | Rust |
| :--- | :--- | :--- | :--- |
| **Mechanism** | Exceptions (`try / catch` or `try / except`) | Explicit return values `(result, err)` | Algebraic Data Types: `Result<T, E>` and `Option<T>` |
| **Control Flow** | Unwinds the call stack until a matching catch/except block catches it. | Normal linear flow with `if err != nil` checks. | Pattern matching (`match`) or `?` operator to propagate errors early. |
| **Visibility** | Implicit: Looking at a function signature does not tell you what exceptions it might raise. | Explicit: The function signature clearly returns an `error` type. | Strictly explicit: The return type is `Result<Value, Error>`. |
| **Compiler Enforcement** | None. Uncaught exceptions crash the process at runtime. | Weak. You can technically ignore errors with `_`. | **Absolute.** The compiler refuses to compile if you don't handle both `Ok` and `Err`. |

---

## 2. Best Practice in Marketplace Integrations Architecture

Because unhandled exceptions in integration workers can cause silent job loss, structure integration errors explicitly:

1. **Custom Error Classification Hierarchy:**
   - Define a base integration error class and derive specific categories:
     - **`RetryableError`**: Transient network timeouts, `429` rate limits, `503` service unavailable. $\rightarrow$ Retry with exponential backoff.
     - **`AuthExpiredError`**: `401` Unauthorized $\rightarrow$ Abort retries, refresh token, or notify seller to reconnect account.
     - **`SchemaDriftError`**: Marketplace altered response fields $\rightarrow$ Log scrubbed payload diff, alert engineers to update connector.
2. **Explicit Result Pattern (Rust/Go-Style in Integrations):**
   - For batch synchronization across 5 marketplaces, returning an explicit `Result(success=True/False, error_code=...)` avoids crashing the entire batch when one marketplace fails.
3. **Never Swallow Errors Silently:**
   - Never use bare catch-all error suppression. Always log contextual metadata (seller ID, item ID, marketplace) and handle or re-raise properly.
