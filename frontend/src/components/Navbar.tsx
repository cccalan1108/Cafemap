import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* */}
      <Link to="/" className="nav-brand">CafeMap</Link>
      <div className="nav-links">
        {/**/}
        <Link to="/map" className="nav-link">探索地圖</Link>

        {user ? (
          <>
            <span className="nav-user">你好, {user.name || user.email}</span>
            <button onClick={handleLogout} className="nav-link-button">登出</button>
          </>
        ) : (
          <>
            <Link to="/register" className="nav-link">註冊</Link>
            <Link to="/login" className="nav-link">登入</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;