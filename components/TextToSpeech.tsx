"use client";

import { useState, useRef } from "react";
import { Play, Download, Loader2 } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  style: string;
}

const VOICES: Voice[] = [
  { id: "male-deep", name: "Masculina Deep/Grave", gender: "male", style: "deep" },
  { id: "male-neutral", name: "Masculina Neutral", gender: "male", style: "neutral" },
  { id: "male-energetic", name: "Masculina Energética", gender: "male", style: "energetic" },
  { id: "male-narrative", name: "Masculina Narrativa", gender: "male", style: "narrative" },
  { id: "female-soft", name: "Feminina Suave", gender: "female", style: "soft" },
  { id: "female-powerful", name: "Feminina Potente", gender: "female", style: "powerful" },
  { id: "female-dramatic", name: "Feminina Dramática", gender: "female", style: "dramatic" },
  { id: "female-narrative", name: "Feminina Narrativa", gender: "female", style: "narrative" },
];

const EMOTIONS = [
  { id: "neutral", name: "Neutro" },
  { id: "happy", name: "Feliz" },
  { id: "sad", name: "Triste" },
  { id: "intense", name: "Intenso" },
  { id: "mysterious", name: "Misterioso" },
  { id: "epic", name: "Épico" },
];

interface TextToSpeechProps {
  onAudioGenerated: (blob: Blob) => void;
}

export default function TextToSpeech({ onAudioGenerated }: TextToSpeechProps) {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [emotion, setEmotion] = useState("neutral");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    if (!text.trim()) {
      alert("Por favor, insira um texto para converter.");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Create speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Select voice based on gender preference
      const voice = VOICES.find(v => v.id === selectedVoice);
      if (voice) {
        const systemVoice = voices.find(v =>
          voice.gender === "male"
            ? v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("google uk english male")
            : v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google uk english female")
        ) || voices[0];

        if (systemVoice) utterance.voice = systemVoice;
      }

      utterance.rate = speed;
      utterance.pitch = 1 + (pitch / 10);

      // Record audio using MediaRecorder
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioGenerated(blob);
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setIsGenerating(false), 500);
      };

      mediaRecorder.start();
      window.speechSynthesis.speak(utterance);

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 100);
      };
    } catch (error) {
      console.error("Error generating audio:", error);
      alert("Erro ao gerar áudio. Por favor, tente novamente.");
      setIsGenerating(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `audio-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Conversão Texto para Áudio</h2>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Texto (até 100.000 caracteres)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 100000))}
          className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Digite ou cole seu texto aqui..."
          maxLength={100000}
        />
        <div className="text-right text-sm text-gray-400 mt-1">
          {text.length.toLocaleString()} / 100.000 caracteres
        </div>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Voz
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`p-4 rounded-xl font-medium transition-all ${
                selectedVoice === voice.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {voice.name}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Velocidade: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="slider w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5x</span>
          <span>1.0x</span>
          <span>2.0x</span>
        </div>
      </div>

      {/* Pitch Control */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Tom/Pitch: {pitch > 0 ? `+${pitch}` : pitch}
        </label>
        <input
          type="range"
          min="-10"
          max="10"
          step="1"
          value={pitch}
          onChange={(e) => setPitch(parseInt(e.target.value))}
          className="slider w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-10</span>
          <span>0</span>
          <span>+10</span>
        </div>
      </div>

      {/* Emotion Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Emoção
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {EMOTIONS.map((emo) => (
            <button
              key={emo.id}
              onClick={() => setEmotion(emo.id)}
              className={`p-3 rounded-xl font-medium transition-all ${
                emotion === emo.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {emo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            Gerando áudio... {progress}%
          </p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateAudio}
        disabled={isGenerating || !text.trim()}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando Áudio...
          </>
        ) : (
          "Gerar Áudio"
        )}
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-gray-900 p-6 rounded-xl space-y-4">
          <h3 className="text-xl font-bold text-white">Áudio Gerado</h3>
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          <div className="flex gap-3">
            <button
              onClick={playAudio}
              className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Reproduzir
            </button>
            <button
              onClick={downloadAudio}
              className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar MP3
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
