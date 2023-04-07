@extends('admin.layouts.app')
@section('content')
    <div class="card">
        <div class="card-header d-flex justify-content-between">
            <div class="title">
                <h5>{{  $title  }}</h5>
            </div>
            <div class="addbutton">
               <!--  <a href="{{  route('setting_config.create') }}" class="btn btn-primary btn-sm">+ Add New Variable </a> -->
            </div>
        </div>
        <div class="card-body">
            <table class="table table-bordered table-sm">

                <tbody>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Action</th>
                    </tr>
                    @isset($records)
                    @php
                        $sr = 1;
                    @endphp

                        @foreach ($records as $obj)
                            <tr>
                                <td>{{ $sr++ }}</td>
                                <td>{{ $obj->var_name  }}</td>
                                <td>
                                    @php
                                        $in = strip_tags(settingConfig($obj->var_key));
                                        $out = strlen($in) > 60 ? substr($in,0,60)."..." : $in;

                                    @endphp
                                    {!! $out !!}</td>
                                <td><a href="{{ route('setting_config.edit',[encodeId($obj->id)]) }}" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>
                                {{-- <a href="{{ route('setting_config.show',[encodeId($obj->id)]) }}" class="btn btn-outline-primary ml-2 btn-sm mr-2">View</a></td> --}}
                            </tr>
                        @endforeach
                    @endisset
                </tbody>
            </table>
        </div>
    </div>


@endsection
