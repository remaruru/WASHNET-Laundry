import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiConfig } from '../config/api';

function CustomerHome() {
  const [customerName, setCustomerName] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [bestDay, setBestDay] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async (showLoading = false) => {
    if (showLoading) setWeatherLoading(true);
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY?.trim();

      // If no valid key, immediately use demo data to avoid CORS/401 white screens
      if (!apiKey || apiKey.length < 20) {
        setDemoWeather();
        return;
      }

      const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          q: 'Manila,PH',
          appid: apiKey,
          units: 'metric',
          cnt: 40 
        }
      });

      if (response.data && response.data.list && response.data.list.length > 0) {
        setWeather(response.data);
        findBestLaundryDay(response.data.list);
      } else {
        setDemoWeather();
      }
    } catch (error) {
      // Always fall back silently
      setDemoWeather();
    } finally {
      if (showLoading) setWeatherLoading(false);
    }
  };

  const setDemoWeather = () => {
    const today = new Date();
    const demoData = {
      city: { name: 'Manila', country: 'PH' },
      list: []
    };
    
    for (let i = 0; i < 40; i++) {
      const date = new Date(today);
      date.setHours(date.getHours() + (i * 3)); // Every 3 hours
      demoData.list.push({
        dt: date.getTime() / 1000,
        weather: [{ 
          main: i === 8 ? 'Rain' : 'Clear',
          description: i === 8 ? 'light rain' : 'clear sky'
        }],
        main: { 
          temp: 28 + (i % 5),
          feels_like: 29 + (i % 5),
          humidity: 70 + (i % 10),
          temp_min: 27 + (i % 5),
          temp_max: 30 + (i % 5)
        },
        wind: {
          speed: 2 + (i % 3)
        }
      });
    }
    
    setWeather(demoData);
    findBestLaundryDay(demoData.list);
    console.log('Using demo weather data');
  };

  const findBestLaundryDay = (forecast) => {
    // Find the best day (clear weather, no rain)
    const bestDayIndex = forecast.findIndex(item => 
      !item.weather[0].main.toLowerCase().includes('rain') &&
      !item.weather[0].main.toLowerCase().includes('storm')
    );
    
    if (bestDayIndex !== -1) {
      const bestDate = new Date(forecast[bestDayIndex].dt * 1000);
      setBestDay({
        date: bestDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        temp: forecast[bestDayIndex].main.temp,
        condition: forecast[bestDayIndex].weather[0].main
      });
    } else {
      setBestDay({ date: 'Tomorrow', temp: forecast[0].main.temp, condition: forecast[0].weather[0].main });
    }
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return '🌧️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) return '☀️';
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    return '🌤️';
  };

  const groupForecastByDay = (forecastList) => {
    const grouped = {};
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (!grouped[dayKey]) {
        grouped[dayKey] = {
          date: dayKey,
          items: [],
          maxTemp: item.main.temp,
          minTemp: item.main.temp,
          mainCondition: item.weather[0].main
        };
      }
      grouped[dayKey].items.push(item);
      grouped[dayKey].maxTemp = Math.max(grouped[dayKey].maxTemp, item.main.temp);
      grouped[dayKey].minTemp = Math.min(grouped[dayKey].minTemp, item.main.temp);
    });
    return Object.values(grouped).slice(0, 5);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Searching for customer:', trimmedName);
      const response = await axios.get(apiConfig.endpoints.orderSearch, {
        params: { customer_name: trimmedName },
        headers: {
          Accept: 'application/json',
        },
      });
      
      console.log('Search response:', response.data);
      setOrders(response.data);
      if (response.data.length === 0) {
        setError('No orders found for this name. Please check your name and try again.');
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Error searching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      ready: '#28a745',
      completed: '#28a745',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="customer-home">
      {/* Header with Logo */}
      <header className="customer-header">
        <div className="header-content">
          <img src="/washnet-logo.jpg" alt="WASHNET Laundry" className="site-logo" />
          <h1>WASHNET Laundry</h1>
          <p className="subtitle">Fresh • Fast • Clean</p>
          <button onClick={() => navigate('/login')} className="btn-login">
            Staff Login
          </button>
        </div>
      </header>

      <div className="customer-container">
        <div className="customer-main">
          {/* Weather Section */}
          <div className="weather-card">
            <div className="weather-header">
              <div>
                <h2>🌤️ Weather Forecast</h2>
                <span className="weather-location">📍 {weather?.city?.name || 'Manila'}, {weather?.city?.country || 'Philippines'}</span>
              </div>
              <div className="weather-actions">
                <button 
                  onClick={() => fetchWeather(true)} 
                  className="btn-weather-refresh"
                  disabled={weatherLoading}
                  title="Refresh weather"
                >
                  {weatherLoading ? '⏳' : '🔄'} {weatherLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="btn-weather-toggle"
                  title={showDetails ? 'Show less' : 'Show more details'}
                >
                  {showDetails ? '▲ Less' : '▼ More'}
                </button>
              </div>
            </div>
            
            {weather && weather.list && weather.list.length > 0 && (
              <>
                <div className="weather-today">
                  <div className="weather-icon-large">
                    {getWeatherIcon(weather.list[0].weather[0].main)}
                  </div>
                  <div className="weather-info">
                    <div className="weather-time-label">
                      Today at {new Date(weather.list[0].dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="weather-temp">{Math.round(weather.list[0].main.temp)}°C</div>
                    <div className="weather-desc">{weather.list[0].weather[0].description || weather.list[0].weather[0].main}</div>
                    {showDetails && (
                      <div className="weather-extras">
                        <div className="weather-extra-item">
                          <span className="extra-label">Feels like:</span>
                          <span className="extra-value">
                            {weather.list[0].main.feels_like !== undefined 
                              ? Math.round(weather.list[0].main.feels_like) + '°C'
                              : Math.round(weather.list[0].main.temp) + '°C'}
                          </span>
                        </div>
                        <div className="weather-extra-item">
                          <span className="extra-label">Humidity:</span>
                          <span className="extra-value">
                            {weather.list[0].main.humidity !== undefined 
                              ? weather.list[0].main.humidity + '%'
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="weather-extra-item">
                          <span className="extra-label">Wind:</span>
                          <span className="extra-value">
                            {weather.list[0].wind?.speed !== undefined 
                              ? Math.round(weather.list[0].wind.speed) + ' m/s'
                              : '0 m/s'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {bestDay && (
                  <div className="best-day">
                    <div className="best-day-header">
                      <span className="best-day-icon">⭐</span>
                      <div>
                        <div className="best-day-label">Best Day for Laundry</div>
                        <div className="best-day-info">
                          {bestDay.date} • {Math.round(bestDay.temp)}°C • {bestDay.condition}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`weather-forecast ${showDetails ? 'detailed-view' : 'simple-view'}`}>
                  {showDetails ? (
                    // Detailed 5-day forecast grouped by day
                    groupForecastByDay(weather.list).map((day, index) => (
                      <div 
                        key={index} 
                        className={`forecast-item-detailed ${expandedDay === index ? 'expanded' : ''}`}
                        onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                      >
                        <div className="forecast-day-header">
                          <div className="forecast-day-date">{day.date}</div>
                          <div className="forecast-day-icon">{getWeatherIcon(day.mainCondition)}</div>
                          <div className="forecast-day-temps">
                            <span className="temp-high">{Math.round(day.maxTemp)}°</span>
                            <span className="temp-separator">/</span>
                            <span className="temp-low">{Math.round(day.minTemp)}°</span>
                          </div>
                          <button className="btn-expand-forecast">
                            {expandedDay === index ? '▲' : '▼'}
                          </button>
                        </div>
                        {expandedDay === index && (
                          <div className="forecast-hourly">
                            {day.items.slice(0, 8).map((item, hourIndex) => (
                              <div key={hourIndex} className="hourly-item">
                                <div className="hourly-time">
                                  {new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                                <div className="hourly-icon">{getWeatherIcon(item.weather[0].main)}</div>
                                <div className="hourly-temp">{Math.round(item.main.temp)}°</div>
                                <div className="hourly-desc">{item.weather[0].description}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Simple 5-day forecast preview
                    groupForecastByDay(weather.list).map((day, index) => (
                      <div key={index} className="forecast-item">
                        <div className="forecast-date">{day.date.split(',')[0]}</div>
                        <div className="forecast-icon">{getWeatherIcon(day.mainCondition)}</div>
                        <div className="forecast-temps">
                          <span className="temp-high">{Math.round(day.maxTemp)}°</span>
                          <span className="temp-separator">/</span>
                          <span className="temp-low">{Math.round(day.minTemp)}°</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Search Section */}
          <div className="search-card">
            <h2>🔍 Search Your Order</h2>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Enter your full name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value.trimStart())}
                className="customer-search-input"
                required
                minLength="1"
              />
              <button type="submit" disabled={loading} className="btn-search">
                {loading ? 'Searching...' : '🔍 Search'}
              </button>
            </form>
            {error && <div className="search-error">{error}</div>}
          </div>

          {/* Results Section */}
          {orders.length > 0 && (
            <div className="orders-results">
              <h3>📋 Your Orders ({orders.length})</h3>
              <div className="orders-grid">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Order #{order.id}</span>
                      <span 
                        className="order-status" 
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="order-details">
                      <div className="order-row">
                        <span className="order-label">Total:</span>
                        <span className="order-value">₱{order.total_amount}</span>
                      </div>
                      
                      <div className="order-row">
                        <span className="order-label">Service:</span>
                        <span className="order-value">
                          {order.service_type === 'wash_dry' ? 'Wash & Dry' : 
                           order.service_type === 'wash_only' ? 'Wash Only' : 
                           order.service_type === 'dry_only' ? 'Dry Only' : 
                           order.service_type === 'mixed' ? 'Mixed' : 'Wash & Dry'}
                        </span>
                      </div>
                      
                      <div className="order-row">
                        <span className="order-label">Created:</span>
                        <span className="order-value">{formatDate(order.created_at)}</span>
                      </div>
                      
                      <div className="order-row">
                        <span className="order-label">Service Type:</span>
                        <span className="order-value">
                          {order.delivery_method === 'pickup' ? '🏠 Pickup Only' : '📦 Delivery Only'}
                        </span>
                      </div>
                      
                      {order.pickup_date && (
                        <div className="order-row">
                          <span className="order-label">Pickup Date:</span>
                          <span className="order-value">{formatDate(order.pickup_date)}</span>
                        </div>
                      )}
                      
                      {order.delivery_date && (
                        <div className="order-row">
                          <span className="order-label">Delivery Date:</span>
                          <span className="order-value">{formatDate(order.delivery_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="order-items">
                      <div className="items-title">Items:</div>
                      {order.items?.map((item, index) => (
                        <div key={index} className="item-badge">
                          {item.name} (x{item.quantity})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="customer-footer">
        <div className="footer-content">
          <img src="/washnet-logo.jpg" alt="WASHNET Laundry" className="footer-logo" />
          <div className="footer-text">
            <h3>WASHNET Laundry</h3>
            <p className="footer-tagline">Fresh • Fast • Clean</p>
            <p className="footer-copyright">© 2025 WASHNET Laundry Management System Made by Arrogante-Roldan-Rosales-Salazar-Torres POWERPUFFBOYS</p>
            <p className="footer-desc">Track Your Laundry • Know the Weather • Plan Smart</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CustomerHome;

