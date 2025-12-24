const User=require('../models/User');
const mailsender=require('../utils/mailSender');
exports.resetPasswordToken=async(req,res)=>{
    try{
    const email=req.body.email;
    const user=await User.findOne({email});
    if(!user){
        return res.status(400).json({
            success:false,
            message:"User not found"
        })
    }
    //generate token
    const token=crypto.randomUUID();
 
    const updateDetails=await User.findOneAndUpdate({email:email},{token:token,
        resetPasswordExpires:Date.now()+ 5*60*1000
    },
    {
        new:true
    });
       const url=`http://localhost:3000/update-password?${token}`;
       await mailsender(email,"Password Reset Link",
        `password reset link: ${url}`
       );
       return res.status(200).json({
        success:true,
        message:"Password reset link sent successfully"
       })
    }
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}
}
exports.resetPassword=async(req,res)=>{
    try{
        const {password,confirmPassword,token}=req.body;
        if(!password || !confirmPassword || !token){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password do not match"
            })
        }
        const userDetails=await User.findOne({token:token});
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        if(userDetails.resetPasswordExpires<Date.now()){
            return res.status(400).json({
                success:false,
                message:"Password reset link expired"
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const updateDetails=await User.findOneAndUpdate({token:token},{password:hashedPassword},
        {
            new:true
        });
        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}