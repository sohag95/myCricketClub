const upcomingMatchCollection = require("../db").db().collection("upcomingMatch")

const ObjectID = require("mongodb").ObjectID

const sanitizeHTML = require("sanitize-html")

let UpcomingMatch = function (data, teacherName) {
  this.data = data
  this.errors = []
  this.teacherName = teacherName
}

UpcomingMatch.prototype.cleanUp = function () {
  if (typeof this.data.firstTeam != "string") {
    this.data.firstTeam = ""
  }
  if (typeof this.data.secondTeam != "string") {
    this.data.secondTeam = ""
  }
  if (typeof this.data.matchType != "string") {
    this.data.matchType = ""
  }
  if (typeof this.data.date != "string") {
    this.data.date = ""
  }
  if (typeof this.data.venue != "string") {
    this.data.venue = ""
  }
  if (typeof this.data.reportingTime != "string") {
    this.data.reportingTime = ""
  }
  if (typeof this.data.playersName != "string") {
    this.data.playersName = ""
  }

  // get rid of any bogus properties
  this.data = {
    details: {
      firstTeam: sanitizeHTML(this.data.firstTeam.trim(), { allowedTags: [], allowedAttributes: {} }),
      secondTeam: sanitizeHTML(this.data.secondTeam.trim(), { allowedTags: [], allowedAttributes: {} }),
      matchType: sanitizeHTML(this.data.matchType.trim(), { allowedTags: [], allowedAttributes: {} }),
      gameDate: sanitizeHTML(this.data.date.trim(), { allowedTags: [], allowedAttributes: {} }),
      venue: sanitizeHTML(this.data.venue.trim(), { allowedTags: [], allowedAttributes: {} }),
      reportingTime: sanitizeHTML(this.data.reportingTime.trim(), { allowedTags: [], allowedAttributes: {} }),
      playersName: sanitizeHTML(this.data.playersName.trim(), { allowedTags: [], allowedAttributes: {} }),
      teacherName: this.teacherName,
      announcedDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
  }
}

UpcomingMatch.prototype.validate = function () {
  if (this.data.date == "") {
    this.errors.push("You must provide game date.")
  }
  if (this.data.vanue == "") {
    this.errors.push("You must provide venue name.")
  }
  if (this.data.reportingTime == "") {
    this.errors.push("You must provide reporting time.")
  }
  if (this.data.playersName == "") {
    this.errors.push("You must provide players name.")
  }
}

// UpcomingMatch.prototype.create = function() {
//   return new Promise((resolve, reject) => {
//     this.cleanUp()
//     this.validate()
//     if (!this.errors.length) {
//       // save post into database
//         upcomingMatchCollection.insertOne(this.data).then(() => {
//         resolve()
//       }).catch(() => {
//         this.errors.push("Please try again later.")
//         reject(this.errors)
//       })
//     } else {
//       reject(this.errors)
//     }
//   })
// }

UpcomingMatch.prototype.updateDetails = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into database
      upcomingMatchCollection
        .findOneAndUpdate({ _id: new ObjectID("5f42cb6940aeb37c78341d74") }, { $set: { details: this.data.details } })
        .then(() => {
          resolve()
        })
        .catch(() => {
          this.errors.push("Please try again later.")
          reject(this.errors)
        })
    } else {
      reject(this.errors)
    }
  })
}

UpcomingMatch.prototype.updateNotice = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof this.data.notice != "string") {
        this.data.notice = ""
      }
      if (this.data.notice == "") {
        this.errors.push("You must provide game date.")
      }

      if (!this.errors.length) {
        await upcomingMatchCollection.findOneAndUpdate({ _id: new ObjectID("5f42cb6940aeb37c78341d74") }, { $set: { notice: this.data.notice } })
        resolve()
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}
module.exports = UpcomingMatch
