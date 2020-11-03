const MatchDetails = require("../models/MatchDetails")

exports.addDetails = async function (req, res) {
  try {
    let matchDetails = new MatchDetails(req.body)
    await matchDetails
      .create()
      .then(function () {
        req.flash("success", "Match details successfully added.")
        req.session.save(() => res.redirect("/matchController-home"))
      })
      .catch(function (errors) {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/matchController-home"))
      })
  } catch {
    res.render("404")
  }
}
