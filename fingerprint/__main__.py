"""CLI entry point: python -m fingerprint example.com"""

import asyncio
import json
import sys

import structlog

structlog.configure(
    processors=[
        structlog.dev.ConsoleRenderer(),
    ],
)

from fingerprint.collector import collect_fingerprint


async def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python -m fingerprint <ip_or_domain>")
        print("Example: python -m fingerprint example.com")
        print("Example: python -m fingerprint 8.8.8.8")
        sys.exit(1)

    target = sys.argv[1]
    report = await collect_fingerprint(target)
    print(json.dumps(report.model_dump(), indent=2, default=str))


if __name__ == "__main__":
    asyncio.run(main())
