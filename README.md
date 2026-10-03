# 🚀 Portfolio Website - MERN Stack

A full-stack dynamic personal portfolio website built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).  
Includes a public portfolio frontend and a protected **Admin Panel** for managing projects, skills, personal info, and contact messages.

**Live Demo:** Coming soon  
**GitHub:** https://github.com/AliHamza917/Portfolio-WebSite-MERN

---

## ✨ Features

- **Public Portfolio**
  - Hero / Home section
  - About Me
  - Skills
  - Projects (dynamic from MongoDB)
  - Contact form (saves messages to DB)
  - Social links
  - Fully responsive (Tailwind CSS + DaisyUI)

- **Admin Panel** (JWT Protected)
  - Login / Logout
  - Dashboard
  - CRUD Projects (title, description, tech stack, live link, GitHub link, image)
  - Manage Skills
  - View / Delete Contact Messages
  - Update Personal Info

- **Authentication**
  - JWT-based admin authentication
  - Protected routes

---

## 🏗️ Project Structure

```
Portfolio-WebSite-MERN/
│
├── client/                          # React Frontend (Create React App)
│   ├── public/
│   ├── src/
│   │   ├── global/
│   │   │   ├── components/          # Navbar, Footer, ProjectCard, SkillCard, etc.
│   │   │   └── layouts/             # MainLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── home/                # Home, About, Skills, Projects, Contact sections
│   │   │   ├── auth/                # Admin Login
│   │   │   └── admin/               # Admin Dashboard, Projects, Skills, Messages, Profile
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                          # Node.js + Express Backend
│   ├── controllers/
│   │   ├── auth-controller.js
│   │   ├── project-controller.js
│   │   ├── skill-controller.js
│   │   ├── contact-controller.js
│   │   └── profile-controller.js
│   ├── middleware/
│   │   ├── auth-middleware.js       # JWT verification
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── user-model.js            # Admin user
│   │   ├── project-model.js
│   │   ├── skill-model.js
│   │   ├── contact-model.js
│   │   └── profile-model.js         # Name, about, social links, photo
│   ├── router/
│   │   ├── auth-router.js
│   │   ├── project-router.js
│   │   ├── skill-router.js
│   │   ├── contact-router.js
│   │   └── profile-router.js
│   ├── utills/
│   │   ├── db.js                    # MongoDB connection
│   │   └── .env                     # Environment variables (not committed)
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router DOM, Axios, Tailwind CSS, DaisyUI, React Toastify |
| Backend    | Node.js, Express.js, Mongoose, JWT, bcryptjs, cors, dotenv |
| Database   | MongoDB (Atlas or Local)            |
| Auth       | JSON Web Tokens (JWT)               |

---

## ⚙️ How to Connect to MongoDB

### Option 1: MongoDB Atlas (Recommended - Cloud)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new **Cluster** (Free tier M0 is enough).
3. Click **Connect** → **Drivers** → copy the connection string.
4. It looks like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials.
6. Add your IP address (or `0.0.0.0/0` for development) in Network Access.
7. Create a database user under **Database Access**.

### Option 2: Local MongoDB

1. Install MongoDB Community Edition on your machine.
2. Start the MongoDB service.
3. Connection string will be:
   ```
   mongodb://127.0.0.1:27017/portfolio
   ```

### Setting the Connection String

1. Go to `server/utills/` folder.
2. Create a file named `.env` (copy from example if available).
3. Add the following:

```env
PORT=8000
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_this
```

> **Important:** Never commit the `.env` file. It is already in `.gitignore`.

The connection is handled in `server/utills/db.js`:

```js
const mongoose = require("mongoose");

const DBconnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = DBconnection;
```

---

> 📘 To put the site online, follow **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**.

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/AliHamza917/Portfolio-WebSite-MERN.git
cd Portfolio-WebSite-MERN
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/utills/.env` with your MongoDB URI and JWT secret (see above).

Start the server:

```bash
npm start
# Server runs on http://localhost:8000
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd client
npm install
npm start
# Client runs on http://localhost:3000
```

### 4. Seed Database (Recommended)

After configuring `.env` and installing dependencies, run the seed script to add your projects, skills, profile and a default admin:

```bash
cd server
npm run seed
```

This will create:
- Your real projects from GitHub
- Skills list
- Profile with your photo & bio
- Default admin account:
  - **Email:** `admin@portfolio.com`
  - **Password:** `admin123`  ← Change this after first login!

### 5. Create Admin User (Alternative)

You can also register manually via API:

```bash
POST http://localhost:8000/api/auth/register
{
  "name": "Ali Hamza",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

---

## 📡 API Endpoints (Overview)

| Method | Endpoint                  | Description                  | Auth Required |
|--------|---------------------------|------------------------------|---------------|
| POST   | `/api/auth/login`         | Admin login                  | No            |
| POST   | `/api/auth/register`      | Register admin (first time)  | No            |
| GET    | `/api/projects`           | Get all projects             | No            |
| POST   | `/api/projects`           | Create project               | Yes           |
| PUT    | `/api/projects/:id`       | Update project               | Yes           |
| DELETE | `/api/projects/:id`       | Delete project               | Yes           |
| GET    | `/api/skills`             | Get all skills               | No            |
| POST   | `/api/contact`            | Submit contact form          | No            |
| GET    | `/api/contact`            | Get all messages             | Yes           |
| GET    | `/api/profile`            | Get profile info             | No            |
| PUT    | `/api/profile`            | Update profile               | Yes           |

---

## 📝 Environment Variables

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose_a_strong_password
```

---

## 👨‍💻 Author

**Ali Hamza**  
Developer And IT Support Officer  

- GitHub: [AliHamza917](https://github.com/AliHamza917)
- Portfolio: Coming soon

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
