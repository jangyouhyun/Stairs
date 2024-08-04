# YouBook 유북
<br>

## 작동방식

### 1.npm install
> /youbook 에서 npm install<br>
> /youbook/frontend 에서 npm install<br>
> /youbook/backend 에서 npm install<br>
> redis 설치 -> 세션 저장소 - (mac) brew install redis / (window) https://github.com/microsoftarchive/redis/releases -> msi 파일 설치<br>
> redis-server 실행 - 터미널(관리자권한) 실행 후 redis-server 입력<br>

> database 세팅 - mysql -u root -p // pw를 root 로 해야 정상동작한다<br>
>  -> use stair; ( create database stair; ) -> create tables( 아래 url 참고) 후 진행하면 된다.<br>
> ( 본 프로젝트에서는 루트계정 사용 : user:root /password:root )<br>
> https://jazzy-galleon-b0d.notion.site/51948f4e20da4078a1783aebcb92ddca?pvs=4<br>
> 위 페이지에서 데이터베이스 세팅값을 참고할 수 있다. <br>

### 2. npm start
>루트디렉토리 ( /youbook ) 에서 npm start<br>
>http://localhost:3000/ 에 접속하여 확인
