@extends('admin.layouts.app')

@section('content')
<style>
	.crr_box{
		background: #faebd74f;
    	padding: 24px;
    	margin: 5px;
	}
	.crr_box2{
		background: antiquewhite;
	}
</style>
<div class="card">

	<div class="card-body">
		<h5>{{  $title  }}</h5> 
		<hr>  
		<div class="row">
			<div class="col-3 crr_box">
				<label><b>Demo Trade Cash</b></label>
				<p>{{  config('app.currency').$demo_trade_amount }} </p>
			</div>
			<div class="col-3 crr_box">
				<label><b>Demo Fund Used</b></label>
				<p>{{  config('app.currency').$demo_fund_used }} </p>
			</div>
			<div class="col-3 crr_box crr_box2">
				<label><b>Demo Remaining Balance</b></label>
				<p>{{  config('app.currency').$demo_available_balance }} </p>
			</div>
		</div>

		<div class="row">
			<div class="col-3 crr_box">
				<label><b>Trader Trade Cash</b></label>
				<p>{{  config('app.currency').$trader_trade_amount }} </p>
			</div>
			<div class="col-3 crr_box">
				<label><b>Trader Fund Used</b></label>
				<p>{{  config('app.currency').$trader_fund_used }} </p>
			</div>
			<div class="col-3 crr_box crr_box2">
				<label><b>Trader Remaining Balance</b></label>
				<p>{{  config('app.currency').$trader_available_balance }} </p>
			</div>
		</div>

		<div class="row">
			<div class="col-3 crr_box">
				<label><b>Launcher Trade Cash</b></label>
				<p>{{  config('app.currency').$launcher_trade_amount }} </p>
			</div>
			<div class="col-3 crr_box">
				<label><b>Launcher Fund Used</b></label>
				<p>{{  config('app.currency').$launcher_fund_used }} </p>
			</div>
			<div class="col-3 crr_box crr_box2">
				<label><b>Launcher Remaining Balance</b></label>
				<p>{{  config('app.currency').$launcher_available_balance }} </p>
			</div>    
		</div>  

		<div class="row"> 
			<div class="col-6 crr_box" style="width: 51%;" >
				<label><b>Credit Balance</b></label>
				<p>{{  config('app.currency').$launcher_credit_balance }} </p>
			</div> 
			<div class="col-3 crr_box crr_box2" >
				<label><b>Remaining Credit Balance</b></label>
				<p>{{  config('app.currency').$launcher_credit_remaining_balance }} </p>
			</div>   
		</div>
</div>

@endsection
