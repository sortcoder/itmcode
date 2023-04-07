

import connection from "../Config/db";
import TradeController from '../Controller/TradeController';
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  PortfolioController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class PortfolioController {

  
    detail = async (userId,search='') => {

        try {

            await connection.execute('delete from `user_trading_portfolio` where quantity="0"');
            const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
            let UserType=userDetail[0].account_type; //1=demo 2=live
           let portfolioDetail=await TradeController.getCurrentValue(userId,userDetail);
           portfolioDetail.availableFound=userDetail && userDetail[0] && UserType == 2 ? userDetail[0].tradding_live_wallet :(userDetail && userDetail[0] && UserType == 1 ? userDetail[0].tradding_demo_wallet : 0); 
           portfolioDetail.balanceUsed=portfolioDetail.investment; 
           portfolioDetail.portfolioList=await this.portfolioList(userId,search);
           
            return {data:portfolioDetail};
        } catch (error) {
            return { message: error.message };
        }
    };
    portfolioList=async (userId,search='')=>{
        let query = 'SELECT utp.* FROM `user_trading_portfolio` as utp left join launchpaid as l on l.id=utp.image_id left join users as u on u.id=l.user_id where utp.user_id='+userId+' ';
        if(search)
        {
            query=query+" and (l.launch_sketch like '%"+search+"%' or u.username like '%"+search+"%'  or u.name like '%"+search+"%') ";
        }
        console.log("query",query)
        console.log("search",search)
        const [totalImages] = await connection.execute(query);
        let result=[];
        for (const iterator of totalImages) {
            let item=await imageCollection.imageFullCollectionForPortfolio(iterator.image_id,userId);
            item.availableQTY=iterator.quantity ? iterator.quantity  :'' ;
            item.availableAVGPrice=iterator.price? iterator.price  :'' ;
            item.totalPrice=iterator.total_price? iterator.total_price  :'' ;
            result.push(item);
        }
        return result;
    }

}

export default new PortfolioController();
