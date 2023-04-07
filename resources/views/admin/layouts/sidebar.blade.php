<style> .btn { margin: 0px 2px; }</style>
<div class="sidebar-wrapper" data-simplebar="true">
    <div class="sidebar-header">
        <div>
            <img src="{{ asset('assets/admin/images/mainlogo.png') }}" class="logo-icon" alt="logo icon">
        </div>
        <div>
            <h4 class="logo-text">ITM Money</h4>
        </div>
        <div class="toggle-icon ms-auto"><i class='bx bx-arrow-to-left'></i>
        </div>
    </div>
    <!--navigation-->
    <ul class="metismenu" id="menu">
        <li>
            <a href="{{  route('dashboard') }}" >
                <div class="parent-icon"><i class='bx bx-home-circle'></i>
                </div>
                <div class="menu-title">Dashboard</div>
            </a>

        </li>
         
        @can('Roles-Permission-Management')
            <li>
                <a href="javascript:;" class="has-arrow">
                    <div class="parent-icon"><i class="bx bx-user"></i>
                    </div>
                    <div class="menu-title">Role & Management</div>
                </a>
                <ul> 
                    <li> <a href="{{ route('roles.index') }}"><i class="bx bx-right-arrow-alt"></i>Roles</a>
                    </li>
                    <li> <a href="{{ route('users.index') }}"><i class="bx bx-right-arrow-alt"></i>Users</a>
                    </li> 
                </ul>
            </li>
        @endcan 
        
        <li class="menu-label">App Modules</li>
        @can('User-Management')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-user"></i>
                </div>
                <div class="menu-title">User Management</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('appuser.index') }}"><i class="bx bx-right-arrow-alt"></i>Users</a>
                </li>
                <li>
                    <a href="{{ route('professional.index') }}"><i class="bx bx-right-arrow-alt"></i>Profession</a>
                </li>
                <li>
                    <a href="{{ route('designation.index') }}"><i class="bx bx-right-arrow-alt"></i>Designation</a>
                </li>
                {{-- <li>
                    <a href="{{ route('countries.index') }}"><i class="bx bx-right-arrow-alt"></i>Countries</a>
                </li>
                <li>
                    <a href="{{ route('state.index') }}"><i class="bx bx-right-arrow-alt"></i>States</a>
                </li>
                <li>
                    <a href="{{ route('district.index') }}"><i class="bx bx-right-arrow-alt"></i>District</a>
                </li> --}}
            </ul>
        </li>
        @endcan
        @can('Package-Management')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-category"></i>
                </div>
                <div class="menu-title">Package Management</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('package.create') }}"><i class="bx bx-right-arrow-alt"></i>Add Package</a>
                </li>
                <li>
                    <a href="{{ route('package.index') }}"><i class="bx bx-right-arrow-alt"></i>Package List</a>
                </li>

            </ul>
        </li>
        @endcan
        @can('Video-Management')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-video"></i>
                </div>
                <div class="menu-title">Video Management</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('video.create') }}"><i class="bx bx-right-arrow-alt"></i>Add Video</a>
                </li>
                <li>
                    <a href="{{ route('video.index') }}"><i class="bx bx-right-arrow-alt"></i>Video List</a>
                </li>

            </ul>
        </li>
        @endcan
        @can('Launch-Paid-Management')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-paper-plane"></i>
                </div>
                <div class="menu-title">Launch Paid Management</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('launchpaid.create') }}"><i class="bx bx-right-arrow-alt"></i>Create Demo Launch Paid</a>
                </li>
                <!-- <li>
                    <a href="{{ route('launch_image') }}"><i class="bx bx-right-arrow-alt"></i>Launch Image  </a>
                </li> -->
                <li>
                    <a href="{{ route('launch_image_icon') }}"><i class="bx bx-right-arrow-alt"></i>Upcomming ICO</a>
                </li>
                {{-- <li>
                    <a href="{{ route('launchpaid.index') }}"><i class="bx bx-right-arrow-alt"></i>Launch Paid List </a>
                </li> --}}
                <li>
                    <a href="{{ route('demo_launcher') }}?created_by=true&live=false"><i class="bx bx-right-arrow-alt"></i>Demo Launcher Image</a>
                </li>
                <li>
                    <a href="{{ route('live_launcher') }}?created_by=true&live=true"><i class="bx bx-right-arrow-alt"></i>User Launcher Image</a>
                </li>
            </ul>
        </li>
        @endcan
        @can('Trading-Management')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-line-chart-down"></i>
                </div>
                <div class="menu-title">Trading Management</div>
            </a>
            <ul> 
                <li>
                    <a href="{{ route('launch_image_tradding',2) }}"><i class="bx bx-right-arrow-alt"></i>Live Trading Images </a>
                </li>
                <li>
                    <a href="{{ route('launch_image_tradding',1) }}"><i class="bx bx-right-arrow-alt"></i>Demo Trading Images </a>
                </li>
                <li>
                    <a href="{{ route('buy_more_request.index') }}"><i class="bx bx-right-arrow-alt"></i>Buy More Image Request </a>
                </li>
            </ul>
        </li>
        @endcan 
        @can('Order-Management')
            <li>
                <a href="javascript:;" class="has-arrow">
                    <div class="parent-icon"><i class="bx bx-cart"></i>
                    </div>
                    <div class="menu-title">Order Management</div>
                </a>
                <ul>
                    <li>
                        <a href="{{ route('manage_order.index') }}"><i class="bx bx-right-arrow-alt"></i>Order List</a>
                    </li>
                    <li>
                        <a href="{{ route('upcomming_order.index') }}"><i class="bx bx-right-arrow-alt"></i>ICO Order</a>
                    </li> 
                    <!-- <li>
                        <a href="{{ route('order-list') }}"><i class="bx bx-right-arrow-alt"></i>Order List</a>
                    </li> -->
                </ul>
            </li>
        @endcan 
        @can('Payment-Management')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-money"></i>
                </div>
                <div class="menu-title">Payment Management</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('launcher_list') }}"><i class="bx bx-right-arrow-alt"></i>Credit Balance </a>
                </li>
                <li>
                    <a href="{{ route('withdraw.index') }}"><i class="bx bx-right-arrow-alt"></i>Withdraw Request </a>
                </li> 
                <li>
                    <a href="{{ route('user_transaction') }}"><i class="bx bx-right-arrow-alt"></i>Payment Transaction</a>
                </li>
                <!-- <li>
                    <a href="{{ route('transfer_money_transaction') }}"><i class="bx bx-right-arrow-alt"></i>Transfer Money Transaction </a>
                </li> -->
                <li>
                    <a href="{{ route('history_user_transaction') }}"><i class="bx bx-right-arrow-alt"></i>Wallet Transactions</a>
                </li>
                <li>
                    <a href="{{ route('credited_users') }}"><i class="bx bx-right-arrow-alt"></i>Credit History</a>
                </li>
            </ul>
        </li>
        @endcan 
        @can('Notification')
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-bell"></i>
                </div>
                <div class="menu-title">Notification</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('notification.create') }}"><i class="bx bx-right-arrow-alt"></i>Add Notification</a>
                </li>
                <li>
                    <a href="{{ route('notification.index') }}"><i class="bx bx-right-arrow-alt"></i>Notification List</a>
                </li>
            </ul>
        </li>
        @endcan
        @can('Banner-Management')


        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-image"></i>
                </div>
                <div class="menu-title">Banner Management</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('banner.create') }}"><i class="bx bx-right-arrow-alt"></i>Add Banner</a>
                </li>
                <li>
                    <a href="{{ route('banner.index') }}"><i class="bx bx-right-arrow-alt"></i>Banner List</a>
                </li>
            </ul>
        </li>
        @endcan

        <li class="menu-label">Others</li>
        @can('Setting-Management')

        <li> 
            <a href="{{  route('contact.index') }}" >
                <div class="parent-icon"><i class='bx bx-envelope'></i>
                </div>
                <div class="menu-title">Customer Support</div>
            </a>
        </li>
        <li>
            <a href="javascript:;" class="has-arrow">
                <div class="parent-icon"><i class="bx bx-user"></i>
                </div>
                <div class="menu-title">Settings</div>
            </a>
            <ul>
                <li>
                    <a href="{{ route('setting_config.index') }}"><i class="bx bx-right-arrow-alt"></i>Basic Setting</a>
                </li>

            </ul>
        </li>
        @endcan
        <li>
            <a data-logout-click="{{ route('logout') }}" href="javascript:;">
                <div class="parent-icon"><i class="bx bx-lock"></i>
                </div>
                <div class="menu-title">Logout</div>
            </a> 
        </li>
    </ul>
    <!--end navigation-->
</div>
