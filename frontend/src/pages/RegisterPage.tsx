import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios'; 
import './AuthForm.css'; 

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(''); 

    try {
      
      const response = await apiClient.post('/auth/register', { email, password });

      console.log(response.data);
      alert('註冊成功，將為您導向登入頁面。');
      navigate('/login'); 

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('註冊失敗，請稍後再試。');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>註冊</h2>
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
          <button type="submit">註冊</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;