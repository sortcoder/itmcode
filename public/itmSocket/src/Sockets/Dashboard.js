
import TradeController from '../Controller/TradeController';
import WatchlistController from '../Controller/WatchlistController';
import SearchController from '../Controller/SearchController';


/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class DashboardSocket {

    dashboard = async (socket,io) => {

        let result= socket.on('dashboard',async (userId) => {
            socket.join(userId);
           
            let result=await TradeController.dashboard(userId);
            console.log("join room",result)
            let upcomming=await TradeController.upcommingICO(userId);
            let hotTrade=await TradeController.hotTrade(userId);
            let topGainerAndLooser=await TradeController.topGainerAndLooser(userId);
            let tradingImage=await TradeController.tradingImage(userId);
            
            io.emit("getDashboardData",result);
            io.to(userId).emit("getDashboardData",result);
            io.to(userId).emit("getUpcomming",upcomming);
            io.emit("getTop",{data:{hotTrade:hotTrade,topGainer:topGainerAndLooser.topGainer,topLooser:topGainerAndLooser.topLooser}});
            io.emit("getTrading",tradingImage);
          
            
        });

        return result;
    };
    tradingImageDetail= async (socket,io) => {

        let result= socket.on('tradingImageDetail',async (userId,id) => {
            // console.log("join room",data)
            let result=await TradeController.tradingImageDetail(userId,id);          
            io.emit("getImageDetail",result);
         
            
        });

        return result;
    };
    favImage= async (socket,io) => {

        let result= socket.on('favImage',async (userId,id,search='') => {
                console.log("favcal");
            let result=await TradeController.favImage(userId,id);          
            let tradingImage=await TradeController.tradingImage(userId);
            io.to(userId).emit("getTrading",tradingImage);
            let washlist=await WatchlistController.list(userId);
            io.to(userId).emit("getWatchlist",washlist);
            
            let serachData=await SearchController.list(userId,search);
            io.to(userId).emit("getSearchData",serachData);

            let DetailMultiple=await TradeController.tradingImageDetailMultipleC(userId,id);          
            io.to(userId).emit("getImageDetailMultiple",DetailMultiple);
            
        });
       

        return result;
    };
    tradingImageDetailMultiple= async (socket,io) => {

        let result= socket.on('tradingImageDetailMultiple',async (userId,id) => {
            // console.log("join room",data)
            let result=await TradeController.tradingImageDetailMultipleC(userId,id);          
            io.to(userId).emit("getImageDetailMultiple",result);
         
            
        });

        return result;
    };

}

export default new DashboardSocket();
