#!/bin/bash

# MongoDB Demo API Test Runner Script
# This script provides easy commands to run API tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_PORT=3001
API_URL="http://localhost:$API_PORT"

# Function to check if API is running
check_api() {
    echo -e "${BLUE}🔍 Checking if API is running on port $API_PORT...${NC}"
    
    if curl -s "$API_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is running${NC}"
        return 0
    else
        echo -e "${RED}❌ API is not running${NC}"
        return 1
    fi
}

# Function to start API server
start_api() {
    echo -e "${BLUE}🚀 Starting API server...${NC}"
    cd ..
    npm run api &
    API_PID=$!
    echo "API_PID=$API_PID" > http-tests/.api_pid
    
    # Wait for API to start
    echo -e "${YELLOW}⏳ Waiting for API to start...${NC}"
    sleep 5
    
    if check_api; then
        echo -e "${GREEN}✅ API started successfully${NC}"
        cd http-tests
        return 0
    else
        echo -e "${RED}❌ Failed to start API${NC}"
        cd http-tests
        return 1
    fi
}

# Function to stop API server
stop_api() {
    if [ -f .api_pid ]; then
        API_PID=$(cat .api_pid | grep API_PID | cut -d'=' -f2)
        if [ ! -z "$API_PID" ]; then
            echo -e "${BLUE}🛑 Stopping API server (PID: $API_PID)...${NC}"
            kill $API_PID 2>/dev/null || true
            rm .api_pid
            echo -e "${GREEN}✅ API server stopped${NC}"
        fi
    fi
}

# Function to run all tests
run_tests() {
    echo -e "${BLUE}🧪 Running all API tests...${NC}"
    node test-runner.js
}

# Function to run specific test category
run_category_tests() {
    local category=$1
    echo -e "${BLUE}🧪 Running $category tests...${NC}"
    
    case $category in
        "health")
            echo "Testing health and basic endpoints..."
            curl -s "$API_URL/health" | jq . || echo "Health check failed"
            curl -s "$API_URL/api/queries" | jq '.data | length' || echo "Queries endpoint failed"
            ;;
        "basic")
            echo "Testing basic predefined queries..."
            curl -s -X POST "$API_URL/api/data/execute/basic-find-companies" \
                -H "Content-Type: application/json" \
                -d '{"parameters":{"industry":"Technology","limit":3}}' | jq '.data | length' || echo "Basic companies query failed"
            ;;
        "custom")
            echo "Testing custom queries..."
            curl -s -X POST "$API_URL/api/data/execute-custom" \
                -H "Content-Type: application/json" \
                -d '{"collection":"users","operation":"countDocuments","query":{}}' | jq '.data' || echo "Custom query failed"
            ;;
        *)
            echo -e "${RED}❌ Unknown category: $category${NC}"
            echo "Available categories: health, basic, custom"
            return 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo -e "${BLUE}MongoDB Demo API Test Runner${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check       Check if API is running"
    echo "  start       Start the API server"
    echo "  stop        Stop the API server"
    echo "  test        Run all tests"
    echo "  test-cat    Run tests for specific category (health|basic|custom)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 start"
    echo "  $0 test"
    echo "  $0 test-cat health"
    echo "  $0 stop"
    echo ""
    echo "Files:"
    echo "  *.http files can be used with REST Client extension in VS Code"
    echo "  test-runner.js runs all tests programmatically"
    echo "  MongoDB-Demo-API.postman_collection.json for Postman"
}

# Main script logic
case "${1:-help}" in
    "check")
        check_api
        ;;
    "start")
        start_api
        ;;
    "stop")
        stop_api
        ;;
    "test")
        if check_api; then
            run_tests
        else
            echo -e "${YELLOW}⚠️  API is not running. Starting it first...${NC}"
            if start_api; then
                run_tests
                stop_api
            else
                echo -e "${RED}❌ Failed to start API. Cannot run tests.${NC}"
                exit 1
            fi
        fi
        ;;
    "test-cat")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please specify a test category${NC}"
            show_help
            exit 1
        fi
        if check_api; then
            run_category_tests "$2"
        else
            echo -e "${RED}❌ API is not running. Please start it first with: $0 start${NC}"
            exit 1
        fi
        ;;
    "help"|*)
        show_help
        ;;
esac
