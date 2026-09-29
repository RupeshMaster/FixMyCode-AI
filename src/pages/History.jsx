import { useHistory } from '../context/HistoryContext';
import { Clock, Trash2, Code, CheckCircle, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { fixes, clearHistory } = useHistory();
  const navigate = useNavigate();

  const handleEdit = (fix) => {
    navigate('/editor', { state: { loadCode: fix.original, loadOutput: fix.fixed } });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
          <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
            <Clock className="w-7 h-7 text-indigo-400" /> 
          </div>
          Fix History
        </h2>
        {/* Unit 1.2: Conditional Rendering (&&) */}
        {fixes.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl font-medium border border-red-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-5 h-5" /> Clear All
          </button>
        )}
      </div>

      {fixes.length === 0 ? (
        <div className="text-center py-32 text-gray-500 border-2 border-gray-700 border-dashed rounded-3xl bg-gray-800/20">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">No history yet. Go fix some code!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unit 1.2: Lists and Keys */}
          {fixes.map((fix) => (
            <div key={fix.id} className="bg-gray-800/80 border border-gray-700/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm transition-transform hover:-translate-y-1">
              
              <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">{fix.date}</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {fix.mode} Mode
                  </span>
                </div>
                <button 
                  onClick={() => handleEdit(fix)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-1.5 rounded-lg border border-blue-500/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Load into Editor
                </button>
              </div>
              
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-700/80">
                <div className="flex-1 p-6 bg-[#0d1117]/80">
                  <div className="text-sm text-red-400 mb-3 flex items-center gap-2 font-bold uppercase tracking-wider">
                    <Code className="w-4 h-4" /> Original Code
                  </div>
                  <pre className="text-[14px] text-gray-300 bg-black/40 p-5 rounded-xl overflow-x-auto border border-gray-800 custom-scrollbar">
                    {fix.original}
                  </pre>
                </div>
                
                <div className="flex-1 p-6 bg-[#0d1117]/80">
                  <div className="text-sm text-green-400 mb-3 flex items-center gap-2 font-bold uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" /> Fixed Output
                  </div>
                  <pre className="text-[14px] text-green-400 bg-black/40 p-5 rounded-xl overflow-x-auto border border-gray-800 custom-scrollbar font-medium">
                    {fix.fixed}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
