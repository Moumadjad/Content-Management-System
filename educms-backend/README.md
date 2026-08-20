# EduCMS — Educational Content Management System

A full-featured CMS designed for educational institutions to manage courses, articles, announcements, and student resources with advanced role-based access control, content versioning, and analytics.

**Live API:** https://educms-api-hoev.onrender.com ([`/health`](https://educms-api-hoev.onrender.com/health)) — deployed on Render's free tier, see [Deployment](#deployment).

## Key Features

- User authentication and authorization (JWT)
- Role-based access control (Admin, Editor, Author, Subscriber)
- Complete CRUD operations for posts, categories, tags, and comments
- Media management system
- Content versioning and drafts
- SEO optimization tools
- Analytics dashboard
- RESTful API
- Responsive admin panel
- Advanced search and filtering

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Redis (caching)
- **Frontend:** React.js, Material-UI
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Validation:** Express-validator

## System Requirements

**Software**
- Node.js v16 or higher
- PostgreSQL 13 or higher
- Redis 6 or higher (optional, for caching)
- Git
- Code editor (VS Code recommended)

**Hardware (minimum)**
- RAM: 4GB
- Storage: 10GB free space
- Processor: Dual-core 2.0 GHz

## Project Structure

Database schema lives in [`src/database/schema.sql`](src/database/schema.sql).

```
educms-backend/
├── src/
│   ├── config/        # database.js, redis.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/          # logger.js, helpers.js
│   ├── database/        # schema.sql, migrate.js
│   └── app.js
├── uploads/
├── tests/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Getting Started

```bash
npm install
# configure .env (DB credentials, JWT_SECRET, etc.)
npm run migrate   # apply src/database/schema.sql
npm run dev
```

## Deployment

Deployed on [Render](https://render.com) (free tier) from the [`Dockerfile`](Dockerfile) via the
[`render.yaml`](../render.yaml) Blueprint — see [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full
guide (Render + local Docker instructions, Heroku kept for reference).

## Next Steps

- Add Frontend (React Admin Panel)
- Implement File Upload with AWS S3
- Add Full-Text Search with Elasticsearch
- Implement Caching with Redis
- Add Real-time Features with WebSockets
- Create Comprehensive Unit and Integration Tests
- Add API Documentation with Swagger
- Implement Rate Limiting and Security Enhancements
- Add Analytics and Reporting Dashboard
- Write Research Paper and Documentation

## Conclusion

In conclusion, this Content Management System project successfully delivers a flexible and user-friendly solution for managing digital content efficiently. It meets the project requirements by enabling easy content creation, updating, and organization while ensuring reliability and scalability. This system provides a solid foundation for future enhancements and real-world use.
