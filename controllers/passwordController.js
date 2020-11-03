const Password = require("../models/password")

exports.changePassword=function(req,res){
    let profileType=req.regNumber.slice(5,7)
    if(req.body.passwordNew1 == req.body.passwordNew2){
      let password=new Password(req.body)
      password.changePassword(req.regNumber).then(()=>{
        req.flash("success", "You have successfully updated your new password.")
        req.session.save(function() {
            if(profileType=="st"){
                res.redirect("/student-home")
            }
            if(profileType=="ad"){
                res.redirect("/admin-home")
            }
            if(profileType=="te"){
                res.redirect("/teacher-home")
            }
            if(profileType=="mc"){
                res.redirect("/matchController-home")
            }
        })
      }).catch((e)=>{
        req.flash("errors", e)
        req.session.save(function() {
            if(profileType=="st"){
                res.redirect(`/student/profile/${req.regNumber}/edit`)
            }
            if(profileType=="ad"){
                res.redirect("/admin-home")
            }
            if(profileType=="te"){
                res.redirect(`/teacher/profile/${req.regNumber}/edit`)
            }
            if(profileType=="mc"){
                res.redirect("/matchController-home")
            }
          
        })
      })
    }else{
      req.flash("errors", "Your new passwords are not matching.Enter again.....")
      req.session.save(function() {
        if(profileType=="st"){
            res.redirect(`/student/profile/${req.regNumber}/edit`)
        }
        if(profileType=="ad"){
            res.redirect("/admin-home")
        }
        if(profileType=="te"){
            res.redirect(`/teacher/profile/${req.regNumber}/edit`)
        }
        if(profileType=="mc"){
            res.redirect("/matchController-home")
        }
      })
    }
    
  }