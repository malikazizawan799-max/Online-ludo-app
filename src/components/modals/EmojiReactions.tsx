import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/audio';

interface EmojiReactionsProps {
  onSendEmoji: (emoji: string) => void;
  incomingReaction?: {
    userId: string;
    emoji: string;
    timestamp: number;
  } | null;
}

const EMOJIS = ['🎉', '🎲', '🔥', '👑', '😱', '😎', '😂', '👏'];

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  onSendEmoji,
  incomingReaction,
}) => {
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);

  // When incoming reaction arrives, trigger floating bubble
  useEffect(() => {
    if (incomingReaction && Date.now() - incomingReaction.timestamp < 4000) {
      triggerFloat(incomingReaction.emoji);
    }
  }, [incomingReaction]);

  const triggerFloat = (emoji: string) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev.slice(-5), { id, emoji }]);
    soundService.playClick();
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const handleSelect = (emoji: string) => {
    triggerFloat(emoji);
    onSendEmoji(emoji);
  };

  return (
    <div className="relative">
      {/* Floating active emojis container */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 z-40">
        {floatingEmojis.map(item => (
          <div
            key={item.id}
            className="text-4xl animate-bounce filter drop-shadow-lg transition-all duration-700 -translate-y-4 opacity-90"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Emoji Selector Pill */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSelect(emoji)}
            className="w-8 h-8 rounded-full hover:bg-slate-800 active:scale-125 transition-transform flex items-center justify-center text-lg select-none"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
