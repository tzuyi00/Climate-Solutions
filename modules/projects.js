/********************************************************************************
 * WEB322 – Assignment 05
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: ___Tzuyi Lin___ Student ID: __127201234__ Date: __2025/3/24__
 *
 ********************************************************************************/

require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // This will help you connect to the database with SSL
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  },
  define: {
    schema: "myschema",
  },
});

// Define Sector model
const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false
});

// Define Project model
const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false
});

// Define association
Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// // Load initial data for bulk insert
// const projectData = require("../data/projectData");
// const sectorData = require("../data/sectorData");
// let projects = [];

// sequelize
// .sync()
// .then( async () => {
//   try{
//     await Sector.bulkCreate(sectorData); 
//     await Project.bulkCreate(projectData);

//     await sequelize.query(`SELECT setval(pg_get_serial_sequence('"myschema"."Sectors"', 'id'), (SELECT MAX(id) FROM "myschema"."Sectors"))`);
//     await sequelize.query(`SELECT setval(pg_get_serial_sequence('"myschema"."Projects"', 'id'), (SELECT MAX(id) FROM "myschema"."Projects"))`);

//     console.log("-----");
//     console.log("data inserted successfully");
//   }catch(err){
//     console.log("-----");
//     console.log(err.message);
//   }

//   process.exit();
// })
// .catch((err) => {
//   console.log('Unable to connect to the database:', err);
// });


// 1. Initialize function to populate the projects array
function initialize() {
  return sequelize.sync();
}

// 2. Return all projects
function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

// 3. Return a specific project by its ID
function getProjectById(projectId) {
  return Project.findAll({
    include: [Sector],
    where: { id: projectId }
  }).then(data => {
    if (data.length > 0) return data[0];
    else throw new Error("Unable to find requested project");
  });
}

// 4. Return all projects by a specific sector
function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Sequelize.Op.iLike]: `%${sector}%`
      }
    }
  }).then(data => {
    if (data.length > 0) return data;
    else throw new Error("Unable to find requested projects");
  });
}

// 5. Return all sectors
function getAllSectors() {
  return Sector.findAll();
}

// 6. Add a new project
function addProject(projectData) {
  return Project.create(projectData)
    .then(() => {})
    .catch((err) => {
      throw new Error(err.errors[0].message);
    });
}

// 7. Edit a project
function editProject(id, projectData) {
  return Project.update(projectData, {
    where: { id: id }
  })
    .then(() => {})
    .catch((err) => {
      throw new Error(err.errors[0].message);
    });
}

// 8. Delete a project
function deleteProject(id) {
  return Project.destroy({
    where: { id: id }
  })
    .then(() => {})
    .catch((err) => {
      throw new Error(err.errors[0].message);
    });
}


module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject,
  Project,
  Sector
};