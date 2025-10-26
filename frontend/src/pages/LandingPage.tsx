import { Link } from 'react-router-dom';
import './LandingPage.css'; 

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>探索台北的咖啡角落</h1>
          <p>加入我們，在地圖上分享與發現您最愛的私房咖啡廳。</p>
          <Link to="/map" className="hero-cta-button">
            開始探索地圖
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;