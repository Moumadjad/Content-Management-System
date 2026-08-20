# EduCMS — Educational Content Management System

A CMS for educational institutions to manage courses, articles, announcements, and student
resources, with role-based access control (Admin, Editor, Author, Subscriber), JWT auth, and a
REST API. Master's degree project.

**Live API:** https://educms-api-hoev.onrender.com

## Structure

- [`educms-backend/`](educms-backend/) — Node.js/Express REST API (PostgreSQL, Redis, JWT). See
  [`educms-backend/README.md`](educms-backend/README.md) for details.
- `educms-frontend/` — React admin panel (planned, not started yet).

## Deployment

The backend is deployed on [Render](https://render.com) (free tier) from a Docker image via the
[`render.yaml`](render.yaml) Blueprint. See
[`educms-backend/DEPLOYMENT.md`](educms-backend/DEPLOYMENT.md) for the full guide.

## License

MIT
