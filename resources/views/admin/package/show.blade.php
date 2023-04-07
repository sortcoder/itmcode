@extends('admin.layouts.app')

@section('content')
@section('style')
<style>
label{
    font-weight: 600 !important;
}
</style>
@endsection


    <div class="card">
        <div class="card-header"><h6>Lauch Paid Package </h6></div>
        <div class="card-body">

            <div class="alertError" style="display: none;">

            </div>

            <div class="row">
                <div class="col-4 mt-2">
                    <label for="quantity">Quantity</label>
                    <p>  {{  $user->quantity }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="price">One Image Price</label>
                    <p>  {{  config('app.currency').$user->one_image_price }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="price">Price</label>
                    <p>  {{  config('app.currency').$user->price }}</p>
                </div>
                <div class="col-12 mt-2">
                    <label for="price">Description</label>
                    <p>  {{  $user->description }}</p>
                </div>
            </div>

        </div>
    </div>


</div>
@section('script')

@endsection
@endsection
