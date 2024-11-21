const chatMessages = document.querySelector('#chat-messages');
const userInput = document.querySelector('#user-input input');
const sendButton = document.querySelector('#user-input button');
let apiKey;

const apiEndpoint = 'https://api.openai.com/v1/chat/completions';

// API 키를 서버에서 가져오기
fetch('/api-key')
  .then(response => response.json())
  .then(data => {
    apiKey = data.apiKey;
    console.log('API Key:', apiKey); // API 키 로그
    initializeChat();
  })
  .catch(error => console.error('API 키를 가져오는 중 오류 발생:', error));

let userResponses = [];
let currentStep = 0;
let questions = [];

const userScript = `내 이름은 김민수이고, 올해 52살이다. 현재는 중견 건설회사에서 프로젝트 매니저로 일하고 있다. 어린 시절, 서울의 작은 동네에서 자라며 부모님의 사랑을 듬뿍 받았다. 아버지는 작은 가게를 운영하셨고, 어머니는 가정주부로 우리 가족을 보살피셨다. 집안 형편은 넉넉지 않았지만, 부모님의 노력 덕분에 부족함 없이 자랄 수 있었다. 청년 시절, 학업에 열중해 서울대학교 건축학과에 입학했다. 대학 시절에는 공부뿐만 아니라 동아리 활동에도 열심히 참여하며 다양한 친구들을 사귀었다. 그 시절 친구들은 지금까지도 내 인생에서 중요한 부분을 차지하고 있다. 졸업 후에는 곧바로 대기업에 입사해 치열한 경쟁 속에서 살아남아야 했다. 28살 때, 회사에서 만난 아내와 결혼했다. 아내는 나와 같은 건축학과를 졸업한 동기였고, 우리는 함께 많은 꿈을 꾸었다. 결혼 후 두 아이를 낳았고, 아이들이 자라는 모습을 보며 인생의 또 다른 행복을 느꼈다. 하지만 직장 생활의 바쁜 일정 때문에 가족과 함께하는 시간이 부족했던 것이 늘 마음에 걸렸다. 지금은 아이들이 다 커서 각자의 길을 가고 있고, 나는 아내와 함께 조용한 일상을 즐기고 있다. 직장에서는 많은 프로젝트를 성공적으로 이끌었지만, 이제는 후배들에게 자리를 물려주고 한 발 물러나 있는 상태다. 최근에는 건강 관리에 신경을 쓰며, 주말마다 등산을 다니고 있다. 지난 인생을 돌아보면 후회되는 부분도 있지만, 그 덕분에 지금의 내가 있다고 생각한다. 앞으로는 남은 인생을 더 의미 있게 보내기 위해 노력할 것이다. 새로운 도전도 해보고, 아내와 함께 여행도 다니며 행복한 시간을 보낼 계획이다. 인생의 후반부를 맞이하며, 나는 내 자신에게 더 솔직하고 진솔하게 살아가고자 한다.`;

async function generateQuestions(input, t) {
    if (t == 1) {
        const prompt1 = `기본적으로 필요한 정보: 이름, 나이, 성별, 직업, 유년기, 청소년기, 청년기, 중년기, 장년기, 기본적인 인생의 사건들 (ex : 결혼, 진학, 취업 등), 나를 둘러싼 인간관계. 유저 인풋이 다음과 같을 때, 부족한 정보를 물어보기 위해 질문을 작성해줘: ${input}`;
        const aiResponse1 = await fetchAIResponse(prompt1);
        console.log('AI Response:', aiResponse1);
        return aiResponse1.split('\n').filter(q => q.trim().length > 0);
    }
    if (t == 2) {
        const prompt2 = `기본적으로 필요한 정보: 이름, 나이, 성별, 직업, 유년기, 청소년기, 청년기, 중년기, 장년기, 기본적인 인생의 사건들 (ex : 결혼, 진학, 취업 등), 나를 둘러싼 인간관계. 유저 인풋이 다음과 같을 때, 들어온 정보들에 대해서 주제별로 정리해줘 <주제> - <내용요약> 형식: ${input}`;
        const aiResponse2 = await fetchAIResponse(prompt2);
        console.log('<<기본 데이터>>', aiResponse2);
        return aiResponse2.split('\n').filter(q => q.trim().length > 0 && !q.includes('정리된 데이터 --'));
    }
    if (t == 3) {
        const formattedResponses = input.map(item => `${item.question} - ${item.answer}`).join('\n');
        const prompt3 = `기본적으로 필요한 정보: 이름, 나이, 성별, 직업, 유년기, 청소년기, 청년기, 중년기, 장년기, 기본적인 인생의 사건들 (ex : 결혼, 진학, 취업 등), 나를 둘러싼 인간관계. 챗봇과 사용자가 만들어낸 응답이 다음과 같을 때, 들어온 정보들에 대해서 주제별로 정리해줘 <주제> - <내용요약> 형식: ${formattedResponses}`;
        const aiResponse3 = await fetchAIResponse(prompt3);
        console.log('<<응답 데이터>>', aiResponse3);
        return aiResponse3.split('\n').filter(q => q.trim().length > 0 && !q.includes('정리된 데이터 --'));
    }
}

function addMessage(sender, message, senderType = 'bot') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${senderType}`;
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.prepend(messageElement);
}

async function fetchAIResponse(prompt) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 1000,
            top_p: 0.3,
            frequency_penalty: 1.0,
            presence_penalty: 1.0,
            stop: ["Human"]
        }),
    };

    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const data = await response.json();
        console.log('Fetch AI Response:', data); // Fetch 결과 로그
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API 호출 중 오류 발생:', error);
        return 'OpenAI API 호출 중 오류 발생';
    }
}

sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message.length === 0) return;

    addMessage('나', message, 'user');
    userInput.value = '';

    if (currentStep < questions.length) {
        const question = questions[currentStep];
        userResponses.push({ question, answer: message });
        if (currentStep < questions.length - 1) {
            currentStep++;
            addMessage('챗봇', questions[currentStep]);
        } else {
            addMessage('챗봇', '모든 질문이 완료되었습니다.');
            saveUserResponses();
        }
    }
});

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

async function initializeChat() {
    addMessage('챗봇', '안녕하세요! 자서전을 작성하기 위한 데이터를 수집합니다. 먼저 필요한 정보를 입력해 주세요.');
    questions = await generateQuestions(userScript, 1);
    if (questions.length > 0) {
        addMessage('챗봇', questions[0]);
    } else {
        addMessage('챗봇', '필요한 질문을 생성할 수 없습니다. 다시 시도해 주세요.');
    }
}

function saveUserResponses() {
    console.log('정리된 데이터', summarizeResponse());
    alert('응답이 저장되었습니다');
}

async function summarizeResponse() {
    // `generateQuestions` 비동기 함수 호출
    const initdata = await generateQuestions(userScript, 2);
    const responsedata = await generateQuestions(userResponses, 3);
    
    // initdata와 responsedata를 결합하여 반환
    return [...initdata, ...responsedata];
}
