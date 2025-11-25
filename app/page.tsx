"use client";

import { useState } from "react";
import TextToSpeech from "@/components/TextToSpeech";
import VideoComposer from "@/components/VideoComposer";
import { Film, Mic } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tts" | "video">("tts");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Studio Audiovisual PRO
          </h1>
          <p className="text-gray-400 text-lg">
            Plataforma completa de produção audiovisual profissional
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setActiveTab("tts")}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "tts"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Mic className="w-6 h-6" />
            Texto para Áudio
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "video"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Film className="w-6 h-6" />
            Video Composer
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          {activeTab === "tts" ? (
            <TextToSpeech onAudioGenerated={setAudioBlob} />
          ) : (
            <VideoComposer audioBlob={audioBlob} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>© 2025 Studio Audiovisual PRO - Produção Profissional</p>
        </footer>
      </div>
    </main>
  );
}
