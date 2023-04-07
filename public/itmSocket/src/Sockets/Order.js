
import PortfolioController from '../Controller/PortfolioController';
import OrderController from '../Controller/OrderController';

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */

class OrderSocket {
/* 
    list = async (socket,io) => {

        let result= socket.on('orderDetail',async (userId) => {
           console.log("orderDetail call",userId)
            let result=await PortfolioController.detail(userId);
            io.to(userId).emit("getOrderList",result);
          
            
        });

        return result;
    }; */
    orderlist = async (socket,io) => {

        let result= socket.on('orderlist',async (userId, dayType, type) => {
           console.log("orderDetail call",userId)
            let result=await OrderController.index(userId, dayType, type);
            io.to(userId).emit("getOrderList",result);
          
            
        });

        return result;
    };
    cancleOrder=async (socket,io)=>{
        let result= socket.on('cancleOrder',async (id,userId,dayType,type) => {
         
            await OrderController.cancleOrder(id);
            let result=await OrderController.index(userId, dayType, type);
            io.to(userId).emit("getOrderList",result);
            
        });
        return result;
    }

}

export default new OrderSocket();
