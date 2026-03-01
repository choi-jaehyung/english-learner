import React, { useState } from 'react';
import { Search as SearchIcon, Copy, BrainCircuit, AlertCircle, Save } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const WordSearch = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!query) return;

        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            setError('Settings 탭에서 Gemini API Key를 먼저 설정해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `당신은 영어 교육자이고, 유저는 advanced level의 영어 학습자입니다. 영어 학습자가 채팅으로 영어 단어나 표현을 입력하면, 발음기호, 뜻, 예문을 제시합니다. 만약 학습자가 완전한 문장을 제시하면, 해당 문장을 해석하고 어려운 문법 구조를 설명해줍니다. 그리고 이 문장에서 고급 학습자가 어려워할 만한 단어나 표현이 있다면 아래에 지정한 형식으로 정리합니다. 영어 단어 표현이나 예문을 제외한 설명은 모두 한국어로 보여줍니다. 위에 지시한 단어 및 표현을 구글 시트에 정리하기 위한 데이터를 테이블 형식으로, 아래 컬럼에 맞추어 제공합니다. 단, 정리한 내용을 복사 버튼을 눌러서 카피할 때 헤더 정보는 제외하고 내용만 카피되도록 합니다. 사용자가 드래그해서 복사하는 게 아니라 내보내기 버튼을 클릭해서 복사할 수 있도록 합니다. 구글 시트에 붙여넣을 때 탭 구분 정보가 반영되도록 합니다. 날짜는 YYYY-MM-DD 형식으로 제공하고 가운데 정렬이 되도록 합니다. 단어 또는 표현은 볼드체, 소문자로 제공합니다.
      
      날짜(문의한 날짜) | 단어 또는 표현 | 뜻 | 예문

      사용자 입력: ${query}`;

            const res = await model.generateContent(prompt);
            const text = res.response.text();

            const datePattern = /\d{4}-\d{2}-\d{2}/;
            const lines = text.split('\n');
            const tableRows = lines.filter(line => datePattern.test(line) && line.includes('|'));

            const parsedData = tableRows.map(line => {
                const parts = line.split('|').map(p => p.trim());
                return {
                    date: parts[0],
                    word: parts[1].replace(/\*\*/g, ''),
                    meaning: parts[2],
                    example: parts[3]
                };
            });

            setResult({
                explanation: text,
                data: parsedData
            });
        } catch (err) {
            setError('Gemini API 호출 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!result || result.data.length === 0) return;
        const row = result.data[0];
        const tabSeparated = `${row.date}\t${row.word}\t${row.meaning}\t${row.example}`;
        navigator.clipboard.writeText(tabSeparated);
        alert('클립보드에 복사되었습니다. 구글 시트에 붙여넣으세요.');
    };

    const handleAutoSave = async () => {
        if (!result || result.data.length === 0) return;

        const gasUrl = localStorage.getItem('gas_deployment_url');
        if (!gasUrl) {
            alert('Settings에서 GAS 배포 URL을 먼저 설정해주세요.');
            return;
        }

        setSaving(true);
        try {
            const row = result.data[0];
            const response = await fetch(gasUrl, {
                method: 'POST',
                mode: 'no-cors', // GAS web app returns a redirect which 'no-cors' handles silently (but can't read response)
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(row),
            });
            // 'no-cors' mode won't let us read response, so we assume success if no exception
            alert('구글 시트에 성공적으로 저장되었습니다!');
        } catch (err) {
            alert('저장 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="feature-card search-container">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="단어, 표현 또는 문장을 입력하세요..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? <BrainCircuit className="spin" /> : <SearchIcon />}
                </button>
            </div>

            {error && (
                <div className="error-message animate-fade-in">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="result-area animate-fade-in">
                    <div className="explanation-box card-inner">
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result.explanation}</pre>
                    </div>

                    {result.data.length > 0 && (
                        <div className="table-container animate-fade-in">
                            <table>
                                <thead>
                                    <tr>
                                        <th>날짜</th>
                                        <th>단어 또는 표현</th>
                                        <th>뜻</th>
                                        <th>예문</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.data.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="center">{item.date}</td>
                                            <td><strong>{item.word}</strong></td>
                                            <td>{item.meaning}</td>
                                            <td>{item.example}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="actions">
                                <button className="secondary-btn" onClick={handleExport}>
                                    <Copy size={16} />
                                    <span>복사</span>
                                </button>
                                <button className="primary-btn" onClick={handleAutoSave} disabled={saving}>
                                    {saving ? <BrainCircuit className="spin" /> : <Save size={16} />}
                                    <span>자동 저장</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WordSearch;
