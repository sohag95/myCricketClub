const Teacher = require("../models/Teacher")
const postsCollection = require("../db").db().collection("posts")

exports.teacherMustBeLoggedIn = function (req, res, next) {
  if (req.session.user.userType == "teacher") {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.teacherLogin = function (req, res) {
  let teacher = new Teacher(req.body)
  teacher
    .teacherLogin()
    .then(function (result) {
      req.session.user = { regNumber: teacher.data.regNumber, username: teacher.data.username, _id: teacher.data._id, userType: "teacher" }
      req.session.save(function () {
        res.redirect("/teacher-home")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.teacherRegister = function (req, res) {
  let teacher = new Teacher(req.body)
  teacher
    .teacherRegister()
    .then(regNumber => {
      let msg = "Account Created !!! Teacher's name : " + req.body.username + "  ||  Registration number : " + regNumber + "  ||  Password : " + req.body.password + " "
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

exports.ifTeacherExists = function (req, res, next) {
  Teacher.findByregNumber(req.params.regNumber)
    .then(function (userDocument) {
      req.profileUser = userDocument
      next()
    })
    .catch(function () {
      res.render("404")
    })
}

exports.getTeacherEditPage = function (req, res) {
  let userData = req.profileUser
  let visitorReg = userData.regNumber
  userData = {
    regNumber: userData.regNumber,
    username: userData.username,
    address: userData.address,
    phone: userData.phone,
    experiences: userData.experiences,
    role: userData.role,
    email: userData.email
  }
  console.log(userData)
  if (visitorReg == req.session.user.regNumber) {
    res.render("teacher-edit-profile", {
      userData: userData
    })
  } else {
    req.flash("errors", "You don't have permition to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.getTeacherProfileData = async function (req, res) {
  try {
    let isVisitorsProfile = false
    let posts = await postsCollection.find({ regNumber: req.profileUser.regNumber }).sort({ createdDate: -1 }).toArray()
    let userDocument = req.profileUser
    console.log("posts:", posts)
    console.log(userDocument.regNumber, " and ", req.session.user.regNumber)

    if (userDocument.regNumber == req.session.user.regNumber) {
      profileUser = {
        regNumber: userDocument.regNumber,
        username: userDocument.username,
        address: userDocument.address,
        phone: userDocument.phone,
        experiences: userDocument.experiences,
        role: userDocument.role,
        email: userDocument.email
      }
      isVisitorsProfile = true
    } else {
      profileUser = {
        regNumber: userDocument.regNumber,
        username: userDocument.username,
        address: userDocument.address,
        phone: userDocument.phone,
        experiences: userDocument.experiences,
        role: userDocument.role,
        email: userDocument.email
      }
    }
    console.log(isVisitorsProfile)
    console.log("Profile data", profileUser)
    res.render("teacher-profile", {
      profileUser: profileUser,
      posts: posts,
      isVisitorsProfile: isVisitorsProfile
    })
  } catch {
    res.render("404")
  }
}

exports.teacherEditProfile = function (req, res) {
  let teacher = new Teacher(req.body, req.regNumber, req.params.regNumber)
  console.log(req.body)
  teacher
    .updateProfile()
    .then(status => {
      // the post was successfully updated in the database
      // or user did have permission, but there were validation errors
      if (status == "success") {
        // post was updated in db
        req.flash("success", "Profile successfully updated.")
        req.session.save(function () {
          res.redirect(`/teacher/profile/${req.regNumber}/edit`)
        })
      } else {
        teacher.errors.forEach(function (error) {
          req.flash("errors", error)
        })
        req.session.save(function () {
          res.redirect(`/teacher/profile/${req.regNumber}/edit`)
        })
      }
    })
    .catch(() => {
      // a post with the requested id doesn't exist
      // or if the current visitor is not the owner of the requested post
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.getPlayers = function (req, res) {
  let players = req.playersData
  let eligibleDOB = new Date(req.body.birthDate)
  eligiblePlayers = players.filter(data => {
    let dob = new Date(data.dob)
    if (dob >= eligibleDOB) {
      return data
    }
  })
  res.render("eligible-players", {
    players: eligiblePlayers,
    dob: req.body.birthDate
  })
}
