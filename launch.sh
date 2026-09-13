#!/usr/bin/env bash

# ==============================================================================
# Khoa.vo Portal - Launch Script
# ==============================================================================

set -e

# Resolve project root directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Color formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
RESET="\033[0m"

show_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "  _  ____     __   ____             _        _ "
  echo " | |/ /\ \   / /  |  _ \ ___  _ __ | |_ __ _| |"
  echo " | ' /  \ \ / /___| |_) / _ \| '__|| __/ _\` | |"
  echo " | . \   \ V /_____|  __/ (_) | |   | || (_| | |"
  echo " |_|\_\   \_/     |_|   \___/|_|    \__\__,_|_|"
  echo -e "${RESET}"
}

show_help() {
  echo -e "${BOLD}Usage:${RESET} ./launch.sh [command] [options]"
  echo ""
  echo -e "${BOLD}Commands:${RESET}"
  echo -e "  ${GREEN}dev${RESET}      Start the Vite development server (default)"
  echo -e "  ${GREEN}start${RESET}    Start the production Node.js server (for NAS/local)"
  echo -e "  ${GREEN}preview${RESET}  Build for production and start the Vite preview server"
  echo -e "  ${GREEN}build${RESET}    Build the project for production only"
  echo -e "  ${GREEN}install${RESET}  Install or update npm dependencies"
  echo -e "  ${GREEN}help${RESET}     Show this help guide"
  echo ""
  echo -e "${BOLD}Options (passed directly to Vite):${RESET}"
  echo -e "  ${CYAN}--host${RESET}           Expose the server to LAN / network"
  echo -e "  ${CYAN}--port <port>${RESET}    Specify a custom port"
  echo -e "  ${CYAN}--open${RESET}           Automatically launch default browser"
  echo ""
  echo -e "${BOLD}Examples:${RESET}"
  echo "  ./launch.sh                 # Start dev server on http://localhost:5173"
  echo "  ./launch.sh dev --host      # Start dev server accessible on local network"
  echo "  ./launch.sh preview         # Build and start production preview server"
  echo "  ./launch.sh --port 3000     # Start dev server on custom port 3000"
  echo ""
}

check_dependencies() {
  if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Node.js is not found in PATH.${RESET}"
    echo -e "Please install Node.js (v18+) to run this project."
    exit 1
  fi

  if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] npm is not found in PATH.${RESET}"
    exit 1
  fi
}

ensure_modules() {
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[!] node_modules not detected. Installing dependencies...${RESET}"
    npm install
    echo -e "${GREEN}[✓] Dependencies installed.${RESET}\n"
  fi
}

MODE="dev"
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    dev|preview|build|install|start)
      MODE="$1"
      shift
      ;;
    -h|--help|help)
      show_banner
      show_help
      exit 0
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

show_banner
check_dependencies

case "$MODE" in
  install)
    echo -e "${BLUE}[INFO] Running npm install...${RESET}"
    npm install
    echo -e "${GREEN}[✓] Installation completed successfully.${RESET}"
    ;;
  build)
    ensure_modules
    echo -e "${BLUE}[INFO] Building project for production...${RESET}"
    npm run build -- "${EXTRA_ARGS[@]}"
    mkdir -p data uploads
    if [ ! -f "data/links.json" ] && [ -f "src/data/links.json" ]; then
      cp "src/data/links.json" "data/links.json"
    fi
    if [ ! -f "data/auth.json" ] && [ -f "src/data/auth.json" ]; then
      cp "src/data/auth.json" "data/auth.json"
    fi
    echo -e "${GREEN}[✓] Build complete! Artifacts located in dist/${RESET}"
    echo -e "${CYAN}To deploy to your NAS:${RESET}"
    echo -e "  Copy ${BOLD}dist/${RESET}, ${BOLD}data/${RESET}, ${BOLD}uploads/${RESET}, and ${BOLD}server.js${RESET} to your NAS."
    echo -e "  Run ${BOLD}node server.js${RESET} (no npm install required on the NAS!)"
    echo -e "  Or run with Docker: ${BOLD}docker compose up -d${RESET}"
    ;;
  start)
    if [ ! -d "dist" ]; then
      echo -e "${YELLOW}[!] dist/ folder not found. Building first...${RESET}"
      ensure_modules
      npm run build
    fi
    mkdir -p data uploads
    echo -e "${BLUE}[INFO] Starting production server (server.js)...${RESET}"
    node server.js
    ;;
  preview)
    ensure_modules
    echo -e "${BLUE}[INFO] Building project for production preview...${RESET}"
    npm run build
    echo -e "${BLUE}[INFO] Launching preview server...${RESET}"
    echo -e "${GREEN}Default Preview URL: ${BOLD}http://localhost:4173/${RESET}"
    echo -e "Press ${BOLD}Ctrl+C${RESET} to terminate the server.\n"
    npm run preview -- "${EXTRA_ARGS[@]}"
    ;;
  dev)
    ensure_modules
    echo -e "${BLUE}[INFO] Launching Vite development server...${RESET}"
    echo -e "${GREEN}Default Dev URL: ${BOLD}http://localhost:5173/${RESET}"
    echo -e "Press ${BOLD}Ctrl+C${RESET} to terminate the server.\n"
    npm run dev -- "${EXTRA_ARGS[@]}"
    ;;
esac
