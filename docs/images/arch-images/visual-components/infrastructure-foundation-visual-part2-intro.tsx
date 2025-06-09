import React from 'react';
import {
  Database,
  Lock,
  Brain,
  Layers,
  Server,
  Code2,
  Zap,
  ArrowRight,
  Building2,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  GitBranch,
  Cpu,
  Shield,
  FolderTree,
  ListTodo,
  BrainCircuit
} from 'lucide-react';

const InfrastructureFoundationVisual = () => {
  const infrastructureLayers = [
    {
      icon: Database,
      title: "Database Schemas",
      description: "Snowflake Warehouse DDL",
      color: "from-purple-500 to-pink-500",
      details: ["Health-optimized tables", "Domain relationships", "Indexed for analytics"]
    },
    {
      icon: Lock,
      title: "API Integrations",
      description: "Complex JWT authentication",
      color: "from-blue-500 to-cyan-500",
      details: ["Cortex Analyst endpoints", "Private key signing", "MCP server tools"]
    },
    {
      icon: Brain,
      title: "Semantic Models",
      description: "Natural language to SQL",
      color: "from-green-500 to-emerald-500",
      details: ["Cortex Analyst YAML", "Business logic mapping", "Health metrics definitions"]
    }
  ];

  const traditionalTools = [
    { name: "Cursor", icon: Code2, issues: "Enhanced autocomplete at best" },
    { name: "Copilot", icon: GitBranch, issues: "More debugging than coding" },
    { name: "ChatGPT", icon: Cpu, issues: "Generated code often breaks" }
  ];

  const claudeCodeCapabilities = [
    { 
      name: "Complete Workspace Understanding", 
      icon: FolderTree, 
      description: "Automatic project comprehension" 
    },
    { 
      name: "Strategic Planning", 
      icon: ListTodo, 
      description: "Structured development before coding" 
    },
    { 
      name: "Extended Thinking", 
      icon: BrainCircuit, 
      description: "Deep analysis for complex integrations" 
    }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 overflow-hidden">
      
      {/* Header - The Challenge */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Behind Every Capable Agent
          </span>
        </h1>
        <p className="text-3xl text-gray-300">
          Lies Critical Infrastructure That Takes Endless Iterations to Build... <span className="text-blue-400 font-semibold">Or Does It?</span>
        </p>
      </div>

      {/* Traditional Approach vs Claude Code Revolution */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        {/* Traditional Approach - Left Side */}
        <div className="bg-red-500/10 rounded-3xl p-6 border-2 border-red-500/30">
          <h2 className="text-5xl font-bold text-red-400 mb-6 flex items-center gap-3">
            <XCircle className="w-12 h-12" />
            Traditional Tools Approach
          </h2>
          
          <div className="space-y-4 mb-6">
            {traditionalTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white">{tool.name}</h3>
                      <p className="text-xl text-red-300">{tool.issues}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
            <p className="text-2xl text-red-200 text-center">
              "I often spent more time debugging their generated code than it would have taken to write from scratch"
            </p>
          </div>
        </div>

        {/* Claude Code Revolution - Right Side */}
        <div className="bg-green-500/10 rounded-3xl p-6 border-2 border-green-500/30">
          <h2 className="text-5xl font-bold text-green-400 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-12 h-12" />
            Claude Code Revolution
          </h2>
          
          <div className="space-y-4 mb-6">
            {claudeCodeCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white">{capability.name}</h3>
                      <p className="text-xl text-green-300">{capability.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
            <p className="text-2xl text-green-200 text-center">
              "Genuine development orchestration that made the theoretical shift tangible"
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure Foundation */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-3xl p-8 border-2 border-blue-500/30">
        <h2 className="text-6xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            The Critical Infrastructure Stack
          </span>
        </h2>

        {/* Infrastructure Layers */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {infrastructureLayers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div key={index}>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                  <div className={`w-20 h-20 bg-gradient-to-r ${layer.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">{layer.title}</h3>
                  <p className="text-2xl text-gray-300 mb-4">{layer.description}</p>
                  <div className="space-y-2">
                    {layer.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <span className="text-xl text-gray-400">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Message */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <Building2 className="w-14 h-14 text-purple-400" />
            <ArrowRight className="w-10 h-10 text-blue-400" />
            <div className="flex items-center gap-2">
              <Clock className="w-10 h-10 text-green-400" />
              <span className="text-4xl font-bold text-green-400">15 Minutes</span>
            </div>
          </div>
          <p className="text-3xl text-gray-300 mt-4">
            With Claude Code: From concept to working infrastructure in 1-2 attempts
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureFoundationVisual;