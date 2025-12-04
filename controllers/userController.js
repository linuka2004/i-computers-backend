import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";


dotenv.config();
//create user
export function createUser(req,res){

    const data = req.body

    const hashedPassword = bcrypt.hashSync(data.password, 10)

    const user = new User({
        email : data.email,
        firstName : data.firstName,
        lastName : data.lastName,
        password : hashedPassword,
    })

    user.save().then(
        ()=>{
            res.json({
                message: "User created successfully"
            })
        }
    )
}

export function loginUser(req, res) {
	const email = req.body.email;
	const password = req.body.password;



	User.find({ email: email }).then((users) => {
		if (users[0] == null) {
				res.status(404).json({
				message: "User not found",
				}
			);
			
		} else {
			const user = users[0];

			const isPasswordCorrect = bcrypt.compareSync(password, user.password);

			if (isPasswordCorrect) {
				const payload = {
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					isEmailVerified: user.isEmailVerified,
					image: user.image,
				};

				const token = jwt.sign(payload, process.env.JWT_SECRET, {
					expiresIn: "150h",
				});

				res.json({
					message: "Login successful",
					token: token,
          role:user.role,
				});
			} else {
				res.status(401).json({
					message: "Invalid password",
				});
			}
		}
	});
}
//below part has an error
// export function loginUser(req,res){

//     const email = req.body.email
//     const password = req.body.password

//     User.find({email : email}).then(
//         (users)=>{
//             if(users[0] == null){
//                 res.json({
//                     message: "User not found"
//                 })
//             }else{
//                 const user = users[0];
                
//                 /*if(user.invalidTries > 3){
//                     res.json({
//                         message: "Your account is temporarily locked due to multiple failed login attempts"
//                     });
//                     return;
//                 }*/

//                 const isPasswordCorrect = bcrypt.compareSync(password,user.password)


//                 if(isPasswordCorrect){

                    
//                 const payload = {
//                     email: user.email,
//                     firstName : user.firstName,
//                     lastName : user.lastName,
//                     role : user.role,
//                     isEmailVerified : user.isEmailVerified,
//                     image : user.image
//                 };

//                 const token = jwt.sign(payload,process.env.JWT_SECRET,{
//                     expiresIn: "150h"
//                 })

//                     res.json({
//                         message: "Login successful",
//                         token : token,
//                         role : user.role,
//                     })
//                 }else{
//                     /*User.updateOne({email:email},{
//                         invalidTries: user.invalidTries + 1
//                     }).then(()=>{
//                         res.json({
//                         message: "Invalid password",
//                     })})*/
//                    res.status(401).json({
//                     message : "Invalid password"
//                    })

                    
//                 }
//             }
//         }
//     )
// } 

export function isAdmin(req){
  if(req.user == null){
    return false;
  }
  if(req.user.role != "admin"){
    return false;
  }

  return true;
}

export function getUser(req,res){ //get user info 		
	if(req.user == null){
		res.status(401).json({
			message: "Unauthorized"
		})
		return;
	}
	res.json(req.user)
}

export async function googleLogin(req,res){
    console.log(req.body.token)
		try{
			const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{ 
				headers : {
					Authorization : `Bearer ${req.body.token}`
				}
			})

			console.log(response.data)

			const user= await User.findOne({ email : response.data.email})
			if(user==null){
				const hashedPassword = bcrypt.hashSync(data.password, 10)

				const newUser = new User({
					email : response.data.email,
					firstName : response.data.given_name,
					lastName : response.data.family_name,
					isEmailVerified : response.data.email_verified,
					image : response.data.picture,
					password : "123", // this can't be found anywhere
				})
				await newUser.save();

				const payload = {
					email: newUser.email,
					firstName: newUser.firstName,
					lastName: newUser.lastName,
					role: newUser.role,
					isEmailVerified: true,
					image: newUser.image,
				};

				const token = jwt.sign(payload, process.env.JWT_SECRET, {
					expiresIn: "150h",
				});

				res.json({
					message: "Login successful",
					token: token,
          role:newUser.role,
				});


			}else{
				const payload = {
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					isEmailVerified: user.isEmailVerified,
					image: user.image,
				};

				const token = jwt.sign(payload, process.env.JWT_SECRET, {
					expiresIn: "150h",
				});

				res.json({
					message: "Login successful",
					token: token,
          role:user.role,
				});
				
			}

		}catch(error){
			res.status(500).json({
				message : "Google login failed",
				error : error.message,
			})
		}
    
}