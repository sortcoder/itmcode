<?php
namespace App\Traits;
trait ResponseWithHttpRequest{


	protected function success($message,$data=[],$status=200){
		return response([
			'status'=>'success',
			'code'=>$status,
			'message'=>$message,
			'data'=>$data
		]);
	}


	protected function failure($message,$data=[],$status=422){
		$status=201;
		/*return response([
			'status'=>'error',
			'code'=>$status,
			'message'=>$message,
			'data'=>$data
		]);*/

		return response([
			'status'=>'error',
			'code'=>$status,
			'message'=>$message 
		]);
	}

}