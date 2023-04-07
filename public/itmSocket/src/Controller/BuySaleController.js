
// import UserModel from '../Models/User';
import connection from "../Config/db";
import moment from 'moment';
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class BuySaleController {

    /**
     * Create gift
     */
    index = async (id, days = 1) => {

        try {

            let result = {};
            result = await imageCollection.imageFullCollection(id, '');
            result.marketDepth = await this.marketDepth(id);
            result.overAllBuyTotal = await this.getTotalBuyQty(id);
            result.overAllSaleTotal = await this.getTotalSaleQty(id);
            result.graphData = await this.graphData(id, days);
            let totalLength = result.graphData.length;
            let lastValue = 0;
            let firstValue = 0;

            if (totalLength > 0) {
                lastValue = result.graphData[totalLength - 1].price;
                firstValue = result.graphData[0].price;
            }


            result.graphTrand = firstValue > lastValue ? "down" : (firstValue < lastValue ? "up" : "neutral");



            return result;
        } catch (error) {
            return { message: error.message };
        }
    };
    marketDepth = async (id) => {
        let query = 'SELECT *,sum(quantity) as totalqty FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="buy" group by price order by price DESC limit 5; ';
        const [pendingBuyOrders] = await connection.execute(query);


        let query1 = 'SELECT *,sum(quantity) as totalqty FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="sell" group by price order by price ASC limit 5; ';
        const [pendingSellOrders] = await connection.execute(query1);
        //check which length is greater
        let primaryLoop = [];

        if (pendingSellOrders.length >= pendingBuyOrders.length) {
            primaryLoop = pendingSellOrders;
        }
        else {
            primaryLoop = pendingBuyOrders;
        }
        let i = 0;
        let result = [];
        for (const iterator of primaryLoop) {
            let item = {};
            item.buyPrice = pendingBuyOrders && pendingBuyOrders[i] ? pendingBuyOrders[i].price : "-";
            item.buyTotalQty = pendingBuyOrders && pendingBuyOrders[i] ? pendingBuyOrders[i].totalqty : "-";
            item.sellPrice = pendingSellOrders && pendingSellOrders[i] ? pendingSellOrders[i].price : "-";
            item.sellTotalQty = pendingSellOrders && pendingSellOrders[i] ? pendingSellOrders[i].totalqty : "-";
            result.push(item);
            i++;
        }
        return result;
    }
    graphData = async (id, days) => {
        var startdate = moment();
        days = days - 1;
        startdate = startdate.subtract(days, "days");
        startdate = startdate.format("YYYY-MM-DD");

        let query = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="successful" and type="buy" and date(created_at) >="' + startdate + '" order by id asc; ';
        const [successOrder] = await connection.execute(query);
        let result = [];

        for (const iterator of successOrder) {
            let item = {};
            item.price = iterator.price;
            item.datetime = moment(iterator.created_at).format("DD MMM YYYY HH:mm:ss");
            item.created_at = iterator.created_at;

            result.push(item);

        }
        return result;
    }
    getTotalBuyQty = async (id) => {
        let query = 'SELECT *,sum(quantity) as totalqty FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="buy"  order by price DESC ; ';
        const [pendingBuyOrders] = await connection.execute(query);
        return pendingBuyOrders && pendingBuyOrders[0] ? pendingBuyOrders[0].price : "-";

    }
    getTotalSaleQty = async (id) => {
        let query = 'SELECT *,sum(quantity) as totalqty FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="sell"  order by price DESC ; ';
        const [pendingBuyOrders] = await connection.execute(query);
        let finalValue = pendingBuyOrders && pendingBuyOrders[0] ? (pendingBuyOrders[0].price > 0 ? pendingBuyOrders[0].price : 0) : "0";
        // this.createOrder(1,"buy",1,1,1);
        return finalValue;

    }
    createOrder = async (id, type, userId, price, qty) => {
        let inverseType = type == "buy" ? "sell" : "buy";
        let validationResult = await this.sellValidation(id, userId, price, qty, type);
        if (validationResult.status == "failed") {
            return validationResult;
        }
        let checkquery = '';
        if (inverseType == "buy") {
            checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="' + inverseType + '"  and price >= "' + price + '" and user_id !="' + userId + '" order by id asc ; ';
        }
        else {
            checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="' + inverseType + '"  and price <= "' + price + '" and user_id !="' + userId + '" order by id asc ; ';
        }

        const [records] = await connection.execute(checkquery);

        let stockExId = await this.insertInExchange(id, type, userId, price, qty);
        // if same price order already exist in inverse type then complete (succss) order
        let orderRemainQty = qty;
        if (records && records[0]) {
            for (const iterator of records) {


                if (orderRemainQty > 0) {
                    let response = {};
                    //if previous  single order have sufficiant qty
                    if (iterator.remaining_qty >= qty) {
                        await this.insertStockHistory(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);
                        response = await this.updatePortfolio(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);

                    }
                    // if require multiple order to fullfill current order
                    else {

                        await this.insertStockHistory(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);
                        response = await this.updatePortfolio(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);
                    }
                    orderRemainQty = response.orderRemainQty;
                    let usedQty = response.usedQty;

                    if (response.status == true) {
                        await this.updateStockExchange(stockExId, iterator, orderRemainQty, usedQty, type, id);
                    }

                }
                else {
                    break;
                }

            }
        }
        return { message: "Order Placed Successfully", status: "success" }

    }
    sellValidation = async (id, userId, price, qty, type, stockExchangeData = '') => {
        console.log("sellValidation", type)
        if (type == "sell") {
            let checkStockQuery = 'SELECT * FROM `user_trading_portfolio` where user_id="' + userId + '" and  image_id="' + id + '"  and quantity >= "' + qty + '"; ';
            const [checkStock] = await connection.execute(checkStockQuery);
            console.log("checkStock", checkStock)
            if (checkStock.length == 0) {
                return { message: "Insufficient Quantity", status: "failed" }
            }

            let checkPendingQuery = 'SELECT sum(quantity) as orderQty FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="' + type + '" and user_id ="' + userId + '"  ';
            if (stockExchangeData) {
                checkPendingQuery = checkPendingQuery + " and id != '" + stockExchangeData.id + "' ";
            }
            checkPendingQuery = checkPendingQuery + " order by id asc ; ";
            const [pendingOrdersQty] = await connection.execute(checkPendingQuery);
            let totalOrderQty = parseInt(pendingOrdersQty[0].orderQty) + parseInt(qty);
            if (pendingOrdersQty.length > 0 && totalOrderQty > checkStock[0].quantity) {
                return { message: "Insufficient Quantity.you have already used all quantity", status: "failed" }
            }

        }
        else {
            let userQuery = 'SELECT * FROM `users` where id="' + userId + '"; ';
            const [userDetail] = await connection.execute(userQuery);
            let UserType = userDetail[0].account_type; //1=demo 2=live
            let checkPendingQuery = 'SELECT * FROM `stock_exchange` where status="pending" and type="' + type + '" and user_id ="' + userId + '"  ';

            if (stockExchangeData) {
                checkPendingQuery = checkPendingQuery + " and id != '" + stockExchangeData.id + "' ";
            }
            checkPendingQuery = checkPendingQuery + " order by id asc ; ";

            const [pendingOrdersQty] = await connection.execute(checkPendingQuery);
            let totalprice = 0;
            for (const iterator of pendingOrdersQty) {
                totalprice = parseFloat(totalprice) + (parseFloat(iterator.price) * parseFloat(iterator.quantity));

            }
            totalprice = parseFloat(totalprice) + (price * qty);
            if (UserType == 2) {
                if (totalprice > userDetail[0].tradding_live_wallet) {
                    return { message: "Insufficient Found.Please add amount to your wallet", status: "failed" }
                }
            }
            else {
                if (totalprice > userDetail[0].tradding_demo_wallet) {
                    return { message: "Insufficient Found.Please add amount to your wallet", status: "failed" }
                }
            }

        }


        let checkPrice = 'SELECT * FROM `launchpaid` where id="' + id + '" ; ';
        const [currentData] = await connection.execute(checkPrice);

        let settingQueryBuy = 'SELECT * FROM `setting_configs` where var_key="BUY_TRADING_PERCENTAGE" ; ';
        const [buySetting] = await connection.execute(settingQueryBuy);

        let sellSettingQuery = 'SELECT * FROM `setting_configs` where var_key="SELL_TRADING_PERCENTAGE" ; ';
        const [sellSetting] = await connection.execute(sellSettingQuery);


        let currentPriceDiff = currentData[0].live_image_price - price;
        let parcentChange = (currentPriceDiff / currentData[0].live_image_price) * 100;
        if (type == "buy" && (parcentChange > buySetting[0].var_data || parcentChange < "-" + buySetting[0].var_data)) {
            return { message: "Price is too high or low", status: "failed" }
        }
        if (type == "sell" && (parcentChange > sellSetting[0].var_data || parcentChange < "-" + sellSetting[0].var_data)) {
            return { message: "Price is too high or low", status: "failed" }
        }
        return { message: "success", status: "success" }
    }
    insertInExchange = async (id, type, userId, price, qty) => {
        let query = 'insert into stock_exchange(user_id,lauch_id,price,type,quantity,remaining_qty,status) values("' + userId + '","' + id + '","' + price + '","' + type + '","' + qty + '","' + qty + '","pending")  ; ';
        const [pendingBuyOrders] = await connection.execute(query);
        return pendingBuyOrders.insertId;
    }
    updateStockExchange = async (stockExId, previousStockExData, orderRemainQty, usedQty, type, id) => {

        let currentRecord = 'SELECT * FROM `stock_exchange` where id=' + stockExId + '; ';
        const [records1] = await connection.execute(currentRecord);

        if (!orderRemainQty || orderRemainQty == 0) {
            let query = 'update stock_exchange set remaining_qty="0",status="successful" where id="' + stockExId + '" ; ';
            await connection.execute(query);

            let query2 = 'update launchpaid set live_image_price="' + records1[0].price + '"  where id="' + id + '" ; ';
            await connection.execute(query2);

        }
        else {
            let query = 'update stock_exchange set remaining_qty="' + orderRemainQty + '" where id="' + stockExId + '" ; ';
            const [pendingBuyOrders] = await connection.execute(query);

        }

        // update and manage trading transaction for p&L 
        if (type == "sell") {
            let checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="successful" and type="buy"  and quantity > sell_qty and user_id="' + records1[0].user_id + '" order by id asc ; ';
            const [records] = await connection.execute(checkquery);



            let priceDiff = records1[0].price - records[0].price;
            let profitAmount = priceDiff * usedQty;
            let profitPercent = (priceDiff / records[0].price) * 100;
            let profilLoss = 1;
            if (profitPercent < 0) {
                profilLoss = 2;
            }
            let query1 = "INSERT INTO `trading_transaction`( `first_buy_stock_exchange_id`, `stock_exchange_id`, `image_id`, `first_buy_user_id`, `user_id`, `quantity`, `first_buy_price`, `price`, `type`, `live_price`, `status`, `profit_in_amount`, `profit_in_percent`, `is_profit_or_loss`) VALUES ('" + records[0].id + "','" + stockExId + "','" + id + "','" + records[0].user_id + "','" + records[0].user_id + "','" + usedQty + "','" + records[0].price + "','" + records1[0].price + "','sell','" + records1[0].price + "','successful','" + profitAmount + "','" + profitPercent + "','" + profilLoss + "')";
            await connection.execute(query1);

            let newSellQty = parseInt(records[0].sell_qty) + parseInt(usedQty);
            let checkquery1 = 'update `stock_exchange` set sell_qty=' + newSellQty + ' where id=' + records[0].id + ' ; ';
            await connection.execute(checkquery1);
            let type="credit";
            if(profilLoss == 2)
            {
                type="Debit";
            }
            let query = 'SELECT * FROM `users` where id="' + records[0].user_id + '"; ';
            const [userDetail] = await connection.execute(query);
            let UserType = userDetail[0].account_type; //1=demo 2=live
            let tranactionType=UserType==1?"Demo":"live";
            let query2 = 'insert into user_investment(user_id,amount,payment_type,status,type,remark) values("' + records[0].user_id+ '","' + profitAmount + '","'+type+'","Successful","'+tranactionType+'","sell image") ; ';
            await connection.execute(query2);


        } else {
            // if your order is buy type then update seller  sell_qty
            let checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="successful" and type="buy"  and quantity > sell_qty and user_id="' + previousStockExData.user_id + '" order by id asc ; ';
            const [records] = await connection.execute(checkquery);

            let priceDiff = records1[0].price - records[0].price;
            let profitAmount = priceDiff * usedQty;
            let profitPercent = (priceDiff / records[0].price) * 100;
            let profilLoss = 1;
            if (profitPercent < 0) {
                profilLoss = 2;
            }
            let query1 = "INSERT INTO `trading_transaction`( `first_buy_stock_exchange_id`, `stock_exchange_id`, `image_id`, `first_buy_user_id`, `user_id`, `quantity`, `first_buy_price`, `price`, `type`, `live_price`, `status`, `profit_in_amount`, `profit_in_percent`, `is_profit_or_loss`) VALUES ('" + records[0].id + "','" + stockExId + "','" + id + "','" + records[0].user_id + "','" + records[0].user_id + "','" + usedQty + "','" + records[0].price + "','" + records1[0].price + "','sell','" + records1[0].price + "','successful','" + profitAmount + "','" + profitPercent + "','" + profilLoss + "')";
            await connection.execute(query1);

            let newSellQty = parseInt(records[0].sell_qty) + parseInt(usedQty);
            let checkquery1 = 'update `stock_exchange` set sell_qty=' + newSellQty + ' where id=' + records[0].id + ' ; ';
            await connection.execute(checkquery1);


            let type="credit";
            if(profilLoss == 2)
            {
                type="Debit";
            }
            let query = 'SELECT * FROM `users` where id="' + records[0].user_id + '"; ';
            const [userDetail] = await connection.execute(query);
            let UserType = userDetail[0].account_type; //1=demo 2=live
            let tranactionType=UserType==1?"Demo":"live";
            let query2 = 'insert into user_investment(user_id,amount,payment_type,status,type,remark) values("' + records[0].user_id+ '","' + profitAmount + '","'+type+'","Successful","'+tranactionType+'","sell image") ; ';
            await connection.execute(query2);

        }



        if (previousStockExData.remaining_qty == usedQty) {
            let query1 = 'update stock_exchange set remaining_qty="0", status="successful" where id="' + previousStockExData.id + '" ; ';
            await connection.execute(query1);

            let query2 = 'update launchpaid set live_image_price="' + records1[0].price + '"  where id="' + id + '" ; ';
            await connection.execute(query2);
        }
        else {
            let remaining_qty = previousStockExData.remaining_qty - usedQty;
            let newSellQty = parseInt(previousStockExData.sell_qty) + parseInt(usedQty);
            let query1 = 'update stock_exchange set remaining_qty="' + remaining_qty + '" where id="' + previousStockExData.id + '" ; ';
            await connection.execute(query1);
        }




    }
    insertStockHistory = async (id, type, userId, price, qty, stockExId, previousStockExId, orderRemainQty) => {

        let fromRemainQty = previousStockExId.remaining_qty >= orderRemainQty ? previousStockExId.remaining_qty - orderRemainQty : 0;
        let toRemainQty = previousStockExId.remaining_qty >= orderRemainQty ? 0 : orderRemainQty - previousStockExId.remaining_qty;

        let query = 'INSERT INTO `stock_exchange_history`( `from_stock_exchange_id`, `to_stock_exchange_id`, `from_user_id`, `to_user_id`, `from_type`, `to_type`, `from_quantity`, `to_quantity`, `from_remaining_qty`, `to_remaining_qty`, `buying_price`, `selling_price`) VALUES ("' + previousStockExId.id + '","' + stockExId + '","' + previousStockExId.user_id + '","' + userId + '","' + previousStockExId.type + '","' + type + '","' + previousStockExId.quantity + '","' + qty + '","' + fromRemainQty + '","' + toRemainQty + '","' + price + '","' + price + '") ; ';
        const [history] = await connection.execute(query);

        
        return history.insertId;
    }
    updatePortfolio = async (id, type, userId, price, qty, stockExId, previousStockExId, orderRemainQty) => {

        let usedQty = previousStockExId.remaining_qty >= orderRemainQty ? orderRemainQty : previousStockExId.remaining_qty;
        orderRemainQty = orderRemainQty - usedQty;
        let checkquery = 'SELECT * FROM `user_trading_portfolio` where user_id="' + userId + '" and  image_id="' + id + '" ; ';
        const [checkPortfolio] = await connection.execute(checkquery);

        let checkqueryPre = 'SELECT * FROM `user_trading_portfolio` where user_id="' + previousStockExId.user_id + '" and  image_id="' + id + '" ; ';
        const [checkPortfolioPre] = await connection.execute(checkqueryPre);

        if (type == "buy") {

            // if image already in portfolio
            if (checkPortfolio && checkPortfolio[0]) {
                let newTotal = parseFloat(checkPortfolio[0].total_price) + (price * usedQty);
                let newQty = parseFloat(checkPortfolio[0].quantity) + parseFloat(usedQty);
                let newPrice = newTotal / newQty;
                let query = 'UPDATE `user_trading_portfolio` SET `quantity`="' + newQty + '",`price`="' + newPrice + '",`total_price`="' + newTotal + '" WHERE user_id="' + userId + '" and  image_id="' + id + '"; ';
                const [history] = await connection.execute(query);


                //update previouse user Detail

                let newQty1 = checkPortfolioPre[0].quantity - usedQty;

                let newTotal1 = checkPortfolioPre[0].price * newQty1;


                let query1 = 'UPDATE `user_trading_portfolio` SET `quantity`="' + newQty1 + '",`price`="' + checkPortfolioPre[0].price + '",`total_price`="' + newTotal1 + '" WHERE id="' + checkPortfolioPre[0].id + '" and  image_id="' + id + '"; ';
                const [history1] = await connection.execute(query1);
                await this.updateWallet(userId, price, usedQty, type, stockExId);
                await this.updateWallet(previousStockExId.user_id, price, usedQty, "sell", previousStockExId.id);
              
                return { message: "Success", status: true, orderRemainQty: orderRemainQty, usedQty: usedQty };


            }
            else {
                let query = 'INSERT INTO `user_trading_portfolio`( `user_id`, `image_id`, `quantity`, `price`, `total_price`) VALUES (' + userId + ',' + id + ',' + usedQty + ',' + price + ',' + (price * usedQty) + '); ';
                const [history] = await connection.execute(query);


                let newQty1 = checkPortfolioPre[0].quantity - usedQty;

                let newTotal1 = checkPortfolioPre[0].price * newQty1;


                let query1 = 'UPDATE `user_trading_portfolio` SET `quantity`="' + newQty1 + '",`total_price`="' + newTotal1 + '" WHERE id="' + checkPortfolioPre[0].id + '" and  image_id="' + id + '"; ';
                const [history1] = await connection.execute(query1);

                await this.updateWallet(userId, price, usedQty, type, stockExId);
                await this.updateWallet(previousStockExId.user_id, price, usedQty, "sell", previousStockExId.id);
                
                return { message: "Success", status: true, orderRemainQty: orderRemainQty, usedQty: usedQty };
            }


        }
        else {
            //for sale order

            // if image already in portfolio
            if (checkPortfolio && checkPortfolio[0]) {
                let newQty = checkPortfolio[0].quantity - usedQty;
                let newTotal = checkPortfolio[0].price * newQty;


                let query = 'UPDATE `user_trading_portfolio` SET `quantity`="' + newQty + '",`price`="' + checkPortfolio[0].price + '",`total_price`="' + newTotal + '" WHERE user_id="' + userId + '" and  image_id="' + id + '"; ';
                const [history] = await connection.execute(query);


                //update previouse user Detail
                if (checkPortfolioPre && checkPortfolioPre[0]) {

                    let newQty1 = parseFloat(checkPortfolioPre[0].quantity) + parseFloat(usedQty);
                    let newTotal1 = checkPortfolioPre[0].price * newQty1;
                    let query1 = 'UPDATE `user_trading_portfolio` SET `quantity`="' + newQty1 + '",`price`="' + checkPortfolioPre[0].price + '",`total_price`="' + newTotal1 + '" WHERE id="' + checkPortfolioPre[0].id + '" and  image_id="' + id + '"; ';
                    const [history1] = await connection.execute(query1);

                }
                else {
                    let query = 'INSERT INTO `user_trading_portfolio`( `user_id`, `image_id`, `quantity`, `price`, `total_price`) VALUES (' + previousStockExId.user_id + ',' + id + ',' + usedQty + ',' + price + ',' + (price * usedQty) + '); ';
                    const [history] = await connection.execute(query);
                }
                await this.updateWallet(userId, price, usedQty, type, stockExId);
              
                await this.updateWallet(previousStockExId.user_id, price, usedQty, "buy", previousStockExId.id);
                return { message: "Success", status: true, orderRemainQty: orderRemainQty, usedQty: usedQty };

            }
            else {

                return { message: "Insufficient Quantity", status: false };
            }
        }


    }
    updateWallet = async (userId, price, qty, type, stockExId) => {


        let totalPrice = price * qty
        let date = moment().format("YYYY-MM-DD HH:mm:ss");
        let query = 'SELECT * FROM `users` where id="' + userId + '"; ';
        const [userDetail] = await connection.execute(query);
        let UserType = userDetail[0].account_type; //1=demo 2=live
        // manage live wallet
        if (UserType == 2) {
            let tradingWallet = userDetail && userDetail[0] ? userDetail[0].tradding_live_wallet : 0;
            if (type == "buy") {

                let newTradingWallet = tradingWallet - totalPrice;
                let query1 = 'UPDATE `users` SET `tradding_live_wallet`="' + newTradingWallet + '" WHERE id="' + userId + '"; ';
                await connection.execute(query1);

                let query2 = 'insert into tradding_wallets(user_id,is_transfer,amount,payment_type,status,type,remark,stock_id,created_at) values("' + userId + '",0,"' + totalPrice + '","debit","Successful","live","buy image","' + stockExId + '","' + date + '") ; ';
                await connection.execute(query2);

            }
            else {

                let newTradingWallet = parseFloat(tradingWallet) + parseFloat(totalPrice);
                let query1 = 'UPDATE `users` SET `tradding_live_wallet`="' + newTradingWallet + '" WHERE id="' + userId + '"; ';
                await connection.execute(query1);

                let query2 = 'insert into tradding_wallets(user_id,is_transfer,amount,payment_type,status,type,remark,stock_id,created_at) values("' + userId + '",0,"' + totalPrice + '","credit","Successful","live","sell image","' + stockExId + '","' + date + '") ; ';
                await connection.execute(query2)
            }
        }
        //manage demo wallet
        else {
            let tradingWallet = userDetail && userDetail[0] ? userDetail[0].tradding_demo_wallet : 0;
            if (type == "buy") {

                let newTradingWallet = tradingWallet - totalPrice;
                let query1 = 'UPDATE `users` SET `tradding_demo_wallet`="' + newTradingWallet + '" WHERE id="' + userId + '"; ';
                await connection.execute(query1);

                let query2 = 'insert into tradding_wallets(user_id,is_transfer,amount,payment_type,status,type,remark,stock_id,created_at) values("' + userId + '",0,"' + totalPrice + '","debit","Successful","demo","buy image","' + stockExId + '","' + date + '") ; ';
                await connection.execute(query2);

            }
            else {

                let newTradingWallet = parseFloat(tradingWallet) + parseFloat(totalPrice);
                let query1 = 'UPDATE `users` SET `tradding_demo_wallet`="' + newTradingWallet + '" WHERE id="' + userId + '"; ';
                await connection.execute(query1);

                let query2 = 'insert into tradding_wallets(user_id,is_transfer,amount,payment_type,status,type,remark,stock_id,created_at) values("' + userId + '",0,"' + totalPrice + '","credit","Successful","demo","sell image","' + stockExId + '","' + date + '") ; ';
                await connection.execute(query2)
            }
        }

    }

   

    updateOrder = async (stockExId, price, qty) => {

        let stockExchangeQuery = 'SELECT * FROM `stock_exchange` where id="' + stockExId + '"  order by id asc ; ';
        const [stockExchangeData] = await connection.execute(stockExchangeQuery);
        let type = stockExchangeData[0].type;
        let id = stockExchangeData[0].lauch_id;
        let userId = stockExchangeData[0].user_id;
        let inverseType = type == "buy" ? "sell" : "buy";
        let validationResult = await this.sellValidation(id, userId, price, qty, type, stockExchangeData[0]);
        if (validationResult.status == "failed") {
            return validationResult;
        }
        let checkquery = '';
        if (inverseType == "buy") {
            checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="' + inverseType + '"  and price >= "' + price + '" and user_id !="' + userId + '" order by id asc ; ';
        }
        else {
            checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + id + '" and status="pending" and type="' + inverseType + '"  and price <= "' + price + '" and user_id !="' + userId + '" order by id asc ; ';
        }

        const [records] = await connection.execute(checkquery);

        let query1 = 'update stock_exchange set price="' + price + '", quantity = "' + qty + '"  where id="' + stockExId + '" ; ';
        await connection.execute(query1);

        // if same price order already exist in inverse type then complete (succss) order
        let orderRemainQty = qty;
        if (records && records[0]) {
            for (const iterator of records) {


                if (orderRemainQty > 0) {
                    let response = {};
                    //if previous  single order have sufficiant qty
                    if (iterator.remaining_qty >= qty) {
                        await this.insertStockHistory(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);
                        response = await this.updatePortfolio(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);

                    }
                    // if require multiple order to fullfill current order
                    else {

                        await this.insertStockHistory(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);
                        response = await this.updatePortfolio(id, type, userId, price, qty, stockExId, iterator, orderRemainQty);
                    }
                    orderRemainQty = response.orderRemainQty;
                    let usedQty = response.usedQty;

                    if (response.status == true) {
                        await this.updateStockExchange(stockExId, iterator, orderRemainQty, usedQty, type, id);
                    }

                }
                else {
                    break;
                }

            }
        }
        return { message: "Order Updated Successfully", status: "success" }

    }
    demoAutoBuySale = async () => {
        //1=demo 2=live
        console.log("cron running")
        let launchpaidQuery = 'SELECT * FROM `launchpaid` where launc_paid_type="1"; ';
        const [launchPaid] = await connection.execute(launchpaidQuery);
        for (const iterator of launchPaid) {
          let  checkquery = 'SELECT * FROM `stock_exchange` where lauch_id="' + iterator.id + '" and status="pending"  order by id asc ; ';
            const [records] = await connection.execute(checkquery);
            for (const iterator1 of records) {
                if (iterator1.type == "buy") {
                    // insert admin buy dummy order
                    let query = 'insert into stock_exchange(user_id,lauch_id,price,type,quantity,remaining_qty,status) values("1","' + iterator.id + '","' + iterator1.price + '","buy","' + iterator1.quantity + '","0","successful")  ; ';
                    const [orderDetail] = await connection.execute(query);
                    let buyOrderId = orderDetail.insertId;

                    let checkquery1 = 'SELECT * FROM `user_trading_portfolio` where user_id="1" and  image_id="' + iterator.id + '" ; ';
                    const [checkPortfolio] = await connection.execute(checkquery1);


                    let price = iterator1.price;
                    let usedQty = iterator1.quantity;
                    let id = iterator.id;
                    let userId = 1;

                    if (checkPortfolio && checkPortfolio[0]) {
                        let newTotal = parseFloat(checkPortfolio[0].total_price) + (price * usedQty);
                        let newQty = parseFloat(checkPortfolio[0].quantity) + parseFloat(usedQty);
                        let newPrice = newTotal / newQty;
                        let query = 'UPDATE `user_trading_portfolio` SET `quantity`="' + newQty + '",`price`="' + newPrice + '",`total_price`="' + newTotal + '" WHERE user_id="' + userId + '" and  image_id="' + id + '"; ';
                         await connection.execute(query);

                    }
                    else {
                        let query = 'INSERT INTO `user_trading_portfolio`( `user_id`, `image_id`, `quantity`, `price`, `total_price`) VALUES (' + userId + ',' + id + ',' + usedQty + ',' + price + ',' + (price * usedQty) + '); ';
                      await connection.execute(query);

                    }

                    // insert admin sell dummy order
                    await this.createOrder(iterator.id, "sell", 1, iterator1.price, iterator1.quantity);


                }
                else{
                  
                     // insert admin buy dummy order
                     await this.createOrder(iterator.id, "buy", 1, iterator1.price, iterator1.quantity);
                }
            }
        }

    }







}

export default new BuySaleController();
