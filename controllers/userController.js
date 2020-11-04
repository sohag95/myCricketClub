const RegistrationNumber = require("../models/RegistrationNumber")
const Student = require("../models/Student")
const teacherCollection = require("../db").db().collection("teacher")
const PostsCollection = require("../db").db().collection("posts")
const studentCollection = require("../db").db().collection("student")
const upcomingMatchCollection = require("../db").db().collection("upcomingMatch")
const matchDetailsCollection = require("../db").db().collection("MatchDetails")
const adminCollection = require("../db").db().collection("admin")
const matchControllerCollection = require("../db").db().collection("matchController")

const ObjectID = require("mongodb").ObjectID

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.userMustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.getPosts = async function (req, res, next) {
  try {
    let posts = await PostsCollection.find().sort({ createdDate: -1 }).toArray()
    req.posts = posts
    next()
  } catch {
    res.render("404")
  }
}

exports.coaches = async function (req, res) {
  try {
    let coaches = await teacherCollection.find().toArray()
    console.log(coaches)
    res.render("coaches", { coaches: coaches })
  } catch {
    res.render("404")
  }
}

exports.groups = async function (req, res, next) {
  try {
    let groupA = await studentCollection.find({ group: "a" }).toArray()
    let groupB = await studentCollection.find({ group: "b" }).toArray()
    let groupC = await studentCollection.find({ group: "c" }).toArray()
    req.groupA = groupA.map(student => {
      groupA = {
        regNumber: student.regNumber,
        username: student.username,
        dob: student.dob
      }
      return groupA
    })
    req.groupB = groupB.map(student => {
      groupB = {
        regNumber: student.regNumber,
        username: student.username,
        dob: student.dob
      }
      return groupB
    })
    req.groupC = groupC.map(student => {
      groupC = {
        regNumber: student.regNumber,
        username: student.username,
        dob: student.dob
      }
      return groupC
    })
    next()
  } catch {
    res.render("404")
  }
}

exports.performance = async function (req, res, next) {
  try {
    let playersData = await Student.getStatistics()
    req.playersData = playersData
    next()
  } catch {
    res.render("404")
  }
}

exports.students = function (req, res) {
  try {
    let playersData = req.playersData

    let groupA = playersData.filter(data => {
      if (data.group == "a") {
        return data
      }
    })
    let groupB = playersData.filter(data => {
      if (data.group == "b") {
        return data
      }
    })
    let groupC = playersData.filter(data => {
      if (data.group == "c") {
        return data
      }
    })

    res.render("students", {
      regErrors: req.flash("regErrors"),
      playersDataA: groupA,
      playersDataB: groupB,
      playersDataC: groupC
    })
  } catch {
    res.render("404")
  }
}

exports.matches = async function (req, res) {
  try {
    let matches = await matchDetailsCollection.find().sort({ date: -1 }).toArray()
    practiceMatches = matches.filter(match => {
      if (match.matchType == "Practice match") {
        return match
      }
    })
    leagueMatches = matches.filter(match => {
      if (match.matchType == "League match") {
        return match
      }
    })
    groupMatches = matches.filter(match => {
      if (match.matchType == "Group match") {
        return match
      }
    })
    console.log(matches)
    res.render("matches", {
      matches: matches,
      practiceMatches: practiceMatches,
      leagueMatches: leagueMatches,
      groupMatches: groupMatches
    })
  } catch {
    res.render("404")
  }
}

exports.admition = function (req, res) {
  res.render("admition")
}

exports.aboutUs = async function (req, res) {
  try {
    let regNumber = new RegistrationNumber("te") //testing autometic registration number generate...
    let reg = await regNumber.getRegNumber()
    console.log("Registration number :", reg)
    res.render("about-us")
  } catch {
    res.render("404")
  }
}

exports.home = async function (req, res) {
  try {
    let info = await upcomingMatchCollection.findOne({ _id: new ObjectID("5f42cb6940aeb37c78341d74") })
    let matches = await matchDetailsCollection.find().sort({ date: -1 }).toArray()
    let lastMatch = matches[0]
    console.log("Matches:", lastMatch)
    let today = new Date().toLocaleDateString()
    let matchOn = new Date(info.details.gameDate).toLocaleDateString()
    let newInfo
    console.log(today, matchOn)
    if (today < matchOn) {
      newInfo = "new"
    } else if (today == matchOn) {
      newInfo = "today"
    } else {
      newInfo = "old"
    }

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    function format(d) {
      var t = new Date(d)
      return t.getDate() + " " + monthNames[t.getMonth()] + " " + t.getFullYear()
    }
    info.details.gameDate = format(new Date(info.details.gameDate))
    lastMatch.date = format(new Date(lastMatch.date))

    console.log(lastMatch)
    console.log(newInfo)

    res.render("home-guest", {
      regErrors: req.flash("regErrors"),
      info: info,
      newInfo: newInfo,
      lastMatch: lastMatch
    })
  } catch {
    res.render("404")
  }
}

exports.adminHome = async function (req, res) {
  try {
    let students = await studentCollection.find().toArray()
    let teachers = await teacherCollection.find().toArray()
    let matchControllers = await matchControllerCollection.find().toArray()
    let admins = await adminCollection.find().toArray()

    students = students.map(student => {
      student = {
        regNumber: student.regNumber,
        username: student.username,
        paymentTill: student.paymentTill
      }
      return student
    })
    teachers = teachers.map(teacher => {
      teacher = {
        regNumber: teacher.regNumber,
        username: teacher.username
      }
      return teacher
    })
    admins = admins.map(admin => {
      admin = {
        regNumber: admin.regNumber,
        username: admin.username
      }
      return admin
    })
    matchControllers = matchControllers.map(matchController => {
      matchController = {
        regNumber: matchController.regNumber,
        username: matchController.username
      }
      return matchController
    })
    let notice = await upcomingMatchCollection.findOne({ _id: new ObjectID("5f42cb6940aeb37c78341d74") })
    res.render("admin-home", {
      regErrors: req.flash("regErrors"),
      notice: notice.notice,
      students: students,
      teachers: teachers,
      admins: admins,
      scorers: matchControllers
    })
  } catch {
    res.render("404")
  }
}

exports.teacherHome = async function (req, res) {
  try {
    let teachers = await teacherCollection.find().toArray()
    teachers = teachers.map(teacher => {
      teachers = {
        regNumber: teacher.regNumber,
        username: teacher.username
      }
      return teachers
    })
    let announcement = await upcomingMatchCollection.findOne({ _id: new ObjectID("5f42cb6940aeb37c78341d74") })
    console.log(announcement.details)
    res.render("teacher-home", {
      regErrors: req.flash("regErrors"),
      teachers: teachers,
      groupA: req.groupA,
      groupB: req.groupB,
      groupC: req.groupC,
      posts: req.posts,
      birthdayBoys: req.BirthdayBoys,
      announcement: announcement.details
    })
  } catch {
    res.render("404")
  }
}

exports.birthday = async function (req, res, next) {
  try {
    var dateFull = new Date()
    var month1 = dateFull.getMonth()
    var date1 = dateFull.getDate()

    let Students = await studentCollection.find().toArray()

    let BirthdayBoys = Students.filter(boy => {
      var dateBoy = new Date(boy.dob)
      var month2 = dateBoy.getMonth()
      var date2 = dateBoy.getDate()
      if (month1 == month2 && date1 == date2) {
        return boy
      }
    }).map(bdboy => {
      bdboy = {
        regNumber: bdboy.regNumber,
        username: bdboy.username,
        gender: bdboy.gender
      }
      return bdboy
    })
    req.BirthdayBoys = BirthdayBoys
    next()
  } catch {
    res.render("404")
  }
}

exports.studentHome = async function (req, res) {
  try {
    let teachers = await teacherCollection.find().toArray()
    teachers = teachers.map(teacher => {
      teachers = {
        regNumber: teacher.regNumber,
        username: teacher.username
      }
      return teachers
    })
    let Students = await studentCollection.find().toArray()
    let GroupStudents = Students.filter(student => {
      if (student.group == req.group) {
        return student
      }
    }).map(student => {
      student = {
        regNumber: student.regNumber,
        username: student.username
      }
      return student
    })

    res.render("student-home", {
      regErrors: req.flash("regErrors"),
      groupStudents: GroupStudents,
      posts: req.posts,
      teachers: teachers,
      birthdayBoys: req.BirthdayBoys
    })
  } catch {
    res.render("404")
  }
}

exports.matchControllerHome = function (req, res) {
  res.render("matchController-home", { regErrors: req.flash("regErrors") })
}
