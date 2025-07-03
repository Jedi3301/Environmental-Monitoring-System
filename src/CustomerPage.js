import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AirQualityPanel from './AirQualityPanel';
import WaterQualityPanel from './WaterQualityPanel';
import WeatherForecastPanel from './WeatherForecastPanel';

function CustomerPage() {
  const [selected, setSelected] = useState(null);
  // Data and loading state for all panels
  const [airData, setAirData] = useState([]);
  const [airLoading, setAirLoading] = useState(true);
  const [waterData, setWaterData] = useState([]);
  const [waterLoading, setWaterLoading] = useState(true);
  const [weatherData, setWeatherData] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const fetchAir = async () => {
      setAirLoading(true);
      const { data, error } = await supabase
        .from('air_quality')
        .select('*')
        .order('recorded_at', { ascending: true })
        .limit(100);
      if (!error) setAirData(data || []);
      setAirLoading(false);
    };
    fetchAir();
  }, []);

  useEffect(() => {
    const fetchWater = async () => {
      setWaterLoading(true);
      const { data, error } = await supabase
        .from('water_quality')
        .select('*')
        .order('recorded_at', { ascending: true })
        .limit(100);
      if (!error) setWaterData(data || []);
      setWaterLoading(false);
    };
    fetchWater();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      const { data, error } = await supabase
        .from('weather_forecast')
        .select('*')
        .order('forecast_time', { ascending: true })
        .limit(100);
      if (!error) setWeatherData(data || []);
      setWeatherLoading(false);
    };
    fetchWeather();
  }, []);

  // Helper to render the selected panel in modal
  const renderModalPanel = () => {
    let PanelComponent = null;
    let panelProps = {};
    if (selected === 'air') {
      PanelComponent = AirQualityPanel;
      panelProps = { selected: true, onClick: () => {}, data: airData, loading: airLoading };
    }
    if (selected === 'water') {
      PanelComponent = WaterQualityPanel;
      panelProps = { selected: true, onClick: () => {}, data: waterData, loading: waterLoading };
    }
    if (selected === 'weather') {
      PanelComponent = WeatherForecastPanel;
      panelProps = { selected: true, onClick: () => {}, data: weatherData, loading: weatherLoading };
    }
    if (!PanelComponent) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
          paddingTop: 40,
          paddingBottom: 40,
          boxSizing: 'border-box',
        }}
        onClick={() => setSelected(null)}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 1003,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 24,
            boxShadow: '0 8px 48px 0 rgba(30,58,138,0.25)',
            padding: 32,
            minWidth: 380,
            maxWidth: 600,
            width: '90vw',
            transform: 'scale(1.08)',
            opacity: 1,
            transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
            animation: 'modalPopIn 0.35s cubic-bezier(.4,2,.6,1)',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(30,58,138,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 24,
              color: '#222',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30,58,138,0.08)',
              transition: 'background 0.2s',
              zIndex: 1004,
            }}
            aria-label="Close"
          >
            ×
          </button>
          <PanelComponent {...panelProps} />
        </div>
      </div>
    );
  };

  return (
    <div className="login-bg" style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: selected ? 'hidden' : undefined }}>
      {/* Animated background blobs for consistency with LoginPage */}
      <div className="login-blob login-blob1" />
      <div className="login-blob login-blob2" />
      <div className="login-blob login-blob3" />
      {/* Overlay for modal */}
      {selected && (
        <div className="modal-overlay" />
      )}
      <Link
        to="/admin"
        style={{
          position: 'absolute',
          top: 24,
          right: 32,
          color: '#1976d2',
          fontWeight: 600,
          textDecoration: 'none',
          fontSize: 16,
          background: 'rgba(255,255,255,0.7)',
          padding: '6px 16px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
          transition: 'background 0.2s, color 0.2s',
          zIndex: 2,
        }}
        onMouseOver={e => (e.target.style.background = '#e3f2fd')}
        onMouseOut={e => (e.target.style.background = 'rgba(255,255,255,0.7)')}
      >
        Admin Login
      </Link>
      <div
        className="glass-panel"
        style={{
          marginTop: 64,
          marginBottom: 24,
          width: 'min(1200px, 95vw)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 8px 32px 0 rgba(99,102,241,0.13)',
        }}
      >
        <h1 style={{ fontWeight: 800, color: '#1a237e', marginBottom: 24, textShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          Environmental Monitoring Dashboard
        </h1>
        <div className="panels-row" style={{ visibility: selected ? 'hidden' : 'visible', height: selected ? 0 : undefined }}>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 420 }}>
            <AirQualityPanel selected={selected === 'air'} onClick={() => setSelected('air')} data={airData} loading={airLoading} />
          </div>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 420 }}>
            <WaterQualityPanel selected={selected === 'water'} onClick={() => setSelected('water')} data={waterData} loading={waterLoading} />
          </div>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 420 }}>
            <WeatherForecastPanel selected={selected === 'weather'} onClick={() => setSelected('weather')} data={weatherData} loading={weatherLoading} />
          </div>
        </div>
      </div>
      {/* Modal for selected panel */}
      {selected && (
        <div className="modal-content" style={{ zIndex: 1002 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(30,58,138,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 24,
              color: '#222',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30,58,138,0.08)',
              transition: 'background 0.2s',
              zIndex: 1004,
            }}
            aria-label="Close"
          >
            ×
          </button>
          {renderModalPanel()}
        </div>
      )}
      {/* Modal pop-in animation */}
      <style>{`
        @keyframes modalPopIn {
          0% { transform: scale(0.92); opacity: 0.2; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default CustomerPage; 