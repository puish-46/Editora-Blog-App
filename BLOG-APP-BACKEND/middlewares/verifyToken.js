import jwt from 'jsonwebtoken'
import { config } from "dotenv";
const {verify}=jwt
config();

export const verifyToken=(...allowedRoles)=>{
    return (req,res,next)=>{
        try{
    //get token from cookie
    const token=req.cookies?.token;
    //check token existed or not 
    if(!token){
        return res.status(401).json({message:"plz login"})
    }
    //validate token 
        let decodedToken=verify(token,process.env.SECRET_KEY);
        //check the role is same as role in decodedtoken
        if(!allowedRoles.includes(decodedToken.role)){
            return res.status(403).json({message:"You are not authorized"})
        }
        //add decoded token
        req.user=decodedToken;
        next();
    }catch(error){
        res.status(401).json({message:"Invalid token"})
    }
    }
}




