
// import UserModel from '../Models/User';
import connection from  "../Config/db";
import moment from 'moment';
import imageCollection from '../Collections/imageCollection';
import _ from "lodash";

/**
 *  TradeController Class
 *  @author Chetan Sharma <chetan.sharma@jploft.com>
 */



class TradeController {

    /**
     * Create gift
     */
    dashboard = async (userId) => {

        try {
            
            const [userDetail, fields] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
       
                let currentReturn=await this.getCurrentValue(userId,userDetail);
                console.log("dashboar",currentReturn);
                let result={};
                result.investment=currentReturn.investment;
                result.currentValue=currentReturn.currentValue;
                result.overallReturn=currentReturn.overallReturn;
                result.overallReturnAmount=currentReturn.currentValue-currentReturn.investment;
                result.trand=currentReturn.trand;
                result.accountType=userDetail && userDetail[0]?(userDetail[0].account_type==1?"demo":"live"):'demo';
                result.realAmount=userDetail && userDetail[0]?userDetail[0].tradding_live_wallet:0;
                result.demoAmount=userDetail && userDetail[0]?userDetail[0].tradding_demo_wallet:0;
                
                      
           
            return JSON.stringify(result);
        } catch (error) {
           return {message:error.message};
        }
    };
    getCurrentValue= async (userId,userDetail) =>{
        let UserType=userDetail[0].account_type; //1=demo 2=live
        let imageQuery='SELECT p.price,p.total_price,lp.live_image_price,p.quantity FROM `user_trading_portfolio` as p  join launchpaid as lp on lp.id =p.image_id   ';
        imageQuery=imageQuery+' and lp.launc_paid_type="'+UserType+'" ';
        imageQuery=imageQuery+' where p.user_id="'+userId+'" ';
      
        const [totalImages, fields] = await connection.execute(imageQuery);
      
        let currentValue=0;
        let totalPrice=0;
        for (const iterator of totalImages) {
            let liveTotalPrice=iterator.live_image_price*iterator.quantity;
            currentValue=parseFloat(currentValue)+parseFloat(liveTotalPrice);
            totalPrice=parseFloat(totalPrice)+parseFloat(iterator.total_price);

        }
        let overallReturn=0;
        if(totalPrice>0)
        {
            let profitLoss=currentValue-totalPrice;
            overallReturn=(profitLoss/totalPrice)*100;
            overallReturn=overallReturn.toFixed(2);
        }

        let result={
            investment:totalPrice.toString(),
            currentValue:currentValue.toString(),
            overallReturn:overallReturn.toString(),
            trand:overallReturn>0?"up":"down",
        }
        console.log(result,"result");
       
        return result;
    }
    upcommingICO  = async (userId) => {
        var date2 = new Date();
        const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
        let UserType=userDetail[0].account_type; //1=demo 2=live

        const [totalImages, fields] = await connection.execute('SELECT lp.*,p.*,u.name,u.email,u.username FROM `launch_paid_data` as p left join launchpaid as lp on lp.id =p.launch_id left join users as u on u.id=lp.user_id where p.end_date >  "'+moment(date2).format("YYYY-MM-DD")+'" and approve_status=2 and lp.user_id !="'+userId+'" and lp.launc_paid_type="'+UserType+'" ');
        let result=await imageCollection.normalCollection(totalImages,userId); 
       return {data:result};
    

    };
    hotTrade  = async (userId) => {
        var date2 = new Date();

        const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
        let UserType=userDetail[0].account_type; //1=demo 2=live


     

        let query='SELECT p.*,lp.launch_image,launch_sketch,launch_designation,live_image_price,about_us,sum(quantity) as totalqty,u.username,u.name,u.email FROM `stock_exchange` as p left join launchpaid as lp on lp.id =p.lauch_id';
       
        query=query+' and lp.launc_paid_type="'+UserType+'" ';
        
        query= query+' left join users as u on u.id=lp.user_id where p.created_at > "'+moment(date2).format("YYYY-MM-DD 00:00:00")+'"  and type="buy" and approve_status=2 group by lp.id order by totalqty desc  ';
        const [totalImages, fields] = await connection.execute(query);
        let result=await imageCollection.normalCollection(totalImages,userId); 

        return result;
    };
    topGainerAndLooser  = async (userId) => {
        var date = new Date();
        const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
        let UserType=userDetail[0].account_type; //1=demo 2=live
        let query='SELECT l.*,u.username,u.name,u.email FROM `launchpaid` as l left join users as u on u.id=l.user_id where approve_status=2 and l.launc_paid_type="'+UserType+'" ';
        const [totalImages, fields] = await connection.execute(query);
        let allResult=await imageCollection.normalCollection(totalImages,userId);        
        let topGainer=_.orderBy(allResult, ['changePercent'],['desc']);
        let topLooser=_.orderBy(allResult, ['changePercent'],['asc']);
        return {topGainer,topLooser};

        
    } ;
    tradingImage  = async (userId) => {
        const [userDetail] = await connection.execute('SELECT * FROM `users` where id="'+userId+'"');
        let UserType=userDetail[0].account_type; //1=demo 2=live

        let query='SELECT l.*,u.username,u.name,u.email FROM `launchpaid` as l left join users as u on u.id=l.user_id where approve_status=2  and l.launc_paid_type="'+UserType+'" ';
        const [totalImages, fields] = await connection.execute(query);
        let result= await imageCollection.normalCollection(totalImages,userId);
       
        return {data:result};
       

    }
    tradingImageDetail  = async (userId,id) => {
      
      
        let result=await imageCollection.imageFullCollection(id,userId);
        // result=extraDetail[0];
        // result.buystatus=0;
        return {data:result};
       

    }
    favImage= async (userId,id) => {
        let query='SELECT * FROM `like_launchpad` as l  where user_id='+userId+' and launchpad_id='+id+' ';
        const [totalImages, fields] = await connection.execute(query); 
        if(totalImages && totalImages.length > 0) 
        {
            let query='delete FROM `like_launchpad` as l  where user_id='+userId+' and launchpad_id='+id+' ';
            const [totalImages1, fields1] = await connection.execute(query); 
        } 
        else{
            let query='insert into `like_launchpad` (user_id,launchpad_id) values('+userId+','+id+') ';
            const [totalImages2, fields2] = await connection.execute(query); 
        }    
        let query1='SELECT * FROM `like_launchpad` as l  where user_id='+userId+' and launchpad_id='+id+' ';
        const [result, fields1] = await connection.execute(query1); 
       
        return {data:result[0]};
       

    }
    tradingImageDetailMultipleC  = async (userId,id) => {
      
        let result=await imageCollection.ImageDetailMultiple(id,userId);
        // result=extraDetail[0];
        // result.buystatus=0;
        return {data:result};
       

    }
    changeUserType=async (userId,type) =>{
        let query="update users set account_type='"+type+"' where id='"+userId+"' ";
        console.log(query,"query")
        console.log("changeUserType")
        await connection.execute(query); 
    }
    
    
    


}

export default new TradeController();
