import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Brain, 
  FileText, 
  MessageSquare, 
  Database,
  Zap,
  ArrowRight,
  CheckCircle,
  Activity,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const Part1IntroVisual = () => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const transformationSteps = [
    {
      name: "Apple Health Export",
      purpose: "12+ Years of Data",
      icon: FileText,
      color: "from-gray-500 to-slate-500",
      description: "200+ pages scattered across 3+ providers"
    },
    {
      name: "Claude Opus 4", 
      purpose: "AI Extraction",
      icon: Brain,
      color: "from-blue-500 to-cyan-500", 
      description: "Schema-based extraction with 100% accuracy"
    },
    {
      name: "Snowflake Analytics",
      purpose: "Data Platform", 
      icon: Database,
      color: "from-purple-500 to-pink-500",
      description: "Enterprise health data warehouse"
    },
    {
      name: "Snowflake Cortex Analyst",
      purpose: "Natural Language",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      description: "Ask questions in plain English"
    }
  ];

  const getStepClass = (step) => {
    return animationStep >= step 
      ? 'opacity-100 translate-y-0 scale-100' 
      : 'opacity-70 translate-y-4 scale-95';
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 flex flex-col justify-center relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-400 rounded-full blur-2xl"></div>
      </div>

      {/* Part 1 Badge */}
      <div className={`text-center mb-6 transition-all duration-1000 ${getStepClass(0)}`}>
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full px-6 py-3 border border-blue-400/50 mb-4">
          <Heart className="w-6 h-6 text-blue-400" />
          <span className="text-2xl font-bold text-blue-300">Part 1</span>
        </div>
      </div>

      {/* Main Title */}
      <div className={`text-center mb-8 transition-all duration-1000 delay-300 ${getStepClass(1)}`}>
        <h1 className="text-6xl font-bold mb-4 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Transform 12+ Years of
          </span>
        </h1>
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Health Data into Intelligence
          </span>
        </h1>
        <p className="text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed">
          <span className="text-purple-400 font-semibold">Multi-agent Health System</span> powered by
          <br />
          <span className="text-blue-400 font-semibold">Claude + MCP + Snowflake</span>
        </p>
      </div>

      {/* Transformation Flow */}
      <div className={`space-y-4 max-w-2xl mx-auto transition-all duration-1000 delay-600 ${getStepClass(2)}`}>
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-white mb-2">The Transformation Pipeline</h3>
          <p className="text-xl text-gray-400">Four steps to health intelligence</p>
        </div>
        
        {transformationSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = animationStep >= (index + 2);
          
          return (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-60 translate-x-4'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold text-white">{step.name}</h4>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-medium text-gray-300">{step.purpose}</span>
                    </div>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                  {isActive && <CheckCircle className="w-5 h-5 text-green-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Health Questions Demo */}
      <div className={`text-center mt-8 transition-all duration-1000 delay-1500 ${getStepClass(5)}`}>
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MessageSquare className="w-6 h-6 text-green-400" />
            <h4 className="text-2xl font-bold text-white">Ask Your Health Questions</h4>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 mb-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-medium">You Ask:</span>
            </div>
            <p className="text-white font-medium text-lg">
              "How has my HbA1c changed since starting metformin?"
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">AI Insight:</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💊</div>
              <p className="text-purple-100 font-medium">
                27-pound weight gain reversed medication benefits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-12 animate-bounce delay-1000">
        <Activity className="w-6 h-6 text-blue-400 opacity-60" />
      </div>
      <div className="absolute bottom-1/4 left-12 animate-pulse delay-500">
        <TrendingUp className="w-8 h-8 text-green-400 opacity-60" />
      </div>
      <div className="absolute top-1/3 right-1/3 animate-ping delay-2000">
        <Sparkles className="w-5 h-5 text-purple-400 opacity-40" />
      </div>
    </div>
  );
};

export default Part1IntroVisual;