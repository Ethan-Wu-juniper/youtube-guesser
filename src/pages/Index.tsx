import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Youtube, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  fetchVideosBatch, 
  getStoredVideos, 
  getGameSettings, 
  storeGameSettings 
} from "@/lib/services/videoService";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GameSettings } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    questionCount: 10,
    forceRefresh: false
  });
  
  // 載入已保存的設置
  useEffect(() => {
    const savedSettings = getGameSettings();
    setSettings(savedSettings);
  }, []);
  
  const handleStartGame = async () => {
    setIsLoading(true);
    
    try {
      // 儲存目前的設置
      storeGameSettings(settings);
      
      // 檢查是否已經有儲存的影片
      const storedVideos = getStoredVideos();
      
      // 如果沒有儲存的影片或用戶選擇強制刷新，才進行搜尋
      if (storedVideos.length === 0 || settings.forceRefresh) {
        await fetchVideosBatch(settings.forceRefresh);
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
          
          <div className="space-y-6 pt-2">
            <div className="space-y-4 text-left">
              <div className="font-medium text-neutral-800">
                題目數量
              </div>
              <RadioGroup 
                value={settings.questionCount.toString()} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, questionCount: parseInt(value) }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="q5" />
                  <Label htmlFor="q5">5 題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10" id="q10" />
                  <Label htmlFor="q10">10 題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50" id="q50" />
                  <Label htmlFor="q50">50 題</Label>
                </div>
              </RadioGroup>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-medium text-neutral-800">使用 API 生成新影片</div>
                  <p className="text-sm text-neutral-500">
                    {settings.forceRefresh 
                      ? '將重新搜尋新影片' 
                      : '有已儲存影片時將優先使用'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.forceRefresh}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, forceRefresh: checked }))}
                    id="force-refresh"
                  />
                  <Label htmlFor="force-refresh" className="text-neutral-500">
                    {settings.forceRefresh && <RefreshCw className="w-4 h-4 text-red-600" />}
                  </Label>
                </div>
              </div>
            </div>
            
            <Button 
              className="group bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full"
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
