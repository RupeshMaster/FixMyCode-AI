import { Link } from 'react-router-dom';
import { Code2, ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-auto">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="bg-blue-600/10 p-5 rounded-3xl border border-blue-500/20 mb-8 inline-block shadow-2xl">
            <Code2 className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Check and fix your code <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">instantly.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            An intelligent tool to validate your code, find errors, and suggest fixes in seconds. Perfect for beginners and pros alike.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/editor" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] text-lg hover:-translate-y-1">
              Start Coding <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 px-8 py-4 rounded-xl font-bold transition-all shadow-lg text-lg hover:-translate-y-1">
              Login / Signup
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-900 border-t border-gray-800 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/40 p-10 rounded-3xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
            <div className="bg-yellow-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Instant Validation</h3>
            <p className="text-gray-400 leading-relaxed">Our advanced built-in logic catches syntax errors, missing semicolons, and colons in real-time before you even run your code.</p>
          </div>
          <div className="bg-gray-800/40 p-10 rounded-3xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
            <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Code2 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Multiple Languages</h3>
            <p className="text-gray-400 leading-relaxed">Full support for JavaScript, Python, Java, PHP, and C++ with dynamic syntax highlighting and language-specific rules.</p>
          </div>
          <div className="bg-gray-800/40 p-10 rounded-3xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
            <div className="bg-green-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Secure History</h3>
            <p className="text-gray-400 leading-relaxed">Every piece of code you fix is safely stored in your personal history log. Review past fixes and learn from your mistakes instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
