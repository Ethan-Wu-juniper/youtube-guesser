import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { GameState } from "@/lib/types";
import { getRandomVideo, calculateScore, formatNumber } from "@/lib/services/videoService";

const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    currentVideo: null,
    userGuess: null,
    score: 0,
    attempts: 0
  });
  
  const guessInputRef = useRef<HTMLInputElement>(null);
  const [guessValue, setGuessValue] = useState<string>('');
  const playerRef = useRef<any>(null);
  
  const fetchRandomVideo = async () => {
    setGameState(prev => ({
      ...prev,
      status: 'loading',
      currentVideo: null,
      userGuess: null
    }));
    
    const video = await getRandomVideo();
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      currentVideo: video
    }));
  };
  
  useEffect(() => {
    fetchRandomVideo();
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
  };
  
  const handleNextRound = () => {
    fetchRandomVideo();
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
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-neutral-900">
            YouTube Guesser
          </CardTitle>
          <div className="mt-2 text-sm text-neutral-500">
            總分: {gameState.score} | 回合: {gameState.attempts}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center rounded-lg overflow-hidden shadow-lg relative w-fit">
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default Game;
