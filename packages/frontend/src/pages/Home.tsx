import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => (
    <div className="home">
      <header className="home-header">
        <h1>遺跡漁りとドブさらい</h1>
        <p className="home-subtitle">
          非同期TRPGスタイルWebゲーム
        </p>
      </header>

      <div className="home-content">
        <section className="welcome-section">
          <h2>ゲームについて</h2>
          <p>
            このゲームは遺跡を探索し、宝物を発見する非同期のターン制冒険ゲームです。
            他のプレイヤーと協力して、謎に満ちた遺跡の深部を目指しましょう。
          </p>
        </section>

        <section className="actions-section">
          <div className="action-cards">
            <div className="action-card">
              <h3>新しいゲームを始める</h3>
              <p>新しいセッションを作成してゲームを開始します</p>
              <Link to="/game" className="btn btn-primary">
                ゲーム開始
              </Link>
            </div>

            <div className="action-card">
              <h3>シナリオを閲覧</h3>
              <p>利用可能なシナリオを見つけて参加します</p>
              <Link to="/scenario" className="btn btn-secondary">
                シナリオ一覧
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>ゲームの特徴</h2>
          <ul className="features-list">
            <li>非同期ターン制ゲームプレイ</li>
            <li>豊富なカードベースアクションシステム</li>
            <li>協力プレイとマルチプレイヤー対応</li>
            <li>動的なシナリオ生成</li>
            <li>ブラウザ内での完全なゲーム体験</li>
          </ul>
        </section>
      </div>
    </div>
  );

export default Home;