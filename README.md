# BetterForm — Production-Ready MVP

> The Minimalist Hiring Workflow for Modern Teams.
> **Create better job applications.**

BetterForm allows recruiters and hiring teams to create professional job postings, customize application screening forms with dynamic question types, publish public application links, collect resumes (PDF/DOC/DOCX), and review candidate applications from an intuitive B2B SaaS dashboard.

Candidates require **no account** and can apply directly via a shared link.

---

## 1. Product Overview & Workflow

```text
Recruiter Registers / Logs in
          ↓
Create Job Posting (Draft or Published)
          ↓
Build Application Form (Default fields + Custom questions)
          ↓
Publish Job & Copy Public Application URL
          ↓
Candidate Applies (Reads Job, Uploads CV, Answers Custom Questions)
          ↓
Recruiter Reviews Candidate (Inspects CV & Answers, Shortlists or Rejects)
```

---

## 2. Tech Stack

### Frontend
- **React 18** (Vite)
- **JavaScript (ES6+)**
- **React Router v6**
- **Tailwind CSS**
- **Typography**: Space Grotesk & Outfit
- **Axios**
- **Lucide React** (Minimalist Icons)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (with seamless zero-config In-Memory Store fallback)
- **JWT** (`jsonwebtoken`) & **bcryptjs**
- **Multer** (CV upload handling with format and 5MB size validation)
- **Helmet**, **CORS**, and **express-rate-limit** (Production Security)

---

## 3. Project Structure

```text
betterform/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── JobCreatePage.jsx
│   │   │   ├── JobDetailsPage.jsx
│   │   │   ├── JobEditPage.jsx
│   │   │   ├── FormBuilderPage.jsx
│   │   │   ├── JobApplicationsPage.jsx
│   │   │   ├── ApplicationDetailsPage.jsx
│   │   │   └── PublicJobApplyPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── memoryStore.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── jobController.js
│   │   │   ├── questionController.js
│   │   │   ├── applicationController.js
│   │   │   └── publicController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   ├── Question.js
│   │   │   └── Application.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── questionRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   └── publicRoutes.js
│   │   ├── services/
│   │   │   └── uploadService.js
│   │   ├── utils/
│   │   │   ├── slug.js
│   │   │   └── seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 4. Environment Variables

Create `.env` in the root directory (or copy `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/betterform
JWT_SECRET=super_secret_betterform_jwt_dev_key_2026
CLIENT_URL=http://localhost:5180
UPLOAD_DIR=uploads
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Installation & Getting Started

### 1. Install Dependencies

You can install all dependencies across the monorepo from the root:

```bash
npm run install:all
```

Or individually:

```bash
# In root
npm install

# In server
cd server && npm install

# In client
cd ../client && npm install
```

### 2. Database Setup

Ensure MongoDB is running locally:
```bash
mongod
```
Or set `MONGODB_URI` in `.env` to a MongoDB Atlas cluster URI. *(If MongoDB is not installed locally, BetterForm automatically activates an in-memory database store for immediate zero-config operation).*

### 3. Seed Demo Data

Run the seed script to populate demo recruiter credentials, sample job postings, questions, and test applications:

```bash
npm run seed
```

#### Demo Recruiter Credentials:
- **Email:** `demo@betterform.local`
- **Password:** `Demo123456`
- **Company:** `Yonile Digital`
- **Job:** `Senior Full-Stack Developer`
- *(These credentials are development-only)*

### 4. Run the Full Application

From the root directory:

```bash
npm run dev
```

This concurrently starts:
- **Backend API Server:** `http://localhost:5000`
- **Frontend Vite Client:** `http://localhost:5180`

---

## 6. Key Features & Highlights

1. **Recruiter Authentication**: Secure registration, login, and token-based profile validation with bcrypt and JWT.
2. **Left Sidebar & Dashboard**: Permanent vertical sidebar navigation, company workspace badge, 4 KPI cards (Total Postings, Total Applicants, Shortlist Rate, Portal Status), real-time status toggling, and copyable public application links.
3. **Application Form Builder**:
   - Automatically bundles the 4 standard application questions: **Full Name**, **Email**, **Phone**, and **CV**.
   - Supports 10 question types: `text`, `textarea`, `email`, `phone`, `number`, `url`, `select`, `radio`, `checkbox`, `file`.
   - Reorder questions using simple **Move Up** and **Move Down** controls.
   - Built-in **Live Preview** toggle so recruiters can test how candidates experience their form.
4. **Public Candidate Application (`/apply/:slug`)**:
   - No login required for candidates.
   - Fully responsive, clean B2B layout.
   - Enforces CV upload validation (PDF, DOC, DOCX up to 5MB).
   - Dynamic form validation for required questions and specific inputs (URLs, emails, numbers).
   - Immediate confirmation screen upon submission.
5. **Candidate Review & Pipeline**:
   - Filter applicants by status: `All`, `Applied`, `Shortlisted`, `Rejected`.
   - Live search by candidate name or email.
   - Detailed applicant view with complete question-by-question responses, CV preview/download link, and single-click status updates.

---

## 7. REST API Overview

### Authentication
- `POST /api/auth/register` — Register recruiter account
- `POST /api/auth/login` — Login recruiter & receive JWT
- `GET /api/auth/me` — Get current logged-in recruiter profile

### Jobs (Protected)
- `GET /api/jobs` — Get recruiter's jobs with application counts
- `GET /api/jobs/stats/summary` — Recruiter dashboard metric summary
- `POST /api/jobs` — Create new job (generates unique slug)
- `POST /api/jobs/seed-demo` — 1-click sample role loader for testing
- `GET /api/jobs/:id` — Get single job details
- `PUT /api/jobs/:id` — Update job posting
- `DELETE /api/jobs/:id` — Delete job and cascade delete its questions & applications
- `PATCH /api/jobs/:id/publish` — Toggle published/draft status

### Questions & Form Builder (Protected)
- `GET /api/jobs/:jobId/questions` — List questions for a job (sorted by order)
- `POST /api/jobs/:jobId/questions` — Add a custom question
- `PUT /api/questions/:id` — Update question label, type, options, or required flag
- `DELETE /api/questions/:id` — Remove question and re-index remaining orders
- `PATCH /api/questions/:id/order` — Move question order (`up` or `down`)

### Public Endpoints (No Auth Required)
- `GET /api/public/jobs/:slug` — View public job and questions
- `POST /api/public/jobs/:slug/applications` — Submit application with CV attachment

### Applications (Protected)
- `GET /api/jobs/:jobId/applications` — Get candidate applications (supports `?status=` and `?search=`)
- `GET /api/applications/:id` — View full candidate application details & answers
- `PATCH /api/applications/:id/status` — Update status (`applied`, `shortlisted`, `rejected`)

---

## 8. Security & Production Standards

- **Ownership Authorization**: Backend strictly enforces recruiter ownership before returning or modifying any job, question, or application.
- **Helmet**: Secures HTTP response headers with cross-origin resource policy for uploaded files.
- **Rate Limiting**: Public application submissions are rate-limited via `express-rate-limit` to prevent abuse.
- **File Validation**: CV uploads are filtered by extension and mime-type, with an enforced 5MB size limit.
- **Input Sanitization & Centralized Error Handler**: Handles 400, 401, 403, 404, 409, and 500 error responses consistently.
