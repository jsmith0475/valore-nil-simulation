# NIL Simulation Deployment Guide

This guide will help you deploy your NIL Simulation application so others can access it via a URL.

## 🚀 Quick Start: Railway (Recommended)

Railway is the easiest option for getting your app online quickly.

### Prerequisites
- GitHub repository with your code
- OpenAI API key
- Railway account (free at [railway.app](https://railway.app))

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Ensure you have a `.env` file with your OpenAI API key:
   ```bash
   SIM_OPENAI_API_KEY=sk-your-actual-key-here
   ```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your NIL repository
4. Railway will automatically detect your `docker-compose.yml`
5. Add environment variables in Railway dashboard:
   ```
   SIM_OPENAI_API_KEY=your-actual-openai-key
   SIM_OPENAI_MODEL=gpt-4
   NEXT_PUBLIC_API_BASE_URL=https://your-app.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-app.railway.app/ws/agents
   SIM_DATA_MODE=simulation
   NEXT_PUBLIC_DATA_MODE=simulation
   ```
6. Railway will build and deploy both services
7. You'll get a URL like `https://your-app.railway.app`

### Step 3: Test Your Deployment
1. Visit your Railway URL
2. Test the simulation mode
3. Try generating narratives
4. Check the agent stream

---

## 🐳 Alternative: Render

Render is another excellent option for Docker-based applications.

### Step 1: Create render.yaml
Create this file in your project root:

```yaml
services:
  - type: web
    name: nil-simulation-api
    env: docker
    dockerfilePath: ./api/Dockerfile
    dockerContext: .
    envVars:
      - key: SIM_OPENAI_API_KEY
        sync: false
      - key: SIM_OPENAI_MODEL
        value: gpt-4
    healthCheckPath: /docs

  - type: web
    name: nil-simulation-ui
    env: docker
    dockerfilePath: ./ui/Dockerfile
    dockerContext: .
    envVars:
      - key: NEXT_PUBLIC_API_BASE_URL
        fromService:
          type: web
          name: nil-simulation-api
          property: host
      - key: NEXT_PUBLIC_WS_URL
        fromService:
          type: web
          name: nil-simulation-api
          property: host
```

### Step 2: Deploy
1. Go to [render.com](https://render.com)
2. Connect your GitHub repo
3. Render will use the `render.yaml` to deploy both services
4. Add your OpenAI API key in the dashboard

---

## 🚁 Alternative: Fly.io (Best for WebSockets)

Fly.io is excellent for applications with WebSocket support (like your agent stream).

### Step 1: Install Fly CLI
```bash
# macOS
brew install flyctl

# Or download from https://fly.io/docs/hands-on/install-flyctl/
```

### Step 2: Create fly.toml
Create this file in your project root:

```toml
app = "nil-simulation"
primary_region = "ord"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  internal_port = 8000
  protocol = "tcp"
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20
```

### Step 3: Deploy
```bash
cd /path/to/your/Simulation2
fly auth login
fly launch
fly secrets set SIM_OPENAI_API_KEY=your-key-here
fly deploy
```

---

## 🔧 Environment Variables Reference

### Required
- `SIM_OPENAI_API_KEY` - Your OpenAI API key for GPT narratives

### Optional (with defaults)
- `SIM_OPENAI_MODEL` - Model to use (default: gpt-4)
- `SIM_OPENAI_MAX_OUTPUT_TOKENS` - Max tokens (default: 1200)
- `SIM_OPENAI_REASONING_EFFORT` - Reasoning effort (default: minimal)
- `SIM_DATA_MODE` - Backend mode (default: simulation)
- `NEXT_PUBLIC_DATA_MODE` - Frontend mode (default: simulation)
- `SIM_SYNTHETIC_SEED` - Seed for reproducible runs (default: 4242)

### Auto-configured by platform
- `NEXT_PUBLIC_API_BASE_URL` - Backend URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL

---

## 🧪 Testing Your Deployment

### Local Testing
```bash
# Test Docker build
cd Simulation2
docker-compose -f infra/docker-compose.yml build

# Test locally
docker-compose -f infra/docker-compose.yml up
```

### Production Testing
1. **Basic Functionality**
   - Visit your deployed URL
   - Check that the dashboard loads
   - Verify mode toggle works

2. **API Endpoints**
   - Test `/docs` for API documentation
   - Try `/programs?mode=simulation`
   - Test `/narratives/story` with a prompt

3. **WebSocket**
   - Open browser dev tools
   - Check for WebSocket connection
   - Verify agent stream updates

4. **GPT Integration**
   - Generate a narrative
   - Verify it returns content (not "[No narrative returned]")

---

## 🚨 Troubleshooting

### Common Issues

**"No narrative returned"**
- Increase `SIM_OPENAI_MAX_OUTPUT_TOKENS`
- Lower `SIM_OPENAI_REASONING_EFFORT`
- Check your OpenAI API key

**WebSocket not connecting**
- Ensure `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
- Check that your platform supports WebSockets

**Build failures**
- Verify all dependencies are in `pyproject.toml` and `package.json`
- Check Docker build logs for specific errors

**Environment variables not working**
- Ensure variables are set in your platform's dashboard
- Check that variable names match exactly (case-sensitive)

### Getting Help
- Check platform-specific documentation
- Review build logs in your deployment dashboard
- Test locally first with `docker-compose up`

---

## 💰 Cost Estimates

### Railway
- Free tier: 500 hours/month
- Paid: $5-20/month for small apps

### Render
- Free tier: Limited hours
- Paid: $7-25/month for small apps

### Fly.io
- Free tier: 3 shared-cpu VMs
- Paid: $1.94/month per VM

---

## 🎯 Recommendation

**Start with Railway** for the easiest deployment experience, then consider Fly.io if you need better WebSocket performance or more control.

Your NIL simulation is now ready to share with the world! 🎉
