const UpcomingMatch = require('../models/UpcomingMatch')



// exports.create = function(req, res) {
//   let upcomingMatch = new UpcomingMatch(req.body, req.userName)
//   upcomingMatch.create().then(function() {
//     req.flash("success", "Announcement added Successfully.")
//     req.session.save(() => res.redirect("/teacher-home"))
//   }).catch(function(errors) {

//     req.flash("errors", errors)
//     req.session.save(() => res.redirect("/teacher-home"))
//   })
// }


exports.updateDetails = function(req, res) {
  let upcomingMatch = new UpcomingMatch(req.body, req.userName)
  upcomingMatch.updateDetails().then(function() {
    req.flash("success", "Announcement updated Successfully.")
    req.session.save(() => res.redirect("/teacher-home"))
  }).catch(function(errors) {

    req.flash("errors", errors)
    req.session.save(() => res.redirect("/teacher-home"))
  })
}

exports.updateNotice = function(req, res) {
  let upcomingMatch = new UpcomingMatch(req.body, req.userName)
  upcomingMatch.updateNotice().then(function() {
    req.flash("success", "Notice updated Successfully.")
    req.session.save(() => res.redirect("/admin-home"))
  }).catch(function(errors) {

    req.flash("errors", errors)
    req.session.save(() => res.redirect("/admin-home"))
  })
}