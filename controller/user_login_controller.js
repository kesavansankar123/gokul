// routes/userRoutes.js
const express = require('express');
const User = require('../models/user_Schema');
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const nodemailer =require('nodemailer')
const jwt=require('jsonwebtoken')
const crypto = require("crypto");
const router = express.Router();

const userSchema = Joi.object({
    UserName: Joi.string().min(3).max(30).required(),
    Email: Joi.string().email().required(),
    Password: Joi.string().min(6).max(50).required(),
    RepeatPassword: Joi.string().min(6).max(50).required(),
  });
//   const { UserName, Email, Password, RepeatPassword } = req.body;


// Create a new user
// router.post('/register', async (req, res) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

router.route("/reg").post(async (req, res) => {
   

      const { error } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

    const { UserName, Email, Password, RepeatPassword } = req.body;
    // console.log(UserName,Email,Password)
    const email = await User.findOne({ Email: Email });
    if (!email){  
        if(Password===RepeatPassword){
                        try{
                        //  const { UserName, Email, Password } = req.body;
                        bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(Password, salt, (err, hashedPassword) => {
                            const password = hashedPassword;
                            const newUser = User({ UserName, Password:password, Email });
                            newUser
                            .save()
                            .then(() => res.json("User added success!"))
                            .catch((err) => res.status(400).json("error:" + err));
                        });
                        });
                        } catch(err){
                        res.send("err");
                        }
                    }else{
                        res.json("Password Not Matched!")
                    }
            }else{
                res.json("Email Already Register!")
            }
    });
        
  
router.route("/login").post(async (req, res) => {
    // console.log("req", req.body.email);
    // console.log(loginUsers);
    const {Email, Password } = req.body;

    try {
      var user = await User.findOne ({ Email: Email });
      if (!user) {
          return res.status(400).send("email not register");
      }
      const isValidPassword = await bcrypt.compare(Password, user.Password);
      if (!isValidPassword) {
        return res.send("password incorrect");
      }
  
      res.send("login success!!!");
    } catch (err) {
      res.status(400).json("error:" + err);
    }
   });

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/reset-pass', async (req, res) => {
    const { Email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ Email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999);
        // console.log(otp)

        // Save OTP to user document (consider setting an expiry)
        user.resetpasswordToken = otp.toString(); // Store OTP as a string for consistency
        user.resetpasswordExpires = Date.now() + 5 * 60 * 1000; // 1 minutes from now

        await user.save();
        console.log(user)

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "gokulsankargokulsankar7@gmail.com",
              pass: "pidi gmli njlk kwqv " // Replace with your app password (not your Gmail password)
            },
        });

        // Email message
        const message = {
            from: 'gokulsankargokulsankar7@gmail.com', // Replace with your email
            to: user.Email,
            subject: 'Password Reset Request',
            text: `Your OTP for password reset is: ${otp}. It is valid for 1 hour.`,
        };

        // Send email
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.error(err);
                if (!res.headersSent) {
                    return res.status(500).json({ message: 'Something went wrong, please try again' });
                }
            } else {
                // console.log('Email sent:', info.response);
                if (!res.headersSent) {
                    return res.status(200).json({ message: 'Password reset email sent successfully ' + otp });
                }
            }
        });

    } catch (error) {
        console.error('Error during password reset:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

//  router.post('/reset-pass/:token',async (req, res)=>{
//     const { token } = req.params;
//     const { Password }=req.body;
//     try{
//         const tokenResult= await jwt.verify(
//             token,"gokulsankar"
//         );

//         // res.json({message:'success'});
//         const user= await User.findOne({
//             resetpasswordToken : tokenResult
//         //     // resetpasswordExpires : {  $gt: Date.now() },
//         });

//          if(!user){
//             return res.status(404).json({message:'invalid token'})
//         }

//         const hashPassword= await bcrypt.hash(Password,10);
//         user.Password = hashPassword;  
//         user.resetpasswordToken=null;
//         // user.resetpasswordExpires=null;

//         await user.save();

//         res.json({message:"password reset successfully"})
//     } catch(err){
//         res.json({
//             message:'Errpr'});
//     }
// });

router.post('/reset-pass/:otp', async (req, res) => {
  const { otp } = req.params; // OTP sent as a parameter
  const { Password ,RepeatPassword} = req.body;
  // console.log(otp)

  try {
      // Find user with matching OTP and ensure it hasn't expired
      const user = await User.findOne({ 
      resetpasswordToken : otp,
      resetpasswordExpires: { $gt: Date.now() }, // Ensures OTP is not expired
      });
      console.log(user)

      if (!user) {
          return res.status(404).json({ message: 'Invalid or expired OTP '+ otp });
      }

      if (Password===RepeatPassword){
            
          // Hash the new password
          const hashPassword = await bcrypt.hash(Password, 10);
          user.Password = hashPassword;

          // Clear reset password fields
          user.resetpasswordToken = null;
          user.resetpasswordExpires = null;

          // Save updated user data
          await user.save();

          res.json({ message: "Password reset successfully" });
      }else{
        res.json({ message: "Password Is Mismatch" });  
      }
      } catch (err) {
          console.error("Error resetting password:", err);
          res.status(500).json({ message: 'An error occurred. Please try again.' });
      }
});


module.exports = router;
