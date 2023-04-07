

import connection from "../Config/db";
import TradeController from '../Controller/TradeController';
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  PortfolioController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class LouncherController {


    lounchedList = async (userId) => {

        try {
            let query = 'SELECT l.* FROM `launchpaid` as l  where approve_status=2 and l.user_id="' + userId + '"  ';

            const [totalImages] = await connection.execute(query);
            let result = [];
            for (const iterator of totalImages) {
                let item = {}
                item = await imageCollection.imageFullCollection(iterator.id, userId);
                let query1="select * from request_buy_more_image_tbl where user_id='"+userId+"' and image_id='"+iterator.id+"' and status in ('pending','set_price') order by id desc";
                let [buyApplication]=await connection.execute(query1);
               

                let userquery="select * from users where id='"+userId+"' ";
                let [userDetail]=await connection.execute(userquery);

                item.buyMoreStatus = buyApplication && buyApplication[0] ? buyApplication[0].status : '';
                item.launcher_live_wallet = userDetail && userDetail[0] ? userDetail[0].launcher_live_wallet : '';
                item.tradding_live_wallet = userDetail && userDetail[0] ? userDetail[0].tradding_live_wallet : '';
                item.creditBalance =  '';
                item.buyMoreImage = {
                    id: buyApplication && buyApplication[0] ? buyApplication[0].id : '',
                    price: buyApplication && buyApplication[0] ? buyApplication[0].price : '',
                    quantity: buyApplication && buyApplication[0] ? buyApplication[0].quantity : ''
                };
                result.push(item);
            }

            console.log("right lounchedList")

            return { data: result };


        } catch (error) {
            return { message: error.message };
        }
    };

}

export default new LouncherController();
