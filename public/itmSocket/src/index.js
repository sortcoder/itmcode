import express from 'express';
import https from 'https';
import fs from 'fs';
import { Server } from "socket.io";
import Dashboard from './Sockets/Dashboard'; 
import WatchList from './Sockets/WatchList'; 
import Portfolio from './Sockets/Portfolio'; 
import Search from './Sockets/Search'; 
import BuySale from './Sockets/BuySale'; 
import Order from './Sockets/Order'; 
import Louncher from './Sockets/Louncher'; 
import BuySaleController from './Controller/BuySaleController'; 
import schedule from 'node-schedule';

const options = {
    key: fs.readFileSync('/home/ssl/privkey.pem'),
    cert: fs.readFileSync('/home/ssl/fullchain.pem')
};
const app = express();
var httpsServer = https.createServer(options, app);

const io = new Server(httpsServer);
io.on('connection',async (socket) => {
    console.log("socket connected");
    await Dashboard.dashboard(socket,io);
    await Dashboard.tradingImageDetail(socket,io);
    await Dashboard.tradingImageDetailMultiple(socket,io);
    await Dashboard.favImage(socket,io);
    await WatchList.list(socket,io);
    await Portfolio.detail(socket,io);
    await Search.searchlist(socket,io);
    await BuySale.livetrading(socket,io);
    await BuySale.buySale(socket,io);
    await BuySale.updateBuySale(socket,io);
    await BuySale.changeUserType(socket,io);
    await Order.orderlist(socket,io);
    await Order.cancleOrder(socket,io);
    await Louncher.lounchedList(socket,io);
    
   

    socket.on('disconnect', () => {
        console.log(`disconnect`);
    });
    socket.on('disconnected', () => {
        console.log(`disconnected`);
    })
});
schedule.scheduleJob('* * * * *', BuySaleController.demoAutoBuySale);

app.get("/getres",function(req,res){
    res.send("working")
})
httpsServer.listen(9000,function(){
    console.log("connected")
})
