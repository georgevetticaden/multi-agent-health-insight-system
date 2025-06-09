import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Brain, 
  Database, 
  MessageSquare,
  TestTube,
  Heart,
  Pill,
  Clipboard,
  Server,
  Sparkles,
  Code,
  Activity,
  Layers,
  User
} from 'lucide-react';

const MultiAgentArchitecture = () => {
  const [buildStep, setBuildStep] = useState(0);

  const dataTypes = [
    { name: "Lab Tests", icon: TestTube, count: "12 Years", color: "from-red-500 to-orange-500" },
    { name: "Vitals", icon: Heart, count: "2,400+ Records", color: "from-blue-500 to-cyan-500" },
    { name: "Medications", icon: Pill, count: "150+ Prescriptions", color: "from-green-500 to-emerald-500" },
    { name: "Clinical Data", icon: Clipboard, count: "Conditions, Allergies, etc.", color: "from-purple-500 to-pink-500" }
  ];

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') {
        setBuildStep(prev => Math.min(prev + 1, 10));
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
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 flex flex-col relative">
      
      {/* Navigation Instructions */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20 z-10">
        <div className="text-white text-sm">
          <div className="flex items-center gap-2 mb-1">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">→</kbd>
            <span>Next Step ({buildStep}/10)</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">←</kbd>
            <span>Previous Step</span>
          </div>
        </div>
      </div>

      {/* Header - Step 1 */}
      <div className={`text-center mb-6 transition-all duration-1000 ${getAnimationClass(1)}`}>
        <div className="flex justify-center items-center gap-4 mb-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-7xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Multi-Agent Component Architecture
            </span>
          </h1>
        </div>
        <p className="text-3xl text-gray-300 max-w-4xl mx-auto">
          <span className="text-blue-400 font-semibold">Extract</span> → <span className="text-green-400 font-semibold">Load</span> → <span className="text-purple-400 font-semibold">Analyze</span> Health Data Pipeline
        </p>
      </div>

      {/* Document Input - Step 2 */}
      <div className={`flex justify-start ml-56 mt-16 mb-8 transition-all duration-1000 delay-300 ${getAnimationClass(2)}`}>
        <div className="bg-gradient-to-r from-gray-600/20 to-slate-600/20 rounded-2xl p-5 border border-gray-500/30">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-gray-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Apple Health Export Document</h3>
              <p className="text-gray-300 text-lg">12+ Years • 3+ Providers • 200+ Pages</p>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium text-lg">JSON Schema Extraction Configs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container with Flex Growth */}
      <div className="flex-1 flex flex-col relative">
        
        {/* User Health Query - Positioned absolutely and centered with Health Analyst Agent - Step 8 */}
        <div className={`absolute -top-32 right-0 left-0 transition-all duration-1000 delay-2100 ${getAnimationClass(8)}`}>
          <div className="grid grid-cols-9 gap-5">
            <div className="col-span-2 col-start-7">
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-5 border border-green-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Health Query</h3>
                    <p className="text-green-300 text-2xl font-medium leading-relaxed">"How have my HbA1c levels responded to metformin dosage changes and weight fluctuations?"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Three-Column Layout: Individual Agent Components - Steps 3, 4, 5 */}
        <div className="grid grid-cols-9 gap-5 mt-24">
          
          {/* Health Data Extraction Agent - Column 2-3 - Step 3 */}
          <div className={`col-span-2 col-start-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 transition-all duration-1000 delay-600 ${getAnimationClass(3)}`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">Health Data Extraction Agent</h3>
              <p className="text-3xl text-purple-300 mb-3">Claude Opus 4 • Schema-Based Extraction</p>
              <p className="text-xl text-purple-200">Transforms unstructured Apple Health exports into structured, analyzable health data using intelligent schema-based extraction</p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 border border-purple-500/20">
              <div className="text-2xl font-semibold text-purple-200 mb-3">Smart Chunking Strategy:</div>
              <div className="text-3xl font-medium text-white mb-3">By Health Metric and Year</div>
              <div className="text-xl text-purple-300">Automatically organizes data by clinical domains and time periods</div>
            </div>
          </div>

          {/* Extracted Data - Testing different value - Step 4 */}
          <div className={`col-span-2 col-start-4 bg-gradient-to-b from-gray-600/20 to-slate-600/20 rounded-none p-6 border border-gray-500/30 self-center transform translate-x-44 transition-all duration-1000 delay-900 ${getAnimationClass(4)}`}>
            <div className="text-center mb-4">
              <h3 className="text-3xl font-bold text-white mb-2">Extracted Data</h3>
              <p className="text-2xl text-gray-300 mb-3">Structured JSON Files</p>
              <p className="text-xl text-gray-200">Ready for analysis and querying</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {dataTypes.map((type, index) => {
                const TypeIcon = type.icon;
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-gray-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 bg-gradient-to-r ${type.color} rounded flex items-center justify-center`}>
                        <TypeIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-xl font-semibold">{type.name}</span>
                    </div>
                    <div className="text-lg text-gray-300">{type.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Health Analyst Agent - Column 7-8 - Step 5 */}
          <div className={`col-span-2 col-start-7 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30 transition-all duration-1000 delay-1200 ${getAnimationClass(5)}`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">Health Analyst Agent</h3>
              <p className="text-3xl text-blue-300 mb-3">Data Loading • Natural Language Analytics</p>
              <p className="text-xl text-blue-200">Loads extracted health data into Snowflake and enables sophisticated natural language querying via Cortex Analyst</p>
            </div>

            <div className="bg-white/10 rounded-lg p-8 border border-blue-500/20">
              <div className="text-3xl font-semibold text-blue-200 mb-5">Two-Phase Operation:</div>
              <div className="space-y-5 text-xl text-white">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <div className="font-semibold text-xl">Data Ingestion</div>
                    <div className="text-lg text-blue-300">Load extraction files into Snowflake via MCP</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <div className="font-semibold text-xl">Natural Language Analytics</div>
                    <div className="text-lg text-blue-300">Convert health questions to SQL via Cortex Analyst</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom MCP Server - Centered in remaining space - Step 6 */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`transition-all duration-1000 delay-1500 ${getAnimationClass(6)}`}>
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 w-[600px]">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-3xl font-bold text-white mb-2">Custom MCP Snowflake Server</h4>
                <p className="text-2xl text-green-300 mb-4">Provides two specialized tools for the Health Analyst Agent</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <h5 className="text-xl font-bold text-white mb-1">Ingest Tool</h5>
                  <p className="text-lg text-green-200">→ Snowflake Warehouse</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <h5 className="text-xl font-bold text-white mb-1">Execute Query Tool</h5>
                  <p className="text-lg text-green-200">→ Snowflake Cortex</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snowflake Platform Components - At Bottom - Step 7 & 8 */}
      <div className="grid grid-cols-9 gap-5 mb-4">
        
        {/* Snowflake Warehouse - Step 7 */}
        <div className={`col-span-2 col-start-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30 transition-all duration-1000 delay-1800 ${getAnimationClass(7)}`}>
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-4xl font-bold text-white mb-2">Snowflake Warehouse</h4>
            <p className="text-3xl text-blue-300 mb-4">Cloud Data Platform & SQL Execution Engine</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-5 border border-blue-500/20">
              <div className="text-xl font-medium text-blue-200">Database Tables & Views</div>
              <div className="text-lg text-blue-300 mt-2">Structured health data storage and analysis views</div>
            </div>
            <div className="bg-white/10 rounded-lg p-5 border border-blue-500/20">
              <div className="text-xl font-medium text-blue-200">SQL Query Execution</div>
              <div className="text-lg text-blue-300 mt-2">High-performance processing of health analytics queries</div>
            </div>
          </div>
        </div>

        {/* Stats Footer - Between Snowflake Boxes - Step 10 */}
        <div className={`col-span-3 col-start-4 self-center transition-all duration-1000 delay-2700 ${getAnimationClass(10)}`}>
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h5 className="text-center text-2xl font-bold text-white mb-6">Key Architecture Highlights</h5>
            <div className="grid grid-rows-2 gap-4">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-500/20 rounded-xl p-3 border border-purple-400/30 text-center transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-purple-400">Schema-Based</div>
                  <div className="text-sm text-purple-200">Data Extraction</div>
                </div>
                <div className="bg-blue-500/20 rounded-xl p-3 border border-blue-400/30 text-center transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-blue-400">MCP Integration</div>
                  <div className="text-sm text-blue-200">Data Loading</div>
                </div>
                <div className="bg-orange-500/20 rounded-xl p-3 border border-orange-400/30 text-center transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-orange-400">Semantic Models</div>
                  <div className="text-sm text-orange-200">Business Context</div>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-500/20 rounded-xl p-3 border border-green-400/30 text-center transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-green-400">Cortex Analyst</div>
                  <div className="text-sm text-green-200">Natural Language SQL</div>
                </div>
                <div className="bg-cyan-500/20 rounded-xl p-3 border border-cyan-400/30 text-center transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-cyan-400">Two-Agent Flow</div>
                  <div className="text-sm text-cyan-200">Extract → Analyze</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snowflake Cortex - Step 9 */}
        <div className={`col-span-2 col-start-7 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 transition-all duration-1000 delay-2400 ${getAnimationClass(9)}`}>
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-4xl font-bold text-white mb-2">Snowflake Cortex</h4>
            <p className="text-3xl text-purple-300 mb-4">AI-Powered Natural Language Processing</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-10">
            <div className="bg-white/10 rounded-lg p-4 border border-purple-500/20 text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h5 className="text-2xl font-bold text-white mb-2">Cortex Analyst</h5>
              <p className="text-xl text-purple-200">Natural Language to SQL Engine</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-purple-500/20 text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h5 className="text-2xl font-bold text-white mb-2">Semantic Model</h5>
              <p className="text-xl text-purple-200">Business Context Definitions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentArchitecture;