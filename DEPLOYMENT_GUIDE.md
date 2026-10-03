# Deploy Guide (Beginner Friendly)

You need 3 free accounts: **GitHub**, **MongoDB Atlas**, **Vercel**. Nothing needs to be installed on your computer.

You will create **two** Vercel projects from the same GitHub repo:
- **Backend** (folder `server`) -> the API
- **Frontend** (folder `client`) -> the website

---

## Step 1 - Upload the updated code to GitHub
1. Open your repo: https://github.com/AliHamza917/Portfolio-WebSite-MERN
2. Unzip the fixed project on your computer.
3. On GitHub click **Add file -> Upload files**, drag in the contents of the unzipped folder (`client`, `server`, `README.md`, `DEPLOYMENT_GUIDE.md`, `.gitignore`), then click **Commit changes**.
   (If your repo already has these folders, uploading replaces the changed files.)

## Step 2 - MongoDB Atlas (database)
1. Go to https://cloud.mongodb.com and open your project/cluster.
2. **Database Access** -> Add New Database User -> choose a username and password -> save them. Use only letters and numbers in the password (symbols like `@` or `#` break the link).
3. **Network Access** -> Add IP Address -> **Allow access from anywhere** (`0.0.0.0/0`) -> Confirm. (Vercel has no fixed IP, so this is required.)
4. **Database -> Connect -> Drivers** -> copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Edit it: replace `USER` and `PASSWORD`, and add `/portfolio` before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority`
   Keep this safe. This is your **MONGO_URI**.

## Step 3 - Deploy the Backend on Vercel
1. Go to https://vercel.com -> **Add New -> Project** -> import `Portfolio-WebSite-MERN`.
2. Project name: `portfolio-api` (any name).
3. **Root Directory** -> click Edit -> choose `server`.
4. Framework Preset: **Other**.
5. Open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `MONGO_URI` | your string from Step 2 |
   | `JWT_SECRET` | any long random text (e.g. 40 random letters/numbers) |
   | `CLIENT_URL` | leave empty for now (filled in Step 5) |
6. Click **Deploy**.
7. Open the URL Vercel gives you (e.g. `https://portfolio-api.vercel.app`). You should see:
   `{"message":"Portfolio API is running successfully"}`
   Then open `/api/projects` on the same URL - you should see `[]` (empty list, not an error).

## Step 4 - Deploy the Frontend on Vercel
1. Vercel -> **Add New -> Project** -> import the same repo again.
2. **Root Directory** -> `client`.
3. Framework Preset: **Create React App** (auto-detected).
4. Environment Variables:
   | Name | Value |
   |---|---|
   | `REACT_APP_API_URL` | your backend URL from Step 3, no slash at the end |
5. Click **Deploy**. Note the frontend URL (e.g. `https://portfolio-web-site-mern.vercel.app`).

## Step 5 - Allow the frontend to talk to the backend
1. Vercel -> backend project -> **Settings -> Environment Variables**.
2. Set `CLIENT_URL` = your frontend URL (no slash at the end).
3. **Deployments** tab -> latest deployment -> **...** -> **Redeploy**.

## Step 6 - Create your admin account (no coding)
Easiest way: the first-time register endpoint (works only once, then it locks itself).
1. Go to https://hoppscotch.io (free, in the browser).
2. Method **POST**, URL: `https://YOUR-BACKEND.vercel.app/api/auth/register`
3. Body -> JSON:
   ```json
   { "name": "Ali Hamza", "email": "you@example.com", "password": "YourStrongPassword" }
   ```
4. Click Send. You should get status 201.
5. Open `https://YOUR-FRONTEND.vercel.app/admin/login` and log in.

Add your projects and skills from the admin panel (**Projects**, **Skills**, **Profile**).

### Optional: load your sample projects and skills automatically
Use **GitHub Codespaces** (runs in the browser):
1. On your repo click **Code -> Codespaces -> Create codespace**.
2. In the terminal:
   ```
   cd server
   npm install
   cp utills/.env.example utills/.env
   ```
3. Open `server/utills/.env`, fill `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Run `npm run seed`. (It replaces all projects/skills with the sample ones.)
5. Delete the codespace afterwards.

## Troubleshooting
| Problem | Fix |
|---|---|
| Site loads but no data | `REACT_APP_API_URL` missing/wrong. Fix it and **redeploy** the frontend (changes apply only after redeploy). |
| "CORS blocked" in browser console | `CLIENT_URL` in backend must exactly match the frontend URL. Redeploy backend. |
| `Database connection failed` | Check `MONGO_URI`, password characters, and Network Access `0.0.0.0/0`. |
| `/admin/login` shows 404 on refresh | Frontend Root Directory must be `client` (it contains `vercel.json`). |
| Login says invalid email or password | You must complete Step 6 first. |
| Register says "Registration is closed" | An admin already exists. Use Login. |

## Running locally later (optional)
- Backend: `cd server && npm install`, copy `utills/.env.example` to `utills/.env`, then `npm run dev`.
- Frontend: `cd client && npm install && npm start` (leave `REACT_APP_API_URL` empty locally).
