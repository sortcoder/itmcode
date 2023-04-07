

import connection from "../Config/db";
import TradeController from '../Controller/TradeController';
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  PortfolioController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class SearchController {


    list = async (userId, search = '') => {

        try {
            const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
            let UserType=userDetail[0].account_type; //1=demo 2=live

            let query = 'SELECT l.*,u.username,u.name,u.email ,utp.quantity as portfolioQTY,utp.price as portfolioPrice FROM `launchpaid` as l left join users as u on u.id=l.user_id  left join user_trading_portfolio as utp on utp.image_id=l.id and utp.user_id=' + userId + ' where approve_status=2  and l.launc_paid_type="'+UserType+'"  ';

            if(search)
            {
                query=query+" and (l.launch_sketch like '%"+search+"%' or u.username like '%"+search+"%'  or u.name like '%"+search+"%') ";
            }

            const [totalImages] = await connection.execute(query);
            let result = [];
            for (const iterator of totalImages) {

                let item = await imageCollection.imageFullCollection(iterator.id, userId);
                let [lanuchPadDetail] = await connection.execute("SELECT * FROM `like_launchpad` WHERE launchpad_id = '" + iterator.id + "' and user_id='" + userId + "'  ORDER by id desc LIMIT 1;");
                item.availableQTY = iterator.portfolioQTY ? iterator.portfolioQTY : '';
                item.availableAVGPrice = iterator.portfolioPrice ? iterator.portfolioPrice : '';
                item.likeWatch = lanuchPadDetail && lanuchPadDetail[0] ? "YES" : "NO";

                result.push(item);
            }

            return { data: result };
        } catch (error) {
            return { message: error.message };
        }
    };


}

export default new SearchController();
