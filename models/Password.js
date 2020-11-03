const bcrypt = require("bcryptjs")
const teacherCollection = require("../db").db().collection("teacher")
const studentCollection = require("../db").db().collection("student")
const adminCollection = require("../db").db().collection("admin")
const matchControllerCollection = require("../db").db().collection("matchController")

let Password = function (data) {
  this.data = data
  this.errors = []
}

Password.prototype.changePassword = function (regNumber) {
  let profileType = regNumber.slice(5, 7)
  return new Promise(async (resolve, reject) => {
    try {
      //cleaning up data
      if (typeof this.data.passwordNew1 != "string") {
        this.data.passwordNew1 = ""
      }
      //validating data
      if (this.data.passwordNew1 == "") {
        this.errors.push("You must provide a password.")
      }
      if (this.data.passwordNew1.length > 0 && this.data.passwordNew1.length < 12) {
        this.errors.push("Password must be at least 12 characters.")
      }
      if (this.data.passwordNew1.length > 50) {
        this.errors.push("Password cannot exceed 50 characters.")
      }
      if (!this.errors.length) {
        if (profileType == "st") {
          let student = await studentCollection.findOne({ regNumber: regNumber })
          if (student && bcrypt.compareSync(this.data.passwordOld, student.password)) {
            this.updatePassword(regNumber)
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          } else {
            this.errors.push("Your old password is not matching!! Try again....")
            reject(this.errors)
          }
        }
        if (profileType == "te") {
          let teacher = await teacherCollection.findOne({ regNumber: regNumber })
          if (teacher && bcrypt.compareSync(this.data.passwordOld, teacher.password)) {
            this.updatePassword(regNumber)
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          } else {
            this.errors.push("Your old password is not matching!! Try again....")
            reject(this.errors)
          }
        }
        if (profileType == "ad") {
          let admin = await adminCollection.findOne({ regNumber: regNumber })
          if (admin && bcrypt.compareSync(this.data.passwordOld, admin.password)) {
            this.updatePassword(regNumber)
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          } else {
            this.errors.push("Your old password is not matching!! Try again....")
            reject(this.errors)
          }
        }
        if (profileType == "mc") {
          let matchController = await matchControllerCollection.findOne({ regNumber: regNumber })
          if (matchController && bcrypt.compareSync(this.data.passwordOld, matchController.password)) {
            this.updatePassword(regNumber)
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          } else {
            this.errors.push("Your old password is not matching!! Try again....")
            reject(this.errors)
          }
        }
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Password.prototype.updatePassword = function (regNumber) {
  let profileType = regNumber.slice(5, 7)
  return new Promise(async (resolve, reject) => {
    try {
      let salt = bcrypt.genSaltSync(10)
      this.data.passwordNew = bcrypt.hashSync(this.data.passwordNew1, salt)
      if (profileType == "st") {
        await studentCollection.findOneAndUpdate(
          { regNumber: regNumber },
          {
            $set: {
              password: this.data.passwordNew
            }
          }
        )
        resolve("success")
      }
      if (profileType == "te") {
        await teacherCollection.findOneAndUpdate(
          { regNumber: regNumber },
          {
            $set: {
              password: this.data.passwordNew
            }
          }
        )
        resolve("success")
      }
      if (profileType == "ad") {
        await adminCollection.findOneAndUpdate(
          { regNumber: regNumber },
          {
            $set: {
              password: this.data.passwordNew
            }
          }
        )
        resolve("success")
      }
      if (profileType == "mc") {
        await matchControllerCollection.findOneAndUpdate(
          { regNumber: regNumber },
          {
            $set: {
              password: this.data.passwordNew
            }
          }
        )
        resolve("success")
      }
    } catch {
      reject()
    }
  })
}

module.exports = Password
