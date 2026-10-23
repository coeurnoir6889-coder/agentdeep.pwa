/**
 * agentDeep - PWA Install Banner & iOS Safari Guide
 * Conforme aux directives de la Skill pwa-integration
 */

import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Détecte si l'app tourne déjà en standalone (PWA installée)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Détecte iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // Masquer si déjà installée ou fermée manuellement
  if (isInstalled || dismissed) return null;

  // Affichage Android / Chrome / Desktop
  if (deferredPrompt) {
    return (
      <div className="bg-gradient-to-r from-[#7C4DFF]/20 via-[#141414] to-[#00E5FF]/20 border border-[#7C4DFF]/40 rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(124,77,255,0.15)] animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] p-0.5 shrink-0">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center text-[#00E5FF]">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-heading font-bold text-white flex items-center gap-1.5">
              <span>Installer agentDeep sur Android</span>
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            </h4>
            <p className="text-[11px] text-[#8A8A8A]">
              Accède à ton cerveau hors-ligne d'un clic depuis ton écran d'accueil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7C4DFF] hover:bg-[#683bdf] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)] transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-[#8A8A8A] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Affichage iOS
  if (isIOS) {
    return (
      <>
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-3 mb-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#7C4DFF]" />
            <span className="text-[#8A8A8A]">Installer sur iPhone / iPad</span>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="px-3 py-1 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-white text-xs font-medium hover:border-[#7C4DFF]"
          >
            Guide
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6 shadow-2xl">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-[#00E5FF]" />
                Installer sur iOS Safari
              </h3>
              <ol className="text-xs text-[#8A8A8A] space-y-2.5 mb-5 list-decimal list-inside leading-relaxed">
                <li>
                  Dans la barre Safari, appuie sur le bouton <strong className="text-white">Partager</strong>.
                </li>
                <li>
                  Fais défiler la liste vers le bas et choisis <strong className="text-white">Sur l'écran d'accueil</strong>.
                </li>
                <li>
                  Valide en appuyant sur <strong className="text-[#7C4DFF]">Ajouter</strong> en haut à droite.
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#7C4DFF] text-white font-bold text-xs"
              >
                C'est compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
