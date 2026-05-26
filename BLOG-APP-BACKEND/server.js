import exp from 'express'
import { config } from 'dotenv'
import {connect} from 'mongoose'
import { userApp } from './APIs/UserAPI.js'
import { authorApp } from './APIs/AuthorAPI.js'
import { adminApp } from './APIs/AdminAPI.js'
import { commonApp } from './APIs/CommonAPI.js'
import cookieParser from 'cookie-parser'
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ArticleModel } from './models/ArticleModel.js';

config()
//create exp app
const app=exp()

app.use(cors({origin: ['http://localhost:5173',process.env.FRONTEND_URL],credentials: true}));

// Enforce secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: false
}));

// Apply basic rate limiting to secure against API DDoS/flooding
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again in 15 minutes." }
});
app.use(apiLimiter);

// Cookie parser middleware
app.use(cookieParser())
// Body parser middleware
app.use(exp.json())

// Dynamic Robots.txt serving
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *\nAllow: /\nSitemap: ${process.env.BACKEND_URL || req.protocol + "://" + req.get("host")}/sitemap.xml`);
});

// Dynamic XML Sitemap for SEO crawlers
app.get("/sitemap.xml", async (req, res, next) => {
  try {
    const articles = await ArticleModel.find({ isArticleActive: true }).select("_id updatedAt");
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Add default pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/#categories</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    
    // Add articles dynamically
    articles.forEach(article => {
      xml += `  <url>\n    <loc>${baseUrl}/article/${article._id}</loc>\n    <lastmod>${new Date(article.updatedAt).toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    next(err);
  }
});

//path level middlewares
app.use("/user-api",userApp)
app.use("/author-api",authorApp)
app.use("/admin-api",adminApp)
app.use("/auth",commonApp)

//connect to db
const connectdb=async()=>{
    try{
        await connect(process.env.DB_URL);
        console.log("DB server connected")
        //assgin port
        const port=process.env.PORT || 5000
        app.listen(port,()=>console.log(`server listening port ${port} ...`))
    }catch(err){
        console.log.apply("err in db connect",err)
    }
};

connectdb()

//to handle invalid path middleware
app.use((req,res,next)=>{
    res.status(404).json({message:`path ${req.url} is invalid`})
})


//error handiling middleware
app.use((err, req, res, next) => {
  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Error cause:", err.cause);
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
     const field = Object.keys(keyValue)[0];
     const value = keyValue[field];
     return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }
  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});