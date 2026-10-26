import React from 'react';
import { X, BookOpen, Star, ShieldCheck, Dice6, Trophy, Swords } from 'lucide-react';

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      icon: <Dice6 className="w-6 h-6 text-amber-400" />,
      title: "1. Starting the Game",
      description: "Tokens start in your color's Yard. You must roll a 6 to bring a token out onto your colored starting square on the main circuit.",
    },
    {
      icon: <Swords className="w-6 h-6 text-red-400" />,
      title: "2. Capturing Opponents",
      description: "If your token lands on an opponent's token on an unprotected square, that opponent token is captured and sent back to its Yard! Capturing gives you a BONUS ROLL.",
    },
    {
      icon: <Star className="w-6 h-6 text-amber-300" />,
      title: "3. Safe Star Squares",
      description: "Squares marked with a Star (including starting squares) are completely safe. Multiple tokens can share a star square without any danger of capture.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "4. Consecutive Sixes Rule",
      description: "Rolling a 6 grants an extra turn. However, rolling three consecutive sixes cancels the third turn and passes play to the next player.",
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      title: "5. Home Stretch & Victory",
      description: "After circling the board, your tokens enter your colored home lane. You need an exact roll to enter the center Home. First player to get all 4 tokens home wins!",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">HOW TO PLAY</h2>
              <p className="text-xs text-slate-400">Standard Authentic 4-Player Ludo Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 shadow-sm"
            >
              <div className="p-2 rounded-xl bg-slate-800/80 shrink-0">
                {rule.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{rule.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black tracking-wider uppercase text-sm shadow-lg transition-transform active:scale-95"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
