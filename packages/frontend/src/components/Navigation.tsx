import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム' },
    { path: '/game', label: 'ゲーム' },
    { path: '/scenario', label: 'シナリオ' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-title">
          <Link to="/">遺跡漁りとドブさらい</Link>
        </h1>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;