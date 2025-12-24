const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");
//auth
exports.auth=async(req,res,next)=>{
    try {
        const token=req.cookies.token||req.body.token||req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            });
        } //verify the token
        try{
        const decode=await jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode);
        req.user=decode;
        }
        catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });
    }
    next();
}
catch(error){
return res.status(401).json({
    success:false,
    message:"Unauthorized"
})
}
};
exports.isStudent= async(req,res,next)=>{
    try {
        if(req.user.accountType!="Student"){
            return res.status(401).json({
                success:false,
                message:"For students only"
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })

}   
};
exports.isInstructor= async(req,res,next)=>{
    try {
        if(req.user.accountType!="Instructor"){
            return res.status(401).json({
                success:false,
                message:"For instructors only"
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })

}   
};
exports.isAdmin= async(req,res,next)=>{
    try {
        if(req.user.accountType!="Admin"){
            return res.status(401).json({
                success:false,
                message:"for admin only"
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })

}   
};