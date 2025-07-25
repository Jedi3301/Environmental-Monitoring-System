import React, { useState } from 'react';
import './LoginPage.css';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [signupMsg, setSignupMsg] = useState('');
  const [role, setRole] = useState(null); // 'admin' or 'master_admin'
  const [section, setSection] = useState(null);
  const [firstNameDisplay, setFirstNameDisplay] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setRole(null);
    setSection(null);
    setFirstNameDisplay('');
    // Sign in
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }
    // Get user id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError('User not found after login.');
      return;
    }
    // Fetch first name from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();
    if (!profileError && profile && profile.first_name) {
      setFirstNameDisplay(profile.first_name);
    }
    // Check admin_roles
    const { data: roleData, error: roleError } = await supabase
      .from('admin_roles')
      .select('role, section')
      .eq('user_id', user.id)
      .single();
    setLoading(false);
    if (roleError || !roleData) {
      setError('You do not have admin access.');
      return;
    }
    setRole(roleData.role);
    setSection(roleData.section);
    setSuccess(true);
    navigate('/dashboard');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignupMsg('');
    if (password !== confirmPassword) {
      setLoading(false);
      setError('Passwords do not match.');
      return;
    }
    if (!firstName || !lastName) {
      setLoading(false);
      setError('Please enter your first and last name.');
      return;
    }
    // Sign up user
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    // Insert profile
    const userId = data?.user?.id || data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, first_name: firstName, last_name: lastName }]);
      if (profileError) {
        setLoading(false);
        setError('Signup succeeded but failed to save profile info.');
        return;
      }
    }
    setLoading(false);
    setSignupMsg('Signup successful! Please check your email to confirm your account.');
  };

  return (
    <div className="login-bg">
      {/* Animated background blobs */}
      <div className="login-blob login-blob1" />
      <div className="login-blob login-blob2" />
      <div className="login-blob login-blob3" />
      <div className="login-card">
        <div className="card-main-title">Environmental Monitoring System</div>
        {role ? (
          <div style={{textAlign: 'center', marginTop: 32}}>
            <h2>Welcome, {firstNameDisplay ? firstNameDisplay : (role === 'master_admin' ? 'Master Admin' : 'Admin')}!</h2>
            <p>Your section: {role === 'master_admin' ? 'All' : section}</p>
            <p>(Admin dashboard UI goes here)</p>
          </div>
        ) : (
        <>
        <h2 className="login-title">{mode === 'login' ? 'Sign In' : 'Sign Up'}</h2>
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
          {mode === 'signup' && (
            <>
              <div className="login-field">
                <label className="login-label">First Name</label>
                <input
                  className="login-input"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="login-field">
                <label className="login-label">Last Name</label>
                <input
                  className="login-input"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {mode === 'signup' && (
            <div className="login-field">
              <label className="login-label">Confirm Password</label>
              <input
                className="login-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="login-btn-loading">
                <span className="login-spinner"></span>
                {mode === 'login' ? 'Logging in...' : 'Signing up...'}
              </span>
            ) : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
          {error && <div className="login-error">{error}</div>}
          {success && mode === 'login' && <div className="login-success">Login successful!</div>}
          {signupMsg && mode === 'signup' && <div className="login-success">{signupMsg}</div>}
        </form>
        <div className="login-toggle">
          {mode === 'login' ? (
            <>
              <span>Don't have an account? </span>
              <button type="button" className="login-link" onClick={() => { setMode('signup'); setError(null); setSuccess(false); setSignupMsg(''); }}>Sign Up</button>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <button type="button" className="login-link" onClick={() => { setMode('login'); setError(null); setSuccess(false); setSignupMsg(''); }}>Sign In</button>
            </>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default LoginPage; 