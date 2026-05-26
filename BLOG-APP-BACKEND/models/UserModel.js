import { Schema,model } from "mongoose";

const UserSchema=new Schema({
    firstName:{
        type:String,
        required:[true,"First name is required"]
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email already existed"]
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    role:{
        type:String,
        enum:["USER","AUTHOR","ADMIN"],
        required:[true,"{Value} is an Invalid role"]
    },
    profileImageUrl:{
        type:String
    },
    isUserActive:{
        type:Boolean,
        default:true
    },
    bookmarks:{
        type:[Schema.Types.ObjectId],
        ref:"article",
        default:[]
    },
    bio:{
        type:String,
        default:""
    },
    profession:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    },
    website:{
        type:String,
        default:""
    },
    socialLinks:{
        twitter:{ type:String, default:"" },
        github:{ type:String, default:"" },
        linkedin:{ type:String, default:"" }
    }
},{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

//create model
export const UserModel = model("user",UserSchema);
