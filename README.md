# Cloudflare Queue Error Example

Minimal reproduction of [cloudflare/workers-sdk#15670](https://github.com/cloudflare/workers-sdk/issues/15670): enqueueing more than 10,000 queue messages in a single local `fetch` fails with an internal error.

## Error

`GET /` sends 20,000 messages with `sendBatch()` in batches of 100. After 10,000 messages, Miniflare throws:

```
QuotaExceededError: You have exceeded the number of active timeouts you may set.
max active timeouts: 10000, current active timeouts: 10000, finished timeouts: 0
```

The Worker only sees:

```
Error: Unknown Internal Error (15000)
    at async Object.fetch (src/index.ts:10:4)
```

The HTTP response is `500 Internal Server Error`.

## Cause

Miniflare's local queue broker (`QueueBrokerObject.#enqueue`) calls `setTimeout` for every enqueued message. Workerd caps active timeouts at 10,000. Sending 20,000 messages in one request exceeds that cap, so `sendBatch()` fails partway through.

This is probably a local-only limit. Production Queues presumably do not use this timeout quota.

## Reproduce

```sh
pnpm install
pnpm dev
```

In another terminal:

```sh
curl http://localhost:8787/
```

Expected: `Sent 20000 messages to the queue`

Actual: `500` with `Error: Unknown Internal Error (15000)`

## Environment

- wrangler `4.131.2`
- miniflare `5.20260911.1-alpha`
