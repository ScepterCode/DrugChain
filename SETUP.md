# DrugChain Development Setup Guide

## Prerequisites Installation

### 1. Python 3.11+
```bash
# Windows (using Chocolatey)
choco install python --version=3.11

# Or download from python.org
```

### 2. Node.js 18+
```bash
# Windows (using Chocolatey)
choco install nodejs --version=18

# Or download from nodejs.org
```

### 3. Docker Desktop
Download and install from: https://www.docker.com/products/docker-desktop

## Quick Start (Using Docker)

### 1. Clone Repository
```bash
cd C:\Users\DELL\Desktop\DrugChain
```

### 2. Create Environment File
```bash
cd backend
copy .env.example .env
# Edit .env and update with your configuration
```

### 3. Start All Services
```bash
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Backend API (port 8000)
- Frontend (port 3000)

### 4. Access Applications
- **API Documentation**: http://localhost:8000/api/docs
- **Frontend Dashboard**: http://localhost:3000
- **API Health Check**: http://localhost:8000/health

## Manual Setup (Without Docker)

### Backend Setup

1. **Create Virtual Environment**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup Environment**
```bash
copy .env.example .env
# Edit .env with your database credentials
```

4. **Install PostgreSQL**
```bash
# Download from postgresql.org
# Create database: drugchain_db
```

5. **Install MongoDB**
```bash
# Download from mongodb.com
# Start MongoDB service
```

6. **Install Redis**
```bash
# Download from redis.io or use WSL
```

7. **Run Database Migrations**
```bash
# Coming soon - Alembic migrations
```

8. **Start Backend**
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

## Project Structure Verification

Run this to verify all files are created:
```bash
tree /F
```

## Testing the Setup

### 1. Test Backend
```bash
# Health check
curl http://localhost:8000/health

# API docs
# Open browser: http://localhost:8000/api/docs
```

### 2. Test Database Connections
```bash
# PostgreSQL
psql -U drugchain_user -d drugchain_db

# MongoDB
mongosh

# Redis
redis-cli ping
```

## Next Steps

1. ✅ Project structure created
2. ⏭️ Implement database models (Week 1)
3. ⏭️ Implement authentication (Week 1-2)
4. ⏭️ Implement ID generation (Week 3-4)
5. ⏭️ Implement verification system (Week 5-6)

## Troubleshooting

### Port Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Docker Issues
```bash
# Reset Docker
docker-compose down -v
docker-compose up --build
```

### Database Connection Error
- Check .env file has correct credentials
- Ensure PostgreSQL/MongoDB services are running
- Verify firewall settings

## Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Update code
- Write tests
- Update documentation

3. **Test Locally**
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat: your feature description"
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Project Technical Docs](./docs/README.md)
