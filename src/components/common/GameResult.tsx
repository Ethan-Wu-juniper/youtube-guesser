import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, calculateScore } from "@/lib/services/videoService";
import YouTube from "react-youtube";

export interface GameRoundResult {
  videoId: string;
  videoTitle: string;
  guess: number;
  actual: number;
}

interface GameResultProps {
  results: GameRoundResult[];
  totalScore: number;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const GameResult = ({ 
  results, 
  totalScore, 
  onPlayAgain, 
  onBackToHome 
}: GameResultProps) => {
  const opts = {
    height: '195',
    width: '320',
    playerVars: {
      autoplay: 0,
      controls: 1,
      disablekb: 0,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="space-y-8 w-full">
      <div className="text-center space-y-4 pt-6">
        <h2 className="text-2xl font-bold text-red-600">遊戲結束！</h2>
        <p className="text-xl">
          總分: <span className="font-bold">{totalScore}</span>
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">遊戲紀錄</h3>
        
        <div className="grid gap-6 max-h-[60vh] overflow-y-auto px-1 py-2">
          {results.map((result, index) => (
            <Card key={index} className="overflow-hidden border border-neutral-200 shadow-md">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 flex items-center justify-center">
                    <div className="w-full max-w-[320px]">
                      <YouTube 
                        videoId={result.videoId} 
                        opts={opts}
                        className="rounded-lg overflow-hidden shadow-md"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="text-lg font-medium line-clamp-2 text-neutral-800">
                      {result.videoTitle || `影片 #${index + 1}`}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-700">你的猜測</div>
                        <div className="text-lg font-bold text-blue-900 break-all">
                          {formatNumber(result.guess)}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-700">實際觀看次數</div>
                        <div className="text-lg font-bold text-green-900 break-all">
                          {formatNumber(result.actual)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {calculateScore(result.guess, result.actual) >= 80 ? (
                          <span className="text-green-600 font-bold">非常接近！</span>
                        ) : calculateScore(result.guess, result.actual) >= 40 ? (
                          <span className="text-blue-600 font-bold">還不錯！</span>
                        ) : (
                          <span className="text-orange-600 font-bold">差距有點大！</span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        得分: <span className="text-red-600">{calculateScore(result.guess, result.actual)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center p-4">
        <Button 
          onClick={onBackToHome}
          className="bg-neutral-600 hover:bg-neutral-700 text-white px-8 w-full sm:w-auto"
        >
          回首頁
        </Button>
        <Button 
          onClick={onPlayAgain}
          className="bg-red-600 hover:bg-red-700 text-white px-8 w-full sm:w-auto"
        >
          再玩一次
        </Button>
      </div>
    </div>
  );
};
