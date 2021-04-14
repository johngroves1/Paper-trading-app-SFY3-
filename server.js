const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require("path");

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));

app.use(
    session({
        secret: 'secret',

        resave: false,

        saveUninitialized: false
    })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

//app.use("/users/chart", chart)

app.get('/', (req, res)=>{
    res.render('index');
});

app.get('/users/register', checkAuthenticated, (req, res) => {
    res.render("register");
});

app.get('/users/login', checkAuthenticated,  (req, res) => {
    res.render("login");
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.name, test: req.user.id });
});

app.get('/users/chart', checkNotAuthenticated, (req, res) => {
    res.render("chart", { user: req.user.name, test: req.user.id });
});

app.get("/users/javascript", (req, res) => {
    res.sendFile(path.join(__dirname, "/chart.js"));
});

app.get("/users/style", (req, res) => {
    res.sendFile(path.join(__dirname, "/style.css"));
});

app.get("/users/style", (req, res) => {
    res.sendFile(path.join(__dirname, "/style.css"));
});

app.get("/users/images", (req, res) => {
    res.sendFile(path.join(__dirname, "/images/stock.jpg"));
});

app.get('/users/chart', (req, res) => {
    res.render("chart");
});

app.get('/users/assets', checkNotAuthenticated, (req, res) => {
    

    pool.query(
        `SELECT * FROM wallet
        WHERE id = 6`, (err, results) => {
            console.log(results.rows);
            //res.render("assets", { btc: results.bitcoin});
            //console.log(results.rows[0]);
            //console.log(results.rows[0].bitcoin);
            res.render("assets", { user: req.user.name, test: req.user.id, email: req.user.email,  btc: results.rows[0].bitcoin, 
            eth: results.rows[0].ethereum, xrp: results.rows[0].xrp});
            //res.render("assets", { btc: results.rows[0].bitcoin})
          }     
    );
});

app.get('/users/logout', (req, res)=>{
    req.logOut();
    req.flash('sucess_msg', "You have logged out");
    res.redirect('/users/login');
});

app.post('/users/register', async (req, res)=>{
    let { name, email, password, password2} = req.body;


    let errors = [];

    // Validation checks
    if (!name || !email || !password || !password2){
        errors.push({ message: "Please enter all fields" });
    }

    if(password.length < 6){
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if(password != password2){
        errors.push({ message: "Passwords do not match"});
    }

    // Checks form validation
    if(errors.length > 0 ){
        res.render('register', { errors });
    }else{
        // Form validation has passed

        // Using bycrpt to encrypt password
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        // Check to see if user already exists
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results)=>{
                if(err){
                    throw err
                }
                console.log(results.rows);

                if(results.rows.length > 0){
                    errors.push({ message: "Email already registed"});
                    res.render('register', { errors });
                }else{
                    // If user does not exist insert data to DB
                    pool.query(
                        `INSERT INTO users (name, email, password)
                        VALUES ($1, $2, $3)
                        RETURNING id, password`, [name, email, hashedPassword], (err, results)=>{
                            if (err){
                                throw err
                            }
                            console.log(results.rows);
                            req.flash('success_msg', "You are now registered. Please log in");
                            res.redirect('/users/login');
                        }
                    )
                }
            }
        );
    }

});

app.post('/users/login', 
    passport.authenticate('local', {
        successRedirect: '/users/dashboard', // Successfully logged in
        failureRedirect: '/users/login', // If failed redirect to login page
        failureFlash: true // Displays flash messages 
    })
);

app.post('/users/chart', (req, res) => {
    //let {bitcoin} = req.body;
    console.log(req.body.id);
    console.log(req.body.bitcoin);
    //res.redirect('/users/chart');

    pool.query(
        `SELECT * FROM WALLET
        WHERE id = $1`, [req.body.id], (err, results) => {
        if (err) {
            throw err
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
            pool.query(
                `UPDATE wallet SET bitcoin = bitcoin + $1
                    WHERE id =$2`, [req.body.bitcoin, req.body.id], (err, results) => {
                if (err) {
                    throw err
                }
                console.log(results.rows);
               // req.flash('success_msg', "You are now registered. Please log in");
                //res.redirect('/users/chart');
            }
            )
        } else {
            // If wallet does not exist insert data to DB
            pool.query(
                `INSERT INTO wallet (id, bitcoin) VALUES ($2, $1)`, [req.body.bitcoin, req.body.id], (err, results) => {
                if (err) {
                    throw err
                }
                console.log(results.rows);
                //req.flash('success_msg', "You are now registered. Please log in");
                
            }
            )


        }
    })
    res.redirect('/users/chart');

})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/users/login');
}


app.listen(PORT, ()=>{
    console.log(`App listening at http://localhost:${PORT}`);
});