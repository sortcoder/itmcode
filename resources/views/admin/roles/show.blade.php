@extends('admin.layouts.app')

@section('content')

<div class="card">

	<div class="card-body">
		<h5>{{  $title  }}</h5>

		<hr>


				<div class="row">
					<div class="col-12">
						<label><b>Name</b></label>
						<p>{{  $role->name }} </p>
					</div>
					<div class="col-12">
                        <div class="form-group">
                            <strong>Permissions:</strong><br><br>
                            @if(!empty($rolePermissions))
                            @php
                                $count =1;
                            @endphp
                                @foreach($rolePermissions as $v)
                                    <label class="label label-success">{{ $count++ }}:  {{ $v->name }},</label><br>
                                @endforeach
                            @endif
                        </div>
                    </div>

	</div>
</div>

@endsection
