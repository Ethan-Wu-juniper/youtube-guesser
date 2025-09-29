import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { 
  calculateScore, 
  formatNumber, 
  getVideoInfo
} from "@/lib/services/videoService";

interface GameProps {
  questionCount: number;
  timeLimit: number | null;
  onBackToHome: () => void;
  videoIds: string[];
}

const Game = ({ questionCount, timeLimit, onBackToHome, videoIds }: GameProps) => {
  const [score, setScore] = useState<number>(0);
  const [videoIndex, setVideoIndex] = useState<number>(-1);
  const [guessValue, setGuessValue] = useState<number>(0);
  const [status, setStatus] = useState<"playing" | "result">("playing");
  const [viewCount, setViewCount] = useState<number>(0);

  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  
  const guessInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<any>(null);
  
  const startTimer = (
    startFrom: number,
    onTimesUp: () => void
  ) => {
    clearInterval(timerIntervalRef.current!);
    setTimeLeft(startFrom);
    
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          onTimesUp();
          return 0;
        } 
        
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };
  
  const handleGuessSubmit = () => {
    const score = calculateScore(guessValue, viewCount);
    setScore(prev => prev + score);
    setGuessValue(0);
    setStatus("result");
    startTimer(5, handleNextRound);
  };

  const handleNextRound = async () => {
    if (videoIndex >= questionCount - 1) {
      setGameOver(true);
    } else {
      setStatus('playing');
      startTimer(timeLimit, handleGuessSubmit);
      const info = await getVideoInfo(videoIds[videoIndex + 1]);
      setViewCount(info.viewCount);
      setVideoIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    handleNextRound();
    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);



  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value) {
      setGuessValue(parseInt(value, 10));
    } else {
      setGuessValue(0);
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
      playlist: videoIds[videoIndex]
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
              總分: {score}
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
              回合: {videoIndex + 1}/{questionCount}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center rounded-lg overflow-hidden shadow-lg relative w-fit mx-auto">
            <YouTube 
              videoId={videoIds[videoIndex]} 
              opts={opts} 
              onReady={onPlayerReady}
              className="rounded-lg overflow-hidden"
            />
            {status !== 'result' && (
              <div 
                className="absolute inset-0 bg-transparent cursor-not-allowed"
              />
            )}
          </div>
          <Separator />
          {status === 'playing' && (
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
          
          {status === 'result' && videoIds[videoIndex] && (
            <div className="space-y-4 text-center">
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-700">你的猜測</div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatNumber(guessValue || 0)}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-700">實際觀看次數</div>
                  <div className="text-xl font-bold text-green-900">
                    {formatNumber(viewCount)}
                  </div>
                </div>
              </div>
              
              <div className="text-lg">
                <div className="flex justify-center items-center gap-2 mt-2">
                  {Math.abs(guessValue - viewCount) < viewCount * 0.1 ? (
                    <span className="text-green-600 font-bold">非常接近！</span>
                  ) : Math.abs(guessValue - viewCount) < viewCount * 0.3 ? (
                    <span className="text-blue-600 font-bold">還不錯！</span>
                  ) : (
                    <span className="text-orange-600 font-bold">差距有點大！</span>
                  )}
                  <span>本輪得分:</span>
                  <span className="text-xl font-bold ml-2">
                    +{calculateScore(guessValue || 0, viewCount)}
                  </span>
                </div>
              </div>
              
              {gameOver ? (
                <div className="space-y-4">
                  <div className="text-xl font-bold text-red-600">
                    遊戲結束！
                  </div>
                  <div className="text-lg">
                    總分: <span className="font-bold">{score}</span>
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
                        setScore(0);
                        setVideoIndex(0);
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
