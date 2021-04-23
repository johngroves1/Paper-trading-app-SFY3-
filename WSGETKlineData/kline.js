const log = console.log;
const api = require('binance');
const express = require('express');
const app = express();
const server = app.listen('3000',() => log(`Kline Data Server started on port 3000`));
//const server1 = app.listen('3001',() => log(`Kline Data Server started on port 3001`));
const socket = require('socket.io');
const io = socket(server);
//const io1 = socket(server1);

//connecting to binance api
const bRest = new api.BinanceRest({
        key: "", 
        secret: "", 
        timeout: 15000, 
        recvWindow: 20000, 
        disableBeautification: false,
        handleDrift: true
});
const binanceBTC1d = new api.BinanceWS(true);
const binanceBTC1m = new api.BinanceWS(true);


const btc1d = binanceBTC1d.onKline('BTCUSDT', '1d', (data) => {
    io.sockets.emit('KLINE_BTC_1d',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const btc1m = binanceBTC1d.onKline('BTCUSDT', '1m', (data) => {
    io.sockets.emit('KLINE_BTC_1m',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const btc4h = binanceBTC1d.onKline('BTCUSDT', '4h', (data) => {
    io.sockets.emit('KLINE_BTC_4h',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
const btcChange = binanceBTC1d.onTicker('BTCUSDT', (data) => {
    io.sockets.emit('KLINE_CHANGE',{change: data.priceChangePercent, high24h: data.high, low24h: data.low, price: data.currentClose});
});

const eth1d = binanceBTC1d.onKline('ETHUSDT', '1d', (data) => {
    io.sockets.emit('KLINE_ETH_1d',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const eth1m = binanceBTC1d.onKline('ETHUSDT', '1m', (data) => {
    io.sockets.emit('KLINE_ETH_1m',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const eth4h = binanceBTC1d.onKline('ETHUSDT', '4h', (data) => {
    io.sockets.emit('KLINE_ETH_4h',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
const ethChange = binanceBTC1d.onTicker('ETHUSDT', (data) => {
    io.sockets.emit('KLINE_ETH_CHANGE',{change: data.priceChangePercent, high24h: data.high, low24h: data.low, price: data.currentClose});
});

const XRP1d = binanceBTC1d.onKline('XRPUSDT', '1d', (data) => {
    io.sockets.emit('KLINE_XRP_1d',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const XRP1m = binanceBTC1d.onKline('XRPUSDT', '1m', (data) => {
    io.sockets.emit('KLINE_XRP_1m',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const XRP4h = binanceBTC1d.onKline('XRPUSDT', '4h', (data) => {
    io.sockets.emit('KLINE_XRP_4h',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
const XRPChange = binanceBTC1d.onTicker('XRPUSDT', (data) => {
    io.sockets.emit('KLINE_XRP_CHANGE',{change: data.priceChangePercent, high24h: data.high, low24h: data.low, price: data.currentClose});
});

const BNB1d = binanceBTC1d.onKline('BNBUSDT', '1d', (data) => {
    io.sockets.emit('KLINE_BNB_1d',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const BNB1m = binanceBTC1d.onKline('BNBUSDT', '1m', (data) => {
    io.sockets.emit('KLINE_BNB_1m',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const BNB4h = binanceBTC1d.onKline('BNBUSDT', '4h', (data) => {
    io.sockets.emit('KLINE_BNB_4h',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
const BNBChange = binanceBTC1d.onTicker('BNBUSDT', (data) => {
    io.sockets.emit('KLINE_BNB_CHANGE',{change: data.priceChangePercent, high24h: data.high, low24h: data.low, price: data.currentClose});
});

const ADA1d = binanceBTC1d.onKline('ADAUSDT', '1d', (data) => {
    io.sockets.emit('KLINE_ADA_1d',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const ADA1m = binanceBTC1d.onKline('ADAUSDT', '1m', (data) => {
    io.sockets.emit('KLINE_ADA_1m',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const ADA4h = binanceBTC1d.onKline('ADAUSDT', '4h', (data) => {
    io.sockets.emit('KLINE_ADA_4h',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
const ADAChange = binanceBTC1d.onTicker('ADAUSDT', (data) => {
    io.sockets.emit('KLINE_ADA_CHANGE',{change: data.priceChangePercent, high24h: data.high, low24h: data.low, price: data.currentClose});
});

/*const eth1d = binanceBTC1d.onKline('ETHUSDT', '1d', (data) => {
    io.sockets.emit('KLINE11',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const eth1m = binanceBTC1d.onKline('ETHUSDT', '1m', (data) => {
    io.sockets.emit('KLINE11',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

const eth4h = binanceBTC1d.onKline('ETHUSDT', '4h', (data) => {
    io.sockets.emit('KLINE21',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});
*/

