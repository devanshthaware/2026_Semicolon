param(
    [switch]$SkipDockerModels
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Initializing Argus Developer Setup      " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n[1/5] Installing Node dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install dependencies."; exit 1 }

Write-Host "`n[2/5] Generating Prisma Database Client..." -ForegroundColor Yellow
pnpm db:generate
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate Prisma client."; exit 1 }

Write-Host "`n[3/5] Setting up Ollama..." -ForegroundColor Yellow
if (Get-Command "ollama" -ErrorAction SilentlyContinue) {
    Write-Host "Ollama is installed. Pulling the default Qwen model (qwen2.5:0.5b)..."
    ollama pull qwen2.5:0.5b
} else {
    Write-Host "WARNING: Ollama is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Ollama from https://ollama.com to use local LLM verification." -ForegroundColor Red
}

Write-Host "`n[4/5] Pulling Docker Base Images..." -ForegroundColor Yellow
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    docker compose pull
    
    if (-not $SkipDockerModels) {
        Write-Host "`n[5/5] Caching Hugging Face Models into Docker Volumes..." -ForegroundColor Yellow
        Write-Host "This will download the DeBERTa and BGE models securely into your docker cache." -ForegroundColor DarkGray
        Write-Host "This might take a few minutes depending on your internet connection." -ForegroundColor DarkGray
        
        Write-Host "-> Downloading BGE Embedding Model..." -ForegroundColor Blue
        docker compose run --rm retrieval-service python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-large-en-v1.5')"
        
        Write-Host "-> Downloading DeBERTa NLI Model..." -ForegroundColor Blue
        docker compose run --rm model-service python -c "from transformers import pipeline; pipeline('text-classification', model='MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli')"
    } else {
        Write-Host "`n[5/5] Skipping Hugging Face model downloads (--SkipDockerModels flag used)." -ForegroundColor DarkGray
    }
} else {
    Write-Host "WARNING: Docker is not installed or not running." -ForegroundColor Red
    Write-Host "Please install Docker Desktop to run the backend Python services." -ForegroundColor Red
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  Setup Complete!                         " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "To start the full platform, run:" -ForegroundColor White
Write-Host "  1. docker compose up -d" -ForegroundColor Cyan
Write-Host "  2. pnpm dev:platform" -ForegroundColor Cyan
