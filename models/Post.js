const postsCollection = require("../db").db().collection("posts")

const ObjectID = require("mongodb").ObjectID
const sanitizeHTML = require("sanitize-html")
const { post } = require("../router")
const { Timestamp } = require("mongodb")

let Post = function (data, regNumber, postId, userName) {
  this.data = data
  this.errors = []
  this.regNumber = regNumber
  this.postId = postId
  this.author = userName
}

Post.prototype.cleanUp = function () {
  if (typeof this.data.body != "string") {
    this.data.body = ""
  }
  if (typeof this.data.postType != "string") {
    this.data.postType = ""
  }

  if (this.data.postType == "objection") {
    this.data = {
      postType: sanitizeHTML(this.data.postType.trim(), { allowedTags: [], allowedAttributes: {} }),
      regNumber: "anonymususer",
      body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
      comments: [],
      likedBy: [],
      createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
  } else {
    this.data = {
      postType: sanitizeHTML(this.data.postType.trim(), { allowedTags: [], allowedAttributes: {} }),
      regNumber: this.regNumber,
      author: this.author,
      body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
      comments: [],
      likedBy: [],
      createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
  }
  // get rid of any bogus properties
}

Post.prototype.validate = function () {
  if (this.data.body == "") {
    this.errors.push("You must provide post content.")
  }
  if (this.data.postType == "") {
    this.errors.push("You must chooce post type.")
  }
}

Post.prototype.postCreate = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into database
      postsCollection
        .insertOne(this.data)
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
Post.findById = function (postId) {
  return new Promise(function (resolve, reject) {
    if (typeof postId != "string") {
      reject()
      return
    }
    postsCollection
      .findOne({ _id: new ObjectID(postId) })
      .then(function (post) {
        resolve(post)
      })
      .catch(function () {
        reject()
      })
  })
}

Post.prototype.like = function () {
  return new Promise((resolve, reject) => {
    this.likedByCheck()
      .then(() => {
        if (!this.errors.length) {
          let likedBy = {
            regNumber: this.regNumber
          }

          postsCollection
            .updateOne(
              { _id: new ObjectID(this.postId) },
              {
                $push: {
                  likedBy: likedBy
                }
              }
            )
            .then(() => {
              resolve()
            })
            .catch(() => {
              console.log("executed")
              this.errors.push("Please try again later.")
              reject(this.errors)
            })
        } else {
          reject(this.errors)
        }
      })
      .catch(() => {
        console.log("this line is on catch block")
        reject(this.errors)
      })
  })
}

Post.prototype.likedByCheck = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await postsCollection.findOne({ _id: new ObjectID(this.postId) })
      let likedBy = post.likedBy
      console.log("liked by:", likedBy)
      likedBy.forEach(regNumber => {
        if (regNumber.regNumber == this.regNumber) {
          console.log("on check:", regNumber.regNumber, this.regNumber)
          this.present = true
          this.errors.push("You have liked this post already!!")
          resolve()
        }
      })
      resolve()
    } catch {
      reject()
    }
  })
}
Post.prototype.disLike = function () {
  return new Promise((resolve, reject) => {
    this.likedByCheck()
      .then(() => {
        if (this.present) {
          let disLikedBy = {
            regNumber: this.regNumber
          }

          postsCollection
            .updateOne(
              { _id: new ObjectID(this.postId) },
              {
                $pull: {
                  likedBy: disLikedBy
                }
              }
            )
            .then(() => {
              resolve()
            })
            .catch(() => {
              console.log("executed")
              this.errors.push("Please try again later.")
              reject(this.errors)
            })
        } else {
          reject(this.errors)
        }
      })
      .catch(() => {
        console.log("this line is on catch block")
        reject(this.errors)
      })
  })
}
Post.prototype.comment = function () {
  return new Promise((resolve, reject) => {
    if (typeof this.data.comment != "string") {
      this.data.comment = ""
    }
    if (this.data.comment == "") {
      this.errors.push("You must provide a comment.")
    }
    let comment = {
      regNumber: this.regNumber,
      commentBy: this.author,
      comment: this.data.comment,
      createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    if (!this.errors.length) {
      // save post into database
      postsCollection
        .updateOne(
          { _id: new ObjectID(this.postId) },
          {
            $push: {
              comments: comment
            }
          }
        )
        .then(() => {
          resolve()
        })
        .catch(() => {
          console.log("executed")
          this.errors.push("Please try again later.")
          reject(this.errors)
        })
    } else {
      reject(this.errors)
    }
  })
}

Post.prototype.commentOnPost = function () {
  return new Promise((resolve, reject) => {
    this.comment()
      .then(() => {
        resolve()
      })
      .catch(() => {
        reject()
      })
  })
}

Post.delete = function (postIdToDelete, currentUserRegNo) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await postsCollection.findOne({ _id: new ObjectID(postIdToDelete) })
      console.log("executed post:", post, postIdToDelete, currentUserRegNo)
      if (post.regNumber == currentUserRegNo) {
        await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) })
        resolve()
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}

module.exports = Post
