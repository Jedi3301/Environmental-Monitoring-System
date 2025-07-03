import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

function WaterQualityPanel({ selected, onClick, data, loading }) {
  if (loading) return <div>Loading water quality data...</div>;
  if (!data.length) return <div>No water quality data available.</div>;

  // Prepare data for gauge (latest value)
  const latest = data[data.length - 1];
  const phGaugeData = [
    { name: 'pH', value: latest.ph, fill: latest.ph < 6.5 || latest.ph > 8.5 ? '#d32f2f' : '#388e3c' }
  ];

  return (
    <div
      onClick={onClick}
      style={{
        margin: '32px 0',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        boxShadow: selected
          ? '0 6px 24px 0 rgba(2,136,209,0.12)'
          : '0 2px 8px rgba(99,102,241,0.08)',
        padding: 24,
        border: selected ? '2.5px solid #0288d1' : '2px solid rgba(2,136,209,0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.025)' : 'scale(1)',
        opacity: selected ? 0.98 : 1,
      }}
    >
      <h2 style={{ color: '#0288d1', fontWeight: 700, marginBottom: 12 }}>Water Quality</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        {/* pH Gauge */}
        <div style={{ width: 200, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <RadialBarChart width={200} height={200} cx={100} cy={100} innerRadius={70} outerRadius={100} barSize={18} data={phGaugeData} startAngle={180} endAngle={0} >
            <RadialBar minAngle={15} background clockWise dataKey="value" />
            <text x={100} y={110} textAnchor="middle" dominantBaseline="middle" fontSize={32} fontWeight={700} fill="#222">{latest.ph}</text>
            <text x={100} y={150} textAnchor="middle" fontSize={16} fill="#0288d1">pH</text>
          </RadialBarChart>
        </div>
        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 350, width: 500 }}>
          {!selected ? (
            <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(2,136,209,0.06)' }}>
              <h4 style={{ color: '#0288d1', margin: 0, marginBottom: 4 }}>Trends (pH, Turbidity, Dissolved Oxygen)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ph" stroke="#0288d1" dot={false} name="pH" />
                  <Line type="monotone" dataKey="turbidity" stroke="#388e3c" dot={false} name="Turbidity" />
                  <Line type="monotone" dataKey="dissolved_oxygen" stroke="#ffa726" dot={false} name="Dissolved Oxygen" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <>
              <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(2,136,209,0.06)' }}>
                <h4 style={{ color: '#0288d1', margin: 0, marginBottom: 4 }}>pH Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="ph" stroke="#0288d1" dot={false} name="pH" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(2,136,209,0.06)' }}>
                <h4 style={{ color: '#388e3c', margin: 0, marginBottom: 4 }}>Turbidity Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="turbidity" stroke="#388e3c" dot={false} name="Turbidity" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(2,136,209,0.06)' }}>
                <h4 style={{ color: '#ffa726', margin: 0, marginBottom: 4 }}>Dissolved Oxygen Trend</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={str => str.slice(11, 16)} minTickGap={20} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="dissolved_oxygen" stroke="#ffa726" dot={false} name="Dissolved Oxygen" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
      {selected && (
        <div>
          <h3 style={{ color: '#0288d1', marginTop: 24 }}>More Insights</h3>
        </div>
      )}
    </div>
  );
}

export default WaterQualityPanel; 