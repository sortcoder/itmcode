@extends('admin.layouts.app')

@section('content')

<?php

  $data = [];
  $msg = '';

        /*$response = \App\Models\StockExchange::select(DB::raw('DATE(created_at) as date'), DB::raw('MAX(price) as high'), DB::raw('MIN(price) as low'))->where('status',"successful")->where('lauch_id',$row->id)->
        whereDate('stock_exchange.created_at','>=',$start_date)->
        whereDate('stock_exchange.created_at','<=',$end_date)->groupBy('date')->get()->toArray();*/


            /*$response = \App\Models\StockExchange::select(DB::raw('DATE(created_at) as date'), DB::raw('MAX(price) as high'), DB::raw('MIN(price) as low,created_at'))->orderBy('id','asc')->where(['lauch_id'=>$encodeId,'status'=>'successful','type'=>'buy'])->whereDate('stock_exchange.created_at','>=',$start_date)->whereDate('stock_exchange.created_at','<=',$end_date)->get()->toArray();*/

        $response = \App\Models\StockExchange::select(DB::raw('DATE(created_at) as date,created_at,price'))->orderBy('id','asc')->where(['lauch_id'=>$encodeId,'status'=>'successful','type'=>'buy'])->whereDate('stock_exchange.created_at','>=',$start_date)->whereDate('stock_exchange.created_at','<=',$end_date)->get()->toArray();

        if(!empty($response))
        {
            $sr = 11;
            foreach($response as $key =>$val)
            {  
                $val = (Object) $val;
                $dateTime = $val->date.' '.settingConfig('ICO_START_TIMING');
                $dateTime2 = $val->date.' '.settingConfig('ICO_END_TIMING');
                
                $opening = \App\Models\StockExchange::whereDate('created_at','<=',$dateTime)->orderBy('id','desc')->where('lauch_id',$row->id)->first('price')->price ?? 0;
                
                $closing = \App\Models\StockExchange::whereDate('created_at','<=',$dateTime2)->orderBy('id','desc')->where('lauch_id',$row->id)->first('price')->price ?? 0;

                $rowdata = [];
                $rowdata['date']    =   date('Y-m-d H:m:s',strtotime($val->created_at));
                $rowdata['high']    =   $val->price;
                $rowdata['low']     =   $val->price;
                $rowdata['open']    =   $opening;
                $rowdata['close']   =    $val->price; 
                $data[] = $rowdata;
            }
        }else{
            $msg =  "<span class='text-danger'>Graph Not Loaded Due to not available any data</span>";
        } 
 
?>
<style>
    .range_div{ float: right; margin: -4px; }  
    .canvasjs-navigator-panel{
        display: none;
    }
    .f-left{ float:left; padding: 2px; background: aliceblue; }
    .active_type{ background: #0dcaf0 !important;  }
</style>
<div class="card radius-10" >
    <div class="card-header"><h6>{{ $row->launch_sketch }} Trade Live Details</h6></div>
    <div class="card-body" >
        <div class="">
            <div class="range_div"> 
                <a class="btn btn-sm btn-info f-left {{ ($type=="1D") ? 'active_type' : '' }}" href="{{ url('admin/live-graph/'.$encodeId.'/1D') }}" >1D</a>                
                <a class="btn btn-sm btn-info f-left {{ ($type=="1W") ? 'active_type' : '' }}" href="{{ url('admin/live-graph/'.$encodeId.'/1W') }}" >1W</a>
                <a class="btn btn-sm btn-info f-left {{ ($type=="1M") ? 'active_type' : '' }}" href="{{ url('admin/live-graph/'.$encodeId.'/1M') }}" >1M</a>
                <a class="btn btn-sm btn-info f-left {{ ($type=="1Y") ? 'active_type' : '' }}" href="{{ url('admin/live-graph/'.$encodeId.'/1Y') }}" >1Y</a>
                <a class="btn btn-sm btn-info f-left {{ ($type=="3Y") ? 'active_type' : '' }}" href="{{ url('admin/live-graph/'.$encodeId.'/3Y') }}" >3Y</a>
            </div>
        </div>
        <br/>
        {!! $msg !!}
        <div id="chartContainer" style="height: 400px; width: 100%;" >

        </div> 
    </div>
</div>

<?php 
    $getBuyDataArr = App\Models\StockExchange::select(DB::raw('sum(quantity) as total_quantity'),'price','created_at','user_id')->orderBy('total_quantity','desc')->where('lauch_id',$row->id)->where(['status'=>'pending','type'=>"buy"])->where('quantity', '!=', '0')->whereBetween('created_at', [$start_date, $end_date])->groupBy('price')->take(5)->get();
    $getSellDataArr = App\Models\StockExchange::with('user')->select(DB::raw('sum(quantity) as total_quantity'),'price','created_at','user_id')->orderBy('total_quantity','desc')->where('lauch_id',$row->id)->where(['status'=>'pending','type'=>"sell"])->where('quantity', '!=', '0')->whereBetween('created_at', [$start_date, $end_date])->groupBy('price')->take(5)->get();  
 
?>
<div class="card radius-10" >
    <div class="card-header"><h6>Market Depth </h6></div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-6">
                <h6>Bid(Buy Orders) </h6>
                <table class="table table-bordered">
                    <tr> 
                       <!--  <td>Date/Time</td>
                        <td>User</td> -->
                        <td>Quantity</td>
                        <td>Market Price</td> 
                    </tr> 
                    @foreach($getBuyDataArr as $key =>$buy_depth_val)
                        @php
                            $getUser = App\Models\User::where('id',$buy_depth_val->user_id)->first();
                        @endphp
                        <tr>  
                            <td>{{ $buy_depth_val->total_quantity }}</td>
                            <td>{{ $buy_depth_val->price }}</td> 
                        </tr>
                    @endforeach
                </table>
            </div>
            <div class="col-md-6">
                <h6>Ask(Sell Orders) </h6>
                <table class="table table-bordered">
                    <tr> 
                      <!--   <td>Date/Time</td>
                        <td>User</td> -->
                        <td>Quantity</td>
                        <td>Market Price</td> 
                    </tr> 
                    @foreach($getSellDataArr as $key =>$sell_depth_val)
                        <tr>  
                            <td>{{ $sell_depth_val->total_quantity }}</td>
                            <td>{{ $sell_depth_val->price }}</td> 
                        </tr>
                    @endforeach
                </table>
            </div>
        </div> 
    </div> 
    </div>
</div>
@section('script')
<script src="{{ asset('assets/admin/js/canvasjs.stock.min.js') }}"></script>
 <script>
   window.onload = function () {
      var dataPoints = [];
      var stockChart = new CanvasJS.StockChart("chartContainer",{
        theme: "light2",
        title:{
          text:""
        }, 
        rangeSelector: {
            buttons: {
             enabled: false,
           },
           inputFields: {
             enabled: false,
           },  
        },
        charts: [{
          axisX: {
            crosshair: {
              enabled: true,
              snapToDataPoint: true
            }
          },
          axisY: {
            prefix: "$",
            crosshair: {
              enabled: true,
              snapToDataPoint: true,
              valueFormatString: "$#,###.##"
            }
          },
          toolTip: {
            shared: true
          },
          data: [{
            type: "spline",
            name: "Price",
            yValueFormatString: "$#,###.##",
            dataPoints : dataPoints
          }],
        }], 
        navigator: {
              data: [{
                dataPoints: dataPoints
              }],
              slider: {
                enabled: false,
              }
            }
      });
        
        json_chart_data = '<?php echo json_encode($data); ?>'; 
        json_chart_data2 = $.parseJSON(json_chart_data);
        console.log(json_chart_data2);
        if(json_chart_data2.length>0){
            $.each(json_chart_data2, function (key, value) {
                 console.log("sdds");
                console.log(value);
                dataPoints.push({x: new Date(value.date), y: Number(value.close)});
            });
            stockChart.render();
        } 
        

        
            /*$.getJSON("https://canvasjs.com/data/docs/ethusd2018.json", function(data){
                for(var i = 0; i < data.length; i++){
                    dataPoints.push({x: new Date(data[i].date), y: Number(data[i].close)});
                }
                stockChart.render();
            });*/
        


    } 
</script>
@endsection
@endsection



