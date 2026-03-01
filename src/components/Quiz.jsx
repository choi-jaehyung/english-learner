import React, { useState, useEffect } from 'react';
import { HelpCircle, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Quiz = () => {
    const [loading, setLoading] = useState(false);
    const [words, setWords] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');

    const fetchSheetData = async () => {
        const sheetUrl = localStorage.getItem('google_sheet_url');
        if (!sheetUrl) {
            setError('Settings에서 구글 시트 URL을 먼저 설정해주세요.');
            return;
        }

        const sheetIdMatch = sheetUrl.match(/\/d\/([\w-]+)/);
        if (!sheetIdMatch) {
            setError('올바른 구글 시트 URL이 아닙니다.');
            return;
        }

        const sheetId = sheetIdMatch[1];
        setLoading(true);
        setError('');

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                setError('Settings에서 Gemini API Key를 먼저 설정해주세요.');
                setLoading(false);
                return;
            }

            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!B2:B100?key=${apiKey}`);
            const data = await response.json();

            if (data.values) {
                const wordList = data.values.flat().filter(word => word && word.trim() !== '');
                if (wordList.length === 0) {
                    setError('시트에서 단어를 찾을 수 없습니다. (Sheet1 B열 확인)');
                    setLoading(false);
                    return;
                }
                setWords(wordList);
                generateQuiz(wordList);
            } else {
                setError('시트에서 데이터를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('시트 데이터를 가져오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generateQuiz = async (wordList) => {
        setLoading(true);
        setError('');
        setFeedback(null);

        const apiKey = localStorage.getItem('gemini_api_key');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `너는 전문적인 영어 교사야. 다음 단어 리스트 중에서 무작위로 하나를 선택해서 퀴즈를 내줘: [${wordList.join(', ')}]. 
    퀴즈의 유형은 다음 두 가지 중 하나를 무작위로 선택해:
    [유형 1] 단어를 제시하고 5개의 뜻 보기 중 정답 맞추기 (객관식)
    [유형 2] 뜻을 제시하고 5개의 단어 보기 중 정답 맞추기 (객관식)
    
    사용자의 대답이 정답인지 오답인지를 알려주고, 오답인 경우 정답을 알려줘. 그리고 정답이든 오답인든 해당 단어 또는 표현을 사용한 예문을 하나 알려줘.

    답변은 반드시 아래 JSON 형식으로만 줘:
    {
      "type": 1 or 2,
      "question": "질문 내용",
      "options": ["보기1", "보기2", "보기3", "보기4", "보기5"],
      "answerIndex": 0-4,
      "word": "정답 단어",
      "explanation": "예문 및 설명"
    }`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                setCurrentQuiz(JSON.parse(jsonMatch[0]));
            }
        } catch (err) {
            setError('퀴즈 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (index) => {
        if (index === currentQuiz.answerIndex) {
            setFeedback({ correct: true, text: '정답입니다! ' + currentQuiz.explanation });
        } else {
            setFeedback({ correct: false, text: `오답입니다. 정답은 ${currentQuiz.options[currentQuiz.answerIndex]}입니다. ` + currentQuiz.explanation });
        }
    };

    return (
        <div className="feature-card quiz-container">
            <div className="quiz-header">
                <HelpCircle size={32} className="feature-icon" color="#4cc9f0" />
                <h2>영어 퀴즈</h2>
                <p>구글 시트(B열)에 저장된 단어로 무작위 퀴즈를 생성합니다.</p>
            </div>

            {error && <div className="error-message animate-fade-in">{error}</div>}

            {!currentQuiz && !loading && (
                <div className="quiz-start">
                    <button className="save-btn" onClick={fetchSheetData}>
                        퀴즈 데이터 불러오기 및 시작
                    </button>
                </div>
            )}

            {loading && (
                <div className="loading-area" style={{ textAlign: 'center', padding: '2rem' }}>
                    <BrainCircuit className="spin" size={40} color="#4cc9f0" />
                    <p>AI가 퀴즈를 생성 중입니다...</p>
                </div>
            )}

            {currentQuiz && !loading && (
                <div className="quiz-content animate-fade-in">
                    <h3 className="question-text">{currentQuiz.question}</h3>
                    <div className="options-grid">
                        {currentQuiz.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className="option-btn"
                                onClick={() => handleAnswer(idx)}
                                disabled={!!feedback}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {feedback && (
                        <div className={`feedback-area animate-fade-in ${feedback.correct ? 'correct' : 'incorrect'}`}>
                            <div className="feedback-status">
                                {feedback.correct ? <CheckCircle size={20} color="#00ff88" /> : <XCircle size={20} color="#ff4d4d" />}
                                <span>{feedback.correct ? 'CORRECT' : 'INCORRECT'}</span>
                            </div>
                            <p>{feedback.text}</p>
                            <button className="next-btn" onClick={() => generateQuiz(words)}>
                                다음 문제
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Quiz;
