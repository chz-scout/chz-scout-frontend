# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

### What is chz-scout-frontend?
chz-scout-frontend는 **chz-scout 서비스의 웹 프론트엔드**입니다. Discord OAuth 로그인, 태그 관리, 알림 설정 등의 UI를 제공합니다.

### Related Projects
- **chz-scout** (Backend): Spring Boot 기반 백엔드 API 서버
- 백엔드 저장소: `C:\Users\super\IdeaProjects\chz-scout`

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/          # 페이지 컴포넌트 (라우트별)
├── hooks/          # 커스텀 React 훅
├── services/       # API 서비스 (axios 인스턴스, API 호출)
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
├── contexts/       # React Context (전역 상태)
├── assets/         # 정적 파일 (이미지, 폰트 등)
├── App.tsx         # 메인 앱 컴포넌트
├── main.tsx        # 엔트리 포인트
└── index.css       # 글로벌 스타일 (Tailwind)
```

## Build Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## Environment Variables

환경 변수는 `.env` 파일에 정의합니다. `.env.example`을 참고하세요.

```bash
VITE_API_BASE_URL=http://localhost:8080      # 백엔드 API URL
VITE_DISCORD_CLIENT_ID=your_client_id        # Discord OAuth Client ID
VITE_REDIRECT_URI=http://localhost:5173/auth/callback  # OAuth 콜백 URL
```

**중요**: `VITE_` 접두사가 있어야 클라이언트에서 접근 가능합니다.

## Code Generation Guide

### 컴포넌트 생성 시
```tsx
interface ComponentNameProps {
  // props 정의
}

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### 페이지 생성 시
```tsx
import { useAuth } from '../contexts/AuthContext';

export default function PageName() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 페이지 내용 */}
    </div>
  );
}
```

### API 호출 시
```tsx
import api from '../services/api';

// GET 요청
const response = await api.get('/api/v1/endpoint');
const data = response.data.data;

// POST 요청
const response = await api.post('/api/v1/endpoint', { key: value });
```

## Styling Guidelines

### Tailwind CSS 사용
- 인라인 클래스 사용 권장
- 반복되는 스타일은 컴포넌트로 추출
- 다크 테마 기본 (bg-gray-900, text-white)

### 색상 팔레트
- Primary: `indigo-600`, `indigo-700` (버튼, 강조)
- Background: `gray-900`, `gray-800`
- Text: `white`, `gray-400`
- Success: `green-600`
- Error: `red-600`

## API Response Format

백엔드 API 응답 형식:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}
```

## Authentication Flow

1. 사용자가 "Login with Discord" 클릭
2. Discord OAuth 페이지로 리다이렉트
3. 사용자 승인 후 `/auth/callback`으로 리다이렉트
4. 백엔드에 code 전달 → JWT 토큰 수신
5. localStorage에 토큰 저장
6. API 요청 시 자동으로 Authorization 헤더 첨부

## Prohibited Patterns

1. **any 타입 사용 금지** - 명시적 타입 정의 필수
2. **인라인 스타일 사용 금지** - Tailwind 클래스 사용
3. **console.log 남기기 금지** - 개발 완료 후 제거
4. **하드코딩된 URL 금지** - 환경 변수 사용
5. **useEffect 의존성 배열 누락 금지**

## Git Branching Strategy

GitHub Flow를 따릅니다. (백엔드와 동일)

```bash
feature/<기능명>     # 새로운 기능 개발
fix/<버그명>         # 버그 수정
```

## Commit Convention

```
<type>(<scope>): <subject>

예시:
feat(tags): 태그 삭제 기능 추가
fix(auth): 토큰 갱신 오류 수정
style(home): 홈페이지 레이아웃 개선
```