const bcrypt = require("bcryptjs")
const RegistrationNumber = require("./RegistrationNumber")
const Performance = require("./Performance")
const teacherCollection = require("../db").db().collection("teacher")
const studentCollection = require("../db").db().collection("student")
const adminCollection = require("../db").db().collection("admin")
const matchControllerCollection = require("../db").db().collection("matchController")
const upcomingMatchCollection = require("../db").db().collection("upcomingMatch")
const validator = require("validator")
const md5 = require("md5")
const ObjectID = require("mongodb").ObjectID

let Student = function (data, userRegNumber, updateRegNumber) {
  this.data = data
  this.errors = []
  this.serialNumber
  if (userRegNumber == undefined) {
    this.userRegNumber = false
  }
  if (userRegNumber) {
    this.userRegNumber = userRegNumber
  }
  if (updateRegNumber == undefined) {
    this.updateRegNumber = false
  }
  if (updateRegNumber) {
    this.updateRegNumber = updateRegNumber
  }
}
Student.prototype.dateFormat = function () {
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  function format(d) {
    var t = new Date(d)
    return t.getDate() + " " + monthNames[t.getMonth()] + " " + t.getFullYear()
  }
  this.data.paymentTill = format(new Date(this.data.paymentTill))
}

Student.prototype.cleanUp = async function () {
  try {
    let registrationNumber = new RegistrationNumber("st")
    let regNumber = await registrationNumber.getRegNumber()
    this.performance = new Performance(regNumber)
    this.serialNumber = Number(regNumber.slice(7))
    console.log("serial number:", this.serialNumber)

    if (typeof this.data.group != "string") {
      this.data.group = ""
    }
    if (typeof this.data.gender != "string") {
      this.data.gender = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    if (typeof this.data.paymentTill != "string") {
      this.data.paymentTill = ""
    }

    if (typeof this.data.username != "string") {
      this.data.username = ""
    }
    if (typeof this.data.email != "string") {
      this.data.email = ""
    }
    if (typeof this.data.dob != "string") {
      this.data.dob = ""
    }
    if (typeof this.data.address != "string") {
      this.data.address = ""
    }
    if (typeof this.data.battingStyle != "string") {
      this.data.battingStyle = ""
    }
    if (typeof this.data.bowlingStyle != "string") {
      this.data.bowlingStyle = ""
    }
    if (typeof this.data.phone != "string") {
      this.data.phone = ""
    }

    // get rid of any bogus properties
    this.data = {
      regNumber: regNumber.trim().toLowerCase(),
      group: this.data.group.trim().toLowerCase(),
      username: this.data.username.trim().toLowerCase(),
      gender: this.data.gender.trim().toLowerCase(),
      dob: this.data.dob.trim().toLowerCase(),
      battingStyle: this.data.battingStyle.trim().toLowerCase(),
      bowlingStyle: this.data.bowlingStyle.trim().toLowerCase(),
      address: this.data.address.trim().toLowerCase(),
      email: this.data.email.trim().toLowerCase(),
      phone: this.data.phone.trim().toLowerCase(),
      password: this.data.password,
      paymentTill: this.data.paymentTill.trim()
    }
  } catch {
    res.render("404")
  }
}

Student.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (!this.userRegNumber) {
        if (this.data.group == "") {
          this.errors.push("You must select a group.")
        }
        if (this.data.password == "") {
          this.errors.push("You must provide a password.")
        }
        if (this.data.gender == "") {
          this.errors.push("You must select player's gender.")
        }
        if (this.data.password.length > 0 && this.data.password.length < 12) {
          this.errors.push("Password must be at least 12 characters.")
        }
        if (this.data.password.length > 50) {
          this.errors.push("Password cannot exceed 50 characters.")
        }
        if (this.data.paymentTill == "") {
          this.errors.push("You must provide your date of birth.")
        }
        // if (this.data.regNumber == "") {this.errors.push("You must provide a registration number.")}
        // if (this.data.regNumber != "" && !validator.isAlphanumeric(this.data.regNumber)) {this.errors.push("Registration number can only contain letters and numbers.")}
        // if (this.data.regNumber.length > 0 && this.data.regNumber.length < 9) {this.errors.push("Registration number must be at least 9 characters.")}
        // if (this.data.regNumber.length > 30) {this.errors.push("Registration number cannot exceed 30 characters.")}
        if (this.data.dob == "") {
          this.errors.push("You must provide your date of birth.")
        }
      }

      if (this.data.username == "") {
        this.errors.push("You must provide a username.")
      }
      if (this.data.email == "") {
        this.data.email = "Not given"
      }
      if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push("Username must be at least 3 characters.")
      }
      if (this.data.username.length > 30) {
        this.errors.push("Username cannot exceed 30 characters.")
      }

      if (this.data.address == "") {
        this.errors.push("You must provide your address.")
      }
      if (this.data.battingStyle == "") {
        this.errors.push("You must provide your batting style")
      }
      if (this.data.bowlingStyle == "") {
        this.errors.push("You must provide your bowling style.")
      }
      if (this.data.phone == "") {
        this.errors.push("You must provide a phone number.")
      }
      if (this.data.address.length > 50) {
        this.errors.push("address cannot exceed 50 characters.")
      }
      if (this.data.dob.length > 10) {
        this.errors.push("DOB cannot exceed 10 characters.")
      }
      if (this.data.phone.length > 12) {
        this.errors.push("phone number cannot exceed 12 characters.")
      }

      if (!this.userRegNumber && this.data.regNumber.length > 9 && this.data.regNumber.length < 31 && validator.isAlphanumeric(this.data.regNumber)) {
        let regNumberExists1 = await adminCollection.findOne({ regNumber: this.data.regNumber })
        let regNumberExists2 = await teacherCollection.findOne({ regNumber: this.data.regNumber })
        let regNumberExists3 = await studentCollection.findOne({ regNumber: this.data.regNumber })
        let regNumberExists4 = await matchControllerCollection.findOne({ regNumber: this.data.regNumber })
        if (regNumberExists1 || regNumberExists2 || regNumberExists3 || regNumberExists4) {
          this.errors.push("That Registration number is already taken.")
        }
      }

      resolve()
    } catch {
      reject()
    }
  })
}

Student.prototype.studentLogin = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    studentCollection
      .findOne({ regNumber: this.data.regNumber })
      .then(attemptedUser => {
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
          this.data = attemptedUser

          resolve("Congrats!")
        } else {
          reject("Invalid registration number / password.")
        }
      })
      .catch(function () {
        reject("Please try again later.")
      })
  })
}

Student.prototype.studentRegister = function () {
  return new Promise(async (resolve, reject) => {
    try {
      // Step #1: Validate user data
      this.dateFormat()
      await this.cleanUp()
      await this.validate()

      // Step #2: Only if there are no validation errors
      // then save the user data into a database
      if (!this.errors.length) {
        // hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        await studentCollection.insertOne(this.data)
        await this.performance.createTable()
        //updating the serial number for next regNumber
        await upcomingMatchCollection.findOneAndUpdate({ _id: new ObjectID("5f42cb6940aeb37c78341d74") }, { $set: { serialNumber: this.serialNumber } })
        resolve(this.data.regNumber)
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Student.prototype.updateGroup = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof this.data.group != "string") {
        this.data.group = ""
      }
      if (this.data.group == "") {
        this.errors.push("You must provide group.")
      }
      if (this.data.regNumber.length > 9 && this.data.regNumber.length < 31 && validator.isAlphanumeric(this.data.regNumber)) {
        let present = await studentCollection.findOne({ regNumber: this.data.regNumber })
        if (!present) {
          this.errors.push("You have entered a wrong registration number!!")
        }
      }
      if (!this.errors.length) {
        await studentCollection.findOneAndUpdate({ regNumber: this.data.regNumber }, { $set: { group: this.data.group } })
        resolve()
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Student.prototype.updatePaymentDate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof this.data.paymentTill != "string") {
        this.data.paymentTill = ""
      }
      if (this.data.paymentTill == "") {
        this.errors.push("You must provide date.")
      }
      this.dateFormat()
      if (this.data.regNumber.length > 9 && this.data.regNumber.length < 31 && validator.isAlphanumeric(this.data.regNumber)) {
        let present = await studentCollection.findOne({ regNumber: this.data.regNumber })
        if (!present) {
          this.errors.push("You have entered a wrong registration number!!")
        }
      }
      if (!this.errors.length) {
        await studentCollection.findOneAndUpdate({ regNumber: this.data.regNumber }, { $set: { paymentTill: this.data.paymentTill } })
        resolve()
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Student.findByregNumber = function (regNumber) {
  return new Promise(function (resolve, reject) {
    if (typeof regNumber != "string") {
      reject()
      return
    }
    studentCollection
      .findOne({ regNumber: regNumber })
      .then(function (userDocument) {
        if (userDocument) {
          userDocument = {
            regNumber: userDocument.regNumber,
            group: userDocument.group,
            username: userDocument.username,
            dob: userDocument.dob,
            battingStyle: userDocument.battingStyle,
            bowlingStyle: userDocument.bowlingStyle,
            address: userDocument.address,
            email: userDocument.email,
            phone: userDocument.phone,
            paymentTill: userDocument.paymentTill
          }
          resolve(userDocument)
        } else {
          reject()
        }
      })
      .catch(function () {
        reject()
      })
  })
}

Student.prototype.updateProfile = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let owner = await Student.findUserProfile(this.userRegNumber, this.updateRegNumber)
      console.log("Last:", owner)
      if (owner) {
        console.log("executed.......")
        // actually update the db
        let status = await this.actuallyUpdate()
        console.log("status:", status)
        resolve(status)
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}
Student.prototype.actuallyUpdate = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("executed.......2")
      await this.cleanUp()
      await this.validate()
      console.log("Errors: ", this.errors)
      if (!this.errors.length) {
        await studentCollection.findOneAndUpdate(
          { regNumber: this.userRegNumber },
          {
            $set: {
              username: this.data.username,
              address: this.data.address,
              battingStyle: this.data.battingStyle,
              bowlingStyle: this.data.bowlingStyle,
              phone: this.data.phone,
              email: this.data.email
            }
          }
        )
        resolve("success")
      } else {
        resolve(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Student.findUserProfile = function (userReg, updateReg) {
  return new Promise(function (resolve, reject) {
    if (typeof updateReg != "string") {
      reject()
      return
    }
    if (userReg == updateReg) {
      Owner = true
      console.log(Owner)
      resolve(Owner)
    } else {
      reject()
    }
  })
}

Student.deleteProfile = function (profileRegToDelete) {
  return new Promise(async (resolve, reject) => {
    try {
      let student = await studentCollection.findOne({ regNumber: profileRegToDelete })
      if (student) {
        await studentCollection.deleteOne({ regNumber: profileRegToDelete })
        resolve()
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}

Student.getStatistics = async function () {
  try {
    let allStudents = await studentCollection.find().toArray()
    allStudents = allStudents.map(doc => {
      return doc.regNumber
    })

    return Student.getAllData([{ $match: { regNumber: { $in: allStudents } } }])
  } catch {
    reject()
  }
}

Student.getAllData = function (uniqueOperations) {
  return new Promise(async function (resolve, reject) {
    try {
      let aggOperations = uniqueOperations.concat([
        { $lookup: { from: "performanceTable", localField: "regNumber", foreignField: "regNumber", as: "statistics" } },
        {
          $project: {
            regNumber: 1,
            username: 1,
            gender: 1,
            battingStyle: 1,
            bowlingStyle: 1,
            dob: 1,
            group: 1,
            statistics: { $arrayElemAt: ["$statistics", 0] }
          }
        }
      ])
      let allData = await studentCollection.aggregate(aggOperations).toArray()

      allData = allData.map(function (data) {
        data.statistics = {
          matches: data.statistics.matches,
          batting: {
            innings: data.statistics.batting.innings,
            runs: data.statistics.batting.runs,
            balls: data.statistics.batting.balls,
            hightRun: data.statistics.batting.hightRun
          },
          bowling: {
            innings: data.statistics.bowling.innings,
            runs: data.statistics.bowling.runs,
            overs: data.statistics.bowling.overs,
            wickets: data.statistics.bowling.wickets
          }
        }
        return data
      })

      console.log("All data here : ", allData)

      resolve(allData)
    } catch {
      reject()
    }
  })
}

module.exports = Student
