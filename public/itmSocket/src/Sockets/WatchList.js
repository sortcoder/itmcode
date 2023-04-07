
import WatchlistController from '../Controller/WatchlistController';

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class WatchListSocket {

    list = async (socket,io) => {

        let result= socket.on('watchlist',async (userId) => {
           console.log("Watch call",userId)
            let result=await WatchlistController.list(userId);
            console.log("result",result)
            io.to(userId).emit("getWatchlist",result);
          
            
        });

        return result;
    };

}

export default new WatchListSocket();
