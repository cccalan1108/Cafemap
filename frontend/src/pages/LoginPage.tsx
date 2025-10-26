import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext'; 
import './AuthForm.css'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token } = response.data;

      if (token) {
        
        login(token); 

        alert('登入成功');
        navigate('/');
      }

    } catch (err: any) {
      
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('登入失敗，請檢查帳號密碼。');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>登入</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>密碼:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {/* */}
          <button type="submit">登入</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;