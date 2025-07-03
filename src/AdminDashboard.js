import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import EditableTable from './EditableTable';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changePw, setChangePw] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const navigate = useNavigate();

  // User management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userMsg, setUserMsg] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editUser, setEditUser] = useState({});

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

  // Fetch all users and their roles for master_admin
  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      setLoadingUsers(true);
      // Get all profiles
      const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name');
      // Get all roles
      const { data: rolesData } = await supabase.from('admin_roles').select('*');
      // Get emails from auth.users via RPC
      const { data: authUsers } = await supabase.rpc('get_all_users_with_email');
      // Merge data: use authUsers as base
      const merged = (authUsers || []).map(authUser => {
        const profile = (profiles || []).find(p => p.id === authUser.id) || {};
        const role = (rolesData || []).find(r => r.user_id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          role: role?.role || '',
          section: role?.section || '',
          role_id: role?.id || null,
        };
      });
      setUsers(merged);
      setLoadingUsers(false);
    };
    fetchUsersAndRoles();
  }, []);

  const canEdit = tableName => {
    if (roles.some(r => r.role === 'master_admin')) return true;
    return roles.some(r => r.role === 'admin' && r.section === tableName);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  // Change password logic
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPwMsg('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwMsg('New passwords do not match.');
      return;
    }
    // Re-authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setPwMsg('User not found.');
      return;
    }
    // Sign in with old password to verify
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword });
    if (signInError) {
      setPwMsg('Old password is incorrect.');
      return;
    }
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setPwMsg('Failed to update password.');
      return;
    }
    setPwMsg('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setChangePw(false);
  };

  // Add or update role
  const handleSaveRole = async (idx) => {
    setUserMsg('');
    const user = users[idx];
    if (!editUser.role || !editUser.section) {
      setUserMsg('Role and section are required.');
      return;
    }
    if (user.role_id) {
      // Update
      await supabase.from('admin_roles').update({ role: editUser.role, section: editUser.section }).eq('id', user.role_id);
    } else {
      // Insert
      await supabase.from('admin_roles').insert({ user_id: user.id, role: editUser.role, section: editUser.section });
    }
    // Update profile
    await supabase.from('profiles').update({
      first_name: editUser.first_name,
      last_name: editUser.last_name
    }).eq('id', user.id);
    setEditIdx(null);
    setEditUser({});
    setUserMsg('User details updated.');
    await refreshUsers();
  };

  // Remove role
  const handleRemoveRole = async (idx) => {
    setUserMsg('');
    const user = users[idx];
    if (!user.role_id) return;
    const { error } = await supabase.from('admin_roles').delete().eq('id', user.role_id);
    if (error) {
      setUserMsg('Failed to remove role.');
      return;
    }
    setUserMsg('Role removed.');
    await refreshUsers();
  };

  const refreshUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name');
    const { data: rolesData } = await supabase.from('admin_roles').select('*');
    const { data: authUsers } = await supabase.rpc('get_all_users_with_email');
    const merged = (authUsers || []).map(authUser => {
      const profile = (profiles || []).find(p => p.id === authUser.id) || {};
      const role = (rolesData || []).find(r => r.user_id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: role?.role || '',
        section: role?.section || '',
        role_id: role?.id || null,
      };
    });
    setUsers(merged);
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
    <div style={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', position: 'relative' }}>
      <button onClick={handleLogout} style={{ position: 'absolute', top: 24, right: 32, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
        Logout
      </button>
      {/* Change Password Section */}
      <div style={{ position: 'absolute', top: 24, left: 32 }}>
        {!changePw ? (
          <button onClick={() => setChangePw(true)} style={{ background: '#fff', color: '#1976d2', border: '1.5px solid #1976d2', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} style={{ background: '#fff', border: '1.5px solid #1976d2', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
            <label style={{ fontWeight: 600, color: '#1976d2' }}>Old Password</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e7ff' }} required />
            <label style={{ fontWeight: 600, color: '#1976d2' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e7ff' }} required />
            <label style={{ fontWeight: 600, color: '#1976d2' }}>Confirm New Password</label>
            <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e7ff' }} required />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Update</button>
              <button type="button" onClick={() => { setChangePw(false); setPwMsg(''); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); }} style={{ background: '#eee', color: '#1976d2', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
            {pwMsg && <div style={{ color: pwMsg.includes('success') ? 'green' : 'red', marginTop: 4 }}>{pwMsg}</div>}
          </form>
        )}
      </div>
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
      {roles.some(r => r.role === 'master_admin') && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 900, marginBottom: 48 }}>
          <h2>Manage User Roles</h2>
          {loadingUsers ? (
            <div>Loading users...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', background: '#fff', border: '1.5px solid #b6c6e3', borderRadius: 8, boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #b6c6e3', padding: '4px 8px' }}>Email</th>
                  <th style={{ border: '1px solid #b6c6e3', padding: '4px 8px' }}>First Name</th>
                  <th style={{ border: '1px solid #b6c6e3', padding: '4px 8px' }}>Last Name</th>
                  <th style={{ border: '1px solid #b6c6e3', padding: '4px 8px' }}>Role</th>
                  <th style={{ border: '1px solid #b6c6e3', padding: '4px 8px' }}>Section</th>
                  <th style={{ border: '1px solid #b6c6e3', padding: '4px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id}>
                    <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>{user.email}</td>
                    <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                      {editIdx === idx ? (
                        <input
                          value={editUser.first_name}
                          onChange={e => setEditUser({ ...editUser, first_name: e.target.value })}
                          style={{ fontSize: '0.95rem', width: 90 }}
                        />
                      ) : (
                        user.first_name
                      )}
                    </td>
                    <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                      {editIdx === idx ? (
                        <input
                          value={editUser.last_name}
                          onChange={e => setEditUser({ ...editUser, last_name: e.target.value })}
                          style={{ fontSize: '0.95rem', width: 90 }}
                        />
                      ) : (
                        user.last_name
                      )}
                    </td>
                    <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                      {editIdx === idx ? (
                        <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })} style={{ fontSize: '0.95rem' }}>
                          <option value="">Select</option>
                          <option value="admin">admin</option>
                          <option value="master_admin">master_admin</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                      {editIdx === idx ? (
                        <select value={editUser.section} onChange={e => setEditUser({ ...editUser, section: e.target.value })} style={{ fontSize: '0.95rem' }}>
                          <option value="">Select</option>
                          <option value="air_quality">air_quality</option>
                          <option value="water_quality">water_quality</option>
                          <option value="weather_forecast">weather_forecast</option>
                          <option value="master">master</option>
                        </select>
                      ) : (
                        user.section
                      )}
                    </td>
                    <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                      {editIdx === idx ? (
                        <>
                          <button onClick={() => handleSaveRole(idx)} style={{ fontSize: '0.92rem', padding: '2px 8px', marginRight: 4 }}>Save</button>
                          <button onClick={() => { setEditIdx(null); setEditUser({}); }} style={{ fontSize: '0.92rem', padding: '2px 8px' }}>Cancel</button>
                        </>
                      ) : user.role ? (
                        <>
                          <button onClick={() => {
                            setEditIdx(idx);
                            setEditUser({
                              first_name: user.first_name,
                              last_name: user.last_name,
                              role: user.role,
                              section: user.section
                            });
                          }} style={{ fontSize: '0.92rem', padding: '2px 8px', marginRight: 4 }}>Edit</button>
                          <button onClick={() => handleRemoveRole(idx)} style={{ color: 'red', fontSize: '0.92rem', padding: '2px 8px' }}>Remove</button>
                        </>
                      ) : (
                        <button onClick={() => {
                          setEditIdx(idx);
                          setEditUser({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            role: '',
                            section: ''
                          });
                        }} style={{ fontSize: '0.92rem', padding: '2px 8px' }}>Add Role</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {userMsg && <div style={{ color: userMsg.includes('fail') ? 'red' : 'green', marginTop: 8 }}>{userMsg}</div>}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 