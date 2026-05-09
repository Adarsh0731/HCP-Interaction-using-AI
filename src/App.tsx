/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  Mic, 
  Plus, 
  Bot, 
  Send, 
  ChevronDown,
  Info,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [hcpName, setHcpName] = useState('');
  const [interactionType, setInteractionType] = useState('Meeting');
  const [date, setDate] = useState('2025-04-19');
  const [time, setTime] = useState('19:36');
  const [attendees, setAttendees] = useState('');
  const [topics, setTopics] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiLog = async () => {
    if (!aiInput.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: aiInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = aiInput;
    setAiInput('');
    setIsAiLoading(true);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an AI assistant for a medical sales representative. 
        The user wants to log, update, or get suggestions for interaction details.
        
        Current Form State:
        - HCP Name: ${hcpName}
        - Interaction Type: ${interactionType}
        - Date: ${date}
        - Time: ${time}
        - Attendees: ${attendees}
        - Topics Discussed: ${topics}
        
        Instruction: "${currentInput}"
        
        If the user asks for suggestions, provide professional medical discussion points relevant to the HCP and interaction type. 
        Focus on clinical efficacy, patient outcomes, or administrative requirements for products like "Prodo-X".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { 
                type: Type.STRING, 
                description: "A friendly conversational response acknowledging the changes or additions." 
              },
              updates: {
                type: Type.OBJECT,
                description: "The fields to update in the form based on the user's input.",
                properties: {
                  hcpName: { type: Type.STRING },
                  interactionType: { type: Type.STRING, enum: ["Meeting", "Lunch", "Phone Call", "Email"] },
                  date: { type: Type.STRING, description: "ISO date format YYYY-MM-DD" },
                  time: { type: Type.STRING, description: "24h time format HH:MM" },
                  attendees: { type: Type.STRING },
                  topics: { type: Type.STRING }
                }
              }
            },
            required: ["summary"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: result.summary || "I've processed that for you." 
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (result.updates) {
        if (result.updates.hcpName !== undefined) setHcpName(result.updates.hcpName);
        if (result.updates.interactionType !== undefined) setInteractionType(result.updates.interactionType);
        if (result.updates.date !== undefined) setDate(result.updates.date);
        if (result.updates.time !== undefined) setTime(result.updates.time);
        if (result.updates.attendees !== undefined) setAttendees(result.updates.attendees);
        if (result.updates.topics !== undefined) setTopics(result.updates.topics);
      }
      
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "Sorry, I had trouble processing that. Please try again." 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm shadow-blue-900/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">HCP Logger <span className="text-slate-400 font-mono text-xs ml-1">v2.4</span></h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sync Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/20">
                AK
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">Adarsh Kumar</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        {/* Main Form Area */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-blue-900/5 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Log HCP Interaction</h2>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Entry ID: HCP-{Date.now().toString().slice(-6)}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all border border-slate-200">
                Discard
              </button>
              <button className="px-5 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                Finalize Log
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Interaction Details Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Info className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Primary Parameters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 block">HCP Designation</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search identifier..."
                      value={hcpName}
                      onChange={(e) => setHcpName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 block">Interaction Vector</label>
                  <div className="relative">
                    <select 
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none text-slate-800"
                    >
                      <option className="bg-white text-slate-800">Meeting</option>
                      <option className="bg-white text-slate-800">Lunch</option>
                      <option className="bg-white text-slate-800">Phone Call</option>
                      <option className="bg-white text-slate-800">Email</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 block">Temporal Stamp</label>
                  <div className="relative group">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 block">Execution Time</label>
                  <div className="relative group">
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Attendees Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Personnel Registry</h3>
              </div>
              <input 
                type="text" 
                placeholder="List identified attendees..."
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-800 placeholder-slate-400"
              />
            </section>

            {/* Topics Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Discussion Synthesis</h3>
                </div>
                <button 
                  onClick={() => {
                    setAiInput(`Provide 3 context-aware discussion topics for a ${interactionType} with ${hcpName || "this HCP"}.`);
                    handleAiLog();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Query Cortex for Suggestions
                </button>
              </div>
              <textarea 
                placeholder="Document key discussion points and outcomes..."
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                rows={5}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none text-slate-800 placeholder-slate-400 leading-relaxed"
              />
              <button className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:text-blue-700 transition-colors py-2 group">
                <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Initialize Voice Transcription (Protected)
              </button>
            </section>

            {/* Materials Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Asset Distribution</h3>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-all">
                  <Search className="w-3.5 h-3.5" />
                  Catalog Global
                </button>
              </div>
              
              <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 group hover:border-blue-200 transition-all cursor-pointer">
                <Plus className="w-8 h-8 mb-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                <p className="text-xs font-bold uppercase tracking-widest">No assets tagged.</p>
              </div>
            </section>
          </div>
        </div>

        {/* AI Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          {/* AI Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 flex items-center gap-4 border-l-4 border-l-blue-600">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Bot className="text-white w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight text-white-none">Cortex Agent v2</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telemetric Analysis Active</p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>ENCRYPTED_CHANNEL_SECURE</span>
                <span className="text-emerald-600 uppercase font-bold">Auto-Sync On</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none border border-blue-400/30' 
                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-200'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none border border-slate-200 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
              <div className="relative flex items-end gap-2">
                <textarea 
                  placeholder="Feed data points..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiLog();
                    }
                  }}
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all resize-none shadow-sm text-slate-800 placeholder-slate-300 text-xs font-mono"
                  rows={2}
                />
                <button 
                  onClick={handleAiLog}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="absolute bottom-2.5 right-2.5 w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-20 disabled:grayscale transition-all shadow-lg shadow-blue-600/30 active:scale-90"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-4">
                <button 
                  onClick={handleAiLog}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 group border border-blue-400/20"
                >
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-[9px] font-mono group-hover:bg-white/30 text-white">LOG</div>
                  Execute Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        
        input[type=\"date\"]::-webkit-calendar-picker-indicator,
        input[type=\"time\"]::-webkit-calendar-picker-indicator {
          filter: opacity(0.3);
          cursor: pointer;
        }
        
        input[type=\"date\"]::-webkit-calendar-picker-indicator:hover,
        input[type=\"time\"]::-webkit-calendar-picker-indicator:hover {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
