# Climate Solutions Web App 🌍

This is a full-stack web application that provides information about climate change solution projects. Users can browse project data, filter by sector, and view detailed information for each solution. Authenticated users have full CRUD capabilities to manage the project database.

🔗 **Live Demo:**  
👉 [https://web322-asgn6.vercel.app/](https://web322-asgn6.vercel.app/)

---

## 🛠️ Technologies Used

- **Node.js** with **Express.js**
- **EJS** templating engine
- **PostgreSQL** (via **Sequelize**) for project data
- **MongoDB Atlas** (via **Mongoose**) for user authentication
- **Tailwind CSS** with **DaisyUI**
- **bcrypt.js** for password hashing
- **client-sessions** for session management
- **Vercel** for deployment

---

## 🔐 Key Features

### Public Users:
- View a list of climate solution projects
- Filter projects by sector
- View project details including image, summary, impact, and source
- Navigate through a user-friendly UI with responsive design

### Authenticated Users:
- Register / Login / Logout
- Add new projects
- Edit existing projects
- Delete projects
- View personal login history

---

## 📂 Folder Structure

```
/views           --> EJS templates
/modules         --> Sequelize & Mongoose service files
/data            --> (legacy) projectData.json & sectorData.json
/public          --> Static assets (CSS, images)
server.js        --> Main Express app entry
.env             --> Environment variables
```

---

## 📌 Notes

- Project and sector data were originally sourced from [drawdown.org](https://drawdown.org).
- User authentication and login history are handled securely using MongoDB and bcrypt.js.
- Hosting is done via [Vercel](https://vercel.com).
