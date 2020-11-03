const Match = require('../models/Match')
const Performance = require('../models/Performance')
exports.scorerMustBeLoggedIn = function(req, res, next) {
    if (req.session.user.userType=="matchController") {
      next()
    } else {
      req.flash("errors", "You must be logged in to perform that action.")
      req.session.save(function() {
        res.redirect('/')
      })
    }
  }

exports.matchControllerLogin = function(req, res) {
    let match = new Match(req.body)
    match.matchControllerLogin().then(function(result) {
      req.session.user = {regNumber: match.data.regNumber, username: match.data.username, _id: match.data._id,userType:"matchController"}
      req.session.save(function() {
        res.redirect('/matchController-home')
      })
    }).catch(function(e) {
      req.flash('errors', e)
      req.session.save(function() {
        res.redirect('/')
      })
    })
  }

  exports.matchControllerRegister = function(req, res) {
    let match = new Match(req.body)
    match.matchControllerRegister().then((regNumber) => {
      let msg="Account Created !!! Scorer's name : "+req.body.username+"  ||  Registration number : "+regNumber+"  ||  Password : "+req.body.password+" "
      req.flash('success', msg)
      req.session.save(function() {
        res.redirect('/admin-home')
      })
    }).catch((regErrors) => {
      regErrors.forEach(function(error) {
        req.flash('regErrors', error)
      })
      req.session.save(function() {
        res.redirect('/admin-home')
      })
    })
  }

  exports.updateScore=function(req,res){
    
    let performance=new Performance(req.body.regNumber,req.body)
    performance.updateScore().then((status) => {
      console.log("this line has been executed")
      // the score was successfully updated in the database
      // or user did have permission, but there were validation errors
      if (status == "success") {
        // post was updated in db
       
        req.flash("success", "Score successfully updated.")
        req.session.save(function() {
          res.redirect('/matchController-home')
        })
      } else {
        performance.errors.forEach(function(error) {
          req.flash("errors", error)
        })
        req.session.save(function() {
          res.redirect('/matchController-home')
        })
      }
    }).catch(() => {
      // a post with the requested id doesn't exist
      // or if the current visitor is not the owner of the requested post
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(function() {
        res.redirect("/")
      })
    })
  }

