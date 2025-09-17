import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/productRouter.js"


const mongoURI = "mongodb+srv://linuka_j:linuka_j@cluster0.bq49yut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


mongoose.connect(mongoURI).then(
    ()=>{
        console.log("Connected to MongoDB Cluster")
    }
)


const app = express()



app.use(express.json())

app.use(
    (req,res,next)=>{
        
        const authorizationHeader = req.header("Authorization")

        if(authorizationHeader != null){
            const token = authorizationHeader.replace("Bearer ","")

            //console.log(token)

            jwt.verify(token, "secretKey96#2025",
                (error,content)=>{
                    if(content == null){
                        console.log("invalid token")
                        res.json({
                            message:"Invalid token"
                        })

                        return
                    }else{
                        

                        req.user = content
                        
                        next()
                    }

                }
            )


        }else{
            next()
        }
        

    }
)

app.use ("/users",userRouter)
app.use("/products",productRouter)


app.listen(5000 , 
    ()=>{
        console.log("server is running")
    }
)