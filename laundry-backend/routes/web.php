<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Mirror API endpoints under /api when served behind Apache Alias
Route::get('/api/orders/search', [OrderController::class, 'searchByCustomerName']);
Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/register', [AuthController::class, 'register']);

// Extra mirrors without the /api prefix in case the web server strips it
Route::get('/orders/search', [OrderController::class, 'searchByCustomerName']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
