  import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

function AirQualityPanel({ selected, onClick, data, loading }) {
  if (loading) return <div>Loading air quality data...</div>;
  if (!data.length) return <div>No air quality data available.</div>;

  // Prepare data for AQI gauge (latest value)
  const latest = data[data.length - 1];
  const aqiGaugeData = [
    { name: 'AQI', value: latest.aqi, fill: latest.aqi > 150 ? '#d32f2f' : latest.aqi > 100 ? '#ffa726' : '#388e3c' }
  ];

  return (
    <div
      onClick={onClick}
      style={{
        margin: '32px 0',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        boxShadow: selected
          ? '0 6px 24px 0 rgba(56,142,60,0.12)'
          : '0 2px 8px rgba(99,102,241,0.08)',
        padding: 24,
        border: selected ? '2.5px solid #388e3c' : '2px solid rgba(56,142,60,0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.025)' : 'scale(1)',
        opacity: selected ? 0.98 : 1,
      }}
    >
      <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12 }}>Air Quality</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        {/* AQI Gauge */}
        <div style={{ width: 200, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <RadialBarChart width={200} height={200} cx={100} cy={100} innerRadius={70} outerRadius={100} barSize={18} data={aqiGaugeData} startAngle={180} endAngle={0} >
            <RadialBar minAngle={15} background clockWise dataKey="value" />
            <text x={100} y={110} textAnchor="middle" dominantBaseline="middle" fontSize={32} fontWeight={700} fill="#222">{latest.aqi}</text>
            <text x={100} y={150} textAnchor="middle" fontSize={16} fill="#1976d2">AQI</text>
          </RadialBarChart>
        </div>
        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 350, width: 500 }}>
          {!selected ? (
            <div style={{ background: '#f3f6fa', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(30,58,138,0.06)' }}>
              <h4 style={{ color: '#1976d2', margin: 0, marginBottom: 4 }}>Trends (PM2.5, PM10, CO₂)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pm2_5" stroke="#1976d2" dot={false} name="PM2.5" />
                  <Line type="monotone" dataKey="pm10" stroke="#388e3c" dot={false} name="PM10" />
                  <Line type="monotone" dataKey="co2" stroke="#ffa726" dot={false} name="CO₂" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <>
              <div style={{ background: '#f3f6fa', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(30,58,138,0.06)' }}>
                <h4 style={{ color: '#1976d2', margin: 0, marginBottom: 4 }}>PM2.5 Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pm2_5" stroke="#1976d2" dot={false} name="PM2.5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#f3f6fa', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(30,58,138,0.06)' }}>
                <h4 style={{ color: '#388e3c', margin: 0, marginBottom: 4 }}>PM10 Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pm10" stroke="#388e3c" dot={false} name="PM10" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#f3f6fa', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(30,58,138,0.06)' }}>
                <h4 style={{ color: '#ffa726', margin: 0, marginBottom: 4 }}>CO₂ Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="co2" stroke="#ffa726" dot={false} name="CO₂" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
      {selected && (
        <div>
          <h3 style={{ color: '#388e3c', marginTop: 24 }}>More Insights</h3>
        </div>
      )}
    </div>
  );
}

export default AirQualityPanel; 