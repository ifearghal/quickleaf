# Quickleaf

A minimal self-hosted text sharing tool. No dependencies, no database, just Node.js and flat files.

Quickleaf is built for **local-first homelab use**. It is especially handy for passing notes, code snippets, logs, and clipped text between local tools, services, browsers, and AI assistants running inside the same environment.

## What Quickleaf Is

- A tiny local text sharing tool
- A simple bridge for assistant-enabled homelab workflows
- A fast way to move snippets from one interface to another without adding a full database or heavy stack

## What Quickleaf Is Not

- Not magically internet-accessible on its own
- Not a hosted public paste service out of the box
- Not a full collaboration platform

If you want other people outside your LAN or homelab to reach it, you need to provide that yourself with a reverse proxy, domain, VPN, tunnel, or similar network setup.

## Quick Start

```bash
node server.js
```

Opens at `http://localhost:8445`

## Features

- Single `server.js`, no npm packages required, uses built-in Node.js modules
- Shared entries stored as `.txt` files in `/tmp/pastes`
- UUID-based URLs (8 characters)
- Human-friendly UI with simple copy-link flow
- Useful for AI-assisted workflows where the assistant needs to fetch pasted text by URL

## Config

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8445` | Listen port |
| `PASTES` | `/tmp/pastes` | Storage directory (intentionally ephemeral — survives restarts but cleared on reboot) |

## Production Use

This was built as a lightweight internal ShireWorks tool. For broader exposure or multi-user access, consider:
- Adding HTTPS (put behind nginx/caddy with TLS)
- Adding expiration
- Adding optional access control
- Switching to a more durable storage layer if the tool grows
- Documenting external access expectations clearly for operators

## Project Status

Built 2026-04-07 as a quick local sharing tool for code snippets and notes. Renamed to **Quickleaf** on 2026-04-12.

---

**Part of [ShireWorks Tiny Tools](https://github.com/ifeArghal) — small, focused projects that do one thing well.**

> Quickleaf: 12KB of server.js · No dependencies · 335 lines · ~224KB total project
