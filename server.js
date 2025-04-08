/********************************************************************************
 * WEB322 – Assignment 06
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: ___Tzuyi Lin___ Student ID: __127201234__ Date: __2025/4/7__
 *
 ********************************************************************************/

const express = require("express"); // Import express framework
const clientSessions = require('client-sessions'); // Middleware for session management
const projectData = require("./modules/projects"); 
const authData = require('./modules/auth-service'); 
const path = require("path"); 

const app = express();
const port = 3000;

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static('public'));

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Middleware for session management
app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'fkeRw9gkmadDejs5Dggkl', // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended auto when user is active (1 minute)
  })
);

// Middleware to set session data
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware to check if user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}


// Initialize the projects array before starting the server
async function initializeServer() {
  try {
    await projectData.initialize(); // Initialize the project data(PostgreSQL)
    await authData.initialize(); // Initialize the authentication data(MongoDB)

    app.get("/", (req, res) => {
      res.render("home", { page: "/" });
    });

    app.get("/about", (req, res) => {
      res.render("about", { page: "/about" });
    });

    app.get("/solutions/projects", async (req, res) => {
      try {
        const { sector } = req.query;
        let projects;

        if (sector) {
          projects = await projectData.getProjectsBySector(sector);
        } else {
          projects = await projectData.getAllProjects();
        }

        res.render("projects", {
          projects: projects,
          page: "/solutions/projects",
        });
      } catch (err) {
        res.status(500).render("404", { message: "Failed to retrieve projects" });
      }
    });

    app.get("/solutions/projects/:id", async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        const project = await projectData.getProjectById(projectId);

        if (!project) {
          return res.status(404).render("404", { message: `Project ID ${projectId} not found.` });
        }

        res.render("project", {
          project: project,
          page: "",
        });
      } catch (err) {
        res.status(500).render("404", { message: "Unable to find requested project." });
      }
    });

    // Add project form
    app.get("/solutions/addProject", ensureLogin, async (req, res) => {
      try {
        const sectors = await projectData.getAllSectors();
        res.render("addProject", { sectors: sectors });
      } catch (err) {
        res.render("500", { message: `Unable to load form: ${err.message}` });
      }
    });

    app.post("/solutions/addProject", ensureLogin, async (req, res) => {
      try {
        await projectData.addProject(req.body);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    // edit project form
    app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id);
        const project = await projectData.getProjectById(projectId);
        const sectors = await projectData.getAllSectors();
    
        res.render("editProject", {
          project: project,
          sectors: sectors
        });
      } catch (err) {
        res.status(404).render("404", { message: err.message });
      }
    });

    app.post("/solutions/editProject", ensureLogin, async (req, res) => {
      try {
        const id = parseInt(req.body.id);
        await projectData.editProject(id, req.body);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    // Delete project
    app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        await projectData.deleteProject(id);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`
        });
      }
    });

    // Login page
    app.get("/login", (req, res) => {
      res.render("login", {
        errorMessage: "",
        userName: "",
        page: "/login"
      });
    });

    // Register page
    app.get("/register", (req, res) => {
      res.render("register", {
        errorMessage: "",
        successMessage: "",
        userName: "",
        page: "/register"
      });
    });
    
    // Register user input
    app.post("/register", async (req, res) => {
      try {
        await authData.registerUser(req.body);
        res.render("register", {
          errorMessage: "",
          successMessage: "User created",
          userName: "",
          page: "/register"
        });
      } catch (err) {
        res.render("register", {
          errorMessage: err,
          successMessage: "",
          userName: req.body.userName,
          page: "/register"
        });
      }
    });

    // Login user input
    app.post("/login", async (req, res) => {
      req.body.userAgent = req.get("User-Agent");
    
      try {
        const user = await authData.checkUser(req.body);
    
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
        };
    
        res.redirect("/solutions/projects");
      } catch (err) {
        res.render("login", {
          errorMessage: err,
          userName: req.body.userName,
          page: "/login"
        });
      }
    });

    // Logout
    app.get("/logout", (req, res) => {
      req.session.reset();
      res.redirect("/");
    });    

    // UserHistory
    app.get("/userHistory", ensureLogin, (req, res) => {
      res.render("userHistory", {
        page: "/userHistory"
      });
    });    
    
    
    app.use((req, res) => {
      res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize projects:", err);
  }
}

initializeServer();
