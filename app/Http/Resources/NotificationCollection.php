<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationCollection extends JsonResource
{
    
    public function toArray($request)
    {   
        return [
            'id' => $this->id, 
            'title' => $this->title, 
            'desc' => $this->desc, 
            'image' => $this->image, 
            'created_at' => date('Y-m-d h:m:a',strtotime($this->created_at)), 
            'updated_at' => date('Y-m-d h:m:a',strtotime($this->updated_at)), 

        ];
    }
}
