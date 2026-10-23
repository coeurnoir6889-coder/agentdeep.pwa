/**
 * agentDeep - Écran des Paramètres & Chiffrement Web Crypto
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { encryptApiKey, decryptApiKey } from '../services/cryptoService';
import { geminiService } from '../services/geminiService';
import { exportDatabaseBackup, resetDatabaseToDefault } from '../db/repositories';
import {
  Key,
  User,
  Calendar,
  Flame,
  Download,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, refreshData } = useAppStore();

  const [userName, setUserName] = useState(settings?.userName || 'Tokpa');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isExamMode, setIsExamMode] = useState(Boolean(settings?.isExamMode));
  const [examDate, setExamDate] = useState(settings?.examDate || '');

  // États des tests et confirmations
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Charger la clé chiffrée
  useEffect(() => {
    async function loadKey() {
      if (settings?.geminiApiKey) {
        const decrypted = await decryptApiKey(settings.geminiApiKey);
        setApiKeyInput(decrypted);
      }
    }
    loadKey();
  }, [settings?.geminiApiKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let encryptedKey = settings?.geminiApiKey || '';
    if (apiKeyInput.trim()) {
      encryptedKey = await encryptApiKey(apiKeyInput.trim());
    } else {
      encryptedKey = '';
    }

    await updateSettings({
      userName: userName.trim() || 'Tokpa',
      geminiApiKey: encryptedKey,
      isExamMode,
      examDate: examDate || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestKey = async () => {
    setTestResult({ status: 'testing', message: 'Test de connexion à Gemini en cours...' });

    const result = await geminiService.testConnection(apiKeyInput.trim());
    if (result.success) {
      setTestResult({
        status: 'success',
        message: `Connexion établie avec succès ! Réponse : "${result.message}"`,
      });
    } else {
      setTestResult({
        status: 'error',
        message: result.message || 'Impossible de joindre le modèle Gemini.',
      });
    }
  };

  const handleExportJSON = async () => {
    const jsonString = await exportDatabaseBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentDeep-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    await resetDatabaseToDefault();
    await refreshData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto px-4 pt-2">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          Paramètres & Système
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1">
          Gestion de la clé Gemini, mode examen et sauvegarde locale.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identité Utilisateur */}
        <div className="card-agent p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
            <User className="w-5 h-5 text-[#7C4DFF]" />
            <h3>Profil & Identité</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Ton prénom / Pseudo
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ex: Tokpa"
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C4DFF]"
            />
            <p className="text-[11px] text-[#8A8A8A] mt-1">
              agentDeep utilisera ce nom pour te tutoyer et contextualiser ses réponses.
            </p>
          </div>
        </div>

        {/* Clé API Gemini & Chiffrement Web Crypto */}
        <div className="card-agent p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
              <Key className="w-5 h-5 text-[#00E5FF]" />
              <h3>Clé API Gemini (2.0 Flash)</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-[#00E5FF] font-medium bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Chiffrée AES-GCM
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">
                Clé d'API personnelle (optionnelle)
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1"
              >
                <span>Obtenir une clé</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (laisse vide pour utiliser la clé par défaut du serveur)"
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <p className="text-[11px] text-[#8A8A8A] mt-1.5 leading-relaxed">
              La clé est chiffrée côté client avec la Web Crypto API avant d'être sauvegardée dans IndexedDB (Dexie.js). Si non renseignée, agentDeep utilise la clé serveur injectée ou le fallback local intelligent.
            </p>
          </div>

          {/* Bouton Tester la connexion */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testResult.status === 'testing'}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#00E5FF] text-white transition-colors"
            >
              {testResult.status === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
            </button>

            {testResult.status === 'success' && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {testResult.message}
              </span>
            )}

            {testResult.status === 'error' && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* Configuration Mode Examen FASEG */}
        <div className="card-agent p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
            <Flame className="w-5 h-5 text-[#FF6B35]" />
            <h3>Mode Examen (Prof. agentDeep)</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
            <div>
              <span className="text-xs font-bold text-white block">
                Activer le Mode Examen
              </span>
              <span className="text-[11px] text-[#8A8A8A]">
                60% du temps en révision pour les cours &lt; 70%, 1h obligatoire pour les projets.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isExamMode}
              onChange={(e) => setIsExamMode(e.target.checked)}
              className="w-5 h-5 accent-[#FF6B35] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
              Date de début des examens FASEG
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" />
              Réglages enregistrés !
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#7C4DFF] hover:bg-[#683bdf] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)] transition-all"
          >
            Sauvegarder les modifications
          </button>
        </div>
      </form>

      {/* Sauvegarde & Réinitialisation */}
      <div className="card-agent p-5 space-y-4">
        <h3 className="font-heading font-bold text-base text-white">
          Données locales (IndexedDB)
        </h3>
        <p className="text-xs text-[#8A8A8A] leading-relaxed">
          Toutes tes données sont stockées 100% sur ton appareil. Aucun compte cloud externe n'est requis.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#7C4DFF] text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Exporter mes données (JSON)</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/20 border border-red-500/30 hover:border-red-500 text-red-400 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser la base</span>
          </button>
        </div>

        {/* Modal de confirmation reset */}
        {showResetConfirm && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Attention : Cette action efface toutes tes tâches et réinitialise les cours !</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#8A8A8A] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info version */}
      <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-xs text-[#8A8A8A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#7C4DFF]" />
          <span>agentDeep PWA · v1.0.0 Production Ready</span>
        </div>
        <span className="font-mono text-[10px] text-[#00E5FF]">com.tokpa.agentdeep</span>
      </div>
    </div>
  );
};
