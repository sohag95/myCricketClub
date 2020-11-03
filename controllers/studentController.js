const Student = require("../models/Student")
const performanceTable = require("../db").db().collection("performanceTable")
const postsCollection = require("../db").db().collection("posts")

exports.studentMustBeLoggedIn = function (req, res, next) {
  if (req.session.user.userType == "student") {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.studentLogin = function (req, res) {
  let student = new Student(req.body)
  student
    .studentLogin()
    .then(function (result) {
      req.session.user = { group: student.data.group, regNumber: student.data.regNumber, username: student.data.username, _id: student.data._id, userType: "student" }
      req.session.save(function () {
        res.redirect("/student-home")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.studentRegister = function (req, res) {
  let student = new Student(req.body)

  student
    .studentRegister()
    .then(async regNumber => {
      let msg = "Account Created !!! Student's name : " + req.body.username + "  ||  Registration number : " + regNumber + "  ||  Password : " + req.body.password + " "
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

exports.changeGroup = function (req, res) {
  let student = new Student(req.body)
  student
    .updateGroup()
    .then(() => {
      req.flash("success", "You have successfully updated students group!!")
      req.session.save(function () {
        res.redirect("/teacher-home")
      })
    })
    .catch(Errors => {
      Errors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/teacher-home")
      })
    })
}

exports.updatePaymentDate = function (req, res) {
  let student = new Student(req.body)
  student
    .updatePaymentDate()
    .then(() => {
      req.flash("success", "You have successfully updated students payment date!!")
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(Errors => {
      Errors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}

exports.ifStudentExists = function (req, res, next) {
  Student.findByregNumber(req.params.regNumber)
    .then(function (userDocument) {
      req.profileUser = userDocument
      next()
    })
    .catch(function () {
      res.render("404")
    })
}

exports.getStudentEditPage = function (req, res) {
  let userData = req.profileUser
  let visitorReg = userData.regNumber
  userData = {
    regNumber: userData.regNumber,
    username: userData.username,
    battingStyle: userData.battingStyle,
    bowlingStyle: userData.bowlingStyle,
    address: userData.address,
    phone: userData.phone,
    email: userData.email
  }
  console.log(userData)
  if (visitorReg == req.session.user.regNumber) {
    res.render("student-edit-profile", {
      userData: userData
    })
  } else {
    req.flash("errors", "You don't have permition to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.getStudentProfileData = async function (req, res) {
  try {
    let isVisitorsProfile = false
    let statistics = await performanceTable.findOne({ regNumber: req.params.regNumber })
    let userDocument = req.profileUser
    let posts = await postsCollection.find({ regNumber: req.profileUser.regNumber }).sort({ createdDate: -1 }).toArray()

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    function format(d) {
      var t = new Date(d)
      return t.getDate() + " " + monthNames[t.getMonth()] + " " + t.getFullYear()
    }
    userDocument.dob = format(new Date(userDocument.dob))

    //Is profile visitor owner or not......checking.if owner pass the value of payment details otherwise don't
    if (userDocument.regNumber == req.session.user.regNumber) {
      profileUser = {
        regNumber: userDocument.regNumber,
        group: userDocument.group,
        username: userDocument.username,
        dob: userDocument.dob,
        gender: userDocument.gender,
        battingStyle: userDocument.battingStyle,
        bowlingStyle: userDocument.bowlingStyle,
        address: userDocument.address,
        phone: userDocument.phone,
        paymentTill: userDocument.paymentTill
      }
      isVisitorsProfile = true
    } else {
      profileUser = {
        regNumber: userDocument.regNumber,
        group: userDocument.group,
        username: userDocument.username,
        dob: userDocument.dob,
        gender: userDocument.gender,
        battingStyle: userDocument.battingStyle,
        bowlingStyle: userDocument.bowlingStyle,
        address: userDocument.address,
        phone: userDocument.phone,
        paymentTill: false
      }
    }
    console.log(isVisitorsProfile)
    console.log("Profile data", profileUser, "statistics", statistics)
    res.render("student-profile", {
      profileUser: profileUser,
      statistics: statistics,
      isVisitorsProfile: isVisitorsProfile,
      posts: posts
    })
  } catch {
    res.render("404")
  }
}

exports.studentEditProfile = function (req, res) {
  let student = new Student(req.body, req.regNumber, req.params.regNumber)
  console.log(req.body)
  student
    .updateProfile()
    .then(status => {
      // the post was successfully updated in the database
      // or user did have permission, but there were validation errors
      if (status == "success") {
        // post was updated in db
        req.flash("success", "Profile successfully updated.")
        req.session.save(function () {
          res.redirect(`/student/profile/${req.regNumber}/edit`)
        })
      } else {
        student.errors.forEach(function (error) {
          req.flash("errors", error)
        })
        req.session.save(function () {
          res.redirect(`/student/profile/${req.regNumber}/edit`)
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

// exports.changePassword=function(req,res){
//   console.log(req.regNumber)
//   if(req.body.passwordNew1 == req.body.passwordNew2){
//     let student=new Student(req.body)
//     student.changePassword(req.regNumber).then(()=>{
//       req.flash("success", "You have successfully updated your new password.")
//       req.session.save(function() {
//         res.redirect("/student-home")
//       })
//     }).catch((e)=>{
//       req.flash("errors", e)
//       req.session.save(function() {
//         res.redirect(`/student/profile/${req.regNumber}/edit`)
//       })
//     })
//   }else{
//     req.flash("errors", "Your new passwords are not matching.Enter again.....")
//     res.redirect(`/student/profile/${req.regNumber}/edit`)
//   }

// }
