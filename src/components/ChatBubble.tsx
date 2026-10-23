/**
 * agentDeep - Bulle de chat avec persona ENTP et RoleBadge
 */

import React, { useState } from 'react';
import type { ChatMessageEntity } from '../types';
import { RoleBadge } from './RoleBadge';
import { Copy, Check, Bot } from 'lucide-react';

interface Props {
  message: ChatMessageEntity;
}

export const ChatBubble: React.FC<Props> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex items-start gap-3 my-3 group ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Avatar IA à gauche */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] p-0.5 shrink-0 shadow-[0_0_12px_rgba(124,77,255,0.4)] mt-1">
          <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center text-[#00E5FF]">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      )}

      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-[20px] p-4 text-sm leading-relaxed ${
          isAssistant
            ? 'bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] rounded-tl-sm shadow-md'
            : 'bg-gradient-to-r from-[#7C4DFF] to-[#683bdf] text-white rounded-tr-sm shadow-[0_0_15px_rgba(124,77,255,0.3)]'
        }`}
      >
        {/* Badge rôle IA */}
        {isAssistant && message.activeRole && (
          <div className="mb-2">
            <RoleBadge role={message.activeRole} />
          </div>
        )}

        {/* Corps du message avec préservation des retours à la ligne */}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Footer bulle : heure et bouton copier */}
        <div
          className={`flex items-center gap-2 mt-2 pt-1 text-[10px] ${
            isAssistant ? 'text-[#8A8A8A] justify-between' : 'text-white/70 justify-end'
          }`}
        >
          {isAssistant && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
              title="Copier le message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
          )}

          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
