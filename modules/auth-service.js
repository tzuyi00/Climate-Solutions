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

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

let User; // to be defined on new connection

// Define schema
let Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

// Initialize connection
function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

// Register user
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }

    bcrypt.hash(userData.password, 10).then(hash => {
      userData.password = hash;
      let newUser = new User(userData);
      newUser.save()
        .then(() => resolve())
        .catch(err => {
          if (err.code === 11000) {
            reject("User Name already taken");
          } else {
            reject("There was an error creating the user: " + err);
          }
        });
    }).catch(() => {
      reject("There was an error encrypting the password");
    });
  });
}

// Check login user
function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then(users => {
        if (users.length === 0) {
          reject("Unable to find user: " + userData.userName);
          return;
        }

        const user = users[0];
        bcrypt.compare(userData.password, user.password)
          .then(match => {
            if (!match) {
              reject("Incorrect Password for user: " + userData.userName);
              return;
            }

            if (user.loginHistory.length === 8) {
              user.loginHistory.pop();
            }

            // Add new login history to the beginning
            user.loginHistory.unshift({
              dateTime: (new Date()).toString(),
              userAgent: userData.userAgent
            });

            User.updateOne(
              { userName: user.userName },
              { $set: { loginHistory: user.loginHistory } }
            ).then(() => {
              resolve(user);
            }).catch(err => {
              reject("There was an error verifying the user: " + err);
            });
          });
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser
};