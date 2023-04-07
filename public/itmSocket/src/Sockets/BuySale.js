
import BuySaleController from '../Controller/BuySaleController';
import WatchlistController from '../Controller/WatchlistController';
import TradeController from '../Controller/TradeController';
import PortfolioController from '../Controller/PortfolioController';
import SearchController from '../Controller/SearchController';
import OrderController from '../Controller/OrderController';

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class BuySale {

    livetrading = async (socket,io) => {

        let result= socket.on('livetrading',async (id,days) => {
            socket.join("imageid_"+id);
            let result=await BuySaleController.index(id,days);
          
            io.to("imageid_"+id).emit("getLiveTrading",result);
          
            
        });

        return result;
    };
    buySale=async (socket,io)=>{
        let result= socket.on('createOrder',async (id, type, userId, price, qty) => {
         
            let result=await BuySaleController.createOrder(id, type, userId, price, qty);
          
            io.emit("getOrderResponse",result);

            let result1=await BuySaleController.index(id,1);          
            io.to("imageid_"+id).emit("getLiveTrading",result1);

            let result2=await WatchlistController.list(userId);
         
            io.to(userId).emit("getWatchlist",result2);


         let result3=await TradeController.dashboard(userId);
            let upcomming=await TradeController.upcommingICO(userId);
            let hotTrade=await TradeController.hotTrade(userId);
            let topGainerAndLooser=await TradeController.topGainerAndLooser(userId);
            let tradingImage=await TradeController.tradingImage(userId);
              io.to(userId).emit("getDashboardData",result3);
            io.to(userId).emit("getUpcomming",upcomming);
            io.emit("getTop",{data:{hotTrade:hotTrade,topGainer:topGainerAndLooser.topGainer,topLooser:topGainerAndLooser.topLooser}});
            io.emit("getTrading",tradingImage);

            let result4=await PortfolioController.detail(userId,'');
            io.to(userId).emit("getPortfolio",result4);

            let result5=await SearchController.list(userId,'');
            io.to(userId).emit("getSearchData",result5);


            let result6=await TradeController.tradingImageDetailMultipleC(userId,id);          
            io.to(userId).emit("getImageDetailMultiple",result6);
          
            
        });

        return result;
    }
    updateBuySale=async (socket,io)=>{
        let result= socket.on('updateOrder',async (stockExId, price, qty,userId) => {
         
            let result=await BuySaleController.updateOrder(stockExId, price, qty);
          
            io.emit("getOrderResponse",result);

            // let result1=await BuySaleController.index(id,1);          
            // io.emit("getLiveTrading",result1);

            let result2=await WatchlistController.list(userId);
         
            io.to(userId).emit("getWatchlist",result2);


         let result3=await TradeController.dashboard(userId);
            let upcomming=await TradeController.upcommingICO(userId);
            let hotTrade=await TradeController.hotTrade(userId);
            let topGainerAndLooser=await TradeController.topGainerAndLooser(userId);
            let tradingImage=await TradeController.tradingImage(userId);
              io.to(userId).emit("getDashboardData",result3);
            io.to(userId).emit("getUpcomming",upcomming);
            io.emit("getTop",{data:{hotTrade:hotTrade,topGainer:topGainerAndLooser.topGainer,topLooser:topGainerAndLooser.topLooser}});
            io.emit("getTrading",tradingImage);

            let result4=await PortfolioController.detail(userId,'');
            io.to(userId).emit("getPortfolio",result4);

            let result5=await SearchController.list(userId,'');
            io.to(userId).emit("getSearchData",result5);

            let result7=await OrderController.index(userId, "today", "pending");
            io.to(userId).emit("getOrderList",result7);

           /*  let result6=await TradeController.tradingImageDetailMultipleC(userId,id);          
            io.to(userId).emit("getImageDetailMultiple",result6); */
          
            
        });

        return result;
    }
    changeUserType=async (socket,io)=>{
        let result= socket.on('changeUserType',async (userId,type) => {
            console.log("call changeUserType");
          
          await TradeController.changeUserType(userId,type);
               
           
             let result1=await TradeController.dashboard(userId);
             let upcomming=await TradeController.upcommingICO(userId);
             let hotTrade=await TradeController.hotTrade(userId);
             let topGainerAndLooser=await TradeController.topGainerAndLooser(userId);
             let tradingImage=await TradeController.tradingImage(userId);
             io.to(userId).emit("getDashboardData",result1);
             io.to(userId).emit("getUpcomming",upcomming);
             io.emit("getTop",{data:{hotTrade:hotTrade,topGainer:topGainerAndLooser.topGainer,topLooser:topGainerAndLooser.topLooser}});
             io.emit("getTrading",tradingImage);
            
        });

        return result;
    } 
   

}

export default new BuySale();
