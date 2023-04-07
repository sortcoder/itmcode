@extends('admin.layouts.app')

@section('content')

<?php


        $data = [];
        $msg = '';
        $x_valArr = [];
        $y_valArr = [];

        $response = \App\Models\StockExchange::select(DB::raw('DATE(created_at) as date,created_at,price'))->orderBy('id','asc')->where(['lauch_id'=>$encodeId,'status'=>'successful','type'=>'buy'])->whereDate('stock_exchange.created_at','>=',$start_date)->whereDate('stock_exchange.created_at','<=',$end_date)->whereDate('stock_exchange.created_at','<=',$end_date)->get()->toArray();

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

                $x_valArr[] = date('Y-m-d H:m:s',strtotime($val->created_at));
                $y_valArr[] = $val->price;

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

        // dd($x_valArr);

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
        <!-- <div id="chartContainer" style="height: 400px; width: 100%;" >

        </div>  -->

        <div style="height: 270px; width: 100%;" >
            <canvas id="myChart" style="width:100%;height: 100%;"></canvas>
        </div>

    </div>
</div>


<?php 
    $todayDate = date("Y-m-d"); 

    $getBuyDataArr = App\Models\StockExchange::select(DB::raw('sum(quantity) as total_quantity'),'price','created_at','user_id')->orderBy('total_quantity','desc')->where('lauch_id',$row->id)->where(['status'=>'pending','type'=>"buy"])->where('quantity', '!=', '0')->whereDate('created_at', $todayDate)->groupBy('price')->take(5)->get();
    
    $getSellDataArr = App\Models\StockExchange::with('user')->select(DB::raw('sum(quantity) as total_quantity'),'price','created_at','user_id')->orderBy('total_quantity','desc')->where('lauch_id',$row->id)->where(['status'=>'pending','type'=>"sell"])->where('quantity', '!=', '0')->whereDate('created_at', $todayDate)->groupBy('price')->take(5)->get();  
   
    $pendingBuyOrders = App\Models\StockExchange::select(DB::raw('sum(quantity) as total_quantity'),'price')->orderBy('price','desc')->where(['lauch_id'=>$row->id,'status'=>'pending','type'=>"buy"])->first();
 
    $buy_totalqty = ($pendingBuyOrders) ? $pendingBuyOrders->price : "-";
 
    $pendingSellOrders = App\Models\StockExchange::select(DB::raw('sum(quantity) as total_quantity'),'price')->orderBy('price','desc')->where(['lauch_id'=>$row->id,'status'=>'pending','type'=>"sell"])->first();

    if($pendingSellOrders && $pendingSellOrders){
        if($pendingSellOrders->price > 0){
            $sell_totalqty = $pendingSellOrders->price;
        }else{
            $sell_totalqty = "0";
        }
    }else{
        $sell_totalqty = "0";
    }
?>
<div class="card radius-10" >
    <div class="card-header"><h6>Market Depth </h6></div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-6">
                <h6>Bid(Buy Orders) </h6>
                <table class="table table-bordered">
                    <tr>  
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
                    <tr>  
                        <td>Bid Total</td>
                        <td>{{ $buy_totalqty }}</td> 
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Ask(Sell Orders) </h6>
                <table class="table table-bordered">
                    <tr>  
                        <td>Quantity</td>
                        <td>Market Price</td> 
                    </tr> 
                    @foreach($getSellDataArr as $key =>$sell_depth_val)
                        <tr>  
                            <td>{{ $sell_depth_val->total_quantity }}</td>
                            <td>{{ $sell_depth_val->price }}</td> 
                        </tr>
                    @endforeach
                    <tr>  
                        <td>Ask Total</td>
                        <td>{{ $sell_totalqty }}</td> 
                    </tr>
                </table>
            </div>
        </div> 
    </div> 
    </div>
</div>
@section('script')


<script src="{{ asset('assets/admin/Chart.min.js') }}"></script>
 <script>
var xValues = <?php echo json_encode($x_valArr); ?>;// ["2022-10-11 01:04:15","2022-10-11 03:33:15","2022-10-13 05:45:10","2022-10-14 05:06:15","2022-10-14 08:16:11"];




new Chart("myChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{ 
      data: <?php echo json_encode($y_valArr); ?>,
      borderColor: "#0dcaf0",
      fill: false
    }]
  },
  options: {
    legend: {display: false}
  }
});
</script>
@endsection
@endsection



