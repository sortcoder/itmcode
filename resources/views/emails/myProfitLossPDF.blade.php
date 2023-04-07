<!DOCTYPE html>
<html>
<head>
    <title>Profit Loss Statement</title>
    <link href="{{ asset('assets/admin/css/bootstrap.min.css') }}" rel="stylesheet">
    <link href="{{ asset('assets/admin/css/bootstrap-extended.css') }}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
    <h1></h1>
    <div class="container">
        <div class="row">
            <div class="col-md-6 mt-2">
                <img src="{{ asset('assets/admin/images/mainlogo.png') }}" width="180" alt="" />
            </div> 
        </div>
        <div class="row">
            <div class="col-md-6 mt-2">
                <table class="table table-bordered">
                    <tbody> 
                      <tr>
                        <td>Name</td>
                        <td>{{ $user_name }}</td> 
                      </tr>
                      <tr>
                        <td>PAN number</td>
                        <td>{{ $pancard_no }}</td> 
                      </tr>
                      <tr>
                        <td>Period</td>
                        <td>{{ $period }}</td> 
                      </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-md-6 mt-2"></div>
        </div>
        <br/><br/>
        <p>Unrealized P/L Summary / BUY Record</p>
        <br/><br/>
        <div class="row">
            <div class="col-md-12 mt-2">
                <table class="table table-bordered">
                    <thead>
                        <tr> 
                          <th>Launchpad Name</th>
                          <th>Quantity</th> 
                          <th>Buy Average</th> 
                          <th>Buy Value</th> 
                          <th>Present Price</th>
                          <th>Unrealized P&L</th>
                          <th>P&L%</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php 
                            $total_buy_value =0; $total_present_value=0; $total_unRealize_PnL=0; $pprofit_dt = 0;
                        @endphp
                        @foreach($getUnrealizedTxnBuyDt as $buy_txn_rec)  
                          @php
                            $buy_avg_value = $buy_txn_rec->total_price/$buy_txn_rec->quantity; 
                             
                            $unrealized_P_n_L = $buy_txn_rec->total_price - ($buy_txn_rec->live_image_price*$buy_txn_rec->quantity);
                            
                            $current_profit = ($unrealized_P_n_L*100)/$buy_txn_rec->total_price;
                          @endphp
                          <tr>
                            <td>{{ $buy_txn_rec->launchpad_name }}</td> 
                            <td>{{ $buy_txn_rec->quantity }}</td>
                            <td>{{ round($buy_avg_value,2) }}</td>
                            <td>{{ round($buy_txn_rec->total_price,2) }}</td>
                            <td>{{ round($buy_txn_rec->live_image_price,2) }}</td> 
                            <td>{{ $unrealized_P_n_L }}</td> 
                            <td>{{ round(@$current_profit,2) }}</td> 
                          </tr>
                          @php 
                                $total_buy_value = $total_buy_value + $buy_txn_rec->total_price; 
                                $total_present_value = $total_present_value + $buy_txn_rec->live_image_price; 
                                $total_unRealize_PnL = $total_unRealize_PnL + $unrealized_P_n_L;  

                                if($total_unRealize_PnL>0)
                                    $pprofit_dt = round(($total_unRealize_PnL*100)/$total_buy_value,2); 
                          @endphp
                        @endforeach
                    </tbody>
                    <thead>
                        <tr>
                          <th>Total</th>
                          <th colspan="2"></th>
                          <th>{{ $total_buy_value }}</th>
                          <th>{{ $total_present_value }}</th>
                          <th>{{ $total_unRealize_PnL }}</th>
                          <th>{{ $pprofit_dt }}

                          </th>
                        </tr>
                    </thead>
                </table>
            </div> 
        </div>

        <br/><br/>
        <p>Realized P/L Summary / SELL Record</p>
        <br/><br/>
        <div class="row">
            <div class="col-md-12 mt-2">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                          <th>Launchpad Name</th> 
                          <th>Quantity</th>
                          <th>Buy Average</th>
                          <th>Buy Value</th>
                          <th>Sell Average</th>
                          <th>Sell Value</th>
                          <th>Realized P&L</th>
                          <th>P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php 
                            $total_sell_value =0; $total_sell_present_value=0; $total_Realize_PnL=0; 
                        @endphp
                        @foreach($getRealizedTxnSoldDt as $sell_txn_rec)  
                          @php
                            $buy_avg_value = $sell_txn_rec->total_buy_price;
                            $buy_tot_val = $buy_avg_value*$sell_txn_rec->sell_quantity;

                            $sell_avg_value = $sell_txn_rec->total_sell_price/$sell_txn_rec->sell_quantity; 
                             
                            $Realized_P_n_L = $sell_txn_rec->total_sell_price - ($sell_txn_rec->live_image_price*$sell_txn_rec->sell_quantity);
                            
                            $real_current_profit = ($Realized_P_n_L*100)/$sell_txn_rec->total_sell_price;
                          @endphp
                          <tr>
                            <td>{{ $sell_txn_rec->launchpad_name }}</td> 
                            <td>{{ $sell_txn_rec->sell_quantity }}</td>
                            <td>{{ $buy_avg_value }}</td>
                            <td>{{ $buy_tot_val }}</td>
                            <td>{{ round($sell_avg_value,2) }}</td>
                            <td>{{ round($sell_txn_rec->total_sell_price,2) }}</td>
                            <!-- <td>{{ round($sell_txn_rec->live_image_price,2) }}</td>  -->
                            <td>{{ $Realized_P_n_L }}</td> 
                            <td>{{ round(@$real_current_profit,2) }}</td> 
                          </tr>
                          @php 
                                $total_sell_value = $total_sell_value + $sell_txn_rec->total_sell_price; 
                                $total_sell_present_value = $total_sell_present_value + $sell_txn_rec->live_image_price; 
                                $total_Realize_PnL = $total_Realize_PnL + $Realized_P_n_L;  
                          @endphp
                        @endforeach
                    </tbody>
                    <thead>
                        <tr> 
                          <th>Total</th>
                          <th colspan="4"></th>
                          <th>{{ round($total_sell_value,2) }}</th>
                          <th>{{ round($total_Realize_PnL,2)  }}</th>
                          <th>{{ ($total_Realize_PnL >0) ? round(($total_Realize_PnL*100)/$total_sell_value,2) : '0.00' }}</th>
                        </tr>
                    </thead>
                </table>
            </div> 
        </div>
    </div> 
  
</body>
</html>