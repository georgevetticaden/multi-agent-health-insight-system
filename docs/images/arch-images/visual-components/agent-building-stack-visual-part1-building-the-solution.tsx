import React from 'react';
import {
  Brain,
  Database,
  Server,
  FileText,
  BarChart3,
  Code2,
  Layers,
  Cloud,
  ArrowRight,
  Sparkles,
  Building2,
  Plug
} from 'lucide-react';

const AgentBuildingStackVisual = () => {
  const platforms = [
    {
      name: "Claude Platform",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      components: [
        { name: "Claude Desktop", description: "Agent Builder" },
        { name: "Claude Opus 4", description: "Document Extraction" },
        { name: "Claude Code", description: "Agent Development" }
      ]
    },
    {
      name: "Snowflake Platform",
      icon: Database,
      color: "from-purple-500 to-pink-500",
      components: [
        { name: "Data Warehouse", description: "Health Records Storage" },
        { name: "Cortex Analyst", description: "NL → SQL" },
        { name: "", description: "" } // Empty to maintain alignment
      ]
    },
    {
      name: "MCP Servers",
      icon: Server,
      color: "from-green-500 to-emerald-500",
      components: [
        { name: "Filesystem MCP", description: "File Operations" },
        { name: "Custom Snowflake MCP", description: "Data Integration" },
        { name: "", description: "" } // Empty to maintain alignment
      ]
    }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 overflow-hidden">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Agent Building Stack
          </span>
        </h1>
        <p className="text-3xl text-gray-300">
          Powered by <span className="text-blue-400 font-semibold">Claude + MCP + Snowflake</span> for Health Intelligence
        </p>
      </div>

      {/* Three Platform Columns */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        {platforms.map((platform, index) => {
          const Icon = platform.icon;
          return (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              {/* Platform Header */}
              <div className="text-center mb-8">
                <div className={`w-24 h-24 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white">{platform.name}</h2>
              </div>

              {/* Platform Components */}
              <div className="space-y-4">
                {platform.components.map((component, componentIndex) => (
                  component.name ? (
                    <div key={componentIndex} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-2xl font-bold text-white mb-1">{component.name}</h3>
                      <p className="text-xl text-gray-300">{component.description}</p>
                    </div>
                  ) : (
                    <div key={componentIndex} className="h-[88px]"></div> // Spacer for empty slots
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Flow */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-8 border border-blue-500/30">
        <div className="flex items-center justify-center gap-8">
          
          {/* Claude */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-2">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">Claude</div>
          </div>

          {/* Arrow with MCP label */}
          <div className="flex flex-col items-center">
            <ArrowRight className="w-10 h-10 text-blue-400 mb-1" />
            <div className="text-xl text-blue-300 font-medium">MCP</div>
          </div>

          {/* Connect */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-2">
              <Plug className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">Connect</div>
          </div>

          {/* Arrow with Data label */}
          <div className="flex flex-col items-center">
            <ArrowRight className="w-10 h-10 text-blue-400 mb-1" />
            <div className="text-xl text-blue-300 font-medium">Data</div>
          </div>

          {/* Snowflake */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-2">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">Snowflake</div>
          </div>

        </div>

        <p className="text-2xl text-center text-gray-300 mt-6">
          The Agent Building Stack combines Claude's intelligence platform, Snowflake's analytics capabilities, and MCP's connectivity layer to enable rapid development of working multi-agent systems
        </p>
      </div>
    </div>
  );
};

export default AgentBuildingStackVisual;