const bcrypt = require("bcryptjs")
const RegistrationNumber = require("./RegistrationNumber")
const upcomingMatchCollection = require("../db").db().collection("upcomingMatch")
const teacherCollection = require("../db").db().collection("teacher")
const studentCollection = require("../db").db().collection("student")
const adminCollection = require("../db").db().collection("admin")
const matchControllerCollection = require("../db").db().collection("matchController")
const validator = require("validator")
const ObjectID = require("mongodb").ObjectID

let Teacher = function (data, userRegNumber, updateRegNumber) {
  this.data = data
  this.errors = []
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
Teacher.prototype.cleanUp = async function () {
  try {
    let registrationNumber = new RegistrationNumber("te")
    let regNumber = await registrationNumber.getRegNumber()
    this.serialNumber = Number(regNumber.slice(7))
    console.log("serial number:", this.serialNumber)

    if (typeof this.data.username != "string") {
      this.data.username = ""
    }
    if (typeof this.data.address != "string") {
      this.data.address = ""
    }
    if (typeof this.data.phone != "string") {
      this.data.phone = ""
    }
    if (typeof this.data.experiences != "string") {
      this.data.experiences = ""
    }
    if (typeof this.data.role != "string") {
      this.data.role = ""
    }
    if (typeof this.data.email != "string") {
      this.data.email = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    this.data = {
      regNumber: regNumber.trim().toLowerCase(),
      username: this.data.username.trim().toLowerCase(),
      address: this.data.address.trim().toLowerCase(),
      phone: this.data.phone.trim().toLowerCase(),
      experiences: this.data.experiences.trim().toLowerCase(),
      role: this.data.role.trim().toLowerCase(),
      email: this.data.email.trim().toLowerCase(),
      password: this.data.password
    }
  } catch {
    res.render("404")
  }
}

Teacher.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (!this.userRegNumber) {
        if (this.data.regNumber == "") {
          this.errors.push("You must provide a registration number.")
        }
        if (this.data.regNumber != "" && !validator.isAlphanumeric(this.data.regNumber)) {
          this.errors.push("Registration number can only contain letters and numbers.")
        }
        if (this.data.password == "") {
          this.errors.push("You must provide a password.")
        }
        if (this.data.password.length > 0 && this.data.password.length < 12) {
          this.errors.push("Password must be at least 12 characters.")
        }
        if (this.data.password.length > 50) {
          this.errors.push("Password cannot exceed 50 characters.")
        }
        if (this.data.regNumber.length > 0 && this.data.regNumber.length < 9) {
          this.errors.push("Registration number must be at least 9 characters.")
        }
        if (this.data.regNumber.length > 30) {
          this.errors.push("Registration number cannot exceed 30 characters.")
        }
      }
      if (this.data.experiences == "") {
        this.errors.push("You must provide a username.")
      }
      if (this.data.role == "") {
        this.errors.push("You must provide a username.")
      }
      if (this.data.username == "") {
        this.errors.push("You must provide a username.")
      }
      if (this.data.address == "") {
        this.errors.push("You must provide a address.")
      }
      if (this.data.phone == "") {
        this.errors.push("You must provide phone number.")
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

Teacher.prototype.teacherLogin = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    teacherCollection
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

Teacher.prototype.teacherRegister = function () {
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
        await teacherCollection.insertOne(this.data)
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

Teacher.findByregNumber = function (regNumber) {
  return new Promise(function (resolve, reject) {
    if (typeof regNumber != "string") {
      reject()
      return
    }
    teacherCollection
      .findOne({ regNumber: regNumber })
      .then(function (userDocument) {
        if (userDocument) {
          userDocument = {
            regNumber: userDocument.regNumber,
            username: userDocument.username,
            address: userDocument.address,
            email: userDocument.email,
            experiences: userDocument.experiences,
            role: userDocument.role,
            phone: userDocument.phone
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

Teacher.prototype.updateProfile = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let owner = await Teacher.findUserProfile(this.userRegNumber, this.updateRegNumber)
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
Teacher.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("executed.......2")
      this.cleanUp()
      this.validate()
      console.log("Errors: ", this.errors)
      if (!this.errors.length) {
        await teacherCollection.findOneAndUpdate(
          { regNumber: this.userRegNumber },
          {
            $set: {
              username: this.data.username,
              address: this.data.address,
              phone: this.data.phone,
              experiences: this.data.experiences,
              role: this.data.role,
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

Teacher.findUserProfile = function (userReg, updateReg) {
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

Teacher.deleteProfile = function (profileRegToDelete) {
  return new Promise(async (resolve, reject) => {
    try {
      let teacher = await teacherCollection.findOne({ regNumber: profileRegToDelete })
      if (teacher) {
        await teacherCollection.deleteOne({ regNumber: profileRegToDelete })
        resolve()
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}

module.exports = Teacher
