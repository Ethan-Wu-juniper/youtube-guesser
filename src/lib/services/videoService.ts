import { VideoData } from "../types";

// 暫時使用這個 API_KEY，實際使用時應該放在環境變數中
export const API_KEY = "你的_API_KEY";
const count = 50;

// 生成隨機字串
function generateRandom() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 搜尋隨機影片並取得影片ID
async function searchRandomVideos() {
  const random = generateRandom();
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&maxResults=${count}&part=snippet&type=video&q=${random}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const videoIds = [];
    for (const item of data.items) {
      const videoId = item.id.videoId;
      videoIds.push(videoId);
    }
    return videoIds;
  } catch (error) {
    console.error('搜尋影片錯誤:', error);
    return [];
  }
}

// 取得影片資訊
async function getVideoInfo(videoId: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&id=${videoId}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        id: videoId,
        title: video.snippet.title,
        viewCount: parseInt(video.statistics.viewCount, 10)
      };
    }
    return null;
  } catch (error) {
    console.error('取得影片資訊錯誤:', error);
    return null;
  }
}

// 由於我們還沒有設置 API_KEY，先使用預定義的影片列表作為備用
const fallbackVideos: VideoData[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up",
    viewCount: 1398759302
  },
  {
    id: "9bZkp7q19f0",
    title: "PSY - Gangnam Style",
    viewCount: 4723741980
  },
  {
    id: "JGwWNGJdvx8",
    title: "Ed Sheeran - Shape of You",
    viewCount: 5983513123
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Luis Fonsi - Despacito ft. Daddy Yankee",
    viewCount: 8190067015
  },
  {
    id: "OPf0YbXqDm0",
    title: "Mark Ronson - Uptown Funk ft. Bruno Mars",
    viewCount: 4817950990
  }
];

// 獲取隨機影片
export const getRandomVideo = async (): Promise<VideoData> => {
  try {
    if (API_KEY === "你的_API_KEY") {
      // 如果沒有設置 API_KEY，使用備用影片列表
      const randomIndex = Math.floor(Math.random() * fallbackVideos.length);
      return fallbackVideos[randomIndex];
    }
    
    // 使用 YouTube API 獲取隨機影片
    const videoIds = await searchRandomVideos();
    
    if (videoIds.length === 0) {
      throw new Error("無法獲取影片 ID");
    }
    
    // 隨機選擇一個影片 ID
    const randomIndex = Math.floor(Math.random() * videoIds.length);
    const randomVideoId = videoIds[randomIndex];
    
    // 獲取該影片的詳細信息
    const videoInfo = await getVideoInfo(randomVideoId);
    
    if (!videoInfo) {
      throw new Error("無法獲取影片資訊");
    }
    
    return videoInfo as VideoData;
  } catch (error) {
    console.error("獲取隨機影片錯誤:", error);
    
    // 發生錯誤時使用備用影片
    const randomIndex = Math.floor(Math.random() * fallbackVideos.length);
    return fallbackVideos[randomIndex];
  }
};

// 計算得分，基於猜測與實際觀看次數的接近程度
export const calculateScore = (guess: number, actual: number): number => {
  const difference = Math.abs(guess - actual);
  const percentageDifference = (difference / actual) * 100;
  
  // 差異小於 10% 得 100 分
  if (percentageDifference < 10) return 100;
  // 差異小於 20% 得 80 分
  if (percentageDifference < 20) return 80;
  // 差異小於 30% 得 60 分
  if (percentageDifference < 30) return 60;
  // 差異小於 50% 得 40 分
  if (percentageDifference < 50) return 40;
  // 差異小於 70% 得 20 分
  if (percentageDifference < 70) return 20;
  // 差異過大 得 10 分
  return 10;
};

// 格式化數字為易讀形式，例如：1,234,567
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
