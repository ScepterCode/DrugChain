# DrugChain Platform

Blockchain-based drug verification system to combat counterfeit medicines in Nigeria.

## Project Structure

```
DrugChain/
├── backend/           # FastAPI backend service
├── frontend/          # React web dashboard
├── mobile/            # React Native consumer app
├── blockchain/        # Hyperledger Fabric network
├── docs/              # Technical documentation
└── scripts/           # Utility scripts
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- MongoDB 6.0
- Redis 7.0

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Mobile App Setup
```bash
cd mobile
npm install
npx react-native run-android
```

### Blockchain Setup
```bash
cd blockchain
./network.sh up createChannel
./network.sh deployCC -ccn drugchain
```

## Documentation

- [Technical Documentation](./docs/README.md) - Comprehensive system documentation
- [Hosting Guide](./HOSTING_GUIDE.md) - Deploy to Vercel (frontend) and Render (backend)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment verification

## MVP Timeline

- **Week 1-2**: Foundation & Authentication
- **Week 3-4**: ID Generation System
- **Week 5-6**: Verification System
- **Week 7-8**: Analytics & Dashboards
- **Week 9-10**: Testing & Bug Fixes
- **Week 11**: Production Deployment
- **Week 12**: Pilot Launch

## License

Proprietary - DrugChain Platform © 2026
