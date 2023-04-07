@extends('admin.layouts.app')

@section('content')

<div class="card">

	<div class="card-body">
		<h5>{{  $title  }}</h5>

		<hr>


				<div class="row">
					<div class="col-6">
						<label>Name</label>
						<p>{{  $user->name }} </p>
					</div>
					<div class="col-6">
						<label>Email</label>
						<p>{{  $user->email }} </p>
					</div>
					<div class="col-6">
						<label>Mobile</label>
						<p>{{  $user->mobile }} </p>
					</div>
					<div class="col-6">
						<label>Roles</label><br>
						<?php if(!empty($user->roles))
                        {
                            foreach($user->roles as $key => $role) {
                                echo '<span class="badge bg-primary">'.$role->name.'</span>';
                            }
                        }
?>

					</div>
					<div class="col-6">
						<label>Status</label>
                        <p><?=[''=>'Select Status',1=>'Inactive',2=>'Active'][$user->status]?></p>


					</div>


	</div>
</div>

@endsection
