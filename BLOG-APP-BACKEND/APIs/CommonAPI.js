import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { hash,compare } from 'bcryptjs'
import { config } from 'dotenv'
import { upload } from '../config/multer.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middlewares/verifyToken.js'
const {sign}=jwt
export const commonApp=exp.Router()
config()

//Route for register
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res) => {
  let cloudinaryResult;
  try {
    let allowedRoles = ["USER", "AUTHOR"];
    //get user from req
    const newUser = req.body;
    console.log(newUser);
    console.log(req.file);

    //check role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    //Upload image to cloudinary from memoryStorage
    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }

    // console.log("cloudinaryResult", cloudinaryResult);
    //add CDN link(secure_url) of image to newUserObj
    newUser.profileImageUrl = cloudinaryResult?.secure_url;

    //run validators manually
    //hash password and replace plain with hashed one
    newUser.password = await hash(newUser.password, 12);

    //create New user document
    const newUserDoc = new UserModel(newUser);

    //save document
    await newUserDoc.save();
    //send res
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log("err is ", err);
    //delete image from cloudinary
    if (cloudinaryResult.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    next(err);
  }
});

commonApp.get("/test", (req,res)=>{
  res.send("Common API working");
});

//route for login
commonApp.post("/login",async(req,res)=>{
    //get user credentials obj from client
    console.log(req.body)
    const {email,password}=req.body;
    //find user by email
    const user=await UserModel.findOne({email:email})
    //if email not exits
    if(!user){
        return res.status(401).json({message:"Invalid email"})
    }
    // block login if admin has deactivated the account
    if (!user.isUserActive) {
      return res.status(403).json({message: "Your account has been deactivated by admin"});
    }
    //compare passwords
    const isMatch=await compare(password,user.password)
    //if password not match
    if(!isMatch){
        return res.status(400).json({message:"Incorrect password"})
    }
    //if password matched then create token
    const signedToken=sign({id:user._id,email:email,role:user.role,firstName:user.firstName,lastName:user.lastName,profileImageUrl:user.profileImageUrl},process.env.SECRET_KEY,{expiresIn:'1h'})
    //before sending res of token , store token in httponly cookie
    res.cookie("token",signedToken,{
        httpOnly:true,
        sameSite:"none",   
        secure:true
    });
    //remove password
    const UserObj=user.toObject()
    delete UserObj.password
    //send res
    res.status(200).json({message:"Login Success",payload:UserObj})
})

commonApp.get("/login-test", (req,res)=>{
  res.send("Login route section loaded");
});

//route for logout
commonApp.get("/logout",(req,res)=>{
    //delete token from cookie storage
    res.clearCookie("token",{
        httponly:true,
        sameSite:"none",
        secure:true
    });
    //send res
    res.status(200).json({message:"Logout Success"})
})

//Page refresh
commonApp.get("/check-auth", verifyToken("USER", "AUTHOR", "ADMIN"), (req, res) => {
  res.status(200).json({
    message: "authenticated",
    payload: req.user,
  });
});

//change password
commonApp.put("/password",verifyToken("USER","AUTHOR","ADMIN"),async(req,res)=>{
    //get password
    const newpassword=req.body
    //check current password and new password are same
    const isMatch=await compare(newpassword,user.password)
    //get current password of user/author/admin

    //check the current password of req and user are not same 
    //hash new password
    user.password=await hash(user.password,12)
    //replace current password of userwith hashed new password

    //save

    //send res
    res.status(200),json({message:"password is changed"})
})