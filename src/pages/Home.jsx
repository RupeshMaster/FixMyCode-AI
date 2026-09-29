import { useState, useRef, useEffect } from 'react';
import EditorPkg from 'react-simple-code-editor';
const Editor = EditorPkg.default || EditorPkg;
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/themes/prism-twilight.css';
import { Play, Sparkles, Loader2, ArrowRightLeft, Code2, Key, CheckCircle, ChevronDown } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const apiKeyStorageKey = `gemini_api_key_${user?.email || 'guest'}`;

  const [language, setLanguage] = useState('javascript');
  const [inputCode, setInputCode] = useState('function example() {\n  console.log("Hello World")\n}');
  const [outputCode, setOutputCode] = useState('');
  const [mode, setMode] = useState('AI'); // 'AI' or 'Built-in'
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(apiKeyStorageKey) || '');
  const location = useLocation();
  
  useEffect(() => {
    if (apiKey) localStorage.setItem(apiKeyStorageKey, apiKey);
  }, [apiKey, apiKeyStorageKey]);
  
  // Re-sync if they log in/out on the same browser window
  useEffect(() => {
    setApiKey(localStorage.getItem(apiKeyStorageKey) || '');
  }, [apiKeyStorageKey]);
  
  // Unit 2.2: useRef for accessing DOM directly
  const editorRef = useRef(null);
  
  // Unit 3.1: Consuming Context
  const { addFix } = useHistory();

  // Handle incoming code from History Tab
  useEffect(() => {
    if (location.state?.loadCode) {
      setInputCode(location.state.loadCode);
      if (location.state.loadOutput) {
        setOutputCode(location.state.loadOutput);
      }
      // Clear state so it doesn't re-trigger unnecessarily
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Unit 2.2: useEffect for side effects (auto-focusing editor on mount)
  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        // Find the actual textarea inside the simple-code-editor
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 100);
    }
  }, []);

  const handleFixCode = async () => {
    if (!inputCode.trim()) return;
    setIsLoading(true);

    try {
      let fixedResult = '';

      if (mode === 'Built-in') {
        let processedCode = inputCode;
        
        // Rule 1: Common Cross-Language Typos
        const typos = {
          'prin\\(': 'print(',
          'conse\\.log': 'console.log',
          'conso\\.log': 'console.log', // Added your exact typo!
          'docment': 'document',
          'getElemet': 'getElement',
          'lenght': 'length',
          'system\\.out': 'System.out',
          'funtion': 'function',
          'funcon': 'function', // Added your exact typo!
          'ture': 'true',
          'flase': 'false',
          'whiel': 'while',
          'retrun': 'return'
        };
        for (const [bad, good] of Object.entries(typos)) {
          processedCode = processedCode.replace(new RegExp('\\b' + bad + '\\b', 'g'), good);
        }
        processedCode = processedCode.replace(/prin\(/g, 'print(');

        // Rule 2 & 3: Syntax Balancing and Semicolons
        const lines = processedCode.split('\n');
        const newLines = lines.map(line => {
           let currentLine = line;
           if (!currentLine.trim()) return currentLine;

           const singleQuotes = (currentLine.match(/'/g) || []).length;
           const doubleQuotes = (currentLine.match(/"/g) || []).length;
           if (singleQuotes % 2 !== 0) currentLine += "'";
           if (doubleQuotes % 2 !== 0) currentLine += '"';

           const openParen = (currentLine.match(/\(/g) || []).length;
           const closeParen = (currentLine.match(/\)/g) || []).length;
           if (openParen > closeParen) {
             currentLine += ')'.repeat(openParen - closeParen);
           }

           const trimmed = currentLine.trim();

           if (language === 'python') {
              if (/^\s*(def|if|for|while|class|else|elif|try|except).*[^:]$/.test(currentLine)) {
                return currentLine + ':';
              }
           }

           if (['javascript', 'php', 'java', 'cpp'].includes(language)) {
              if (
                !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && 
                !trimmed.endsWith(',') && !trimmed.endsWith(':') &&
                !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('/*') &&
                !/^(if|for|while|foreach|class|function|else)/.test(trimmed)
              ) {
                if (/[a-zA-Z0-9_)'"]$/.test(trimmed)) {
                  return currentLine + ';';
                }
              }
           }
           return currentLine;
        });
        
        let finalFixed = newLines.join('\n');
        
        const hasHtml = finalFixed.includes('<html') || finalFixed.includes('<div') || finalFixed.includes('<body');
        if (hasHtml && ['php', 'javascript', 'java', 'python'].includes(language)) {
          if (language === 'php' && !finalFixed.includes('<?php')) {
            finalFixed = "<?php\n" + finalFixed + "\n?>";
            finalFixed = '// ⚠️ Warning: HTML code detected in PHP. Wrapped in <?php ?> tags.\n' + finalFixed;
          } else if (language !== 'php') {
            finalFixed = '// ⚠️ Warning: HTML tags detected in ' + language.toUpperCase() + '. Removed HTML tags.\n' + finalFixed.replace(/<[^>]*>?/gm, '');
          }
        }
        
        fixedResult = finalFixed;
        await new Promise(r => setTimeout(r, 600));

      } else {
        if (!apiKey) {
          fixedResult = `// ⚠️ API KEY REQUIRED ⚠️\n// Please enter your Gemini API Key in the top right input field.\n// Get a free key here: https://aistudio.google.com/app/apikey`;
          await new Promise(r => setTimeout(r, 600));
        } else {
          const genAI = new GoogleGenerativeAI(apiKey);
          const modelAI = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
          const prompt = `You are an expert code fixer. Fix the following ${language} code. Fix all syntax, logic, and functional errors. Output ONLY the fixed code. Do not wrap in markdown (like \`\`\`javascript). Just the raw code text.\n\nCode to fix:\n${inputCode}`;
          
          const result = await modelAI.generateContent(prompt);
          let text = result.response.text();
          text = text.replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '').trim();
          fixedResult = text;
        }
      }

      setOutputCode(fixedResult);
      addFix({ original: inputCode, fixed: fixedResult, mode, date: new Date().toLocaleString() });

    } catch (error) {
      console.error(error);
      setOutputCode(`// ❌ Error: ${error.message}\n// Please check your API key or network connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-gradient-to-b from-gray-900 to-gray-950">
      
      {/* Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800/80 backdrop-blur border border-gray-700/50 p-4 rounded-2xl shadow-xl gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          
          {/* Language Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-gray-400 font-medium whitespace-nowrap">Language:</label>
            <div className="relative w-full">
              <select 
                className="appearance-none bg-gray-900 border border-gray-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 outline-none transition w-full shadow-inner cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-700"></div>

          {/* Mode Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-gray-400 font-medium whitespace-nowrap">Mode:</label>
            <div className="relative w-full">
              <select 
                className="appearance-none bg-gray-900 border border-gray-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 outline-none transition w-full shadow-inner cursor-pointer"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="AI">✨ AI Model</option>
                <option value="Built-in">⚙️ Built-in Logic</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          {mode === 'AI' && (
            <div className="relative w-full sm:w-64">
              {apiKey ? (
                <button
                  onClick={() => setApiKey('')}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl block w-full p-3 font-medium hover:bg-green-500/20 transition-colors flex justify-center"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> API Key Saved (Reset)
                  </span>
                </button>
              ) : (
                <>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="password"
                    placeholder="Enter Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 block w-full pl-10 p-3 outline-none shadow-inner"
                  />
                </>
              )}
            </div>
          )}
          <button 
            onClick={handleFixCode}
          disabled={isLoading || !inputCode.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'AI' ? <Sparkles className="w-5 h-5" /> : <Play className="w-5 h-5" />)}
          {isLoading ? 'Analyzing...' : 'Fix My Code'}
        </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Side: Input (Unit 1.3: Passing Props to Editor Component) */}
        <div className="flex-1 flex flex-col border border-gray-700/60 rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl relative group">
          <div className="bg-gray-800/80 backdrop-blur px-5 py-3 border-b border-gray-700/60 text-sm font-semibold text-gray-300 flex justify-between items-center z-10">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Your Code
            </span>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <Editor
              ref={editorRef}
              value={inputCode}
              onValueChange={code => setInputCode(code)}
              highlight={code => Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language)}
              padding={20}
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontSize: 15,
                outline: 'none',
                minHeight: '100%',
                lineHeight: '1.5'
              }}
              className="text-gray-100 min-h-full"
            />
          </div>
        </div>

        {/* Decorative arrow in the middle for large screens */}
        <div className="hidden lg:flex items-center justify-center -mx-3 z-10">
          <div className="bg-gray-800 border border-gray-700 p-2 rounded-full shadow-xl">
            <ArrowRightLeft className="w-6 h-6 text-gray-500" />
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="flex-1 flex flex-col border border-gray-700/60 rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl relative">
          <div className="bg-gray-800/80 backdrop-blur px-5 py-3 border-b border-gray-700/60 text-sm font-semibold text-gray-300 flex justify-between items-center z-10">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              Fixed Output
            </span>
            {isLoading && <span className="text-indigo-400 text-xs flex items-center gap-1.5 animate-pulse bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"><Sparkles className="w-3.5 h-3.5"/> Processing...</span>}
          </div>
          <div className="flex-1 overflow-auto p-5 custom-scrollbar">
            {/* Unit 1.2: Conditional Rendering */}
            {outputCode ? (
              <pre className="font-mono text-[15px] leading-relaxed text-green-400 whitespace-pre-wrap font-medium">
                {outputCode}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                <Code2 className="w-16 h-16 mb-4" />
                <p className="text-lg">Click "Fix My Code" to see the magic.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
