const LocalStrategy = require('passport-local').Strategy;
const User = require("../models").users;
const Profile = require("../models").profiles;
const bcrypt = require('bcryptjs');

module.exports = function(passport){

    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({ where: { username: username } })
                 .then(function (user) {
                     if (!user) {
                         return done(null, false, { message: 'User with that Username not found!' });
                     }
                    // match password
                    bcrypt.compare(password,user.password,async(err,isMatch) => { 
                        if(err) throw err;
                        if(isMatch){

                            let foundx = await Profile.findOne({where: {userId: user.id}})
                            if(foundx){
                                return done(null, user);
                            }
                            else{
                                let newProfile = await Profile.build({ userId: user.id})
                                await newProfile.save();                                                            
                                return done(null, user);
                            }

                        }else{
                            return done(null, false,{message:'Wrong password'});
                        }
                    });                     
                 })
                 .catch(err => done(err));
        }
    ));    
    
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
}    