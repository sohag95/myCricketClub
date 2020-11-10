const Admin = require("../models/Admin")
const Student = require("../models/Student")
const Teacher = require("../models/Teacher")
const Match = require("../models/Match")
const fs = require("fs")

exports.adminMustBeLoggedIn = function (req, res, next) {
  if (req.session.user.userType == "admin") {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}
exports.adminLogin = function (req, res) {
  let admin = new Admin(req.body)
  admin
    .adminLogin()
    .then(function (result) {
      console.log(result)
      req.session.user = { regNumber: admin.data.regNumber, username: admin.data.username, _id: admin.data._id, userType: "admin" }
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.adminRegister = function (req, res) {
  let admin = new Admin(req.body)
  admin
    .adminRegister()
    .then(regNumber => {
      let msg = "Account Created !!! Admin's name : " + req.body.username + "  ||  Registration number : " + regNumber + "  ||  Password : " + req.body.password + " "
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}

exports.uploadProfilePicture = function (req, res) {
  let data = req.body
  let file = req.files.file
  console.log(data, file)
  let filePath = "public/images/" + req.body.regNumber + ".jpg"
  let admin = new Admin(req.body)
  admin
    .uploadingProfilePicture(filePath, file)
    .then(msg => {
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(err => {
      req.flash("errors", err)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}

exports.deleteProfile = function (req, res) {
  let profileType = req.body.regNumber.slice(5, 7)
  let path = "public/images/" + req.body.regNumber + ".jpg"
  if (profileType == "st") {
    Student.deleteProfile(req.body.regNumber)
      .then(() => {
        try {
          if (fs.existsSync(path)) {
            try {
              fs.unlinkSync(path)
              //file removed
              req.flash("success", "Profile successfully deleted.")
              req.session.save(() => res.redirect("/admin-home"))
            } catch (err) {
              req.flash("success", "Profile successfully deleted but profile picture has not deleted.")
              req.session.save(() => res.redirect("/admin-home"))
            }
          } else {
            req.flash("success", "Profile successfully deleted.")
            req.session.save(() => res.redirect("/admin-home"))
          }
        } catch (err) {
          req.flash("success", "Profile successfully deleted.")
          req.session.save(() => res.redirect("/admin-home"))
        }
      })
      .catch(() => {
        req.flash("errors", "You may entered wrong registration number!!.")
        req.session.save(() => res.redirect("/admin-home"))
      })
  } else if (profileType == "te") {
    Teacher.deleteProfile(req.body.regNumber)
      .then(() => {
        try {
          if (fs.existsSync(path)) {
            try {
              fs.unlinkSync(path)
              //file removed

              req.flash("success", "Profile successfully deleted.")
              req.session.save(() => res.redirect("/admin-home"))
            } catch (err) {
              req.flash("success", "Profile successfully deleted but profile picture has not deleted.")
              req.session.save(() => res.redirect("/admin-home"))
            }
          } else {
            req.flash("success", "Profile successfully deleted.")
            req.session.save(() => res.redirect("/admin-home"))
          }
        } catch (err) {
          req.flash("success", "Profile successfully deleted.")
          req.session.save(() => res.redirect("/admin-home"))
        }
      })
      .catch(() => {
        req.flash("errors", "You may entered wrong registration number!!.")
        req.session.save(() => res.redirect("/admin-home"))
      })
  } else if (profileType == "mc") {
    Match.deleteProfile(req.body.regNumber)
      .then(() => {
        try {
          if (fs.existsSync(path)) {
            try {
              fs.unlinkSync(path)
              //file removed
              req.flash("success", "Profile successfully deleted.")
              req.session.save(() => res.redirect("/admin-home"))
            } catch (err) {
              req.flash("success", "Profile successfully deleted but profile picture has not deleted.")
              req.session.save(() => res.redirect("/admin-home"))
            }
          } else {
            req.flash("success", "Profile successfully deleted.")
            req.session.save(() => res.redirect("/admin-home"))
          }
        } catch (err) {
          req.flash("success", "Profile successfully deleted.")
          req.session.save(() => res.redirect("/admin-home"))
        }
      })
      .catch(() => {
        req.flash("errors", "You may entered wrong registration number!!.")
        req.session.save(() => res.redirect("/admin-home"))
      })
  } else {
    req.flash("errors", "You may entered wrong registration number!!.")
    req.session.save(() => res.redirect("/admin-home"))
  }
}

exports.uploadSlidePicture = function (req, res) {
  let data = req.body
  let file = req.files.file
  console.log(data, file)
  let filePath = "public/images/" + req.body.slidePicNumber + ".jpg"
  Admin.uploadingSlidePicture(filePath, file, req.body.slidePicNumber)
    .then(msg => {
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(err => {
      req.flash("errors", err)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}
