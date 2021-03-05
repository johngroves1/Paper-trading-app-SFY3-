const log = console.log;
const api = require('binance');
const express = require('express');
const app = express();
const server = app.listen('3000',() => log(`Kline Data Server started on port 3000`));
const socket = require('socket.io');
const io = socket(server);

//connecting to binance api
const bRest = new api.BinanceRest({
        key: "", 
        secret: "", 
        timeout: 15000, 
        recvWindow: 20000, 
        disableBeautification: false,
        handleDrift: true
});
const binanceWS = new api.BinanceWS(true);
const bws = binanceWS.onKline('BTCUSDT', '5m', (data) => {
    io.sockets.emit('KLINE',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
