/**
 * agentDeep - Web Speech API (Speech-to-Text)
 * Permet la saisie vocale et le parsing de commandes
 */

export interface SpeechRecognitionResultState {
  transcript: string;
  isFinal: boolean;
}

export type SpeechCallback = (result: SpeechRecognitionResultState) => void;
export type ErrorCallback = (error: string) => void;

// Interfaces Web Speech API pour TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'fr-FR';
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public startListening(onResult: SpeechCallback, onError?: ErrorCallback, onEnd?: () => void): boolean {
    if (!this.recognition) {
      onError?.("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult({
        transcript: finalTranscript || interimTranscript,
        isFinal: Boolean(finalTranscript),
      });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorMsg = event.error === 'not-allowed'
        ? 'Accès au micro refusé. Autorise le micro dans ton navigateur.'
        : `Erreur vocale : ${event.error}`;
      onError?.(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      this.isListening = false;
      onError?.("Impossible de démarrer la capture audio.");
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignorer
      }
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
