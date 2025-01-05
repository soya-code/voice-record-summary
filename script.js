const startButton = document.getElementById('start-recording');
const stopButton = document.getElementById('stop-recording');
const transcriptionField = document.getElementById('transcription');
const summaryField = document.getElementById('summary');

let recognition;

// 録音と文字起こしのセットアップ
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP'; // 日本語対応

    let fullTranscription = '';

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        fullTranscription = transcript;
        transcriptionField.value = fullTranscription;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    startButton.addEventListener('click', () => {
        recognition.start();
        startButton.disabled = true;
        stopButton.disabled = false;
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
        startButton.disabled = false;
        stopButton.disabled = true;

        // 文字起こしが完了したら要約を自動実行
        summarizeText(fullTranscription);
    });
} else {
    alert('Web Speech APIがこのブラウザでサポートされていません。');
}

// 要約処理
async function summarizeText(textToSummarize) {
    if (!textToSummarize) {
        alert('要約するテキストがありません。');
        return;
    }

    // OpenAI APIで要約
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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
`, // OpenAI APIキーを入力
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "以下の文章を簡潔に要約してください。" },
                { role: "user", content: textToSummarize }
            ]
        })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
        summaryField.value = data.choices[0].message.content.trim();
    } else {
        summaryField.value = '要約に失敗しました。もう一度お試しください。';
    }
}