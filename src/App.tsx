import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import TagsPage from './pages/TagsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/api/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/tags" element={<TagsPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;