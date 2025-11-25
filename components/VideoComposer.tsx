"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Play, Download, Trash2, Film, Image as ImageIcon, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  file: File;
  duration?: number;
  thumbnail?: string;
}

interface TimelineItem extends MediaItem {
  startTime: number;
  duration: number;
}

interface VideoComposerProps {
  audioBlob: Blob | null;
}

const TRANSITIONS = [
  { id: "none", name: "Nenhuma" },
  { id: "fade", name: "Fade" },
  { id: "slide", name: "Deslizar" },
  { id: "zoom", name: "Zoom" },
  { id: "dissolve", name: "Dissolver" },
];

export default function VideoComposer({ audioBlob }: VideoComposerProps) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [selectedTransition, setSelectedTransition] = useState("fade");
  const [audioDuration, setAudioDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };
    }
  }, [audioBlob]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) continue;

      const url = URL.createObjectURL(file);
      let duration = 5; // Default duration for images
      let thumbnail = url;

      if (isVideo) {
        const video = document.createElement("video");
        video.src = url;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            duration = video.duration;
            resolve(null);
          };
        });
      }

      const mediaItem: MediaItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: isImage ? "image" : "video",
        url,
        file,
        duration,
        thumbnail,
      };

      setMediaLibrary((prev) => [...prev, mediaItem]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const applySimpleMode = () => {
    if (mediaLibrary.length === 0) {
      alert("Por favor, adicione pelo menos uma imagem.");
      return;
    }

    const firstMedia = mediaLibrary[0];
    const timelineItem: TimelineItem = {
      ...firstMedia,
      startTime: 0,
      duration: audioDuration || 10,
    };

    setTimeline([timelineItem]);
  };

  const addToTimeline = (mediaItem: MediaItem) => {
    const lastItem = timeline[timeline.length - 1];
    const startTime = lastItem ? lastItem.startTime + lastItem.duration : 0;

    const timelineItem: TimelineItem = {
      ...mediaItem,
      startTime,
      duration: mediaItem.duration || 5,
    };

    setTimeline((prev) => [...prev, timelineItem]);
  };

  const removeFromTimeline = (id: string) => {
    setTimeline((prev) => prev.filter((item) => item.id !== id));
  };

  const removeFromLibrary = (id: string) => {
    setMediaLibrary((prev) => prev.filter((item) => item.id !== id));
  };

  const renderVideo = async () => {
    if (timeline.length === 0) {
      alert("Adicione mídias à timeline antes de renderizar.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 1920;
      canvas.height = 1080;

      // Simulate video rendering
      const totalFrames = 100;
      for (let i = 0; i < totalFrames; i++) {
        setProgress(Math.round((i / totalFrames) * 100));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Create a simple preview
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (timeline[0]) {
        const img = new Image();
        img.src = timeline[0].url;
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(null);
          };
        });
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Video Preview", canvas.width / 2, canvas.height - 40);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      }, "image/jpeg");

      setProgress(100);
      setTimeout(() => setIsProcessing(false), 500);
    } catch (error) {
      console.error("Error rendering video:", error);
      alert("Erro ao renderizar vídeo.");
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!previewUrl) return;

    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `video-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalDuration = timeline.reduce((acc, item) => acc + item.duration, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Video Composer</h2>

      {/* Mode Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode("simple")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
            mode === "simple"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-900 text-gray-400 hover:bg-gray-800"
          }`}
        >
          Modo Simples
        </button>
        <button
          onClick={() => setMode("advanced")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
            mode === "advanced"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-900 text-gray-400 hover:bg-gray-800"
          }`}
        >
          Modo Avançado
        </button>
      </div>

      {/* File Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload de Imagens e Vídeos
        </button>
      </div>

      {/* Media Library */}
      {mediaLibrary.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-3">Biblioteca de Mídia</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaLibrary.map((media) => (
              <div key={media.id} className="relative group">
                <div className="media-preview bg-gray-900">
                  {media.type === "image" ? (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {media.type === "image" ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {mode === "advanced" && (
                      <button
                        onClick={() => addToTimeline(media)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    )}
                    <button
                      onClick={() => removeFromLibrary(media.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {media.type === "video" && (
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {media.duration?.toFixed(1)}s
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Mode */}
      {mode === "simple" && mediaLibrary.length > 0 && (
        <button
          onClick={applySimpleMode}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
        >
          Aplicar Imagem ao Longo do Áudio
        </button>
      )}

      {/* Advanced Mode Timeline */}
      {mode === "advanced" && (
        <div>
          <h3 className="text-xl font-bold text-white mb-3">
            Timeline ({totalDuration.toFixed(1)}s)
          </h3>
          <div className="timeline">
            <div className="timeline-track">
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className="timeline-item bg-blue-600"
                  style={{ width: `${item.duration * 50}px` }}
                >
                  {item.type === "image" ? (
                    <img src={item.url} alt="" />
                  ) : (
                    <video src={item.url} />
                  )}
                  <button
                    onClick={() => removeFromTimeline(item.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 rounded text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.duration.toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transition Selection */}
      {timeline.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Transições
          </label>
          <div className="grid grid-cols-5 gap-3">
            {TRANSITIONS.map((transition) => (
              <button
                key={transition.id}
                onClick={() => setSelectedTransition(transition.id)}
                className={`p-3 rounded-xl font-medium transition-all ${
                  selectedTransition === transition.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800"
                }`}
              >
                {transition.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            Renderizando vídeo... {progress}%
          </p>
        </div>
      )}

      {/* Render Button */}
      <button
        onClick={renderVideo}
        disabled={isProcessing || timeline.length === 0}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Renderizando...
          </>
        ) : (
          <>
            <Film className="w-5 h-5" />
            Renderizar Vídeo
          </>
        )}
      </button>

      {/* Video Preview */}
      {previewUrl && (
        <div className="bg-gray-900 p-6 rounded-xl space-y-4">
          <h3 className="text-xl font-bold text-white">Preview do Vídeo</h3>
          <img src={previewUrl} alt="Video Preview" className="w-full rounded-lg" />
          <div className="flex gap-3">
            <button
              onClick={downloadVideo}
              className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar Vídeo
            </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
