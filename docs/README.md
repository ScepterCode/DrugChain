# DrugChain Technical Documentation

This folder contains comprehensive technical documentation for the DrugChain blockchain-based drug verification platform.

## Documentation Structure

### 📋 [task.md](./task.md)
Project task checklist tracking progress on documentation and MVP specification phases.

### 🏗️ [01-system-architecture.md](./01-system-architecture.md)
**Complete system architecture documentation** covering:
- High-level microservices architecture with Mermaid diagrams
- Component specifications (API Gateway, Verification Service, ID Generation, etc.)
- Hyperledger Fabric blockchain architecture
- Database designs (PostgreSQL, MongoDB, Redis)
- Deployment architecture on AWS/Kubernetes
- Data flow diagrams
- Scalability and monitoring strategies

### 🔌 [02-api-specification.md](./02-api-specification.md)
**RESTful API documentation** including:
- Authentication endpoints (register, login, JWT refresh)
- Product and ID management APIs
- Verification endpoints (QR scan, SMS)
- Supply chain tracking APIs
- Analytics and reporting endpoints
- Error codes and rate limiting policies
- Code examples in JavaScript and Python

### 💾 [03-database-schema.md](./03-database-schema.md)
**Database schema documentation** for:
- PostgreSQL schemas (users, organizations, products, batches, packs)
- MongoDB collections (verification logs, supply chain events, analytics)
- Redis caching strategies
- Indexes and performance optimizations
- Data relationships and ER diagrams

### 🔒 [04-security-design.md](./04-security-design.md)
**Security architecture** covering:
- Authentication mechanisms (JWT, 2FA, OAuth 2.0)
- Authorization with RBAC (Role-Based Access Control)
- Encryption standards (AES-256, TLS 1.3)
- API security (rate limiting, input validation, XSS/SQL injection prevention)
- Blockchain security (Hyperledger Fabric MSP, chaincode access control)
- Data privacy compliance (NDPR/GDPR)
- Threat modeling and incident response
- NAFDAC regulatory alignment

### 🚀 [05-mvp-specification.md](./05-mvp-specification.md)
**MVP development plan** including:
- Feature scope (in-scope vs. out-of-scope)
- User stories for manufacturers, consumers, and regulators
- Technical stack finalization (FastAPI, React, Hyperledger Fabric)
- 12-week development timeline with milestones
- Testing strategy (unit, integration, load testing)
- AWS deployment plan
- Budget breakdown ($250,000 seed funding)
- Success metrics and KPIs
- Risk analysis and mitigation
- Post-MVP roadmap (Phases 2-4)

---

## Quick Start Guide

### For Development Teams
1. Review **01-system-architecture.md** for overall system design
2. Study **02-api-specification.md** for API contracts
3. Reference **03-database-schema.md** for data models
4. Implement security per **04-security-design.md**
5. Follow **05-mvp-specification.md** for MVP development timeline

### For Stakeholders
1. Start with **05-mvp-specification.md** for project scope and timeline
2. Review **01-system-architecture.md** (Executive Overview section) for high-level design
3. Check **04-security-design.md** for compliance and data protection

### For Investors/Funders
- **MVP Specification**: Budget, timeline, success metrics
- **System Architecture**: Technical feasibility and scalability
- **Security Design**: NAFDAC compliance and data protection

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | FastAPI (Python) | High-performance REST API |
| **Frontend** | React + Tailwind CSS | Manufacturer/Regulator dashboards |
| **Mobile** | React Native | Consumer verification app |
| **Blockchain** | Hyperledger Fabric 2.5 | Immutable provenance tracking |
| **Database** | PostgreSQL 15 | Relational data (users, products) |
| **Document DB** | MongoDB 6.0 | Verification logs, analytics |
| **Cache** | Redis 7.0 | Fast verification caching |
| **Cloud** | AWS | Infrastructure hosting |
| **SMS** | Africa's Talking | Feature phone verification |

---

## Key Features

✅ **Three-Level ID Generation**: Batch → Carton → Pack unique IDs  
✅ **One-Time Verification Lock**: Prevents packaging reuse  
✅ **Blockchain Anchoring**: Immutable transaction history  
✅ **Multi-Channel Verification**: QR code, SMS, mobile app  
✅ **Real-Time Analytics**: Manufacturer dashboards  
✅ **Regulator Oversight**: NAFDAC nationwide visibility  
✅ **Offline Support**: Low-connectivity environments  
✅ **Counterfeit Detection**: Anomaly alerts  

---

## Project Timeline

- **Weeks 1-2**: Foundation & authentication
- **Weeks 3-4**: ID generation system
- **Weeks 5-6**: Verification system (QR + SMS)
- **Weeks 7-8**: Analytics dashboards
- **Weeks 9-10**: Testing & bug fixes
- **Week 11**: Production deployment
- **Week 12**: Pilot launch with manufacturers

---

## Contact & Support

For questions or clarifications on this documentation:
- **Technical Queries**: Refer to specific documentation files
- **Project Management**: See task.md for progress tracking
- **MVP Questions**: Review 05-mvp-specification.md

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Status**: Ready for Development Team Onboarding
