const studentCollection = require("../db").db().collection("student")
const performanceTable = require("../db").db().collection("performanceTable")
const validator = require("validator")
const sanitizeHTML = require("sanitize-html")

let Performance = function (studentReg, data) {
  this.regNumber = studentReg
  this.data = data
  this.errors = []
  this.statistics
  this.batting = {}
  this.bowling = {}
}

Performance.prototype.entry = function () {
  this.data = {
    regNumber: this.regNumber.trim().toLowerCase(),
    matches: 0,
    batting: {
      innings: 0,
      runs: 0,
      balls: 0,
      sixes: 0,
      fours: 0,
      fifties: 0,
      hundreds: 0,
      hightRun: 0
    },
    bowling: {
      innings: 0,
      runs: 0,
      overs: 0,
      wickets: 0,
      fiveWickets: 0,
      tenWickets: 0,
      madenOvers: 0,
      hightWicket: 0
    }
  }
}

Performance.prototype.typeConvertion = function () {
  this.data.scoredRuns = Number(this.data.scoredRuns)
  this.data.balls = Number(this.data.balls)
  this.data.fours = Number(this.data.fours)
  this.data.sixes = Number(this.data.sixes)
  this.data.overs = Number(this.data.overs)
  this.data.givenRuns = Number(this.data.givenRuns)
  this.data.maden = Number(this.data.maden)
  this.data.wickets = Number(this.data.wickets)
}
Performance.prototype.cleanUp = function () {
  if (typeof this.data.regNumber != "string") {
    this.data.regNumber = ""
  }
  if (typeof this.data.scoredRuns != "number") {
    this.data.scoredRuns = ""
  }
  if (typeof this.data.balls != "number") {
    this.data.balls = ""
  }
  if (typeof this.data.fours != "number") {
    this.data.fours = ""
  }
  if (typeof this.data.sixes != "number") {
    this.data.sixes = ""
  }
  if (typeof this.data.overs != "number") {
    this.data.overs = ""
  }
  if (typeof this.data.givenRuns != "number") {
    this.data.givenRuns = ""
  }
  if (typeof this.data.maden != "number") {
    this.data.maden = ""
  }
  if (typeof this.data.wickets != "number") {
    this.data.wickets = ""
  }
  this.data = {
    regNumber: this.regNumber.trim().toLowerCase(),
    scoredRuns: this.data.scoredRuns,
    balls: this.data.balls,
    fours: this.data.fours,
    sixes: this.data.sixes,
    overs: this.data.overs,
    givenRuns: this.data.givenRuns,
    maden: this.data.maden,
    wickets: this.data.wickets
  }

  console.log("cleanUp data:", this.data)
  console.log("cleanup data type:", typeof this.data.scoredRuns)
}

Performance.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (this.data.regNumber === "") {
        this.errors.push("You must provide a valid registration number of the player.")
      }
      if (this.data.regNumber != "" && !validator.isAlphanumeric(this.data.regNumber)) {
        this.errors.push("Registration number can only contain letters and numbers.")
      }
      if (this.data.scoredRuns === "") {
        this.errors.push("You must provide scored run.")
      }
      if (this.data.balls === "") {
        this.errors.push("You must provide how much ball he/she played.")
      }
      if (this.data.fours === "") {
        this.errors.push("You must provide total 4's he/she hitted.")
      }
      if (this.data.sixes === "") {
        this.errors.push("You must provide total 6's he/she hitted.")
      }
      if (this.data.overs === "") {
        this.errors.push("You must provide how much over he/she bowled.")
      }
      if (this.data.givenRuns === "") {
        this.errors.push("You must provide how much run he/she has given.")
      }
      if (this.data.maden === "") {
        this.errors.push("You must provide total maden overs he/she bowled.")
      }
      if (this.data.wickets === "") {
        this.errors.push("You must provide how much wickets he/she taken.")
      }
      if (this.data.wickets > 10) {
        this.errors.push("No one can take more than 10 wickets in a match.")
      }

      if (this.data.maden > this.data.overs) {
        this.errors.push("Maden overs can't great than total overs he/she bowled.")
      }
      if (this.data.balls == 0 && this.data.scoredRuns > 0) {
        this.errors.push("Runs can't be scored without playing a single ball.Enter all values again.")
      }
      if (this.data.fours * 4 + this.data.sixes * 6 > this.data.scoredRuns) {
        this.errors.push("Total Scored runs can not less then the total of all hitting 4's and 6's.")
      }
      if (this.data.fours + this.data.sixes > this.data.balls) {
        this.errors.push("Total number of hitting 4's and 6's can't greater than total ball he/she fatched.")
      }
      if (this.data.overs == 0 && this.data.wickets > 0) {
        this.errors.push("Without bowling a single over one can't get wickets.")
      }
      if (this.data.overs == 0 && this.data.givenRuns > 0) {
        this.errors.push("Without bowling a single over one can't give runs.")
      }
      if (this.data.overs == 0 && this.data.maden > 0) {
        this.errors.push("Without bowling a single over one can't get maden overs.")
      }

      if (validator.isAlphanumeric(this.data.regNumber)) {
        let present = await studentCollection.findOne({ regNumber: this.data.regNumber })
        if (!present) {
          this.errors.push("You have entered wrong registration number!!.")
        }
      }
      resolve()
    } catch {
      reject()
    }
  })
}

Performance.prototype.previousDatas = function () {
  return new Promise(async (resolve, reject) => {
    try {
      var scores = await performanceTable.findOne({ regNumber: this.data.regNumber })
      console.log("about scores:", scores)
      if (scores) {
        resolve(scores)
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}
Performance.prototype.calculate = function () {
  this.statistics.matches = this.statistics.matches + 1
  //batting details adding
  if (this.data.balls > 0) {
    this.statistics.batting.innings = this.statistics.batting.innings + 1
  }
  if (this.statistics.batting.hightRun < this.data.scoredRuns) {
    this.statistics.batting.hightRun = this.data.scoredRuns
  }
  this.statistics.batting.runs = this.statistics.batting.runs + this.data.scoredRuns
  this.statistics.batting.balls = this.statistics.batting.balls + this.data.balls
  this.statistics.batting.fours = this.statistics.batting.fours + this.data.fours
  this.statistics.batting.sixes = this.statistics.batting.sixes + this.data.sixes

  if (this.data.scoredRuns >= 50 && this.data.scoredRuns < 100) {
    this.statistics.batting.fifties = this.statistics.batting.fifties + 1
  }
  if (this.data.scoredRuns >= 100) {
    this.statistics.batting.hundreds = this.statistics.batting.hundreds + 1
  }

  //bowling details adding
  if (this.data.overs > 0) {
    this.statistics.bowling.innings = this.statistics.bowling.innings + 1
  }
  this.statistics.bowling.overs = this.statistics.bowling.overs + this.data.overs
  this.statistics.bowling.runs = this.statistics.bowling.runs + this.data.givenRuns
  this.statistics.bowling.madenOvers = this.statistics.bowling.madenOvers + this.data.maden
  this.statistics.bowling.wickets = this.statistics.bowling.wickets + this.data.wickets
  if (this.data.wickets >= 5 && this.data.wickets < 10) {
    this.statistics.bowling.fiveWickets = this.statistics.bowling.fiveWickets + 1
  }
  if (this.data.wickets >= 10) {
    this.statistics.bowling.tenWickets = this.statistics.bowling.tenWickets + 1
  }
  if (this.statistics.bowling.hightWicket < this.data.wickets) {
    this.statistics.bowling.hightWicket = this.data.wickets
  }

  this.batting = {
    innings: this.statistics.batting.innings,
    runs: this.statistics.batting.runs,
    balls: this.statistics.batting.balls,
    sixes: this.statistics.batting.sixes,
    fours: this.statistics.batting.fours,
    fifties: this.statistics.batting.fifties,
    hundreds: this.statistics.batting.hundreds,
    hightRun: this.statistics.batting.hightRun
  }
  this.bowling = {
    innings: this.statistics.bowling.innings,
    runs: this.statistics.bowling.runs,
    overs: this.statistics.bowling.overs,
    wickets: this.statistics.bowling.wickets,
    fiveWickets: this.statistics.bowling.fiveWickets,
    tenWickets: this.statistics.bowling.tenWickets,
    madenOvers: this.statistics.bowling.madenOvers,
    hightWicket: this.statistics.bowling.hightWicket
  }
}
Performance.prototype.updateScore = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Execution started from here:")
      this.typeConvertion()
      this.cleanUp()
      await this.validate()
      console.log("Errors:", this.errors)
      if (!this.errors.length) {
        this.statistics = await performanceTable.findOne({ regNumber: this.data.regNumber })
        this.calculate()
        await performanceTable.findOneAndUpdate(
          { regNumber: this.data.regNumber },
          {
            $set: {
              matches: this.statistics.matches,
              batting: this.batting,
              bowling: this.bowling
            }
          }
        )
        console.log("getting previous data:", this.statistics)
        resolve("success")
      } else {
        resolve("failure")
      }
    } catch {
      reject()
    }
  })
}

Performance.prototype.createTable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      // Step #1: Validate user data
      this.entry()
      await performanceTable.insertOne(this.data)
      resolve()
    } catch {
      reject()
    }
  })
}
module.exports = Performance
