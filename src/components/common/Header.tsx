import { Youtube } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

interface HeaderProps {
  inGame?: boolean;
  onBackToHome?: () => void;
}

const Header = ({ inGame = false, onBackToHome }: HeaderProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleClick = () => {
    if (inGame && onBackToHome) {
      // 如果在遊戲中，則顯示確認對話框
      setConfirmOpen(true);
    } else {
      // 如果不在遊戲中，直接返回首頁（這個分支實際上不會執行，因為我們已經在首頁）
      onBackToHome?.();
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <button 
        onClick={handleClick}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
          <Youtube className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-neutral-900">YouTube Guesser</span>
      </button>

      {/* 確認對話框 */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          onBackToHome?.();
        }}
        title="結束遊戲"
        description="確定要結束當前遊戲並返回首頁嗎？您的遊戲進度將會丟失。"
        confirmText="結束遊戲"
        cancelText="繼續遊戲"
      />
    </div>
  );
};

export default Header;
