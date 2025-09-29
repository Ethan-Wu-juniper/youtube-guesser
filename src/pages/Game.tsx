import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { GameState, GameSettings } from "@/lib/types";
import { 
  getRandomVideo, 
  calculateScore, 
  formatNumber, 
  getStoredVideos, 
  getGameSettings 
} from "@/lib/services/videoService";

interface GameProps {
  questionCount: number;
  timeLimit: number | null;
  onBackToHome: () => void;
}

const Game = ({ questionCount, timeLimit, onBackToHome }: GameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    currentVideo: null,
    userGuess: null,
    score: 0,
    attempts: 0
  });
  
  // 用來追蹤已經使用過的影片索引
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  // 總影片數
  const [totalVideos, setTotalVideos] = useState<number>(0);
  // 遊戲設置
  const [settings, setSettings] = useState({ 
    questionCount, 
    forceRefresh: false, 
    timeLimit 
  });
  // 是否遊戲結束
  const [gameOver, setGameOver] = useState(false);
  // 倒計時
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // 倒計時間隔ID
  const timerIntervalRef = useRef<number | null>(null);
  
  const guessInputRef = useRef<HTMLInputElement>(null);
  const [guessValue, setGuessValue] = useState<string>('');
  const playerRef = useRef<any>(null);
  
  // 在組件載入時獲取總影片數
  useEffect(() => {
    const videos = getStoredVideos();
    setTotalVideos(videos.length);
  }, []);
  
  // 當 props 變化時更新設置
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      questionCount,
      timeLimit
    }));
  }, [questionCount, timeLimit]);
  
  // 開始倒計時
  const startTimer = () => {
    // 清除之前的計時器
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // 如果沒有時間限制，不啟動計時器
    if (settings.timeLimit === null) {
      setTimeLeft(null);
      return;
    }
    
    // 設置初始時間
    setTimeLeft(settings.timeLimit);
    
    // 開始計時
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        
        if (prev <= 1) {
          // 時間到，清除計時器並自動提交答案
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          
          // 如果用戶還沒提交答案，自動提交 (以0為猜測值)
          if (gameState.status === 'playing') {
            handleTimeUp();
          }
          return 0;
        } 
        
        // 如果剩餘時間是 6 秒，且當前狀態是結果頁面，自動進入下一題
        if (prev === 6 && gameState.status === 'result') {
          handleNextRound();
        }
        
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };
  
  // 時間到自動提交
  const handleTimeUp = () => {
    if (!gameState.currentVideo) return;
    
    // 使用 0 作為猜測值
    const score = calculateScore(0, gameState.currentVideo.viewCount);
    
    setGameState(prev => ({
      ...prev,
      status: 'result',
      userGuess: 0,
      score: prev.score + score,
      attempts: prev.attempts + 1
    }));
    
    setGuessValue('');
  };

  const fetchRandomVideo = async () => {
    // 重置所有狀態
    setGameState(prev => ({
      ...prev,
      status: 'loading',
      currentVideo: null,
      userGuess: null
    }));
    
    try {
      const videos = getStoredVideos();
      
      // 如果所有影片都已經使用過或沒有儲存的影片
      if (usedIndices.length >= videos.length) {
        // 如果已經使用過所有儲存的影片，則重置已使用索引
        setUsedIndices([]);
      }
      
      // 獲取未使用的影片
      let availableIndices = Array.from({ length: videos.length }, (_, i) => i)
        .filter(index => !usedIndices.includes(index));
      
      // 如果沒有可用的影片索引，直接獲取隨機影片
      if (availableIndices.length === 0) {
        const video = await getRandomVideo();
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentVideo: video
        }));
        return;
      }
      
      // 從可用索引中隨機選一個
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const video = videos[randomIndex];
      
      // 將使用過的索引加入已使用列表
      setUsedIndices(prev => [...prev, randomIndex]);
      
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentVideo: video
      }));
      
      // 開始倒計時
      startTimer();
    } catch (error) {
      console.error("獲取影片時出錯:", error);
      // 如果出錯，使用傳統方法獲取影片
      const video = await getRandomVideo();
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentVideo: video
      }));
    }
  };
  
  useEffect(() => {
    fetchRandomVideo();
    
    // 清理計時器
    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  
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
    
    // 如果是在倒計時的情況下，在結果顯示 5 秒後自動進入下一題
    if (settings.timeLimit !== null) {
      // 重新設置倒計時為 5 秒，用於自動進入下一題
      setTimeLeft(5);
    }
  };
  
  const handleNextRound = () => {
    // 檢查是否達到題目數量限制
    if (gameState.attempts >= settings.questionCount - 1) {
      // 已經完成所有題目
      setGameOver(true);
    } else {
      // 繼續下一題
      fetchRandomVideo();
    }
  };
  
  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value) {
      setGuessValue(formatNumber(parseInt(value, 10)));
    } else {
      setGuessValue('');
    }
  };
  
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      loop: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playlist: gameState.currentVideo?.id
    },
  };
  
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-xl">
        <CardHeader className="py-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-red-600">
              總分: {gameState.score}
            </div>
            
            <div className="flex-1 flex justify-center">
              {timeLeft !== null ? (
                <div className={`flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-600 font-bold animate-pulse' : 'text-neutral-700'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-bold">{timeLeft} 秒</span>
                </div>
              ) : (
                <div className="text-lg font-bold text-neutral-700">無時限</div>
              )}
            </div>
            
            <div className="text-lg font-bold text-neutral-700">
              回合: {gameState.attempts + 1}/{settings.questionCount}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center rounded-lg overflow-hidden shadow-lg relative w-fit mx-auto">
            {gameState.status === 'loading' ? (
              <div className="bg-neutral-200 h-[390px] w-[640px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : gameState.currentVideo ? (
              <>
                <YouTube 
                  videoId={gameState.currentVideo.id} 
                  opts={opts} 
                  onReady={onPlayerReady}
                  className="rounded-lg overflow-hidden"
                />
                {gameState.status !== 'result' && (
                  <div 
                    className="absolute inset-0 bg-transparent cursor-not-allowed"
                  />
                )}
              </>
            ) : null}
          </div>
          <Separator />
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
          
          {gameState.status === 'result' && gameState.currentVideo && (
            <div className="space-y-4 text-center">
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
                <div className="flex justify-center items-center gap-2 mt-2">
                  {Math.abs(gameState.userGuess - gameState.currentVideo.viewCount) < gameState.currentVideo.viewCount * 0.1 ? (
                    <span className="text-green-600 font-bold">非常接近！</span>
                  ) : Math.abs(gameState.userGuess - gameState.currentVideo.viewCount) < gameState.currentVideo.viewCount * 0.3 ? (
                    <span className="text-blue-600 font-bold">還不錯！</span>
                  ) : (
                    <span className="text-orange-600 font-bold">差距有點大！</span>
                  )}
                  <span>本輪得分:</span>
                  <span className="text-xl font-bold ml-2">
                    +{calculateScore(gameState.userGuess || 0, gameState.currentVideo.viewCount)}
                  </span>
                </div>
              </div>
              
              {gameOver ? (
                <div className="space-y-4">
                  <div className="text-xl font-bold text-red-600">
                    遊戲結束！
                  </div>
                  <div className="text-lg">
                    總分: <span className="font-bold">{gameState.score}</span>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={onBackToHome}
                      className="bg-neutral-600 hover:bg-neutral-700 text-white px-8"
                    >
                      回首頁
                    </Button>
                    <Button 
                      onClick={() => {
                        setGameOver(false);
                        setGameState({
                          status: 'loading',
                          currentVideo: null,
                          userGuess: null,
                          score: 0,
                          attempts: 0
                        });
                        setUsedIndices([]);
                        fetchRandomVideo();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-8"
                    >
                      再玩一次
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleNextRound}
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                >
                  下一個影片
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Game;
