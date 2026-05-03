import React, { useState } from 'react';
import { Search, Sun, CloudRain, Wind, Droplets, Cloud, CloudLightning, Snowflake } from 'lucide-react';

const WeatherWidget = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mapeia a condição da API para ícones e animações específicas
  const getWeatherDetails = (condition) => {
    const style = "w-20 h-20 transition-all duration-700 ease-in-out";
    switch (condition) {
      case 'Clear': 
        return { icon: <Sun className={`${style} text-yellow-400 animate-spin-slow`} />, bg: 'from-orange-400/20 to-yellow-500/10' };
      case 'Rain': 
        return { icon: <CloudRain className={`${style} text-blue-400 animate-bounce`} />, bg: 'from-blue-600/20 to-indigo-900/10' };
      case 'Clouds': 
        return { icon: <Cloud className={`${style} text-gray-400 animate-pulse`} />, bg: 'from-slate-500/20 to-slate-700/10' };
      case 'Thunderstorm': 
        return { icon: <CloudLightning className={`${style} text-purple-400 animate-pulse`} />, bg: 'from-purple-900/20 to-slate-900/20' };
      case 'Snow': 
        return { icon: <Snowflake className={`${style} text-sky-200 animate-spin-slow`} />, bg: 'from-sky-200/20 to-blue-300/10' };
      default: 
        return { icon: <Sun className={`${style} text-yellow-400`} />, bg: 'from-blue-400/20 to-blue-600/10' };
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setError(null);
    
    try {
      // Chamada para a sua Azure Function migrada para o Static Web App
      const response = await fetch(`/api/clima?city=${city}`);
      
      if (!response.ok) throw new Error('Cidade não encontrada');
      
      const data = await response.json();
      
      setWeather({
        name: data.cidade,
        temp: Math.round(data.temperatura),
        condition: data.weather[0].main,
        humidity: data.umidade,
        wind: Math.round(data.vento * 3.6), // Convertendo m/s para km/h
        description: data.weather[0].descricao
      });
    } catch (err) {
      setError("Ops! Não conseguimos encontrar essa cidade.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const details = weather ? getWeatherDetails(weather.condition) : null;

  return (
    <div className={`max-w-md mx-auto mt-10 p-8 rounded-[2rem] shadow-2xl text-white border border-slate-800 bg-gradient-to-br ${details?.bg || 'from-slate-900 to-slate-950'} transition-all duration-1000`}>
      
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative mb-8 group">
        <input 
          type="text"
          placeholder="Ex: Curitiba, BR"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-11 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none backdrop-blur-sm group-hover:border-slate-500"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4 group-hover:text-blue-400 transition-colors" />
        {loading && <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
      </form>

      {/* Error Message */}
      {error && <div className="text-red-400 text-center text-sm mb-4 animate-pulse">{error}</div>}

      {/* Weather Result */}
      {weather ? (
        <div className="text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">{weather.name}</h2>
            <p className="text-slate-400 capitalize text-sm">{weather.description}</p>
          </div>

          <div className="flex justify-center py-4">
            {details.icon}
          </div>

          <div className="text-7xl font-light tracking-tighter">
            {weather.temp}<span className="text-3xl font-normal text-blue-400">°C</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex flex-col items-center p-4 bg-slate-800/40 rounded-3xl backdrop-blur-md">
              <Droplets className="text-blue-400 w-6 h-6 mb-2" />
              <span className="text-xs text-slate-400 uppercase font-semibold">Umidade</span>
              <span className="text-lg font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-800/40 rounded-3xl backdrop-blur-md">
              <Wind className="text-teal-400 w-6 h-6 mb-2" />
              <span className="text-xs text-slate-400 uppercase font-semibold">Vento</span>
              <span className="text-lg font-medium">{weather.wind} km/h</span>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="py-20 text-center space-y-4">
            <Cloud className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
            <p className="text-slate-500 font-medium">Aguardando sua busca...</p>
          </div>
        )
      )}
    </div>
  );
};

export default WeatherWidget;