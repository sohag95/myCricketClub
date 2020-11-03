const matchDetailsCollection = require('../db').db().collection("MatchDetails")
const sanitizeHTML = require('sanitize-html')
let MatchDetails = function(data) {
  this.data = data
  this.errors = []
}


MatchDetails.prototype.cleanUp =async function() {
  let matches=await matchDetailsCollection.find().toArray()
  this.matchNumber=Number(matches.length)+1
  console.log("match number",this.matchNumber)
    if (typeof(this.data.venue) != "string") {this.data.venue= ""}
    if (typeof(this.data.matchType) != "string") {this.data.matchType= ""}
    if (typeof(this.data.firstTeam) != "string") {this.data.firstTeam = ""}
    if (typeof(this.data.secondTeam) != "string") {this.data.secondTeam= ""}
    if (typeof(this.data.date) != "string") {this.data.date = ""}
    if (typeof(this.data.details) != "string") {this.data.details = ""}
    if (typeof(this.data.manOftheMatch) != "string") {this.data.manOftheMatch= ""}
  
    // get rid of any bogus properties
    this.data = {
        matchNumber:this.matchNumber,
        venue: sanitizeHTML(this.data.venue.trim(), {allowedTags: [], allowedAttributes: {}}),
        matchType: sanitizeHTML(this.data.matchType.trim(), {allowedTags: [], allowedAttributes: {}}),
        firstTeam: sanitizeHTML(this.data.firstTeam.trim(), {allowedTags: [], allowedAttributes: {}}),
        secondTeam: sanitizeHTML(this.data.secondTeam.trim(), {allowedTags: [], allowedAttributes: {}}),
        date: sanitizeHTML(this.data.date.trim(), {allowedTags: [], allowedAttributes: {}}),
        details: sanitizeHTML(this.data.details.trim(), {allowedTags: [], allowedAttributes: {}}),
        manOftheMatch: sanitizeHTML(this.data.manOftheMatch.trim(), {allowedTags: [], allowedAttributes: {}})
    }
  }
  
  MatchDetails.prototype.validate = function() {
    if (this.matchNumber == "") {this.errors.push("You must provide match number.")}
    if (this.data.venue == "") {this.errors.push("You must provide the venue name.")}
    if (this.data.matchType == "") {this.errors.push("You must provide match type.")}
    if (this.data.firstTeam == "") {this.errors.push("You must provide the first team name.")}
    if (this.data.secondTeam == "") {this.errors.push("You must provide the second team name.")}
    if (this.data.date == "") {this.errors.push("You must provide the date.")}
    if (this.data.details == "") {this.errors.push("You must provide the details.")}
    if (this.data.manOftheMatch == "") {this.errors.push("You must provide the man of the match.")}
  }

MatchDetails.prototype.create =async function() {
  return new Promise(async(resolve, reject) => {
    await this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into database
     await matchDetailsCollection.insertOne(this.data)
     resolve()
    } else {
      reject(this.errors)
    }
  })
}
module.exports = MatchDetails