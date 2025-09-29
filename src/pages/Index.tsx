import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Youtube } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchVideosBatch, getStoredVideos } from "@/lib/services/videoService";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStartGame = async () => {
    setIsLoading(true);
    
    try {
      // 檢查是否已經有儲存的影片
      const storedVideos = getStoredVideos();
      
      // 如果沒有儲存的影片，才進行搜尋
      if (storedVideos.length === 0) {
        await fetchVideosBatch();
      }
      
      navigate('/game');
    } catch (error) {
      console.error("開始遊戲時出錯:", error);
      // 即使出錯也進入遊戲，遊戲邏輯會使用預設影片
      navigate('/game');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 hover:scale-110">
            <Youtube className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-neutral-900">
              YouTube Guesser
            </h1>
            <p className="text-neutral-600 leading-relaxed">
              來玩個有趣的遊戲吧！挑戰你對 YouTube 影片的了解程度，猜測隨機影片的觀看次數，越接近越高分！
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              className="group bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleStartGame}
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                {isLoading ? '載入影片中...' : '開始遊戲'}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />}
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
