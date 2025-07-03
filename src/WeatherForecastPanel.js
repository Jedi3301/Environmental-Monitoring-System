import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

function WeatherForecastPanel({ selected, onClick, data, loading }) {
  if (loading) return <div>Loading weather forecast data...</div>;
  if (!data.length) return <div>No weather forecast data available.</div>;

  // Prepare data for temperature gauge (latest value)
  const latest = data[data.length - 1];
  const tempGaugeData = [
    { name: 'Temperature', value: latest.temperature, fill: latest.temperature > 35 ? '#d32f2f' : latest.temperature < 15 ? '#1976d2' : '#ffa726' }
  ];

  return (
    <div
      onClick={onClick}
      style={{
        margin: '32px 0',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        boxShadow: selected
          ? '0 6px 24px 0 rgba(255,193,7,0.12)'
          : '0 2px 8px rgba(99,102,241,0.08)',
        padding: 24,
        border: selected ? '2.5px solid #fbc02d' : '2px solid rgba(255,193,7,0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.025)' : 'scale(1)',
        opacity: selected ? 0.98 : 1,
      }}
    >
      <h2 style={{ color: '#fbc02d', fontWeight: 700, marginBottom: 12 }}>Weather Forecast</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        {/* Temperature Gauge */}
        <div style={{ width: 200, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <RadialBarChart width={200} height={200} cx={100} cy={100} innerRadius={70} outerRadius={100} barSize={18} data={tempGaugeData} startAngle={180} endAngle={0} >
            <RadialBar minAngle={15} background clockWise dataKey="value" />
            <text x={100} y={110} textAnchor="middle" dominantBaseline="middle" fontSize={32} fontWeight={700} fill="#222">{latest.temperature}°C</text>
            <text x={100} y={150} textAnchor="middle" fontSize={16} fill="#1976d2">Temp</text>
          </RadialBarChart>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 350, width: 500 }}>
          {!selected ? (
            <div style={{ background: '#fffde7', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(255,193,7,0.06)' }}>
              <h4 style={{ color: '#fbc02d', margin: 0, marginBottom: 4 }}>Trends (Temperature, Humidity, Rainfall)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="forecast_time" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#fbc02d" dot={false} name="Temperature (°C)" />
                  <Line type="monotone" dataKey="humidity" stroke="#0288d1" dot={false} name="Humidity (%)" />
                  <Line type="monotone" dataKey="rainfall" stroke="#388e3c" dot={false} name="Rainfall (mm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <>
              <div style={{ background: '#fffde7', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(255,193,7,0.06)' }}>
                <h4 style={{ color: '#fbc02d', margin: 0, marginBottom: 4 }}>Temperature Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="forecast_time" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#fbc02d" dot={false} name="Temperature (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fffde7', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(255,193,7,0.06)' }}>
                <h4 style={{ color: '#0288d1', margin: 0, marginBottom: 4 }}>Humidity Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="forecast_time" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="humidity" stroke="#0288d1" dot={false} name="Humidity (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fffde7', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(255,193,7,0.06)' }}>
                <h4 style={{ color: '#388e3c', margin: 0, marginBottom: 4 }}>Rainfall Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="forecast_time" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rainfall" stroke="#388e3c" dot={false} name="Rainfall (mm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
      {selected && (
        <div>
          <h3 style={{ color: '#fbc02d', marginTop: 24 }}>More Insights</h3>
        </div>
      )}
    </div>
  );
}

export default WeatherForecastPanel; 