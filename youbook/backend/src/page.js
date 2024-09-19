// 모듈 호출 + 라우터 변수 생성
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
var authCheck = require('./api/auth/authCheck.js');
var authRouter = require('./api/auth/auth.js');
var writeRouter = require('./api/write_page.js');
const userRouter = require('./api/get_user_info.js');
const imageRouter = require('./api/upload_image.js');
const getBookListRouter = require('./api/get_books.js');
const deleteBookRouter = require('./api/delete_book.js');
const logoutRouter = require('./api/auth/logout.js');

const app = express();

// 요청 본문 해석
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(morgan('dev'));

// 세션설정
const redisClient = new Redis({
    host: 'localhost',  // Redis 서버 호스트
    port: 6379         // Redis 서버 포트
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// 기본루트 get 
app.get('/', (req, res) => {
	if (!authCheck.isOwner(req, res)) { 
  		res.redirect('/auth/login');
  		return;
	} else { 
  		res.redirect('/main');
  		return;
	}
})

// auth 라우터로 분기
app.use('/auth', authRouter);

// 메인 화면 호출
app.get('/main', (req, res) => {
	if (!authCheck.isOwner(req, res)) {  
	  res.redirect('/auth/login');  
	  return;
	}
	var html = template.HTML('Welcome',
	  `<p>로그인에 성공하셨습니다.</p>
	   <p><a href="/write" class="btn">글 작성하기</a></p>
	  `,
	  authCheck.statusUI(req, res)
	);
	res.send(html);
})

//모든 api 분기 라우터
app.use('/api', userRouter);
app.use('/api', writeRouter);
app.use('/api', getBookListRouter);
app.use('/api', imageRouter);
app.use('/api', deleteBookRouter);
app.use('/api', logoutRouter);



app.use((req, res, next) => {
    res.status(404).send('Not found');
})

// 포트 연결
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
