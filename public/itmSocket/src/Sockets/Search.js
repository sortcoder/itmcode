
import SearchController from '../Controller/SearchController';

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class SearchSocket {

    searchlist = async (socket,io) => {

        let result= socket.on('searchList',async (userId,search='') => {
         
            let result=await SearchController.list(userId,search);
            io.to(userId).emit("getSearchData",result);
          
            
        });

        return result;
    };

}

export default new SearchSocket();
