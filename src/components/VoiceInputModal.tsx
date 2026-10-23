/**
 * agentDeep - Modale de Commande Vocale (Speech-to-Text)
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { speechService } from '../services/speechService';
import { geminiService } from '../services/geminiService';
import { X, Mic, Send, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { VoiceParsedAction } from '../types';

export const VoiceInputModal: React.FC = () => {
  const { isVoiceModalOpen, setVoiceModalOpen, applyVoiceAction } = useAppStore();

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedAction, setDetectedAction] = useState<VoiceParsedAction | null>(null);

  // Démarre l'écoute à l'ouverture de la modale
  useEffect(() => {
    if (isVoiceModalOpen) {
      setTranscript('');
      setDetectedAction(null);
      setErrorMsg(null);

      const supported = speechService.isSupported();
      if (!supported) {
        setErrorMsg("La reconnaissance vocale n'est pas disponible sur ce navigateur. Tu peux saisir ta commande au clavier.");
        return;
      }

      startListeningSession();
    } else {
      speechService.stopListening();
      setIsListening(false);
    }
  }, [isVoiceModalOpen]);

  const startListeningSession = () => {
    setErrorMsg(null);
    setIsListening(true);

    speechService.startListening(
      (result) => {
        setTranscript(result.transcript);
      },
      (err) => {
        setErrorMsg(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleProcessCommand = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    handleStopListening();

    try {
      const parsed = await geminiService.parseVoiceCommand(transcript.trim());
      setDetectedAction(parsed);
      await applyVoiceAction(parsed);
      setVoiceModalOpen(false);
    } catch {
      setErrorMsg("Impossible d'interpréter la commande. Réessaie ou saisis-la manuellement.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-[28px] shadow-[0_0_50px_rgba(0,229,255,0.2)] p-6 relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => setVoiceModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00E5FF]">
            agentDeep Voice
          </span>
          <h3 className="font-heading font-bold text-xl text-white mt-0.5">
            Dis-moi quoi faire
          </h3>
          <p className="text-xs text-[#8A8A8A] mt-1">
            "Rappelle-moi de réviser RO demain à 8h", "Ajoute tâche...", etc.
          </p>
        </div>

        {/* Animation Micro central */}
        <div className="relative my-4 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-[#7C4DFF]/15 animate-pulse" />
            </>
          )}

          <button
            onClick={isListening ? handleStopListening : startListeningSession}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white relative z-10 transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.7)] scale-105'
                : 'bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#7C4DFF]'
            }`}
          >
            <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce' : 'text-[#8A8A8A]'}`} />
          </button>
        </div>

        {/* Statut d'écoute */}
        <div className="my-2">
          {isListening ? (
            <span className="text-xs text-[#00E5FF] font-semibold animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
              Écoute en cours... Parle naturellement
            </span>
          ) : (
            <span className="text-xs text-[#8A8A8A]">
              Clique sur le micro pour parler ou édite le texte ci-dessous
            </span>
          )}
        </div>

        {/* Message d'erreur éventuel */}
        {errorMsg && (
          <div className="w-full p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Champ de texte éditable en direct */}
        <div className="w-full my-3">
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="La retranscription vocale s'affiche ici..."
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-3.5 text-sm text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF] resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcessCommand}
          disabled={!transcript.trim() || isAnalyzing}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:opacity-90 disabled:opacity-40 text-white shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-[#00E5FF]" />
              <span>Analyse par agentDeep...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Interpréter & Créer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
