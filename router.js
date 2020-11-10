const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const matchController = require("./controllers/matchController")
const adminController = require("./controllers/adminController")
const postController = require("./controllers/postController")
const teacherController = require("./controllers/teacherController")
const studentController = require("./controllers/studentController")
const matchDetailsController = require("./controllers/matchDetailsController")
const upcomingMatchController = require("./controllers/upcomingMatchController")
const passwordController = require("./controllers/passwordController")

// user related routes
router.get("/", userController.home)
router.get("/coaches", userController.coaches)
router.get("/students", userController.performance, userController.students)
router.get("/matches", userController.matches)
router.get("/admition", userController.admition)
router.get("/about-us", userController.aboutUs)

//Admin related routes
router.get("/admin-home", userController.adminHome)
router.post("/adminLogin", adminController.adminLogin)
router.post("/adminRegister", adminController.adminMustBeLoggedIn, adminController.adminRegister)
router.post("/teacherRegister", adminController.adminMustBeLoggedIn, teacherController.teacherRegister)
router.post("/studentRegister", adminController.adminMustBeLoggedIn, studentController.studentRegister)
router.post("/matchControllerRegister", adminController.adminMustBeLoggedIn, matchController.matchControllerRegister)
router.post("/updatePayment", adminController.adminMustBeLoggedIn, studentController.updatePaymentDate)
router.post("/updateNotice", adminController.adminMustBeLoggedIn, upcomingMatchController.updateNotice)
router.post("/profilePictureUpload", adminController.adminMustBeLoggedIn, adminController.uploadProfilePicture)
router.post("/slidePictureUpload", adminController.adminMustBeLoggedIn, adminController.uploadSlidePicture)
router.post("/deleteProfile", adminController.adminMustBeLoggedIn, adminController.deleteProfile)

//Match controller related routes
router.get("/matchController-home", userController.matchControllerHome)
router.post("/matchControllerLogin", matchController.matchControllerLogin)
router.post("/updateScore", matchController.scorerMustBeLoggedIn, matchController.updateScore)
router.post("/matchShortDetails", matchController.scorerMustBeLoggedIn, matchDetailsController.addDetails)

//Student related routes
router.post("/studentLogin", studentController.studentLogin)
router.get("/student-home", studentController.studentMustBeLoggedIn, userController.birthday, userController.getPosts, userController.studentHome)
router.get("/studentProfile/:regNumber", userController.userMustBeLoggedIn, studentController.ifStudentExists, studentController.getStudentProfileData)
router.get("/student/profile/:regNumber/edit", studentController.studentMustBeLoggedIn, studentController.ifStudentExists, studentController.getStudentEditPage)
router.post("/student/profile/:regNumber/edit", studentController.studentMustBeLoggedIn, studentController.studentEditProfile)
router.post("/changePassword", userController.userMustBeLoggedIn, passwordController.changePassword)

//Teacher related routes
router.get("/teacher-home", teacherController.teacherMustBeLoggedIn, userController.groups, userController.birthday, userController.getPosts, userController.teacherHome)
router.post("/teacherLogin", teacherController.teacherLogin)
router.get("/teacherProfile/:regNumber", userController.userMustBeLoggedIn, teacherController.ifTeacherExists, teacherController.getTeacherProfileData)
router.post("/upcomingMatch", teacherController.teacherMustBeLoggedIn, upcomingMatchController.updateDetails)
router.post("/changeGroup", teacherController.teacherMustBeLoggedIn, studentController.changeGroup)
router.get("/teacher/profile/:regNumber/edit", teacherController.teacherMustBeLoggedIn, teacherController.ifTeacherExists, teacherController.getTeacherEditPage)
router.post("/teacher/profile/:regNumber/edit", teacherController.teacherMustBeLoggedIn, teacherController.teacherEditProfile)
router.post("/eligiblePlayers", teacherController.teacherMustBeLoggedIn, userController.performance, teacherController.getPlayers)

//post related routes
router.post("/post-create", userController.userMustBeLoggedIn, postController.postCreate)
router.post("/like/:postId", userController.userMustBeLoggedIn, postController.ifPostExists, postController.like)
router.post("/disLike/:postId", userController.userMustBeLoggedIn, postController.ifPostExists, postController.disLike)
router.post("/comment/:postId/post", userController.userMustBeLoggedIn, postController.ifPostExists, postController.commentOnPost)
router.post("/post/:postId/delete", userController.userMustBeLoggedIn, postController.ifPostExists, postController.delete)

//Logging out router
router.post("/logout", userController.logout)

module.exports = router
