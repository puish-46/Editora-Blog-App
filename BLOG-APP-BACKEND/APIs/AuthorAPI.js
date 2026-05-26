import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { ArticleModel } from '../models/ArticleModel.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { upload } from '../config/multer.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import { generateBlogSummary } from '../services/aiService.js'
import { calculateReadTime } from '../utils/readTimeHelper.js'

export const authorApp=exp.Router()

// upload editor image
authorApp.post("/upload-image", verifyToken("AUTHOR"), upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({ 
      url: result.secure_url,
      message: "Image uploaded successfully" 
    });
  } catch (err) {
    next(err);
  }
});


//write articles
authorApp.post("/article",verifyToken("AUTHOR"),async(req,res)=>{
    //get articleobj from client
    const articleobj=req.body
    //check author
    let author=await UserModel.findById(articleobj.author)
    if(!author){
        return res.status(403).json({message:"Invalid author"})
    }
    if(author.email!==req.user.email){
        return res.status(403).json({message:"YOU are not authorized"})
    }
    // Calculate estimated read time based on word count
    articleobj.readTime = calculateReadTime(articleobj.content);

    //create article document
    const articleDoc=new ArticleModel(articleobj)
    //save
    await articleDoc.save()
    //send res
    res.status(201).json({message:"Article published successfully"})
})


//read own articles
authorApp.get("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //read article by author email
    const authoridOfToken=req.user?.id
    const articleList=await ArticleModel.find({author:authoridOfToken})
    res.status(200).json({message:"All articles",payload:articleList})
})


//edit article
authorApp.put("/article",verifyToken("AUTHOR"),async(req,res)=>{
    //get author id from decoded token
    const authoridOfToken=req.user?.id
    //get modified article from client
    const {articleId,title,category,content,tags,aiSummary,previewText,seoDescription}=req.body
    
    // Recalculate readTime based on updated content
    const readTime = calculateReadTime(content);

    const modifiedarticle=await ArticleModel.findOneAndUpdate(
      {_id:articleId,author:authoridOfToken},
      {$set:{title,category,content,tags,aiSummary,previewText,seoDescription,readTime}},
      {returnDocument: "after"}
    )
    //if either article id or author not correct
    if(!modifiedarticle){
        return res.status(403).json({message:"not authorized to edit article"})
    }
    //send res
    res.status(200).json({message:"Article modified",payload:modifiedarticle})
})


//delete article(soft delete)
authorApp.patch("/article",verifyToken("AUTHOR"),async(req,res)=>{
    //get author id from decoded token
    const authoridOfToken=req.user?.id
    //get modified article from client
    const {articleId,isArticleActive}=req.body
    //get article by id
    const articleOfDB=await ArticleModel.findOne({_id:articleId,author:authoridOfToken})
    //chech status
    if(isArticleActive==articleOfDB.isArticleActive){
        return res.status(200).json({message:"Article already in the same state"})
    }
    articleOfDB.isArticleActive=isArticleActive
    await articleOfDB.save()
    //send res
    res.status(200).json({message:"artical modified",payload:articleOfDB})
})

// POST generate AI summary from article content
authorApp.post("/article/generate-summary", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length < 20) {
      return res.status(400).json({ message: "Content must be at least 20 characters to generate an AI summary" });
    }

    const aiData = await generateBlogSummary(content);
    res.status(200).json({ message: "AI summary generated successfully", payload: aiData });
  } catch (err) {
    next(err);
  }
});