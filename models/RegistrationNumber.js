const upcomingMatchCollection = require("../db").db().collection("upcomingMatch")
const ObjectID = require("mongodb").ObjectID

let RegistrationNumber = function (from) {
  let cca = "cca"
  let memberAs = cca.concat(from)

  function sort_year(dt) {
    return ("" + dt.getFullYear()).substr(2)
  }

  let dt = new Date()
  this.firstPart = sort_year(dt).concat(memberAs)
  //here i have to take the serial number from the database table as serialNumber
}
RegistrationNumber.prototype.getRegNumber = async function () {
  try {
    let data = await upcomingMatchCollection.findOne({ _id: new ObjectID("5f42cb6940aeb37c78341d74") })

    let serialNumber = data.serialNumber + 1
    let number = serialNumber.toString()
    let digit = number.length
    let regNumber
    if (digit == 1) {
      let onedigit = "000".concat(number)
      regNumber = this.firstPart.concat(onedigit)
    } else if (digit == 2) {
      let twodigit = "00".concat(number)
      regNumber = this.firstPart.concat(twodigit)
    } else if (digit == 3) {
      let threedigit = "0".concat(number)
      regNumber = this.firstPart.concat(threedigit)
    } else {
      regNumber = this.firstPart.concat(number)
    }

    return regNumber
  } catch {
    res.render("404")
  }
}
module.exports = RegistrationNumber
