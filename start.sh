#!/usr/bin/env bash
set -e

bun run src/index.ts &
bun run src/offload.ts &
wait
