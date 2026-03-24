import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { Plus, Users, ArrowLeft, Shield, ShieldOff, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const CreateJoinRoom: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [isCreate, setIsCreate] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateRoom = async () => {
    if (!user || !roomName) return;
    setLoading(true);
    try {
      const code = generateCode();
      const roomData = {
        name: roomName,
        code,
        max_members: maxMembers,
        password: hasPassword ? password : '',
        owner_id: user.id,
        members: [user.id],
        status: 'active',
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select('id')
        .single();

      if (error) throw error;
      
      if (data && data.id) {
        navigate(`/room/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating room', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !roomCode) return;
    setLoading(true);
    try {
      // Query Supabase for room with matching code
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('id, members, max_members')
        .eq('code', roomCode)
        .single();

      if (error || !rooms) {
        alert('Invalid room code');
        setLoading(false);
        return;
      }

      const currentMembers = rooms.members || [];
      
      if (currentMembers.includes(user.id)) {
        navigate(`/room/${rooms.id}`);
        setLoading(false);
        return;
      }

      if (currentMembers.length >= rooms.max_members) {
        alert('Room is full');
        setLoading(false);
        return;
      }

      // Add user to members array
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ members: [...currentMembers, user.id] })
        .eq('id', rooms.id);

      if (updateError) throw updateError;
      
      navigate(`/room/${rooms.id}`);
    } catch (error) {
      console.error('Error joining room', error);
      alert('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '20px',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#00FFB2',
    color: '#000000',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0, 255, 178, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto', color: '#FFFFFF' }}>
      <button 
        onClick={() => navigate('/')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'rgba(255, 255, 255, 0.6)', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '32px',
          fontSize: '16px'
        }}
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button 
          onClick={() => setIsCreate(true)}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '12px', 
            border: 'none', 
            backgroundColor: isCreate ? '#00FFB2' : 'rgba(255, 255, 255, 0.05)', 
            color: isCreate ? '#000000' : '#FFFFFF',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Create Room
        </button>
        <button 
          onClick={() => setIsCreate(false)}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '12px', 
            border: 'none', 
            backgroundColor: !isCreate ? '#00FFB2' : 'rgba(255, 255, 255, 0.05)', 
            color: !isCreate ? '#000000' : '#FFFFFF',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Join Room
        </button>
      </div>

      <motion.div 
        key={isCreate ? 'create' : 'join'}
        initial={{ opacity: 0, x: isCreate ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ 
          backgroundColor: '#111111', 
          padding: '32px', 
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}
      >
        {isCreate ? (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Create New Room</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px' }}>Invite friends and start predicting!</p>
            
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Room Name</label>
            <input 
              type="text" 
              placeholder="e.g. IPL Kings" 
              style={inputStyle} 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Max Members: {maxMembers}</label>
            <input 
              type="range" 
              min="2" 
              max="50" 
              style={{ width: '100%', marginBottom: '24px', accentColor: '#00FFB2' }} 
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Private Room (Password)</label>
              <button 
                onClick={() => setHasPassword(!hasPassword)}
                style={{ background: 'none', border: 'none', color: hasPassword ? '#00FFB2' : 'rgba(255, 255, 255, 0.3)', cursor: 'pointer' }}
              >
                {hasPassword ? <Shield size={24} /> : <ShieldOff size={24} />}
              </button>
            </div>

            {hasPassword && (
              <input 
                type="password" 
                placeholder="Room Password" 
                style={inputStyle} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <button 
              style={buttonStyle} 
              onClick={handleCreateRoom}
              disabled={loading}
            >
              {loading ? 'Creating...' : <><Plus size={20} /> Create Room</>}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Join a Room</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px' }}>Enter the 6-digit code shared by your friend.</p>
            
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Room Code</label>
            <input 
              type="text" 
              placeholder="e.g. 123456" 
              maxLength={6}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }} 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />

            <button 
              style={buttonStyle} 
              onClick={handleJoinRoom}
              disabled={loading}
            >
              {loading ? 'Joining...' : <><Zap size={20} fill="#000" /> Join Now</>}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CreateJoinRoom;
