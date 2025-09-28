import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
          <Youtube className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-neutral-900">YouTube Guesser</span>
      </Link>
    </div>
  );
};

export default Header;
