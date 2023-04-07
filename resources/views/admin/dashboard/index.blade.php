@extends('admin.layouts.app')
@section('content')
<div class="row row-cols-1 row-cols-md-2 row-cols-xl-4">
    <div class="col">
      <div class="card radius-10 border-start border-0 border-3 border-info">
         <div class="card-body"  style="height: 109px;" >
             <div class="d-flex align-items-center">
                 <div>
                     <p class="mb-0 text-secondary">Total Users </p>
                     <h4 class="my-1 text-info">{{ $totalUser = App\Models\User::whereIn('user_type',[2,3])->count() }}</h4>
                     <p class="mb-0 font-13">@php
                         $new = App\Models\User::whereIn('user_type',[2,3])->whereMonth('created_at', date('m'))->whereYear('created_at', date('Y'))->count();

                         if($new > 0 && $totalUser > 0)
                         {
                            $perUser = round(($new/$totalUser)*100,2);
                            @endphp
                            <!-- <p class="mb-0 font-13">{{ ($perUser == 100)?$perUser:'+'.$perUser }}% from last month</p> -->
                            @php
                         }
                     @endphp</p>

                 </div>
                 <div class="widgets-icons-2 rounded-circle bg-gradient-scooter text-white ms-auto"><i class="bx bxs-user"></i>
                 </div>
             </div>
         </div>
      </div>
    </div>
    <div class="col">
     <div class="card radius-10 border-start border-0 border-3 border-danger">
        <div class="card-body" style="height: 109px;" > 
            <div class="d-flex align-items-center">
                <div>
                    <p class="mb-0 text-secondary">Total Revenue</p>
                    <h4 class="my-1 text-danger">{{ $wallet =  App\Models\Wallet::where('status','Successful')->where('type','live')->where('payment_type','credit')->sum('amount') }}</h4>
                    @php
                        $newWallet = App\Models\Wallet::where('status','Successful')->where('type','live')->where('payment_type','credit')->whereMonth('created_at', date('m'))->whereYear('created_at', date('Y'))->sum('amount');

                        if($newWallet > 0 && $wallet > 0)
                        {
                           $perLauncheds = round(($newWallet/$wallet)*100,2);
                           @endphp
                           <!-- <p class="mb-0 font-13">{{ ($perLauncheds == 100)?$perLauncheds:'+'.$perLauncheds }}% from last month</p> -->
                           @php
                        }
                    @endphp

                </div>
                <div class="widgets-icons-2 rounded-circle bg-gradient-bloody text-white ms-auto"><i class="bx bxs-wallet"></i>
                </div>
            </div>
        </div>
     </div>
   </div>
   <div class="col">
     <div class="card radius-10 border-start border-0 border-3 border-success">
        <div class="card-body" style="height: 109px;">
            <div class="d-flex align-items-center">
                <div>
                    <?php
                     $totalLaunched = App\Models\Lauchpaid::where('approve_status',2)->where('launch_status',2)->count();
                         ?>
                    <p class="mb-0 text-secondary">Total Launched Images</p>
                    <h4 class="my-1 text-success">{{ $totalLaunched }}</h4>
                    <p class="mb-0 font-13">@php
                        $newLaunched = App\Models\Lauchpaid::where('approve_status',2)->where('launch_status',2)->whereMonth('created_at', date('m'))->whereYear('created_at', date('Y'))->count();

                        if($newLaunched > 0 && $totalLaunched > 0)
                        {
                           $perLaunched = round(($newLaunched/$totalLaunched)*100,2);
                           @endphp
                           <!-- <p class="mb-0 font-13">{{ ($perLaunched == 100)?$perLaunched:'+'.$perLaunched }}% from last month</p> -->
                           @php
                        }
                    @endphp</p>
                </div>
                <div class="widgets-icons-2 rounded-circle bg-gradient-ohhappiness text-white ms-auto"><i class="bx bxs-bar-chart-alt-2"></i>
                </div>
            </div>
        </div>
     </div>
   </div>
   <div class="col">
     <div class="card radius-10 border-start border-0 border-3 border-warning">
        <div class="card-body"  style="height: 109px;" >
            <div class="d-flex align-items-center">
                <div>

                    <p class="mb-0 text-secondary">Total Launchers</p>
                    <h4 class="my-1 text-warning"><!-- {{ $totalLaunchers = App\Models\User::whereIn('user_type',[3])->where('kyc_status',2)->where('launcher_status',2)->count() }} -->
                        
                        {{ $totalLaunchers = App\Models\User::whereIn('user_type',[3])->count() }}
                    </h4>
                    @php
                        $newLauncheder = App\Models\User::whereIn('user_type',[3])->where('kyc_status',2)->where('launcher_status',2)->whereMonth('created_at', date('m'))->whereYear('created_at', date('Y'))->count();

                        if($newLauncheder > 0 && $totalLaunchers > 0)
                        {
                           $perLauncheder = round(($newLauncheder/$totalLaunchers)*100,2);
                           @endphp
                           <!-- <p class="mb-0 font-13">{{ ($perLauncheder == 100)?$perLauncheder:'+'.$perLauncheder }}% from last month</p> -->
                           @php
                        }
                    @endphp
                </div>
                <div class="widgets-icons-2 rounded-circle bg-gradient-blooker text-white ms-auto"><i class="bx bxs-group"></i>
                </div>
            </div>
        </div>
     </div>
   </div>
 </div>

 <div class="card radius-10">
    <div class="card-body">
       <div class="d-flex align-items-center">
           <div>
               <h6 class="mb-0">Upcomming ICO</h6>
           </div>

       </div>
@php
    $upcommingData = \App\Models\Lauchpaid::with('user')->where('end_date','>',date('Y-m-d'))->orderBy('end_date','asc')->get();

@endphp
    <div class="table-responsive">
      <table class="table align-middle mb-0">
       <thead class="table-light">
        <tr>
          <th>Launcher</th>
          <th>Sketch ID</th>
          <th>Image</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Quantity</th>
          <th>Offered</th>
          <th>Sell Price</th>
        </tr>
        </thead>
        <tbody>
            @isset($upcommingData)
                @if(!empty($upcommingData))
                @foreach ($upcommingData as $upData) 
                    <tr>
                                <td>{{ @$upData->user->name }}</td>

                                <td>{{ @$upData->launch_sketch }}</td>
                                <td>
                                    @if(isset($upData->launch_image))
                                        <a href="{{ asset($upData->launch_image) }}" target="_blank">
                                            <img src="{{ asset($upData->launch_image) }}" style="width: 50px;" />
                                        </a>
                                    @else
                                        <img src="{{ imageAsset('images/noimage.png') }}" class="product-img-2" alt="product img">
                                    @endif 
                                </td>
                                <td>{{ $upData->start_date }}</td>
                                <td>{{ $upData->end_date }}</td>
                                <td>{{ $upData->total_img_quanity }}</td>
                                <td>{{ $upData->total_img_offered }}</td>
                                <td>{{ $upData->total_img_sell }}</td>

                    </tr>
                   @endforeach
                @endif
            @endisset

       </tbody>
     </table>
     </div>
    </div>
</div>

<?php

  $data = [];
  $msg = '';
        $response = \App\Models\StockExchange::select(DB::raw('DATE(created_at) as date'), DB::raw('MAX(price) as high'), DB::raw('MIN(price) as low'))->where('status',"successful")->groupBy('date')->get()->toArray();
        if(!empty($response))
        {
            $sr = 11;
            foreach($response as $key =>$val)
            {
                $val = (Object) $val;
                $dateTime = $val->date.' '.settingConfig('ICO_START_TIMING');
                $dateTime2 = $val->date.' '.settingConfig('ICO_END_TIMING');
                $opening = \App\Models\StockExchange::whereDate('created_at','<=',$dateTime)->orderBy('id','desc')->first('price')->price ?? 0;
                $closing = \App\Models\StockExchange::whereDate('created_at','<=',$dateTime2)->orderBy('id','desc')->first('price')->price ?? 0;

                $rowdata = [];
                $rowdata['date']       = $val->date;
                $rowdata['high']       = $val->high;
                $rowdata['low']        =  $val->low;
                $rowdata['open']       =  $opening;
                $rowdata['close']      =  $closing;
                $rowdata['volume_ltc'] = rand(10043,20034);
                $rowdata['volume_eur'] = rand(100234,200433);
                $data[] = $rowdata;
            }
        }else{
            $msg =  "<span class='text-danger'>Graph Not Loaded Due to not available any data</span>";
        }

?>
<!-- <div class="card radius-10" >
    <div class="card-header"><h6>All Images Live Details</h6></div>
    <div class="card-body ">
        {!! $msg !!}
                <div id="chartContainer" style="height: 400px; width: 100%;">

                </div>

    </div>
</div> -->

  @section('script')
  <script src="{{ asset('assets/admin/js/canvasjs.stock.min.js') }}"></script>

  <script src="{{ asset('assets/admin/js/Chart.min.js') }}"></script>
  <script src="{{ asset('assets/admin/js/Chart.extension.js') }}"></script>

<script type="text/javascript">
    window.onload = function () {
  var dataPoints1 = [];var dataPoints2  = [];
  console.log('dataPoints1',dataPoints1)
  var stockChart = new CanvasJS.StockChart("chartContainer",{
    exportEnabled: true,

    subtitles: [{
      text: "Live Trade"
    }],
    charts: [{
      axisX: {
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY: {
        prefix: "$",
        lineThickness: 0
      },
      data: [{
        name: "Price (in INR)",

        type: "candlestick",
        dataPoints : dataPoints1
      }]
    }],

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
</script>

  @endsection
@endsection
