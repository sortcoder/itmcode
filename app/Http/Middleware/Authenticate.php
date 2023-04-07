<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
class Authenticate extends Middleware
{
    use ResponseWithHttpRequest;
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if ($request->is('api/*')) {
            return route('api.unauthorized');
        }

        if (! $request->expectsJson()) {
            return route('login');
        }else{
            abort($this->failure('Unauthnicated User'));
        }
    }
}
