// 모듈 호출 + 라우터 변수 생성
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const RedisStore = require('connect-redis').default;  // ES6 스타일로 불러오기
const Redis = require('ioredis');
var authCheck = require('./api/auth/authCheck.js');
var authRouter = require('./api/auth/auth.js');
var writeRouter = require('./api/write_page.js');
const userRouter = require('./api/get_user_info.js');
const imageRouter = require('./api/upload_image.js');
const getBookListRouter = require('./api/get_books.js');
const deleteBookRouter = require('./api/delete_book.js');
const logoutRouter = require('./api/auth/logout.js');
const chatbotRouter = require('./api/chatbotapi.js');
const categoryRouter = require('./api/category.js');
const summaryRouter = require('./api/summary.js');
const printRouter = require('./api/print_book.js');
const updateContentRouter = require('./api/update_book_content.js');
const insertContentRouter = require('./api/insert_book_content.js');
const deleteContentRouter = require('./api/delete_book_content.js');
const updateCategoryRouter = require('./api/update_book_category.js');
const updateOrderRouter = require('./api/update_book_order.js');
const updateTitleRouter = require('./api/update_title.js');

const app = express();

// 요청 본문 해석
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(morgan('dev'));

// Redis 클라이언트 설정
const redisClient = new Redis({
  host: 'localhost',
  port: 6379
});

// 세션 설정
app.use(session({
	store: new RedisStore({ client: redisClient }), // 인스턴스화된 RedisStore 사용
	secret: 'your-secret-key',
	resave: false,
	saveUninitialized: true,
	cookie: {
	  maxAge: 30 * 60 * 1000, // 30분
	  httpOnly: true,
	  secure: false
	}
  }));

// // 전역 미들웨어로 세션 확인
// app.use((req, res, next) => {
//   // 로그인, 회원가입 페이지는 세션 확인 없이 접근 가능
//   if (req.path === '/' || req.path === '/signup') {
//     return;
//   }

//   // 세션이 유효한 경우
//   if (req.session.is_logined) {
//     req.session.touch(); // 세션 TTL 갱신
//     return next();
//   } else {
//     return res.redirect('/'); // 세션 만료 시 로그인 페이지로 이동
//   }
// });

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
})

//모든 api 분기 라우터
app.use('/api', userRouter);
app.use('/api', writeRouter);
app.use('/api', getBookListRouter);
app.use('/api', imageRouter);
app.use('/api', deleteBookRouter);
app.use('/api', logoutRouter);
app.use('/api', chatbotRouter);
app.use('/api', summaryRouter);
app.use('/api', categoryRouter);
app.use('/api', printRouter);
app.use('/api', updateContentRouter);
app.use('/api', deleteContentRouter);
app.use('/api', updateCategoryRouter);
app.use('/api', updateOrderRouter);
app.use('/api', updateTitleRouter);
app.use('/api', insertContentRouter);

app.use((req, res, next) => {
    res.status(404).send('Not found');
})

// 포트 연결
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
