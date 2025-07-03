import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import EditableTable from './EditableTable';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not logged in.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role, section')
        .eq('user_id', user.id);
      if (error) {
        setError('Failed to fetch roles.');
        setLoading(false);
        return;
      }
      setRoles(data || []);
      setLoading(false);
    };
    fetchRoles();
  }, []);

  const canEdit = tableName => {
    if (roles.some(r => r.role === 'master_admin')) return true;
    return roles.some(r => r.role === 'admin' && r.section === tableName);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }
  if (error) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
  }
  if (!roles.length) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>You do not have admin access.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', position: 'relative' }}>
      <button onClick={handleLogout} style={{ position: 'absolute', top: 24, right: 32, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
        Logout
      </button>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a237e', marginBottom: 24, textShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        Admin Dashboard
      </h1>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 20, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.13)', padding: 32, minWidth: 320, textAlign: 'center' }}>
        <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 16 }}>Edit Environmental Data</h2>
        {canEdit('air_quality') && (
          <div style={{ marginBottom: 32 }}>
            <h3>Air Quality Data</h3>
            <EditableTable
              tableName="air_quality"
              columns={["id", "pm2_5", "pm10", "co2", "aqi", "recorded_at"]}
              canEdit={canEdit('air_quality')}
            />
          </div>
        )}
        {canEdit('water_quality') && (
          <div style={{ marginBottom: 32 }}>
            <h3>Water Quality Data</h3>
            <EditableTable
              tableName="water_quality"
              columns={["id", "ph", "turbidity", "dissolved_oxygen", "recorded_at"]}
              canEdit={canEdit('water_quality')}
            />
          </div>
        )}
        {canEdit('weather_forecast') && (
          <div style={{ marginBottom: 32 }}>
            <h3>Weather Forecast Data</h3>
            <EditableTable
              tableName="weather_forecast"
              columns={["id", "temperature", "humidity", "wind_speed", "forecast_time"]}
              canEdit={canEdit('weather_forecast')}
            />
          </div>
        )}
        {!canEdit('air_quality') && !canEdit('water_quality') && !canEdit('weather_forecast') && (
          <div style={{ color: '#888' }}>You do not have permission to edit any data.</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 