import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/History';
import Landing from './pages/Landing';
import Login from './pages/Login';
import { Code2, History as HistoryIcon, Home as HomeIcon, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Hide header on Login page for a cleaner look
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      {!isAuthPage && (
        <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
              <Code2 className="text-blue-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              FixMyCode AI
            </h1>
          </Link>
          <nav className="flex gap-2">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${location.pathname === '/' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <HomeIcon className="w-4 h-4" /> Home
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/editor" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${location.pathname === '/editor' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <Code2 className="w-4 h-4" /> Editor
                </Link>
                <Link 
                  to="/history" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${location.pathname === '/history' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <HistoryIcon className="w-4 h-4" /> History
                </Link>
              </>
            )}

            {!user ? (
              <Link 
                to="/login" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ml-4 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20`}
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </nav>
        </header>
      )}

      <main className="flex-1 flex flex-col min-h-0">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/editor" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
