import React, { useState } from 'react';
import { Search, PenTool, Settings as SettingsIcon } from 'lucide-react';
import WordSearch from './components/WordSearch';
import Quiz from './components/Quiz';
import Settings from './components/Settings';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('search');

    const renderContent = () => {
        switch (activeTab) {
            case 'search':
                return <WordSearch />;
            case 'quiz':
                return <Quiz />;
            case 'settings':
                return <Settings />;
            default:
                return <WordSearch />;
        }
    };

    return (
        <div className="app-container">
            <header className="glass-header">
                <div className="logo-section">
                    <PenTool className="logo-icon" />
                    <h1>English Learner</h1>
                </div>
                <nav className="main-nav">
                    <button
                        className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        <Search size={20} />
                        <span>Search</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'quiz' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quiz')}
                    >
                        <PenTool size={20} />
                        <span>Quiz</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <SettingsIcon size={20} />
                        <span>Settings</span>
                    </button>
                </nav>
            </header>

            <main className="content-area">
                {renderContent()}
            </main>

            <footer className="footer-info">
                <p>&copy; 2026 English Learner Web App (GAS Version)</p>
            </footer>
        </div>
    );
}

export default App;
