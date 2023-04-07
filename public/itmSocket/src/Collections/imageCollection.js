
// import UserModel from '../Models/User';
import connection from "../Config/db";
import moment from 'moment';
import _ from "lodash";

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class imageCollection {


    normalCollection = async (allData, userId) => {
        let result = [];
        var date = new Date();
        let [setting] = await connection.execute("SELECT * FROM `setting_configs` WHERE var_key='ICO_START_TIMING' or var_key='ICO_END_TIMING' order by var_key asc;");
        let currentDate = moment(date).format("YYYY-MM-DD");
        for (const iterator of allData) {

            let [priceRecord, fields] = await connection.execute("SELECT * FROM `stock_exchange` WHERE date(created_at) < '" + currentDate + "' and status='successful' and lauch_id='" + iterator.id + "' ORDER by id desc LIMIT 1;");
            let [checkMultiple, fields2] = await connection.execute("SELECT * FROM `launchpaid` WHERE user_id='" + iterator.user_id + "' ;");

            let [lanuchPadDetail, fields1] = await connection.execute("SELECT * FROM `like_launchpad` WHERE launchpad_id = '" + iterator.id + "' and user_id='" + userId + "'  ORDER by id desc LIMIT 1;");

            let lastPrice = priceRecord && priceRecord[0] ? priceRecord[0].price : (iterator.total_img_sell > 0 ? iterator.total_img_sell : 0);
           
            
            let amountDiff = (iterator.live_image_price - lastPrice);
            let percent = amountDiff != "0" ? (amountDiff / lastPrice) * 100 : 0;
            if(lastPrice == 0 )
            {
                percent=0;
            }
                console.log("iterator.live_image_price",iterator.live_image_price);
                console.log("lastPrice",lastPrice,'amountDiff',amountDiff);
                console.log("percent",percent);
            let item = {};
            item = iterator;
            item.id=iterator.lauch_id?iterator.lauch_id:iterator.id;
            let startTime = '';
            if (setting && setting[0]) {
                startTime = await this.tConvert(setting[1]['var_data']);
            }
            let endTime = '';
            if (setting && setting[0]) {
                endTime = await this.tConvert(setting[0]['var_data']);;
            }


            item.start_date = moment(item.start_date).format("DD MMM YYYY") + " " + startTime;
            item.end_date = moment(item.end_date).format("DD MMM YYYY") + " " + endTime;
            item.livePrice = iterator.live_image_price;
            item.changePercent = percent.toFixed(2);
            item.diffMoney = amountDiff;
            item.totalUserIco = iterator.launc_paid_type ==2 ? (checkMultiple.length > 1 ? 1 : 0):0;
            item.likeWatch = lanuchPadDetail && lanuchPadDetail[0] ? "YES" : "NO";
            item.trand = percent > 0 ? "up" : (percent == 0 ? "neutral" : "down");



            //remove some object which is not required normaly
            delete item.approve_status;
            delete item.participant;
            delete item.remaining_qty;
            delete item.updated_at;
            delete item.live_image_price;
            delete item.demo_user_name;
            delete item.deleted_at;
            result.push(item);
        }
        return result;
    }

    imageFullCollection = async (ImageId, userId) => {
        let result = [];
        var date = new Date();
        let [setting] = await connection.execute("SELECT * FROM `setting_configs` WHERE var_key='ICO_START_TIMING' or var_key='ICO_END_TIMING' order by var_key asc;");
        let [allData] = await connection.execute("SELECT * FROM `launchpaid` WHERE id='" + ImageId + "' ;");
        let [extraData] = await connection.execute("SELECT * FROM `launch_paid_data` WHERE launch_id='" + ImageId + "' ;");

        let currentDate = moment(date).format("YYYY-MM-DD");
        let [priceRecord] = await connection.execute("SELECT * FROM `stock_exchange` WHERE date(created_at) < '" + currentDate + "' and status='successful' and lauch_id='" + ImageId + "' ORDER by id desc LIMIT 1;");


        for (const iterator of allData) {
            let [checkMultiple] = await connection.execute("SELECT * FROM `launchpaid` WHERE user_id='" + iterator.user_id + "' ;");
            let [userDetail] = await connection.execute("SELECT * FROM `users` WHERE id='" + iterator.user_id + "' ;");
            let checkApply = '';
            if (userId) {
                [checkApply] = await connection.execute("SELECT * FROM `ico_buy_application` WHERE launch_id='" + iterator.id + "' and user_id='" + userId + "' ;");

            }

            let lastPrice = priceRecord && priceRecord[0] ? priceRecord[0].price : (iterator.total_img_sell > 0 ? iterator.total_img_sell : 0);

            let amountDiff = (iterator.live_image_price - lastPrice);
            let percent = amountDiff != "0" ? (amountDiff / lastPrice) * 100 : 0;
            if(lastPrice == 0 )
            {
                percent=0;
            }
            let startTime = '';
            if (setting && setting[0]) {
                startTime = await this.tConvert(setting[1]['var_data']);
            }
            let endTime = '';
            if (setting && setting[0]) {
                endTime = await this.tConvert(setting[0]['var_data']);;
            }


            let item = {};
            item.name = userDetail && userDetail[0] ? userDetail[0].name : '';
            item.mobile = userDetail && userDetail[0] ? userDetail[0].mobile : '';
            item.email = userDetail && userDetail[0] ? userDetail[0].email : '';
            item.username = userDetail && userDetail[0] ? userDetail[0].username : '';
            item.id = ImageId;
            item.launc_paid_type = iterator.launc_paid_type;
            item.launch_image = iterator.launch_image;
            item.launch_sketch = iterator.launch_sketch;
            item.launch_designation = iterator.launch_designation;
            item.about_us = iterator.about_us;
            item.launch_website = iterator.launch_website;
            item.youtube_link = iterator.youtube_link;
            item.twitter_link = iterator.twitter_link;
            item.instra_link = iterator.instra_link;
            item.facebook_link = iterator.facebook_link;
            item.linked_link = iterator.linked_link;
            item.approve_status = iterator.approve_status;
            item.buy_status = iterator.buy_status;
            item.sell_status = iterator.sell_status;
            item.start_date = iterator.start_date ? moment(iterator.start_date).format("DD MMM YYYY") + " " + startTime : (extraData && extraData[0] ? moment(extraData[0].start_date).format("DD MMM YYYY") + " " + startTime : '');

            item.end_date = iterator.end_date ? moment(iterator.end_date).format("DD MMM YYYY") + " " + endTime : (extraData && extraData[0] ? moment(extraData[0].end_date).format("DD MMM YYYY") + " " + endTime : '');

            item.total_img_quanity = iterator.total_img_quanity;
            item.total_img_offered = iterator.total_img_offered;
            item.total_img_sell = iterator.total_img_sell;
            item.live_image_price = iterator.live_image_price;
            if (userId) {
                item.buy_status = checkApply && checkApply.length > 0 ? 1 : 0;
            }



            item.livePrice = iterator.live_image_price;
            item.changePercent =  percent.toFixed(2);;
            item.diffMoney = amountDiff;
            item.totalUserIco = checkMultiple.length > 1 ? 1 : 0;

            item.trand = percent > 0 ? "up" : (percent == 0 ? "neutral" : "down");




            result.push(item);
        }
        return result[0];
    }
    imageFullCollectionForPortfolio = async (ImageId, userId) => {
        let result = [];
        var date = new Date();
        let [allData] = await connection.execute("SELECT * FROM `launchpaid` WHERE id='" + ImageId + "' ;");
        let [extraData] = await connection.execute("SELECT * FROM `launch_paid_data` WHERE launch_id='" + ImageId + "' ;");

        let currentDate = moment(date).format("YYYY-MM-DD");
        let [priceRecord] = await connection.execute("SELECT * FROM `user_trading_portfolio` where user_id='" + userId + "' and image_id='" + ImageId + "' ORDER by id desc LIMIT 1;");


        for (const iterator of allData) {
            let [checkMultiple] = await connection.execute("SELECT * FROM `launchpaid` WHERE user_id='" + iterator.user_id + "' ;");
            let [userDetail] = await connection.execute("SELECT * FROM `users` WHERE id='" + iterator.user_id + "' ;");
            let lastPrice = priceRecord && priceRecord[0] ? priceRecord[0].price : (iterator.total_img_sell > 0 ? iterator.total_img_sell : 0);

            let amountDiff = (iterator.live_image_price - lastPrice);
            let percent = amountDiff != "0" ? (amountDiff / lastPrice) * 100 : 0;
            if(lastPrice == 0 )
            {
                percent=0;
            }
            let item = {};
            item.name = userDetail && userDetail[0] ? userDetail[0].name : '';
            item.mobile = userDetail && userDetail[0] ? userDetail[0].mobile : '';
            item.email = userDetail && userDetail[0] ? userDetail[0].email : '';
            item.username = userDetail && userDetail[0] ? userDetail[0].username : '';
            item.id = ImageId;
            item.launc_paid_type = iterator.launc_paid_type;
            item.launch_image = iterator.launch_image;
            item.launch_sketch = iterator.launch_sketch;
            item.launch_designation = iterator.launch_designation;
            item.about_us = iterator.about_us;
            item.launch_website = iterator.launch_website;
            item.youtube_link = iterator.youtube_link;
            item.twitter_link = iterator.twitter_link;
            item.instra_link = iterator.instra_link;
            item.facebook_link = iterator.facebook_link;
            item.linked_link = iterator.linked_link;
            item.approve_status = iterator.approve_status;
            item.start_date = iterator.start_date ? iterator.start_date : (extraData && extraData[0] ? extraData[0].start_date : '');
            item.end_date = iterator.end_date ? iterator.end_date : (extraData && extraData[0] ? extraData[0].end_date : '');
            item.total_img_quanity = iterator.total_img_quanity;
            item.total_img_offered = iterator.total_img_offered;
            item.total_img_sell = iterator.total_img_sell;
            item.live_image_price = iterator.live_image_price;
            item.buy_tatus = 0;



            item.livePrice = iterator.live_image_price;
            item.changePercent =  percent.toFixed(2);;
            item.diffMoney = amountDiff;
            item.totalUserIco = checkMultiple.length > 1 ? 1 : 0;

            item.trand = percent > 0 ? "up" : (percent == 0 ? "neutral" : "down");




            result.push(item);
        }
        return result[0];
    }
    tConvert = async (time) => {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
    }
    ImageDetailMultiple = async (ImageId, userId) => {
        let result = [];
        var date = new Date();
        let [setting] = await connection.execute("SELECT * FROM `setting_configs` WHERE var_key='ICO_START_TIMING' or var_key='ICO_END_TIMING' order by var_key asc;");

        let startTime = '';
        if (setting && setting[0]) {
            startTime = await this.tConvert(setting[1]['var_data']);
        }
        let endTime = '';
        if (setting && setting[0]) {
            endTime = await this.tConvert(setting[0]['var_data']);;
        }

        let [firstData] = await connection.execute("SELECT * FROM `launchpaid` WHERE id='" + ImageId + "' ;");
        let currentDate = moment(date).format("YYYY-MM-DD");
        let checkMultipleLunched=[];
        let checkMultipleUpcomming=[];
        let userDetail=[];
        if(firstData && firstData[0] && firstData[0].user_id)
        {
             [checkMultipleLunched] = await connection.execute("SELECT * FROM `launchpaid`  WHERE user_id='" + firstData[0].user_id + "' and  date(end_date) < '" + currentDate + "';");
             [checkMultipleUpcomming] = await connection.execute("SELECT * FROM `launchpaid`  WHERE user_id='" + firstData[0].user_id + "' and  date(end_date) >= '" + currentDate + "';");
             [userDetail] = await connection.execute("SELECT * FROM `users` WHERE id='" + firstData[0].user_id + "' ;");
    
        }
       
       

      

        let multiple = [];
        for (const iterator1 of checkMultipleLunched) {

            let [lanuchPadDetail] = await connection.execute("SELECT * FROM `like_launchpad` WHERE launchpad_id = '" + iterator1.id + "' and user_id='" + userId + "'  ORDER by id desc LIMIT 1;");

            let multipleItem = {};
            multipleItem.name = userDetail && userDetail[0] ? userDetail[0].name : '';
            multipleItem.mobile = userDetail && userDetail[0] ? userDetail[0].mobile : '';
            multipleItem.email = userDetail && userDetail[0] ? userDetail[0].email : '';
            multipleItem.username = userDetail && userDetail[0] ? userDetail[0].username : '';
            multipleItem.id = iterator1.id;
            multipleItem.launch_image = iterator1.launch_image;
            multipleItem.launch_sketch = iterator1.launch_sketch;
            multipleItem.livePrice = iterator1.live_image_price;
            let [priceRecord1] = await connection.execute("SELECT * FROM `stock_exchange` WHERE date(created_at) < '" + currentDate + "' and status='successful' and lauch_id='" + iterator1.id + "' ORDER by id desc LIMIT 1;");
            let lastPrice1 = priceRecord1 && priceRecord1[0] ? priceRecord1[0].price : (iterator1.total_img_sell > 0 ? iterator1.total_img_sell : 0);
            let amountDiff1 = (iterator1.live_image_price - lastPrice1);
            let percent1 = amountDiff1 != "0" ? (amountDiff1 / lastPrice1) * 100 : 0;
            if(lastPrice1 == 0 )
            {
                percent1=0;
            }
            multipleItem.changePercent = percent1.toFixed(2);
            multipleItem.diffMoney = amountDiff1;
            multipleItem.likeWatch = lanuchPadDetail && lanuchPadDetail[0] ? "YES" : "NO";
            multipleItem.trand = percent1 > 0 ? "up" : (percent1 == 0 ? "neutral" : "down");
            multiple.push(multipleItem);

        }

        let multipleUpcomming = [];
        for (const iterator1 of checkMultipleUpcomming) {

            let [extraData] = await connection.execute("SELECT * FROM `launch_paid_data` WHERE launch_id='" + iterator1.id + "' ;");

            let multipleUpcommingItem = {};
            multipleUpcommingItem.name = userDetail && userDetail[0] ? userDetail[0].name : '';
            multipleUpcommingItem.mobile = userDetail && userDetail[0] ? userDetail[0].mobile : '';
            multipleUpcommingItem.email = userDetail && userDetail[0] ? userDetail[0].email : '';
            multipleUpcommingItem.username = userDetail && userDetail[0] ? userDetail[0].username : '';
            multipleUpcommingItem.id = iterator1.id;
            multipleUpcommingItem.launch_image = iterator1.launch_image;
            multipleUpcommingItem.launch_sketch = iterator1.launch_sketch;
            multipleUpcommingItem.livePrice = iterator1.live_image_price;
            let [priceRecord1] = await connection.execute("SELECT * FROM `stock_exchange` WHERE date(created_at) < '" + currentDate + "' and status='successful' and lauch_id='" + iterator1.id + "' ORDER by id desc LIMIT 1;");
            let lastPrice1 = priceRecord1 && priceRecord1[0] ? priceRecord1[0].price : (iterator1.total_img_sell > 0 ? iterator1.total_img_sell : 0);
            let amountDiff1 = (iterator1.live_image_price - lastPrice1);
            let percent1 = amountDiff1 != "0" ? (amountDiff1 / lastPrice1) * 100 : 0;
            multipleUpcommingItem.changePercent = percent1.toFixed(2);
            multipleUpcommingItem.diffMoney = amountDiff1;
            multipleUpcommingItem.trand = percent1 > 0 ? "up" : (percent1 == 0 ? "neutral" : "down");

            multipleUpcommingItem.total_img_quanity = iterator1.total_img_quanity;
            multipleUpcommingItem.total_img_offered = iterator1.total_img_offered;
            multipleUpcommingItem.total_img_sell = iterator1.total_img_sell;



            multipleUpcommingItem.start_date = iterator1.start_date ? moment(iterator1.start_date).format("DD MMM YYYY") + " " + startTime : (extraData && extraData[0] ? moment(extraData[0].start_date).format("DD MMM YYYY") + " " + startTime : '');

            multipleUpcommingItem.end_date = iterator1.end_date ? moment(iterator1.end_date).format("DD MMM YYYY") + " " + endTime : (extraData && extraData[0] ? moment(extraData[0].end_date).format("DD MMM YYYY") + " " + endTime : '');

            multipleUpcomming.push(multipleUpcommingItem);

        }

        let item = {};
        item.name= userDetail && userDetail[0] ? userDetail[0].name : '';
        item.userImage=userDetail && userDetail[0] ? userDetail[0].profile : '';
        item.totalInvestment='15000';
        item.lunched = multiple;
        item.upcomming = multipleUpcomming;




        return item;
    }
    






}

export default new imageCollection();
