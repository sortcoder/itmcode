

import connection from "../Config/db";
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  WatchlistController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class WatchlistController {

 
    list = async (userId) => {

        try {

            const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
            let UserType=userDetail[0].account_type; //1=demo 2=live

            let query = 'SELECT l.*,u.username,u.name,u.email,utp.quantity as portfolioQTY,utp.price as portfolioPrice FROM `launchpaid` as l left join users as u on u.id=l.user_id join like_launchpad as llp on llp.launchpad_id=l.id left join user_trading_portfolio as utp on utp.image_id=l.id and utp.user_id='+userId+' where l.approve_status=2 and llp.user_id='+userId+'  and l.launc_paid_type="'+UserType+'"  ';
           
            const [totalImages, fields] = await connection.execute(query);
            let result=[];
             for (const iterator of totalImages) {
                let item=await imageCollection.imageFullCollection(iterator.id,userId);
                 item.availableQTY=iterator.portfolioQTY ? iterator.portfolioQTY  :'' ;
                 item.availableAVGPrice=iterator.portfolioPrice? iterator.portfolioPrice  :'' ;
                result.push(item);
             }
           

            return {data:result};
        } catch (error) {
            return { message: error.message };
        }
    };





}

export default new WatchlistController();
