import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
              asChild
            >
              <Link to="/game" className="flex items-center gap-2">
                開始遊戲
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
