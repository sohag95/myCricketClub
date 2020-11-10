const bcrypt = require("bcryptjs")
const RegistrationNumber = require("./RegistrationNumber")
const upcomingMatchCollection = require("../db").db().collection("upcomingMatch")
const teacherCollection = require("../db").db().collection("teacher")
const studentCollection = require("../db").db().collection("student")
const adminCollection = require("../db").db().collection("admin")
const matchControllerCollection = require("../db").db().collection("matchController")
const validator = require("validator")
const md5 = require("md5")
const ObjectID = require("mongodb").ObjectID
const fs = require("fs")

let Admin = function (data) {
  this.data = data
  this.errors = []
}
Admin.prototype.cleanUp = async function () {
  try {
    let registrationNumber = new RegistrationNumber("ad")
    let regNumber = await registrationNumber.getRegNumber()
    this.serialNumber = Number(regNumber.slice(7))
    console.log("serial number:", this.serialNumber)

    if (typeof this.data.username != "string") {
      this.data.username = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    this.data = {
      regNumber: regNumber.trim().toLowerCase(),
      username: this.data.username.trim().toLowerCase(),
      password: this.data.password
    }
  } catch {
    res.render("404")
  }
}
Admin.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (this.data.username == "") {
        this.errors.push("You must provide a username.")
      }
      if (this.data.password == "") {
        this.errors.push("You must provide a password.")
      }

      if (this.data.password.length > 0 && this.data.password.length < 12) {
        this.errors.push("Password must be at least 12 characters.")
      }
      if (this.data.password.length > 20) {
        this.errors.push("Password cannot exceed 20 characters.")
      }
      if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push("Username must be at least 3 characters.")
      }
      if (this.data.username.length > 30) {
        this.errors.push("Username cannot exceed 30 characters.")
      }
      if (this.data.regNumber.length > 0 && this.data.regNumber.length < 9) {
        this.errors.push("Registration number must be at least 9 characters.")
      }
      if (this.data.regNumber.length > 30) {
        this.errors.push("Registration number cannot exceed 30 characters.")
      }
      if (this.data.regNumber.length > 9 && this.data.regNumber.length < 31 && validator.isAlphanumeric(this.data.regNumber)) {
        let regNumberExists1 = await adminCollection.findOne({ regNumber: this.data.regNumber })
        let regNumberExists2 = await teacherCollection.findOne({ regNumber: this.data.regNumber })
        let regNumberExists3 = await studentCollection.findOne({ regNumber: this.data.regNumber })
        let regNumberExists4 = await matchControllerCollection.findOne({ regNumber: this.data.regNumber })
        if (regNumberExists1 || regNumberExists2 || regNumberExists3 || regNumberExists4) {
          this.errors.push("That Registration number is already taken.")
        }
      }

      // Only if email is valid then check to see if it's already taken
      // if (validator.isEmail(this.data.email)) {
      //   let emailExists = await usersCollection.findOne({email: this.data.email})
      //   if (emailExists) {this.errors.push("That email is already being used.")}
      // }
      resolve()
    } catch {
      reject()
    }
  })
}
Admin.prototype.adminLogin = function () {
  return new Promise((resolve, reject) => {
    try {
      this.cleanUp()
      adminCollection
        .findOne({ regNumber: this.data.regNumber })
        .then(attemptedUser => {
          if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
            console.log("Executed!!")
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}
Admin.prototype.adminRegister = function () {
  return new Promise(async (resolve, reject) => {
    try {
      // Step #1: Validate user data
      await this.cleanUp()
      await this.validate()

      // Step #2: Only if there are no validation errors
      // then save the user data into a database
      if (!this.errors.length) {
        // hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        await adminCollection.insertOne(this.data)
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

Admin.prototype.uploadingProfilePicture = function (filePath, file) {
  return new Promise(async (resolve, reject) => {
    try {
      let regNumberExists1 = await adminCollection.findOne({ regNumber: this.data.regNumber })
      let regNumberExists2 = await teacherCollection.findOne({ regNumber: this.data.regNumber })
      let regNumberExists3 = await studentCollection.findOne({ regNumber: this.data.regNumber })
      let regNumberExists4 = await matchControllerCollection.findOne({ regNumber: this.data.regNumber })

      if (regNumberExists1 || regNumberExists2 || regNumberExists3 || regNumberExists4) {
        try {
          if (fs.existsSync(filePath)) {
            //file exists
            try {
              fs.unlinkSync(filePath)
              //file removed
              file.mv(filePath, function (error) {
                if (error) {
                  reject(error)
                } else {
                  resolve("Profile picture successfully updated.")
                }
              })
            } catch (err) {
              reject("there is some problem!!")
            }
          } else {
            file.mv(filePath, function (error) {
              if (error) {
                reject(error)
              } else {
                resolve("Profile picture successfully uploaded.")
              }
            })
          }
        } catch (err) {
          reject("Sorry there is some problem!! Try again later..")
        }
      } else {
        reject("Given registration number is not present on database.Please check the Registration number")
      }
    } catch {
      reject()
    }
  })
}

Admin.uploadingSlidePicture = function (filePath, file, name) {
  return new Promise(async (resolve, reject) => {
    try {
      if (name == "slideNo1" || name == "slideNo2" || name == "slideNo3" || name == "slideNo4" || name == "slideNo5") {
        if (fs.existsSync(filePath)) {
          //file exists
          try {
            fs.unlinkSync(filePath)
            //file removed
            file.mv(filePath, function (error) {
              if (error) {
                reject(error)
              } else {
                resolve("Slide picture successfully updated.")
              }
            })
          } catch (err) {
            reject("there is some problem!!")
          }
        } else {
          file.mv(filePath, function (error) {
            if (error) {
              reject(error)
            } else {
              resolve("Slide picture successfully uploaded.")
            }
          })
        }
      } else {
        reject("You have choosen wrong slide name.")
      }
    } catch (err) {
      reject("Sorry there is some problem!! Try again later..")
    }
  })
}

module.exports = Admin
