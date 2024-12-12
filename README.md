# :memo: YOU-BOOK 유북 :books:
### 내가 만드는 나만의 자서전 :pencil2:
<br>


## :seedling: 07 계단팀 팀원 소개
|**🌟양다나🌟**|**:four_leaf_clover:안민지:four_leaf_clover:**|**:rabbit:장유현:rabbit:**|
|:--------:|:--------:|:--------:|
|<img src="https://github.com/jangyouhyun/Stairs/assets/163497403/3f08aaca-abd1-4f1b-9875-ca1b3784df2b" width="280" height="260">|<img src="https://github.com/jangyouhyun/Stairs/assets/163497403/316761f9-8d3d-4052-8f40-f1423b12b20f" width="280" height="260">|<img src="https://github.com/jangyouhyun/Stairs/assets/163497403/69001661-56bc-4789-bbb3-4014a550b0b5" width="280" height="260">|
|  팀장/AI  |  백엔드  | 프론트엔드 |
<br>

## 📚 프로젝트 소개
**YOU-BOOK**은 자서전을 쉽고 빠르게 제작할 수 있는 **AI 웹서비스**입니다.  
복잡한 과정과 높은 비용은 잊고, 직접 작성하거나 AI 챗봇과 함께 인터뷰를 통해 나만의 이야기를 만들어 보세요.  
<br>

## 🔍 어떤 기능이 있나요?  
1. **직접 작성 & AI 인터뷰**  
   - 원하는 내용을 직접 입력하거나, AI 챗봇의 맞춤형 질문에 답하면 데이터가 자동으로 수집됩니다.  
2. **맞춤형 자서전 생성**  
   - 파인튜닝된 GPT-4o-mini 모델이 데이터를 분석해 깔끔한 자서전을 생성합니다.  
3. **디자인 & 편집**  
   - 사진 삽입, 글꼴, 색상, 레이아웃 등 세부적인 편집도 지원합니다.  
<br>

## 🤖 어떻게 구현되었나요?  
- **AI 기술**: GPT-4o-mini 모델을 활용해 사용자 데이터를 분석하고, 자연스러운 질문과 답변을 생성합니다.
- **웹 기반 편집**: 직관적인 UI로 별도의 프로그램 없이 모든 작업을 처리할 수 있습니다.
<br>

## 🎯 YOU-BOOK의 차별점  
- 저렴한 비용(A4 기준 $1 미만)으로 퀄리티 높은 자서전 제작 가능  
- 전 과정에서 사용자가 주도적으로 참여하며 원하는 스타일을 반영  
- AI의 도움으로 쉽고 빠르게 나만의 이야기를 완성  
<br>

## YOU-BOOK 서버 설치 및 실행 방법 
<br>

## **Windows**

### 1. 깃허브 클론 📂

- 사용자 컴퓨터에 서버 실행 소스코드를 다운로드합니다.

```bash
git clone https://github.com/jangyouhyun/Stairs.git
```

<br>

### 2. **데이터베이스 세팅** 💾

- 사용자 컴퓨터에 **MySQL**을 다운로드하세요.

  [MySQL 다운로드](https://dev.mysql.com/downloads/mysql/8.0.html) ⇒ **8.0.39 Version 사용**

- 설치한 MySQL을 실행하고 MySQL 서버에 접속합니다.

```bash
net start mysql;
mysql -u root;
```

- **루트 계정의 비밀번호를 root로 설정합니다.**

```bash
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
```

- 프로젝트에서 사용하는 데이터베이스 **stair**을 생성하고, 접속합니다.

```bash
CREATE DATABASE stair;
USE stair;
```

- **프로젝트 데이터베이스 테이블 생성**

    ⇒ 생성 스크립트는 깃허브 폴더의 `You-Book Project/init_table.sql` 파일에 있습니다.

    ```bash
    SOURCE "Your_init_table.sql_path";
    ```

    - **위 코드가 동작하지 않을 경우**, init_table.sql 내부 스크립트를 복사하여 CLI에 붙여넣기 해도 됩니다.

<br>

### 3. **Redis 설치** ⚙️

- [Redis 다운로드](https://github.com/microsoftarchive/redis/releases) 링크에서 MSI 확장자 설치 프로그램을 다운로드하세요.

- 다운로드된 파일을 실행하여 기본 세팅으로 설치를 완료합니다.

    ![Redis 설치 이미지](https://github.com/jangyouhyun/Stairs/blob/main/image.png?raw=true)

- **설치 확인**: 작업 관리자의 서비스 탭에서 Redis가 실행 중인지 확인합니다.

<br>

### 4. **환경변수 세팅** 🌍

- **You-Book Project** 폴더로 이동합니다.

```bash
echo OPENAI_API_KEY="YOUR_API_KEY" > .env
```

- **OpenAI API 키를 환경변수로 세팅**하여 코드 내부에서 활용할 수 있도록 합니다.

<br>

### 5. **필요 모듈 및 라이브러리 설치** 📦

- **You-Book Project** 폴더로 이동합니다.

```bash
npm install && cd frontend && npm install && cd .. && cd backend && npm install && cd ..
```

<br>

### 6. **서버 시작** 🚀

- **npm start** 명령어를 실행하여 서버를 시작합니다.

```bash
npm start
```

- **접속 방법**:

  - Public IP: `http://203.255.176.147:3278/`
  - Localhost: `http://localhost:3278/`

<br>

## **Linux 및 macOS**

### 1. 깃허브 클론 📂

- 사용자 컴퓨터에 서버 실행 소스코드를 다운로드합니다.

```bash
git clone https://github.com/jangyouhyun/Stairs.git
```

<br>

### 2. **데이터베이스 세팅** 💾

#### 리눅스

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

#### macOS (Homebrew 사용)

```bash
brew install mysql
brew services start mysql
```

- MySQL 서버에 접속하고 **루트 계정 비밀번호를 root로 설정합니다.**

```bash
mysql -u root
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
```

- 프로젝트에서 사용하는 데이터베이스 **stair**를 생성하고 접속합니다.

```sql
CREATE DATABASE stair;
USE stair;
```

- **테이블 생성**

    ⇒ 생성 스크립트는 `You-Book Project/init_table.sql` 파일에 있습니다.

```bash
mysql -u root -p stair < Your_init_table.sql_path
```

    - **위 코드가 동작하지 않을 경우**, `init_table.sql` 내용을 복사하여 CLI에 붙여넣기 합니다.

<br>

### 3. **Redis 설치** ⚙️

#### 리눅스

```bash
sudo apt update
sudo apt install redis
sudo systemctl start redis
```

#### macOS

```bash
brew install redis
brew services start redis
```

- **설치 확인**

```bash
redis-cli ping
```

<br>

### 4. **환경변수 세팅** 🌍

- **You-Book Project** 폴더로 이동합니다.

```bash
echo 'OPENAI_API_KEY="YOUR_API_KEY"' > .env
```

- **OpenAI API 키를 환경변수로 세팅합니다.**

<br>

### 5. **필요 모듈 및 라이브러리 설치** 📦

- **You-Book Project** 폴더로 이동합니다.

```bash
npm install && cd frontend && npm install && cd .. && cd backend && npm install && cd ..
```

<br>

### 6. **서버 시작** 🚀

- **npm start** 명령어를 실행하여 서버를 시작합니다.

```bash
npm start
```

- **접속 방법**:

  - Public IP: `http://203.255.176.147:3278/`
  - Localhost: `http://localhost:3278/`


 🚀 **YOU-BOOK**에서 새로운 방식의 자서전 제작을 경험해보세요. 🚀
