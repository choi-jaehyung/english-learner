import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Table, Link } from 'lucide-react';

const Settings = () => {
    const [geminiKey, setGeminiKey] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');
    const [gasUrl, setGasUrl] = useState('');

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key') || '';
        const savedSheetUrl = localStorage.getItem('google_sheet_url') || '';
        const savedGasUrl = localStorage.getItem('gas_deployment_url') || '';
        setGeminiKey(savedKey);
        setSheetUrl(savedSheetUrl);
        setGasUrl(savedGasUrl);
    }, []);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', geminiKey);
        localStorage.setItem('google_sheet_url', sheetUrl);
        localStorage.setItem('gas_deployment_url', gasUrl);
        alert('설정이 저장되었습니다.');
    };

    return (
        <div className="feature-card settings-container">
            <div className="settings-header">
                <SettingsIcon size={32} className="feature-icon" color="#4cc9f0" />
                <h2>설정</h2>
            </div>

            <div className="settings-form">
                <div className="input-group">
                    <label><Key size={16} /> Gemini API Key</label>
                    <input
                        type="password"
                        placeholder="Gemini API 키를 입력하세요..."
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label><Table size={16} /> 구글 시트 파일 URL (퀴즈용)</label>
                    <input
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                    />
                    <p className="hint">퀴즈 데이터를 가져오기 위해 '링크가 있는 모든 사용자 - 읽기' 권한이 필요합니다.</p>
                </div>

                <div className="input-group">
                    <label><Link size={16} /> GAS 배포 URL (자동 저장용)</label>
                    <input
                        type="text"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={gasUrl}
                        onChange={(e) => setGasUrl(e.target.value)}
                    />
                    <p className="hint">Google Apps Script를 웹 앱으로 배포한 URL을 입력하세요.</p>
                </div>

                <button className="save-btn" onClick={handleSave}>
                    <Save size={18} />
                    <span>설정 저장</span>
                </button>
            </div>
        </div>
    );
};

export default Settings;
