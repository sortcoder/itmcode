
// import UserModel from '../Models/User';
import connection from "../Config/db";
import moment from 'moment';
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class OrderController {

    /**
     * Create gift
     */
    index = async (userId, dayType, type) => {

        try {

            const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
            let UserType=userDetail[0].account_type; //1=demo 2=live

            let query = 'SELECT se.*,l.launch_image,l.launch_sketch,l.live_image_price FROM `stock_exchange` as se join launchpaid as l on l.id=se.lauch_id where se.user_id="' + userId + '" and se.status="' + type + '"  and l.launc_paid_type="'+UserType+'" ';
            let currentDate = new Date();
            let date = moment(currentDate).format("YYYY-MM-DD 00:00:00")
            if (dayType == "today") {
                query += ' and se.created_at >= "' + date+'"';
            }
            else {
                query += ' and se.created_at <  "' + date+'"';
            }
            query += ' order by se.id desc ';
            const [stockExchangeRecord] = await connection.execute(query);
            let result=[];
            for (const iterator of stockExchangeRecord) {
                let item={}
                item=iterator;
                item.created_at= moment(iterator.created_at).format("DD MMM YYYY HH:mm:ss");;
                item.livePrice=iterator.live_image_price;
                result.push(item);
            }


            return {data:result};
        } catch (error) {
            return { message: error.message };
        }
    };
    cancleOrder= async (id) => {

        let query = 'UPDATE `stock_exchange` SET `status`="cancelled" WHERE id="' + id + '"  ';
        const [history] = await connection.execute(query);
        return history;

    }

}

export default new OrderController();
