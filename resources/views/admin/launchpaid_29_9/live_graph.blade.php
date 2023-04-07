@extends('admin.layouts.app')

@section('content')

<?php

  $data = [];
  $msg = '';
        $response = \App\Models\StockExchange::select(DB::raw('DATE(created_at) as date'), DB::raw('MAX(price) as high'), DB::raw('MIN(price) as low'))->where('status',3)->where('lauch_id',$row->id)->groupBy('date')->get()->toArray();
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
                $rowdata['date']       = $val->date;
                $rowdata['high']       = $val->high;
                $rowdata['low']        =  $val->low;
                $rowdata['open']       =  $opening;
                $rowdata['close']      =  $closing;

                $data[] = $rowdata;
            }
        }else{
            $msg =  "<span class='text-danger'>Graph Not Loaded Due to not available any data</span>";
        }

?>
<div class="card radius-10" >
    <div class="card-header"><h6>{{ $row->launch_sketch }} Live Details</h6></div>
    <div class="card-body ">
        {!! $msg !!}
                <div id="chartContainer" style="height: 400px; width: 100%;">

                </div>

    </div>
</div>

<div class="card radius-10" >
    <div class="card-header"><h6>Trade History </h6></div>
    <div class="card-body">
        <table class="table table-bordered">
            <tr>
                <td>#</td>
                <td>Date/Time</td>
                <td>User</td>
                <td>Quantity</td>
                <td>Market Price</td>
                <td>Sold/Buy Price</td>
                <td>Sell/Buy</td>
                <td>Status</td>
            </tr>
            <?php
            $stockList = App\Models\StockExchange::with('user')->where('lauch_id',$row->id)->orderBy('id','asc')->get();
            $sr = 1;
            if(!empty($stockList))
            {
                foreach($stockList as $key =>$vak)
                {
                    ?>
                    <tr>
                        <td>{{ $sr++ }}</td>
                        <td>{{ !empty($vak->created_at)?date('Y-m-d h:i a',strtotime($vak->created_at)):'' }}</td>
                        <td>{{ $vak->user->name ??'' }}</td>
                        <td>{{ $vak->quantity }}</td>
                        <td>{{ $vak->price }}</td>
                        <td>{{ $vak->price*$vak->quantity }}</td>
                        <td>{!! ($vak->type === 1)?'<span class="badge bg-success">Buy</span>':'<span class="badge bg-danger">Sell</span>'; !!}</td>
                        <td>{{ $vak->status }}</td>
                    </tr>
                    <?php
                }
            }
            ?>
            <tr></tr>
        </table>
    </div>
</div>
@section('script')
<script src="{{ asset('assets/admin/js/canvasjs.stock.min.js') }}"></script>
 <script>
    /*
window.onload = function () {
  var dataPoints1 = [];var dataPoints2  = [];
  console.log('dataPoints1',dataPoints1)
  var stockChart = new CanvasJS.StockChart("chartContainer",{
    exportEnabled: true,
    subtitles: [{
      text: "Litecoin Price"
    }],
    charts: [{
      axisX: {
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY: {
        prefix: "₹",
        lineThickness: 0
      },
      data: [{
        name: "Price (in INR)",

        type: "candlestick",
        dataPoints : dataPoints1
      }]
    }],
    navigator: {
      data: [{
        dataPoints: dataPoints2
      }],
      slider: {
        minimum: new Date(2018, 10, 01),
        maximum: new Date(2018, 11, 20)
      }
    }

  });

  var data = @json($data,JSON_PRETTY_PRINT);
  var lowestCloseDate = data[0].date, lowestClosingPrice = data[0].close;
    for(var i = 0; i < data.length; i++) {
      if(data[i].close < lowestClosingPrice) {
        lowestClosingPrice = data[i].close;
        lowestCloseDate = data[i].date;
      }
    }
    for(var i = 0; i < data.length; i++){
      dataPoints1.push({x: new Date(data[i].date), y: [Number(data[i].open), Number(data[i].high), Number(data[i].low), Number(data[i].close)]});
      dataPoints2.push({x: new Date(data[i].date), y: Number(data[i].close)});
      if(data[i].date === lowestCloseDate){
        dataPoints1[i].indexLabel = "Lowest Closing";
        dataPoints1[i].indexLabelFontColor = "red";
        dataPoints1[i].indexLabelOrientation = "vertical"
      }
    }
    stockChart.render();

}
*/

window.onload = function() {

 var dataPoints = [];

 var chart = new CanvasJS.Chart("chartContainer", {
     animationEnabled: true,
     theme: "light2",
     zoomEnabled: true,
     title: {
         text: "{{ $row->launch_sketch }} Trade Live Details"
     },
     axisY: {
         title: "Price in INR",
         titleFontSize: 24,
         prefix: "₹"
     },
     data: [{
         type: "line",
         yValueFormatString: "₹#,##0.00",
         dataPoints: dataPoints
     }]
 });

 function addData(data) {
     var dps = data.price_usd;
     for (var i = 0; i < dps.length; i++) {
         dataPoints.push({
             x: new Date(dps[i][0]),
             y: dps[i][1]
         });
     }
     chart.render();
 }

 $.getJSON("https://canvasjs.com/data/gallery/php/bitcoin-price.json", addData);

 }


</script>
@endsection
@endsection



