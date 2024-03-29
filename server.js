const express = require('express');
const app = express();
const app1 = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require("path");
const api = require('binance');
const fetch = require("node-fetch");

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

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

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/users/register', checkAuthenticated, (req, res) => {
    res.render("register");
});

app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render("login");
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.name, test: req.user.id });
});

app.get('/users/btc', checkNotAuthenticated, (req, res) => {
    var checkFilled = "active";
    pool.query(
        `SELECT * FROM wallet
        WHERE id = $1`, [req.user.id], (err, results) => {
        pool.query(
            `SELECT * FROM trades
            WHERE walletid = $1 AND coin = 'btc'`, [results.rows[0].walletid], (err, result) => {
            if (err) {
                throw err
            }

            if (result.rows.length > 0) {
                fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=50000`)
                    .then(result => result.json())
                    .then(data => {
                        const cdata = data.map(d => {
                            return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                        });
                        cdata.forEach(e => {
                            result.rows.forEach(t => {
                                var filled = false;
                                if (e.low <= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitBuy" && t.coin == "btc") {
                                    checkFilled = "filled";
                                    pool.query(
                                        `UPDATE wallet SET bitcoin = bitcoin + $1
                                        WHERE id =$2`, [parseFloat(t.amount), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                        console.log(data.rows);
                                        console.log("yurt");
                                        console.log(checkFilled);
                                    }
                                    )
                                    console.log("ORDER SUCCESFUL")
                                    console.log(parseFloat(t.amountusd) / parseFloat(t.amount));
                                    console.log(t.amount);
                                    filled = true;
                                } else if (e.high >= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitSell" && t.coin == "btc") {
                                    pool.query(
                                        `UPDATE wallet SET usd = usd + $1
                                        WHERE id =$2`, [parseFloat(t.amountusd), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                        checkFilled = "filled";
                                    }
                                    )
                                    filled = true;
                                }
                            });

                        });
                    })
                    .catch(err => console.log(err))
            }
            res.render("btc", {
                user: req.user.name, test: req.user.id, email: req.user.email, btc: results.rows[0].bitcoin,
                eth: results.rows[0].ethereum, xrp: results.rows[0].xrp, usd: Math.round(results.rows[0].usd * 100) / 100, walletid: results.rows[0].walletid, bitcoinWallet: results.rows[0].bitcoin, trades: result.rows, checkTrade: checkFilled
            });
        }
        )
    }
    );
});

app.get('/users/ethereum', checkNotAuthenticated, (req, res) => {
    var checkFilled = "active";
    pool.query(
        `SELECT * FROM wallet
        WHERE id = $1`, [req.user.id], (err, results) => {
        console.log(results.rows);
        pool.query(
            `SELECT * FROM trades
            WHERE walletid = $1 AND coin = 'eth'`, [results.rows[0].walletid], (err, result) => {
            if (err) {
                throw err
            }
            if (result.rows.length > 0) {
                fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1d&limit=50000`)
                    .then(result => result.json())
                    .then(data => {
                        const cdata = data.map(d => {
                            return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                        });

                        cdata.forEach(e => {
                            result.rows.forEach(t => {
                                var filled = false;
                                if (e.low <= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitBuy" && t.coin == "eth") {
                                    checkFilled = "filled";
                                    pool.query(
                                        `UPDATE wallet SET ethereum = ethereum + $1
                                        WHERE id =$2`, [parseFloat(t.amount), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    filled = true;
                                } else if (e.high >= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitSell" && t.coin == "eth") {
                                    pool.query(
                                        `UPDATE wallet SET usd = usd + $1
                                        WHERE id =$2`, [parseFloat(t.amountusd), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                        checkFilled = "filled";
                                    }
                                    )
                                    filled = true;
                                }
                            });

                        });
                    })
                    .catch(err => console.log(err))
            }
            res.render("ethereum", {
                user: req.user.name, test: req.user.id, email: req.user.email, btc: results.rows[0].bitcoin,
                eth: results.rows[0].ethereum, xrp: results.rows[0].xrp, usd: Math.round(results.rows[0].usd * 100) / 100, walletid: results.rows[0].walletid, ethereumWallet: results.rows[0].ethereum, trades: result.rows, checkTrade: checkFilled
            });
        }
        )
    }
    );
});

app.get('/users/xrp', checkNotAuthenticated, (req, res) => {
    var checkFilled = "active";
    pool.query(
        `SELECT * FROM wallet
        WHERE id = $1`, [req.user.id], (err, results) => {
        console.log(results.rows);
        pool.query(
            `SELECT * FROM trades
            WHERE walletid = $1 AND coin = 'xrp'`, [results.rows[0].walletid], (err, result) => {
            if (err) {
                throw err
            }
            if (result.rows.length > 0) {
                fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=XRPUSDT&interval=1d&limit=50000`)
                    .then(result => result.json())
                    .then(data => {
                        const cdata = data.map(d => {
                            return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                        });
                        cdata.forEach(e => {
                            result.rows.forEach(t => {
                                var filled = false;
                                if (e.low <= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitBuy" && t.coin == "xrp") {
                                    checkFilled = "filled";
                                    pool.query(
                                        `UPDATE wallet SET xrp = xrp + $1
                                        WHERE id =$2`, [parseFloat(t.amount), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    filled = true;
                                } else if (e.high >= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitSell" && t.coin == "xrp") {
                                    pool.query(
                                        `UPDATE wallet SET usd = usd + $1
                                        WHERE id =$2`, [parseFloat(t.amountusd), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    filled = true;
                                }
                            });

                        });
                    })
                    .catch(err => console.log(err))
            }

            res.render("xrp", {
                user: req.user.name, test: req.user.id, email: req.user.email, btc: results.rows[0].bitcoin,
                eth: results.rows[0].xrp, xrp: results.rows[0].xrp, usd: Math.round(results.rows[0].usd * 100) / 100, walletid: results.rows[0].walletid, xrpWallet: results.rows[0].xrp, trades: result.rows, checkTrade: checkFilled
            });
        }
        )
    }
    );
});

app.get('/users/bnb', checkNotAuthenticated, (req, res) => {
    var checkFilled = "active";
    pool.query(
        `SELECT * FROM wallet
        WHERE id = $1`, [req.user.id], (err, results) => {
        pool.query(
            `SELECT * FROM trades
            WHERE walletid = $1 AND coin = 'bnb'`, [results.rows[0].walletid], (err, result) => {
            if (err) {
                throw err
            }
            if (result.rows.length > 0) {
                fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BNBUSDT&interval=1d&limit=50000`)
                    .then(result => result.json())
                    .then(data => {
                        const cdata = data.map(d => {
                            return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                        });

                        cdata.forEach(e => {
                            result.rows.forEach(t => {
                                var filled = false;
                                //log(e.high);
                                if (e.low <= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitBuy" && t.coin == "bnb") {
                                    checkFilled = "filled";
                                    pool.query(
                                        `UPDATE wallet SET bnb = bnb + $1
                                        WHERE id =$2`, [parseFloat(t.amount), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    filled = true;
                                } else if (e.high >= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitSell" && t.coin == "bnb") {
                                    pool.query(
                                        `UPDATE wallet SET usd = usd + $1
                                        WHERE id =$2`, [parseFloat(t.amountusd), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                        console.log(data.rows);
                                        console.log("yurt");
                                        checkFilled = "filled";
                                        console.log(checkFilled);
                                    }
                                    )
                                    filled = true;
                                }
                            });

                        });
                    })
                    .catch(err => console.log(err))
            }
            res.render("bnb", {
                user: req.user.name, test: req.user.id, email: req.user.email, btc: results.rows[0].bitcoin,
                eth: results.rows[0].eth, xrp: results.rows[0].xrp, usd: Math.round(results.rows[0].usd * 100) / 100, walletid: results.rows[0].walletid, bnbWallet: results.rows[0].bnb, trades: result.rows, checkTrade: checkFilled
            });
        }
        )
    }
    );
});

app.get('/users/ada', checkNotAuthenticated, (req, res) => {
    var checkFilled = "active";
    pool.query(
        `SELECT * FROM wallet
        WHERE id = $1`, [req.user.id], (err, results) => {
        console.log(results.rows);
        pool.query(
            `SELECT * FROM trades
            WHERE walletid = $1 AND coin = 'ada'`, [results.rows[0].walletid], (err, result) => {
            if (err) {
                throw err
            }
            if (result.rows.length > 0) {
                fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=ADAUSDT&interval=1d&limit=50000`)
                    .then(result => result.json())
                    .then(data => {
                        const cdata = data.map(d => {
                            return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
                        });

                        cdata.forEach(e => {
                            result.rows.forEach(t => {
                                var filled = false;
                                //log(e.high);
                                if (e.low <= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitBuy" && t.coin == "ada") {
                                    checkFilled = "filled";
                                    pool.query(
                                        `UPDATE wallet SET ada = ada + $1
                                        WHERE id =$2`, [parseFloat(t.amount), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    filled = true;
                                } else if (e.high >= (parseFloat(t.amountusd)) / parseFloat(t.amount) && e.time >= t.time && filled == false && t.type == "limitSell" && t.coin == "ada") {
                                    console.log(parseFloat(t.amountusd) + "tits" + e.high)
                                    pool.query(
                                        `UPDATE wallet SET usd = usd + $1
                                        WHERE id =$2`, [parseFloat(t.amountusd), req.user.id], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                    }
                                    )
                                    pool.query(
                                        `DELETE FROM trades WHERE tradeid = $1
                                        RETURNING *`, [t.tradeid], (err, data) => {
                                        if (err) {
                                            throw err
                                        }
                                        checkFilled = "filled";
                                    }
                                    )
                                    filled = true;
                                }
                            });

                        });
                    })
                    .catch(err => console.log(err))
            }

            console.log(checkFilled + "cheese");

            res.render("ada", {
                user: req.user.name, test: req.user.id, email: req.user.email, btc: results.rows[0].bitcoin,
                ada: results.rows[0].ada, xrp: results.rows[0].xrp, usd: Math.round(results.rows[0].usd * 100) / 100, walletid: results.rows[0].walletid, adaWallet: results.rows[0].ada, trades: result.rows, checkTrade: checkFilled
            });
        }
        )
    }
    );
});

app.get("/users/btcJS", (req, res) => {
    res.sendFile(path.join(__dirname, "/charts/btc.js"));
});

app.get("/users/ethJS", (req, res) => {
    res.sendFile(path.join(__dirname, "/charts/ethereum.js"));
});

app.get("/users/xrpJS", (req, res) => {
    res.sendFile(path.join(__dirname, "/charts/xrp.js"));
});

app.get("/users/bnbJS", (req, res) => {
    res.sendFile(path.join(__dirname, "/charts/bnb.js"));
});

app.get("/users/adaJS", (req, res) => {
    res.sendFile(path.join(__dirname, "/charts/ada.js"));
});

app.get("/users/assetsjs", (req, res) => {
    res.sendFile(path.join(__dirname, "/charts/assets.js"));
});

app.get("/users/style", (req, res) => {
    res.sendFile(path.join(__dirname, "/style.css"));
});

app.get("/users/style", (req, res) => {
    res.sendFile(path.join(__dirname, "/style.css"));
});

app.get("/users/images", (req, res) => {
    res.sendFile(path.join(__dirname, "/homeimage.png"));
});

app.get("/users/btcI", (req, res) => {
    res.sendFile(path.join(__dirname, "/images/bitcoin.png"));
});

app.get("/users/ethI", (req, res) => {
    res.sendFile(path.join(__dirname, "/images/ethereum.png"));
});

app.get("/users/xrpI", (req, res) => {
    res.sendFile(path.join(__dirname, "/images/xrp.png"));
});

app.get("/users/bnbI", (req, res) => {
    res.sendFile(path.join(__dirname, "/images/bnb.png"));
});

app.get("/users/adaI", (req, res) => {
    res.sendFile(path.join(__dirname, "/images/ada.png"));
});

app.get('/users/assets', checkNotAuthenticated, (req, res) => {
    console.log(req.user.id);

    pool.query(
        `SELECT * FROM wallet
        WHERE id = $1`, [req.user.id], (err, results) => {
        console.log(results.rows);
        var amountBTC = 0;
        var amountETH = 0;
        var amountXRP = 0;
        var amountBNB = 0;
        var amountADA = 0;
        pool.query(
            `SELECT * FROM trades
            WHERE walletid = $1`, [results.rows[0].walletid], (err, result) => {
            if (err) {
                throw err
            }
            console.log(result.rows);
            var amountTrade = 0;
            if (result.rows.length > 0) {
                amountTrade = result.rows[0].amount;
            }
            pool.query(
                `SELECT SUM (amount) AS totalBTC
                FROM trades
                WHERE walletid = $1 AND coin = 'btc';
                `, [results.rows[0].walletid], (err, btc) => {
                if (err) {
                    throw err
                }
                console.log(btc.rows[0].totalbtc +"check");
                amount = btc.rows[0].totalbtc;

                pool.query(
                    `SELECT SUM (amount) AS totalETH
                    FROM trades
                    WHERE walletid = $1 AND coin = 'eth';
                    `, [results.rows[0].walletid], (err, eth) => {
                    if (err) {
                        throw err
                    }
                    amountETH = eth.rows[0].totaleth;

                    pool.query(
                        `SELECT SUM (amount) AS totalXRP
                        FROM trades
                        WHERE walletid = $1 AND coin = 'xrp';
                        `, [results.rows[0].walletid], (err, xrp) => {
                        if (err) {
                            throw err
                        }
                        amountXRP = xrp.rows[0].totalxrp;
                        console.log(amountBTC);

                        pool.query(
                            `SELECT SUM (amount) AS totalBNB
                            FROM trades
                            WHERE walletid = $1 AND coin = 'bnb';
                            `, [results.rows[0].walletid], (err, bnb) => {
                            if (err) {
                                throw err
                            }
                            amountBNB = bnb.rows[0].totalbnb;

                            pool.query(
                                `SELECT SUM (amount) AS totalADA
                                FROM trades
                                WHERE walletid = $1 AND coin = 'ada';
                                `, [results.rows[0].walletid], (err, ada) => {
                                if (err) {
                                    throw err
                                }
                                amountADA = ada.rows[0].totalada;
                                res.render("assets", {
                                    user: req.user.name, test: req.user.id, email: req.user.email, btc: results.rows[0].bitcoin,
                                    eth: results.rows[0].ethereum, xrp: results.rows[0].xrp, bnb: results.rows[0].bnb,
                                    ada: results.rows[0].ada, amountBTC: btc.rows[0].totalbtc, amountETH: eth.rows[0].totaleth, amountXRP: xrp.rows[0].totalxrp, amountBNB: bnb.rows[0].totalbnb, amountADA: ada.rows[0].totalada
                                });
                            }
                            )
                        }
                        )
                    }
                    )
                }
                )
            }
            )
        }
        )
    }
    );
});

app.get('/users/logout', (req, res) => {
    req.logOut();
    req.flash('sucess_msg', "You have logged out");
    res.redirect('/users/login');
});

app.post('/users/register', async (req, res) => {
    let { name, email, password, password2 } = req.body;

    let errors = [];

    // Validation checks
    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if (password != password2) {
        errors.push({ message: "Passwords do not match" });
    }

    // Checks form validation
    if (errors.length > 0) {
        res.render('register', { errors });
    } else {
        // Form validation has passed

        // Using bycrpt to encrypt password
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        // Check to see if user already exists
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err
            }
            console.log(results.rows);

            if (results.rows.length > 0) {
                errors.push({ message: "Email already registed" });
                res.render('register', { errors });
            } else {
                // If user does not exist insert data to DB
                pool.query(
                    `INSERT INTO users (name, email, password)
                        VALUES ($1, $2, $3)
                        RETURNING id, password`, [name, email, hashedPassword], (err, results) => {
                    if (err) {
                        throw err
                    }
                    console.log(results.rows[0].id);
                    req.flash('success_msg', "You are now registered. Please log in");
                    res.redirect('/users/login');

                    pool.query(
                        `INSERT INTO wallet (id, bitcoin, ethereum, xrp, bnb, ada, usd) VALUES ($1, 0, 0, 0, 0, 0, 100000)`, [results.rows[0].id], (err, results) => {
                            if (err) {
                                throw err
                            }
                            console.log(results.rows);
                        }
                    )
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

//Post for market orders
//Queries database to read in wallet data
//queries database to either add or subract from the coins wallet depending if a market buy or market sell order is submitted
//If no wallet exists it creates a new wallet and inserts the value into the database 

app.post('/users/btc', (req, res) => {
    console.log(req.body.id);
    console.log(req.body.bitcoin);
    console.log(req.body.coin);
    var amount = req.body.bitcoin * req.body.coin;
    console.log(amount);

    pool.query(
        `SELECT * FROM WALLET
        WHERE id = $1`, [req.body.id], (err, results) => {
        if (err) {
            throw err
        }
        var coin = `bitcoin`;

        if (results.rows.length > 0) {
            console.log(req.body.coin);
            if (req.body.buy == 1) {
                pool.query(
                    `UPDATE wallet SET bitcoin = bitcoin + $1, usd = usd - $3
                            WHERE id =$2`, [req.body.bitcoin, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            } else {
                pool.query(
                    `UPDATE wallet SET bitcoin = bitcoin - $1, usd = usd + $3
                            WHERE id =$2`, [req.body.bitcoin, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            }
        } else {
            pool.query(
                `INSERT INTO wallet (id, bitcoin) VALUES ($2, $1)`, [req.body.bitcoin, req.body.id], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
            )
        }
    })
    res.redirect('/users/btc');
})

app.post('/users/ethMarketBuy', (req, res) => {
    console.log(req.body.id);
    console.log(req.body.ethereum);
    console.log(req.body.coin);
    var amount = req.body.ethereum * req.body.coin;
    console.log(amount);

    pool.query(
        `SELECT * FROM WALLET
        WHERE id = $1`, [req.body.id], (err, results) => {
        if (err) {
            throw err
        }
        var coin = `ethereum`;

        if (results.rows.length > 0) {
            console.log(req.body.coin);
            if (req.body.buy == 1) {
                pool.query(
                    `UPDATE wallet SET ethereum = ethereum + $1, usd = usd - $3
                            WHERE id =$2`, [req.body.ethereum, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            } else {
                pool.query(
                    `UPDATE wallet SET ethereum = ethereum - $1, usd = usd + $3
                            WHERE id =$2`, [req.body.ethereum, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            }
        } else {
            // If wallet does not exist insert data to DB
            pool.query(
                `INSERT INTO wallet (id, ethereum) VALUES ($2, $1)`, [req.body.ethereum, req.body.id], (err, results) => {
                    if (err) {
                        throw err
                    }
                    console.log(results.rows);
                }
            )
        }
    })
    res.redirect('/users/ethereum');
})

app.post('/users/xrpMarketBuy', (req, res) => {
    var amount = req.body.xrp * req.body.coin;
    pool.query(
        `SELECT * FROM WALLET
        WHERE id = $1`, [req.body.id], (err, results) => {
        if (err) {
            throw err
        }
        var coin = `xrp`;

        if (results.rows.length > 0) {
            console.log(req.body.coin);
            if (req.body.buy == 1) {
                pool.query(
                    `UPDATE wallet SET xrp = xrp + $1, usd = usd - $3
                            WHERE id =$2`, [req.body.xrp, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )

            } else {
                pool.query(
                    `UPDATE wallet SET xrp = xrp - $1, usd = usd + $3
                            WHERE id =$2`, [req.body.xrp, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            }
        } else {
            // If wallet does not exist insert data to DB
            pool.query(
                `INSERT INTO wallet (id, xrp) VALUES ($2, $1)`, [req.body.xrp, req.body.id], (err, results) => {
                    if (err) {
                        throw err
                    }
                    console.log(results.rows);
                }
            )
        }
    })
    res.redirect('/users/xrp');
})

app.post('/users/bnbMarketBuy', (req, res) => {
    var amount = req.body.bnb * req.body.coin;
    pool.query(
        `SELECT * FROM WALLET
        WHERE id = $1`, [req.body.id], (err, results) => {
        if (err) {
            throw err
        }
        var coin = `bnb`;

        if (results.rows.length > 0) {
            if (req.body.buy == 1) {
                pool.query(
                    `UPDATE wallet SET bnb = bnb + $1, usd = usd - $3
                            WHERE id =$2`, [req.body.bnb, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            } else {
                pool.query(
                    `UPDATE wallet SET bnb = bnb - $1, usd = usd + $3
                            WHERE id =$2`, [req.body.bnb, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            }
        } else {
            // If wallet does not exist insert data to DB
            pool.query(
                `INSERT INTO wallet (id, bnb) VALUES ($2, $1)`, [req.body.bnb, req.body.id], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
            )
        }
    })
    res.redirect('/users/bnb');
})

app.post('/users/adaMarketBuy', (req, res) => {
    var amount = req.body.ada * req.body.coin;
    pool.query(
        `SELECT * FROM WALLET
        WHERE id = $1`, [req.body.id], (err, results) => {
        if (err) {
            throw err
        }
        var coin = `ada`;

        if (results.rows.length > 0) {
            console.log(req.body.coin);
            if (req.body.buy == 1) {
                pool.query(
                    `UPDATE wallet SET ada = ada + $1, usd = usd - $3
                            WHERE id =$2`, [req.body.ada, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )

            } else {
                pool.query(
                    `UPDATE wallet SET ada = ada - $1, usd = usd + $3
                            WHERE id =$2`, [req.body.ada, req.body.id, req.body.coin], (err, results) => {
                    if (err) {
                        throw err
                    }
                }
                )
            }
        } else {
            // If wallet does not exist insert data to DB
            pool.query(
                `INSERT INTO wallet (id, ada) VALUES ($2, $1)`, [req.body.ada, req.body.id], (err, results) => {
                    if (err) {
                        throw err
                    }
                    console.log(results.rows);
                }
            )
        }
    })
    res.redirect('/users/ada');
})

//Post requests for limit buy and limit sell orders to insert trades into the trades table and update the wallets according to which coin the order is for
//If a buy order is executed it inserts the trade and takes away from USD in wallet
//If a sell order is executed it inserts the trade and takes away from USD in wallet

app.post('/users/btcLimitBuy', (req, res) => {
    var amount = req.body.bitcoin * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.bitcoin, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
            var coin = `bitcoin`;
        })
    pool.query(
        `UPDATE wallet SET usd = usd - $2
            WHERE walletid =$1`, [req.body.id, amount], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/btc');
})

app.post('/users/ethLimitBuy', (req, res) => {
    var amount = req.body.ethereum * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.ethereum, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET usd = usd - $2
            WHERE walletid =$1`, [req.body.id, amount], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/ethereum');
})

app.post('/users/btcLimitSell', (req, res) => {
    var amount = req.body.bitcoin * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.bitcoin, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
            var coin = `bitcoin`;
        })
    pool.query(
        `UPDATE wallet SET bitcoin = bitcoin - $2
            WHERE walletid =$1`, [req.body.id, req.body.bitcoin], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/btc');
})

app.post('/users/ethLimitSell', (req, res) => {
    var amount = req.body.ethereum * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.ethereum, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET ethereum = ethereum - $2
            WHERE walletid =$1`, [req.body.id, req.body.ethereum], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/ethereum');
})

app.post('/users/xrpLimitBuy', (req, res) => {
    var amount = req.body.xrp * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.xrp, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET usd = usd - $2
            WHERE walletid =$1`, [req.body.id, amount], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/xrp');
})

app.post('/users/xrpLimitSell', (req, res) => {
    var amount = req.body.xrp * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.xrp, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET xrp = xrp - $2
            WHERE walletid =$1`, [req.body.id, req.body.xrp], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/xrp');
})

app.post('/users/bnbLimitBuy', (req, res) => {
    var amount = req.body.bnb * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.bnb, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET usd = usd - $2
            WHERE walletid =$1`, [req.body.id, amount], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/bnb');
})

app.post('/users/bnbLimitSell', (req, res) => {
    var amount = req.body.bnb * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.bnb, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET bnb = bnb - $2
            WHERE walletid =$1`, [req.body.id, req.body.bnb], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/bnb');
})

app.post('/users/adaLimitBuy', (req, res) => {
    var amount = req.body.ada * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.ada, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET usd = usd - $2
            WHERE walletid =$1`, [req.body.id, amount], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/ada');
})

app.post('/users/adaLimitSell', (req, res) => {
    var amount = req.body.ada * req.body.usd;
    pool.query(
        `INSERT INTO trades (walletid, amount, amountusd, coin, type, time) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.id, req.body.ada, amount, req.body.coin, req.body.type, req.body.time], (err, results) => {
            if (err) {
                throw err
            }
        })
    pool.query(
        `UPDATE wallet SET ada = ada - $2
            WHERE walletid =$1`, [req.body.id, req.body.ada], (err, results) => {
        if (err) {
            throw err
        }
    })
    res.redirect('/users/ada');
})

//Post requests for queries to cancel remove trade from database and update wallets amounts
//All below is the same queries for the different coins
app.post('/users/cancelTrade', (req, res) => {
    pool.query(
        `DELETE FROM trades WHERE tradeid = $1`, [req.body.id], (err, data) => {
            if (err) {
                throw err
            }
        }
    )
    if (req.body.type == "limitBuy") {
        pool.query(
            `UPDATE wallet SET usd = usd + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.usd], (err, results) => {
            if (err) {
                throw err
            }
        })

    } else {
        pool.query(
            `UPDATE wallet SET bitcoin = bitcoin + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.amount], (err, results) => {
            if (err) {
                throw err
            }
        })
    }
    res.redirect('/users/btc');
})

app.post('/users/cancelTradeETH', (req, res) => {
    pool.query(
        `DELETE FROM trades WHERE tradeid = $1`, [req.body.id], (err, data) => {
            if (err) {
                throw err
            }
        }
    )
    if (req.body.type == "limitBuy") {
        pool.query(
            `UPDATE wallet SET usd = usd + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.usd], (err, results) => {
            if (err) {
                throw err
            }
        })

    } else {
        pool.query(
            `UPDATE wallet SET ethereum = ethereum + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.amount], (err, results) => {
            if (err) {
                throw err
            }
        })
    }
    res.redirect('/users/ethereum');
})

app.post('/users/cancelTradeXRP', (req, res) => {
    pool.query(
        `DELETE FROM trades WHERE tradeid = $1`, [req.body.id], (err, data) => {
            if (err) {
                throw err
            }
        }
    )
    if (req.body.type == "limitBuy") {
        pool.query(
            `UPDATE wallet SET usd = usd + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.usd], (err, results) => {
            if (err) {
                throw err
            }
        })

    } else {
        pool.query(
            `UPDATE wallet SET xrp = xrp + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.amount], (err, results) => {
            if (err) {
                throw err
            }
        })
    }
    res.redirect('/users/xrp');
})

app.post('/users/cancelTradeBNB', (req, res) => {
    pool.query(
        `DELETE FROM trades WHERE tradeid = $1`, [req.body.id], (err, data) => {
            if (err) {
                throw err
            }
        }
    )
    if (req.body.type == "limitBuy") {
        pool.query(
            `UPDATE wallet SET usd = usd + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.usd], (err, results) => {
            if (err) {
                throw err
            }
        })

    } else {
        pool.query(
            `UPDATE wallet SET bnb = bnb + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.amount], (err, results) => {
            if (err) {
                throw err
            }
        })
    }
    res.redirect('/users/bnb');
})

app.post('/users/cancelTradeADA', (req, res) => {

    pool.query(
        `DELETE FROM trades WHERE tradeid = $1`, [req.body.id], (err, data) => {
            if (err) {
                throw err
            }
        }
    )
    if (req.body.type == "limitBuy") {
        pool.query(
            `UPDATE wallet SET usd = usd + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.usd], (err, results) => {
            if (err) {
                throw err
            }
        })

    } else {
        pool.query(
            `UPDATE wallet SET ada = ada + $2
                WHERE walletid =$1`, [req.body.walletid, req.body.amount], (err, results) => {
            if (err) {
                throw err
            }
        })
    }
    res.redirect('/users/ada');
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/users/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/users/login');
}

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});