import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Brain, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Pill,
  TestTube,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Database,
  Zap
} from 'lucide-react';

const HealthIntelligenceSingleSlide = () => {
  const [currentQuery, setCurrentQuery] = useState(0);
  const [buildStep, setBuildStep] = useState(0);

  const queries = [
    {
      question: "What's my cholesterol trend over time?",
      insight: "HDL consistently below target of 40 mg/dL",
      chart: "📈",
      color: "from-red-500 to-orange-500"
    },
    {
      question: "How has my HbA1c changed since starting metformin?",
      insight: "27-pound weight gain reversed medication benefits",
      chart: "💊",
      color: "from-blue-500 to-cyan-500"
    },
    {
      question: "Show my abnormal lab results from this year",
      insight: "5 critical values requiring immediate attention",
      chart: "🚨",
      color: "from-purple-500 to-pink-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuery((prev) => (prev + 1) % queries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') {
        setBuildStep(prev => Math.min(prev + 1, 5));
      } else if (event.key === 'ArrowLeft') {
        setBuildStep(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getAnimationClass = (stepNumber) => {
    return buildStep >= stepNumber 
      ? 'opacity-100 translate-y-0 scale-100' 
      : 'opacity-0 translate-y-8 scale-95';
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 flex flex-col">
      {/* Header - Step 1 */}
      <div className={`text-center mb-10 transition-all duration-1000 ${getAnimationClass(1)}`}>
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-8xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              HealthMind Intelligence
            </span>
          </h1>
        </div>
        <p className="text-3xl text-gray-300 max-w-4xl mx-auto">
          Use Case: Transform 12+ years of medical records into conversational health insights with 
          <span className="text-blue-400 font-semibold"> 100%&nbsp;accuracy</span>
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-8">
        
        {/* Left: Before/Problem - Step 2 */}
        <div className={`col-span-3 bg-red-500/10 rounded-2xl p-8 border border-red-500/20 transition-all duration-1000 delay-300 ${getAnimationClass(2)}`}>
          <div className="text-center mb-6">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">Before</h3>
            <p className="text-red-300 text-xl">Complex Health Records</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6 border border-red-500/30">
              <div className="text-3xl text-red-200">📄 Scattered across 3+ providers</div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-red-500/30">
              <div className="text-3xl text-red-200">📊 5+ health metrics buried in PDFs</div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-red-500/30">
              <div className="text-3xl text-red-200">🔍 No way to find patterns or trends</div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-red-500/30">
              <div className="text-3xl text-red-200">❓ Questions take hours to answer</div>
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="col-span-6 flex flex-col justify-between">
          
          {/* Architecture Flow - Step 3 */}
          <div className={`bg-white/5 rounded-2xl p-8 border border-white/10 mb-6 transition-all duration-1000 delay-600 ${getAnimationClass(3)}`}>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <FileText className="w-10 h-10 text-gray-700" />
                </div>
                <div className="text-xl text-white font-semibold">Apple Health</div>
                <div className="text-lg text-gray-400">12 Years of Data</div>
              </div>
              
              <ArrowRight className="w-8 h-8 text-blue-400" />
              
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Brain className="w-10 h-10 text-blue-700" />
                </div>
                <div className="text-xl text-white font-semibold">Claude Opus 4</div>
                <div className="text-lg text-gray-400">AI Extraction</div>
              </div>
              
              <ArrowRight className="w-8 h-8 text-blue-400" />
              
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Database className="w-10 h-10 text-purple-700" />
                </div>
                <div className="text-xl text-white font-semibold">Snowflake</div>
                <div className="text-lg text-gray-400">Analytics DB</div>
              </div>
              
              <ArrowRight className="w-8 h-8 text-blue-400" />
              
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <MessageSquare className="w-10 h-10 text-green-700" />
                </div>
                <div className="text-xl text-white font-semibold">Natural Language</div>
                <div className="text-lg text-gray-400">Ask Anything</div>
              </div>
            </div>
          </div>

          {/* Live Query Demo - Step 5 */}
          <div className={`bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30 flex-1 transition-all duration-1000 delay-1200 ${getAnimationClass(5)}`}>
            <div className="flex items-center gap-4 mb-6">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <h4 className="text-3xl font-bold text-white">Ask Your Health Questions</h4>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-xl font-medium">You Ask:</span>
              </div>
              <p className="text-white font-medium text-2xl">
                "{queries[currentQuery].question}"
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-xl font-medium">AI Insight:</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{queries[currentQuery].chart}</div>
                <p className="text-green-100 font-medium text-xl">
                  {queries[currentQuery].insight}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: After/Solution - Step 4 */}
        <div className={`col-span-3 bg-green-500/10 rounded-2xl p-8 border border-green-500/20 transition-all duration-1000 delay-900 ${getAnimationClass(4)}`}>
          <div className="text-center mb-6">
            <Zap className="w-16 h-16 text-green-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">After</h3>
            <p className="text-green-300 text-xl">Intelligent Health Companion</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div className="text-3xl text-green-200">Ask questions in plain English</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div className="text-3xl text-green-200">Instant analysis of health trends</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div className="text-3xl text-green-200">Correlate medications & outcomes</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div className="text-3xl text-green-200">Identify health patterns & risks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar - Step 5 */}
      <div className={`mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-1000 delay-1200 ${getAnimationClass(5)}`}>
        <div className="flex justify-center gap-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">12+ Years</div>
            <div className="text-xl text-gray-400">Health History</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400">3+ Providers</div>
            <div className="text-xl text-gray-400">Medical Systems</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400">5+ Metrics</div>
            <div className="text-xl text-gray-400">Labs, Vitals, Meds, etc.</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400">100%</div>
            <div className="text-xl text-gray-400">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">Natural</div>
            <div className="text-xl text-gray-400">Language</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthIntelligenceSingleSlide;