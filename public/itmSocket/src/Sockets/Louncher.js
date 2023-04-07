
import LouncherController from '../Controller/LouncherController';


/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class Louncher {

    lounchedList = async (socket,io) => {

        let result= socket.on('lounchedList',async (userId) => {
            socket.join(userId);
            let result=await LouncherController.lounchedList(userId);
          
            io.to(userId).emit("getLounchedList",result);
          
            
        });

        return result;
    };
  
   

}

export default new Louncher();
