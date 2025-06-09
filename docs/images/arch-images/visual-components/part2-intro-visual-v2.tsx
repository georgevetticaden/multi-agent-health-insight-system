import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Code, 
  Layers, 
  Sparkles, 
  Eye,
  Zap,
  ArrowRight,
  CheckCircle,
  Settings,
  Palette
} from 'lucide-react';

const Part2IntroVisual = () => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 7);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const claudeStackComponents = [
    {
      name: "Claude Code",
      purpose: "Implementation",
      icon: Code,
      color: "from-green-500 to-emerald-500",
      description: "Real-time development & architecture"
    },
    {
      name: "Claude Desktop", 
      purpose: "Agent Building",
      icon: Settings,
      color: "from-blue-500 to-cyan-500", 
      description: "No-code agent creation platform"
    },
    {
      name: "Claude Opus 4",
      purpose: "Reasoning", 
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      description: "Advanced cognitive processing"
    },
    {
      name: "Claude Artifacts",
      purpose: "Visualization",
      icon: Palette,
      color: "from-orange-500 to-red-500",
      description: "Interactive React components"
    },
    {
      name: "Claude Visions", 
      purpose: "Multimodal",
      icon: Eye,
      color: "from-cyan-500 to-blue-500",
      description: "Visual understanding & analysis"
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

      {/* Part 2 Badge */}
      <div className={`text-center mb-6 transition-all duration-1000 ${getStepClass(0)}`}>
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full px-6 py-3 border border-blue-400/50 mb-4">
          <Zap className="w-6 h-6 text-blue-400" />
          <span className="text-2xl font-bold text-blue-300">Part 2</span>
        </div>
      </div>

      {/* Main Title */}
      <div className={`text-center mb-8 transition-all duration-1000 delay-300 ${getStepClass(1)}`}>
        <h1 className="text-6xl font-bold mb-4 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Building Agents with the
          </span>
        </h1>
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Claude Stack
          </span>
        </h1>
        <p className="text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed">
          From zero to <span className="text-blue-400 font-semibold">working agents</span> in <span className="text-green-400 font-semibold">15 minutes</span>
        </p>
      </div>

      {/* Claude Stack Components */}
      <div className={`space-y-4 max-w-2xl mx-auto transition-all duration-1000 delay-600 ${getStepClass(2)}`}>
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-white mb-2">The Complete Stack</h3>
          <p className="text-xl text-gray-400">Five integrated tools, one powerful ecosystem</p>
        </div>
        
        {claudeStackComponents.map((component, index) => {
          const ComponentIcon = component.icon;
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
                  <div className={`w-12 h-12 bg-gradient-to-r ${component.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <ComponentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold text-white">{component.name}</h4>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-medium text-gray-300">{component.purpose}</span>
                    </div>
                    <p className="text-sm text-gray-400">{component.description}</p>
                  </div>
                  {isActive && <CheckCircle className="w-5 h-5 text-green-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className={`text-center mt-8 transition-all duration-1000 delay-1500 ${getStepClass(6)}`}>
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-green-400" />
            <h4 className="text-2xl font-bold text-white">What You'll Build</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">Snowflake Database Schema</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">Custom MCP Server</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">Semantic Models</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">Agent Integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-12 animate-bounce delay-1000">
        <Code className="w-6 h-6 text-green-400 opacity-60" />
      </div>
      <div className="absolute bottom-1/4 left-12 animate-pulse delay-500">
        <Brain className="w-8 h-8 text-purple-400 opacity-60" />
      </div>
      <div className="absolute top-1/3 right-1/3 animate-ping delay-2000">
        <Sparkles className="w-5 h-5 text-blue-400 opacity-40" />
      </div>
    </div>
  );
};

export default Part2IntroVisual;