# 🏥 DocAppoint

**DocAppoint** is a doctor appointment booking platform that allows patients to browse available doctors and schedule appointments online with ease.

🔗 **Live Site:** [doc-appoint-opal.vercel.app](https://doc-appoint-opal.vercel.app/appointments)
🔗 **Repository:** [docAppoint](https://github.com/SafayatCode/docAppoint.git)

<!-- ![DocAppoint Screenshot](./screenshot.png) -->
> 📸 *Add a screenshot of the homepage here (screenshot.png) once available.*

---

## ✨ Key Features

- 👨‍⚕️ **Browse Doctors** — View a list of available doctors with their specialties
- 📅 **Book Appointments** — Schedule an appointment with a chosen doctor at an available time slot
- 🔐 **User Authentication** — Secure login/register for patients using JWT-based auth
- 📋 **Appointment Management** — View and manage upcoming appointments
- 📱 **Responsive Design** — Works smoothly across mobile, tablet, and desktop

---

## 🛠️ Tech Stack

**Frontend:** React.js
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose)
**Authentication:** JWT (jsonwebtoken) + Cookie-based sessions

---

## 📦 Dependencies

**Backend (`docappoint-server`)**

```json
"cookie-parser": "^1.4.7",
"cors": "^2.8.5",
"dotenv": "^16.0.0",
"express": "^4.18.0",
"jsonwebtoken": "^9.0.0",
"mongoose": "^7.0.0"
```

Dev dependency: `nodemon` (for auto-restarting the server during development)

**Frontend (`docAppoint` client)**

> Update this section with the exact dependencies from your client's `package.json` (likely includes react, react-router-dom, and axios).

---

## 🚀 Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/SafayatCode/docAppoint.git
cd docAppoint
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file with:

```
PORT=5000
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**4. Run the app**

```bash
npm run dev
```

**5. Open in browser**

```
http://localhost:3000
```

---

## 🔗 Links

- 🌐 Live Site: [doc-appoint-opal.vercel.app](https://doc-appoint-opal.vercel.app/appointments)
- 💻 Repository: [docAppoint](https://github.com/SafayatCode/docAppoint.git)
