@extends('admin.layouts.app')

@section('content')

<div class="card">

	<div class="card-body">
		<h5>{{  $title  }}</h5>

		<hr> 
		<div class="row">
			<div class="col-6">
				<label class="font-weight-bold"><b>Name</b> </label>
				<p>{{  $user->name }} </p>
			</div>
        </div>
	</div>
</div>

@endsection
