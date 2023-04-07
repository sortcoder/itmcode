
import PortfolioController from '../Controller/PortfolioController';

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class PortfolioSocket {

    detail = async (socket,io) => {

        let result= socket.on('portfolioDetail',async (userId,search='') => {
         
            let result=await PortfolioController.detail(userId,search);
            io.to(userId).emit("getPortfolio",result);
          
            
        });

        return result;
    };

}

export default new PortfolioSocket();
