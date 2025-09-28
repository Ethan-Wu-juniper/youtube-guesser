import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, RefreshCw, Play, Pause, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { GameState, VideoData } from "@/lib/types";
import { getRandomVideo, calculateScore, formatNumber } from "@/lib/services/videoService";

const Game = () => {
  // 遊戲狀態
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    currentVideo: null,
    userGuess: null,
    score: 0,
    attempts: 0
  });
  
  // 用戶輸入參考
  const guessInputRef = useRef<HTMLInputElement>(null);
  
  // 用戶猜測值
  const [guessValue, setGuessValue] = useState<string>('');
  
  // YouTube 播放器參考
  const playerRef = useRef<any>(null);
  
  // 獲取隨機影片
  const fetchRandomVideo = async () => {
    setGameState(prev => ({
      ...prev,
      status: 'loading',
      currentVideo: null,
      userGuess: null
    }));
    
    try {
      const video = await getRandomVideo();
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentVideo: video
      }));
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };
  
  // 首次加載時獲取影片
  useEffect(() => {
    fetchRandomVideo();
  }, []);
  
  // 處理猜測提交
  const handleGuessSubmit = () => {
    if (!guessValue || !gameState.currentVideo) return;
    
    const guess = parseInt(guessValue.replace(/,/g, ''), 10);
    
    if (isNaN(guess)) return;
    
    const score = calculateScore(guess, gameState.currentVideo.viewCount);
    
    setGameState(prev => ({
      ...prev,
      status: 'result',
      userGuess: guess,
      score: prev.score + score,
      attempts: prev.attempts + 1
    }));
    
    setGuessValue('');
  };
  
  // 暫停/播放影片
  const toggleVideoPlay = () => {
    if (!playerRef.current) return;
    
    const player = playerRef.current.getInternalPlayer();
    
    if (player.getPlayerState() === 1) { // 1 = playing
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };
  
  // 開始下一輪
  const handleNextRound = () => {
    fetchRandomVideo();
  };
  
  // 重新開始遊戲
  const handleRestart = () => {
    setGameState({
      status: 'loading',
      currentVideo: null,
      userGuess: null,
      score: 0,
      attempts: 0
    });
    fetchRandomVideo();
  };
  
  // 格式化用戶輸入數字
  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 移除所有非數字字符
    const value = e.target.value.replace(/\D/g, '');
    
    // 格式化數字並設置狀態
    if (value) {
      setGuessValue(formatNumber(parseInt(value, 10)));
    } else {
      setGuessValue('');
    }
  };
  
  // YouTube 播放器選項
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    },
  };
  
  // 處理 YouTube 播放器就緒
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-neutral-900">
            YouTube Guesser
          </CardTitle>
          <p className="text-neutral-600 mt-2">
            猜測這個 YouTube 影片有多少觀看次數？
          </p>
          
          <div className="mt-2 text-sm text-neutral-500">
            總分: {gameState.score} | 回合: {gameState.attempts}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 影片播放區域 */}
          <div className="flex justify-center rounded-lg overflow-hidden shadow-lg">
            {gameState.status === 'loading' ? (
              <div className="bg-neutral-200 h-[390px] w-[640px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : gameState.currentVideo ? (
              <YouTube 
                videoId={gameState.currentVideo.id} 
                opts={opts} 
                onReady={onPlayerReady}
                className="rounded-lg overflow-hidden"
              />
            ) : null}
          </div>
          
          {/* 影片標題 */}
          {gameState.currentVideo && (
            <div className="text-center font-semibold text-lg">
              {gameState.currentVideo.title}
            </div>
          )}
          
          {/* 控制按鈕 */}
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleVideoPlay}
              disabled={!gameState.currentVideo}
            >
              <Play className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleVideoPlay}
              disabled={!gameState.currentVideo}
            >
              <Pause className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleNextRound}
              disabled={gameState.status === 'loading'}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRestart}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator />
          
          {/* 猜測區域 */}
          {gameState.status === 'playing' && (
            <div className="space-y-4">
              <div className="text-center text-lg font-medium">
                這個影片的觀看次數是多少？
              </div>
              
              <div className="flex gap-3 max-w-md mx-auto">
                <Input
                  ref={guessInputRef}
                  type="text"
                  placeholder="輸入數字，例如: 1,000,000"
                  value={guessValue}
                  onChange={handleGuessChange}
                  className="text-center text-lg"
                />
                
                <Button 
                  onClick={handleGuessSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!guessValue}
                >
                  猜測
                </Button>
              </div>
            </div>
          )}
          
          {/* 結果區域 */}
          {gameState.status === 'result' && gameState.currentVideo && (
            <div className="space-y-4 text-center">
              <div className="text-xl font-bold">
                結果揭曉！
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-700">你的猜測</div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatNumber(gameState.userGuess || 0)}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-700">實際觀看次數</div>
                  <div className="text-xl font-bold text-green-900">
                    {formatNumber(gameState.currentVideo.viewCount)}
                  </div>
                </div>
              </div>
              
              <div className="text-lg">
                {gameState.userGuess && gameState.currentVideo && (
                  <div>
                    差異: {Math.abs(gameState.userGuess - gameState.currentVideo.viewCount) < gameState.currentVideo.viewCount * 0.1 ? (
                      <span className="text-green-600 font-bold">非常接近！</span>
                    ) : Math.abs(gameState.userGuess - gameState.currentVideo.viewCount) < gameState.currentVideo.viewCount * 0.3 ? (
                      <span className="text-blue-600 font-bold">還不錯！</span>
                    ) : (
                      <span className="text-orange-600 font-bold">差距有點大！</span>
                    )}
                  </div>
                )}
                
                <div className="mt-2">
                  本輪得分: 
                  <span className="text-xl font-bold ml-2">
                    +{calculateScore(gameState.userGuess || 0, gameState.currentVideo.viewCount)}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleNextRound}
                className="bg-red-600 hover:bg-red-700 text-white px-8"
              >
                下一個影片
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="justify-between flex-wrap gap-4">
          <Button 
            variant="ghost"
            asChild
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </Link>
          </Button>
          
          <div className="text-xs text-neutral-500">
            這是一個模擬應用，使用預先定義的影片數據。
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Game;
