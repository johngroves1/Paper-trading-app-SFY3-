const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');

// Passport package locally stores users login details to a cookie
function initialize(passport){
    // Checks if users email and passwords match
    const authenticateUser = (email, password, done)=>{

        pool.query(
            `SELECT * FROM users WHERE email = $1`, [email], 
            (err, results) => {
                if (err){
                    throw err;
                }
                console.log(results.rows);

                // Finds the user in the db
                if (results.rows.length > 0){
                    const user = results.rows[0];

                    // Compares input password of user to stored password in db
                    bcrypt.compare(password, user.password, (err,isMatch)=>{
                        if(err){
                            throw err
                        }
                        // Passwords match
                        if(isMatch){
                            // Return user and store into session cookie of app
                            return done(null, user);
                        // Passwords dont match    
                        }else{
                        
                            return done(null, false, {message: "Password is not correct"});
                        }
                    });
                // Users email does not match    
                }else{
                    return done(null, false, {message: "Email is not registed"});

                }
            }
        );
    }

    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            }, 
            authenticateUser
        )
    );
    // Stores user ID in session cookie
    passport.serializeUser((user, done)=> done(null, user.id));
    
    // Uses user ID to obtain user details from db and store full object into session cookie
    passport.deserializeUser((id, done)=>{
        pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results)=>{
            if(err){
                throw err
            }
            return done(null, results.rows[0]);
        });
    });
}

module.exports = initialize;