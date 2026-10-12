'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Volume2, Sparkles } from 'lucide-react';
import { LanguageCode, translations } from '../lib/translations';

interface Props {
  currentLang: LanguageCode;
  selectedLanguage: 'Swahili' | 'Maa';
  onTranscriptionComplete: (text: string) => void;
}

export const AudioRecorder: React.FC<Props> = ({ currentLang, selectedLanguage, onTranscriptionComplete }) => {
  const t = translations[currentLang];

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startWaveformVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 128;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          // Gradient between savanna dark and earth ochre
          ctx.fillStyle = '#23291B';
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch {
      // AudioContext fallback
    }
  };

  const stopWaveformVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stopWaveformVisualizer();
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      startWaveformVisualizer(stream);
      setIsRecording(true);
      setRecordingSeconds(0);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access is not available or blocked in this browser. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopWaveformVisualizer();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  const handleTranscribe = () => {
    setIsTranscribing(true);
    // Simulate African Speech-to-Text transcription tailored to rural Kenyan contexts
    setTimeout(() => {
      let sampleText = '';
      if (selectedLanguage === 'Maa') {
        sampleText = "Entito ena eitasheyie enkaputi o inkishu pee aaku esiankiki to olosho e Narok, kake iltung'ana o koma etisila aisho sukulu.";
      } else {
        sampleText = "Wasichana katika jamii yetu wanakabiliwa na mila ya tohara ya wasichana na ngariba anaitwa kuwakata kabla ya ndoa za mapema.";
      }
      onTranscriptionComplete(sampleText);
      setIsTranscribing(false);
    }, 1200);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-savanna-50 border border-savanna-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-savanna-900 font-semibold text-xs">
          <Mic className="w-4 h-4 text-savanna-800" />
          <span>{t.recordAudio}</span>
        </div>
        {isRecording && (
          <span className="flex items-center space-x-1.5 text-xs text-rose-600 font-mono font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            <span>{formatTimer(recordingSeconds)}</span>
          </span>
        )}
      </div>

      {isRecording && (
        <div className="bg-white/80 rounded border border-savanna-200 p-2 overflow-hidden">
          <canvas ref={canvasRef} width={400} height={40} className="w-full h-10 block" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-savanna-800 hover:bg-savanna-900 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Start Oral Recording</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>{t.stopRecording}</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <>
            <audio src={audioUrl} controls className="h-8 max-w-xs" />
            <button
              type="button"
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-earth-600 hover:bg-earth-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTranscribing ? 'animate-spin' : ''}`} />
              <span>{isTranscribing ? t.transcribingAudio : 'Transcribe to Narrative'}</span>
            </button>
            <button
              type="button"
              onClick={clearAudio}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              title="Delete recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] text-slate-500 italic">
        Allows narrators in Narok and Kajiado who prefer oral storytelling to dictate their narrative directly.
      </p>
    </div>
  );
};

