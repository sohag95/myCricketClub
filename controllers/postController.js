const Post = require("../models/Post")

exports.postCreate = function (req, res) {
  console.log(req.body)
  let post = new Post(req.body, req.regNumber, undefined, req.userName)
  post
    .postCreate()
    .then(function () {
      req.flash("success", "New post successfully created.")
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
}
exports.ifPostExists = function (req, res, next) {
  Post.findById(req.params.postId)
    .then(function (post) {
      req.postId = post._id
      next()
    })
    .catch(function () {
      res.render("404")
    })
}
exports.like = function (req, res) {
  let post = new Post(req.body, req.regNumber, req.postId)
  console.log(req.body, req.postId, req.regNumber)
  post
    .like()
    .then(function () {
      if (req.body.postType == "objection" || req.body.postType == "apply") {
        req.flash("success", "Agree added...")
      } else if (req.body.postType == "advice") {
        req.flash("success", "Ok added...")
      } else if (req.body.postType == "announcment") {
        req.flash("success", "Happy added...")
      } else {
        req.flash("success", "Like added...")
      }
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
}

exports.disLike = function (req, res) {
  let post = new Post(req.body, req.regNumber, req.postId)
  console.log(req.body, req.postId, req.regNumber)
  post
    .disLike()
    .then(function () {
      if (req.body.postType == "objection" || req.body.postType == "apply") {
        req.flash("success", "Disagree added...")
      } else if (req.body.postType == "advice") {
        req.flash("success", "No added...")
      } else if (req.body.postType == "announcment") {
        req.flash("success", "Unhappy added...")
      } else {
        req.flash("success", "Dislike added...")
      }
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
}

exports.commentOnPost = function (req, res) {
  console.log(req.body)
  let post = new Post(req.body, req.regNumber, req.postId, req.userName)
  console.log(req.body, req.postId, req.regNumber)
  post
    .commentOnPost()
    .then(function () {
      req.flash("success", "New comment successfully added.")
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else {
        req.session.save(() => res.redirect("/teacher-home"))
      }
    })
}

exports.delete = function (req, res) {
  Post.delete(req.postId, req.regNumber)
    .then(() => {
      req.flash("success", "Post successfully deleted.")
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect(`/studentProfile/${req.regNumber}`))
      } else {
        req.session.save(() => res.redirect(`/teacherProfile/${req.regNumber}`))
      }
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to perform that action.")
      if (req.session.user.userType == "student") {
        req.session.save(() => res.redirect("/student-home"))
      } else if (req.session.user.userType == "teacher") {
        req.session.save(() => res.redirect("/teacher-home"))
      } else {
        req.session.save(() => res.redirect("/"))
      }
    })
}
