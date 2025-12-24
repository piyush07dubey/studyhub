const mongoose=require('mongoose');
import {mailSender} from '../utils/mailSender'
const OTPSchema=new mongoose.Schema({
  email:{
    type:String,
    required:true
  },
  otp:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now,
    expires:5*60
  },
});
async function sendVerificationMail(email,otp){
  try {
    const mailResponse=await mailSender(email,"Verify your email address",`Your OTP is ${otp}`)
    console.log(mailResponse);
    
  } catch (error) {
    console.log(error.message);
    throw error;
    
  }
}
OTPSchema.pre("save",async function(next){
  await sendVerificationMail(this.email,this.otp)
  next()
})
module.exports=mongoose.model("OTP",OTPSchema)