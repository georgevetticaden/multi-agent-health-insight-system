import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Database, 
  Code2, 
  FileText, 
  BarChart3,
  Server,
  Plug,
  Cloud,
  Sparkles,
  ArrowRight,
  Layers,
  Zap
} from 'lucide-react';

const AgentToolingStack = () => {
  const [buildStep, setBuildStep] = useState(0);

  const toolCategories = [
    {
      name: "Claude Platform",
      color: "from-blue-500 to-cyan-500",
      icon: Brain,
      tools: [
        { 
          name: "Claude Desktop", 
          role: "Agent Builder", 
          icon: Code2,
          description: "No-code agent creation with natural language instructions and project knowledge management"
        },
        { 
          name: "Claude Opus 4", 
          role: "Document Intelligence/Extraction", 
          icon: FileText,
          description: "Schema-based extraction with 100% accuracy for complex health documents and medical records"
        },
        { 
          name: "Claude Artifacts", 
          role: "Visual Analytics & Code Generation", 
          icon: BarChart3,
          description: "Interactive React components and dynamic visualizations for health data insights"
        }
      ]
    },
    {
      name: "Snowflake Platform", 
      color: "from-purple-500 to-pink-500",
      icon: Database,
      tools: [
        { 
          name: "Snowflake Warehouse", 
          role: "DataStore & Database", 
          icon: Database,
          description: "Enterprise-grade cloud data platform for storing and processing health records at scale"
        },
        { 
          name: "Semantic Models", 
          role: "YAML Configuration", 
          icon: Layers,
          description: "Business-friendly data definitions enabling natural language queries over health metrics"
        },
        { 
          name: "Cortex Analyst", 
          role: "Natural Language to SQL", 
          icon: Sparkles,
          description: "AI-powered query engine that translates health questions into accurate SQL statements"
        }
      ]
    },
    {
      name: "MCP Servers",
      color: "from-green-500 to-emerald-500", 
      icon: Plug,
      tools: [
        { 
          name: "Filesystem MCP", 
          role: "Anthropic File Operations", 
          icon: Server,
          description: "Standard file system operations for reading extraction artifacts and configuration files"
        },
        { 
          name: "Custom Snowflake MCP", 
          role: "Data Ingestion & Health Queries", 
          icon: Cloud,
          description: "Purpose-built connector for health data import and natural language analytics workflows"
        }
      ]
    }
  ];

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
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-3 overflow-hidden">
      
      {/* Header - Step 1 */}
      <div className={`text-center mb-2 transition-all duration-1000 ${getAnimationClass(1)}`}>
        <div className="flex justify-center items-center gap-4 mb-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-7xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Agent Building Tooling Stack
            </span>
          </h1>
        </div>
        <p className="text-3xl text-gray-300 max-w-5xl mx-auto">
          Powered by <span className="text-blue-400 font-semibold">Claude + MCP + Snowflake</span> for Health Intelligence
        </p>
      </div>

      {/* Main Tooling Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        
        {toolCategories.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          
          // Map category index to animation step
          const animationStep = categoryIndex + 2; // Steps 2, 3, 4 for the three boxes
          
          return (
            <div
              key={categoryIndex}
              className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-all duration-1000 ${
                categoryIndex === 0 ? 'delay-300' : categoryIndex === 1 ? 'delay-600' : 'delay-900'
              } ${getAnimationClass(animationStep)}`}
            >
              {/* Category Header */}
              <div className="text-center mb-3">
                <div className={`w-20 h-20 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                  <CategoryIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-white">{category.name}</h3>
              </div>

              {/* Tools List */}
              <div className="space-y-2">
                {category.tools.map((tool, toolIndex) => {
                  const ToolIcon = tool.icon;
                  return (
                    <div
                      key={toolIndex}
                      className="bg-white/5 rounded-xl p-3 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-18 h-18 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <ToolIcon className="w-9 h-9 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-3xl font-bold text-white">
                            {tool.name}
                          </h4>
                          <p className="text-2xl font-medium text-gray-200 mb-1">
                            {tool.role}
                          </p>
                          <p className="text-2xl text-gray-300 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Flow - Step 5 */}
      <div className={`bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-3 border border-blue-500/30 mb-2 transition-all duration-1000 delay-1200 ${getAnimationClass(5)}`}>
        <div className="flex items-center justify-center gap-12">
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-1">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">Claude</div>
            <div className="text-xl font-medium text-gray-200">Agent Intelligence</div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-8 h-8 text-blue-400" />
            <div className="text-lg text-blue-300 font-medium">MCP</div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-1">
              <Plug className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">Connectors</div>
            <div className="text-xl font-medium text-gray-200">Model Context Protocol</div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-8 h-8 text-blue-400 mb-1" />
            <div className="text-lg text-blue-300 font-medium">Data</div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-1">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div className="text-4xl font-bold text-white">Snowflake</div>
            <div className="text-2xl font-medium text-gray-200">Analytics Platform</div>
          </div>

        </div>
      </div>

      {/* Key Benefits - Step 5 */}
      <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 transition-all duration-1000 delay-1500 ${getAnimationClass(5)}`}>
        <div className="flex justify-center gap-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400">Natural Language</div>
            <div className="text-lg text-gray-400">No-Code Queries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400">Real-Time</div>
            <div className="text-lg text-gray-400">Health Analytics</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400">100% Accurate</div>
            <div className="text-lg text-gray-400">SQL Generation</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">Business-Friendly</div>
            <div className="text-lg text-gray-400">Customizable & Accessible</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentToolingStack;