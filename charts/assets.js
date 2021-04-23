app.post('/users/ethMarketBuy', (req, res) => {
  //let {ethereum} = req.body;
  console.log(req.body.id);
  console.log(req.body.ethereum);
  //console.log(req.body.ethereum1);
  console.log(req.body.coin);
  var amount = req.body.ethereum * req.body.coin;
  console.log(amount);
  //res.redirect('/users/chart');

  pool.query(
      `SELECT * FROM WALLET
      WHERE id = $1`, [req.body.id], (err, results) => {
      if (err) {
          throw err
      }
      //console.log(results.rows);
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
                  //console.log(results.rows);
                  // req.flash('success_msg', "You are now registered. Please log in");
                  //res.redirect('/users/chart');
              }
              )

          } else {
              pool.query(
                  `UPDATE wallet SET ethereum = ethereum - $1, usd = usd + $3
                          WHERE id =$2`, [req.body.ethereum, req.body.id, req.body.coin], (err, results) => {
                  if (err) {
                      throw err
                  }
                  //console.log(results.rows);
                  // req.flash('success_msg', "You are now registered. Please log in");
                  //res.redirect('/users/chart');
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
                  //req.flash('success_msg', "You are now registered. Please log in");

              }
          )


      }
  })
  res.redirect('/users/chart');

})