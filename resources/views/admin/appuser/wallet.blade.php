@extends('admin.layouts.app')

@section('content')
@section('style')

@endsection
    <div class="card">
        <div class="card-header">
            <h5>Wallet Transactions of {{ $findUser->name }}</h5>
        </div>
        <div class="card-body">
            <div class="table table-responsive">
                <table class="table table-bordered table-stripped table-sm">
                    <tr>
                        <th>#</th>
                        <th>Date/Time</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Remark</th>
                    </tr>
                    <?php
                    if(!empty($findUser->tradding_wallet))
                    {
                        $sr = 1;
                        foreach($findUser->tradding_wallet as $key =>$val)
                        {
                            ?>
                             <tr>
                                <td>{{ $sr++ }}</td>
                                <td>{{ \Carbon\Carbon::parse($val->created_at)->format('d M Y h:i A') }}</td>
                                <td>{{ round($val->amount,2) }}</td>
                                <td>{{ ($val->payment_type === 'credit')?'(+)'.$val->payment_type:'(-)'.$val->payment_type }}</td>
                                <td>{{ $val->status }}</td>
                                <td>{{ $val->remark }}</td>
                            </tr>
                            <?php
                        }
                    }
                     ?>

                </table>
            </div>
        </div>
    </div>

@section('script')

@endsection
@endsection
