//Pseudo code
//Step 1: Define chart properties.
//Step 2: Create the chart with defined properties and bind it to the DOM element.
//Step 3: Add the CandleStick Series.
//Step 4: Set the data and render.
//Step5 : Plug the socket to the chart


//const { pool } = require("./dbConfig");


//Code
const log = console.log;

const chartProperties = {
  width: 1500,
  height: 600,
  layout: {
    backgroundColor: '#03041c',
    textColor: 'rgba(255, 255, 255, 0.9)',
  },
  grid: {
    vertLines: {
      color: 'rgba(197, 203, 206, 0.1)',
    },
    horzLines: {
      color: 'rgba(197, 203, 206, 0.1)',
    },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  }
}

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement, chartProperties);
const candleSeries = chart.addCandlestickSeries();

fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=50000`)
  .then(res => res.json())
  .then(data => {
    const cdata = data.map(d => {
      return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
    });
    candleSeries.setData(cdata);
    cdata.forEach(e => {
      //log(e.high);
      if (e.high > 50000) {
        // log(e.time);
        //log(e.high);
        // log("ORDER SUCCESFUL")
      }

    });
  })
  .catch(err => log(err))

//Dynamic Chart
const socket = io.connect('http://127.0.0.1:3000/');
const socket1 = io.connect('http://127.0.0.1:3000/');

var chartTime = "KLINE_BTC_1d";
//var chart4h = "KLINE_BTC_4h";


socket1.on(chartTime, (pl) => {
  log(pl.open + "Not Yurt");
  candleSeries.update(pl);
  //document.getElementById('symbolPrice').innerHTML = "BTC|USDT  " + pl.open;



});

/* /* socket.on('KLINE_BTC_1m', (pl) => {
  log(pl.open + "Yurt");
  //candleSeries.update(pl);
  document.forms[1].coin.value = pl.close;



}); 

socket.on('KLINE_BTC_4h', (pl) => {
  log(pl.open + "Yurty McYurt");
  //candleSeries.update(pl);
  //document.getElementById('symbolPrice').innerHTML = "BTC|USDT  " + pl.close;

}); */


function limitOrderB() {

  var limitOrder = document.getElementById('amountLimit').value;
  var limitValidation = document.getElementById('priceLimit').value.length;
  var limitPrice = document.getElementById('priceLimit').value;
  //log(limitPrice);

  if (total < limitOrder || limitValidation == 0) {
    document.getElementById('output').innerHTML = "Wallet: " + "$" + total + " Insufficient Funds | Incorrect Entry";

  } else {

    document.getElementById('limit1').innerHTML = limitOrder + " Amount USDT";

    socket1.once('KLINE_BTC_1m', (pl) => {
      //log(pl.close);
      var limit1 = pl.close;
      var limit1time = pl.time;
      var date = new Date(pl.time * 1000);
      //log(limitOrder);
      document.getElementById('limit1price').innerHTML = limitPrice + " Price USDT";
      var limit1amount = limitOrder / limitPrice;
      //log(limit1amount);
      document.getElementById('limit1amount').innerHTML = limit1amount + " BTC";
      document.getElementById('limit1time').innerHTML = "Order Submitted: " + date.toGMTString();

      total = total - limitOrder;
      //log(total);
      document.getElementById('output').innerHTML = "Wallet: " + "$" + total;


    });

  }
}

function chart4h() {
  socket1.off(chartTime);

  chartTime = "KLINE_BTC_4h";

  fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=50000`)
    .then(res => res.json())
    .then(data => {
      const cdata = data.map(d => {
        return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
      });
      candleSeries.setData(cdata);
      cdata.forEach(e => {
        //log(e.high);
        if (e.high > 50000) {
          // log(e.time);
          //log(e.high);
          // log("ORDER SUCCESFUL")
        }

      });
    })
    .catch(err => log(err))

  socket.on(chartTime, (pl) => {
    log(pl.open + "Not Yurt");
    candleSeries.update(pl);
    //document.getElementById('symbolPrice').innerHTML = "BTC|USDT  " + pl.open;
    



  });

  fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=50000`)
    .then(res => res.json())
    .then(data => {
      const cdata = data.map(d => {
        return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
      });
      candleSeries.setData(cdata);
      cdata.forEach(e => {
        //log(e.high);
        if (e.high > 50000) {
          // log(e.time);
          //log(e.high);
          // log("ORDER SUCCESFUL")
        }

      });
    })
    .catch(err => log(err))


}
function chart1d() {

  socket1.off(chartTime);

  chartTime = "KLINE_BTC_1d";

  socket.on(chartTime, (pl) => {
    log(pl.open + "Not Yurt");
    candleSeries.update(pl);
    //document.getElementById('symbolPrice').innerHTML = "BTC|USDT  " + pl.open;



  });

  fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=50000`)
    .then(res => res.json())
    .then(data => {
      const cdata = data.map(d => {
        return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
      });
      candleSeries.setData(cdata);
      cdata.forEach(e => {
        //log(e.high);
        if (e.high > 50000) {
          // log(e.time);
          //log(e.high);
          // log("ORDER SUCCESFUL")
        }

      });
    })
    .catch(err => log(err))


}

function chart1m() {

  chartTime = "KLINE_BTC_1m";
  socket1.off(chartTime);

  socket.on(chartTime, (pl) => {
    log(pl.open + "Not Yurt");
    candleSeries.update(pl);
    //document.getElementById('symbolPrice').innerHTML = "BTC|USDT  " + pl.open;



  });

  fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50000`)
    .then(res => res.json())
    .then(data => {
      const cdata = data.map(d => {
        return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
      });
      candleSeries.setData(cdata);
      cdata.forEach(e => {
        //log(e.high);
        if (e.high > 50000) {
          // log(e.time);
          //log(e.high);
          // log("ORDER SUCCESFUL")
        }

      });
    })
    .catch(err => log(err))


}

function marketOrderB() {

  var buyOrder = document.getElementById('amountMarket').value;

  if (total < buyOrder) {
    document.getElementById('output').innerHTML = "Wallet: " + "$" + total + " Insufficient Funds";

  } else {

    document.getElementById('order1').innerHTML = buyOrder + " USDT Amount";

    socket.once('KLINE_BTC_1d', (pl) => {
      log(pl.close);
      var order1 = pl.close;
      //log(buyOrder);
      document.getElementById('order1price').innerHTML = order1 + " Average Price USD";
      var order1amount = buyOrder / order1;
      //log(order1amount);
      document.getElementById('order1amount').innerHTML = order1amount + " BTC";

      total = total - buyOrder;
      //log(total);
      document.getElementById('output').innerHTML = "Wallet: " + "$" + total;


    });

  }



}
