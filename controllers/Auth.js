//SendOTPController
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
require("dotenv").config();

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const checkUserPresent = await User.findOne({ email: email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exists",
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ otp: otp });
        while (result) {
            //generate new otp
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            //check unique otp
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = {
            otp: otp,
            email: email,
        };
        const otpBody = await OTP.create(otpPayload);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otpBody,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const signUp=async(req,res)=>{
    //fetch data,vakidate,2 password match,check user exist or not,
    //find most recent otp stored for the user validate otp hash password
    //create entry in DB, return response
    try{
        const {email,password,firstname,lastname,
            confirmPassword,accountType,
            contactNumber,otp
        }=req.body;
        if(!firstname || !lastname||!email||!password||!confirmPassword||!otp){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password do not match",
            })
        }
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists",
            })
        }
        const mostRecentOtp=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        if(!mostRecentOtp && mostRecentOtp.length===0){
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        }
        else if(otp != mostRecentOtp.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const profileDetails= await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        });
        const user=await User.create({
            email,
            password:hashedPassword,
            firstname,
            lastname,
            accountType,
            contactNumber,
            additionalDetails:profileDetails._id,
            image:'https://api.dicebear.com/7.x/avataaars/svg?seed='+firstname+lastname
        })
        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            user,
        })
      
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
        })
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findOne({ email }).populate("additionalDetails");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );
            user.password=undefined;
            user.token=token;

            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options);
            return res.status(200).json({
                success:true,
                message:"User logged in successfully",
                user,
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Incorrect password",
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.changePassword=async(req,res)=>{
    try{
        const {email,password,confirmPassword}=req.body;
        if(!email || !password || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password do not match",
            })
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found",
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        user.password=hashedPassword;
        await user.save();
        return res.status(200).json({
            success:true,
            message:"Password changed successfully",
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
        })
    }
};



module.exports = { sendOTP };
module.exports={signUp};
module.exports={login};
