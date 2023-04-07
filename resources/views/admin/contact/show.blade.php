@extends('admin.layouts.app')

@section('content')

<div class="card">

	<div class="card-body">
		<h5>{{  $title  }}</h5> 
		<hr> 
		<div class="row">
			<div class="col-6">
				<label><b>Name</b></label>
				<p>{{  $contact_dt->user_name }} </p>
			</div>
			<div class="col-6">
				<label><b>Email</b></label>
				<p>{{  $contact_dt->email }} </p>
			</div>
			<div class="col-6">
				<label><b>Mobile</b></label>
				<p>{{  $contact_dt->mobile }} </p>
			</div>  
			<div class="col-6">
				<label><b>Create Date</b></label>
				<p>{{  $contact_dt->created_at }} </p>
			</div>
			<div class="col-12">
				<label><b>Message</b></label>
				<p>{{  $contact_dt->description }} </p>
			</div> 
		</div>
</div>

@endsection
