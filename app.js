const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
const markdown = require("marked")
const csrf = require("csurf")
const app = express()
const sanitizeHTML = require("sanitize-html")
const fileUpload = require("express-fileupload")

let sessionOptions = session({
  secret: "JavaScript is sooooooooo coool",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.use(sessionOptions)
app.use(flash())
app.use(fileUpload())

app.use(function (req, res, next) {
  // make our markdown function available from within ejs templates
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown(content), { allowedTags: ["p", "br", "ul", "ol", "li", "strong", "bold", "i", "em", "h1", "h2", "h3", "h4", "h5", "h6"], allowedAttributes: {} })
  }

  // make all error and success flash messages available from all templates
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")

  // make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id
  } else {
    req.visitorId = 0
  }
  if (req.session.user) {
    req.regNumber = req.session.user.regNumber
  } else {
    req.regNumber = 0
  }
  if (req.session.user) {
    req.userName = req.session.user.username
  } else {
    req.userName = undefined
  }
  if (req.session.user) {
    req.group = req.session.user.group
  } else {
    req.group = undefined
  }
  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

const router = require("./router")

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

app.use(csrf())
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use("/", router)

app.use(function (err, req, res, next) {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross site request forgery detected.")
      req.session.save(() => res.redirect("/"))
    }
  } else {
    res.render("404")
  }
})

module.exports = app