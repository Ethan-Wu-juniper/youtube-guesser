import { VideoData } from "../types";

export const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const count = 50;

function generateRandom() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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


export const getRandomVideo = async (): Promise<VideoData> => {
  try {
    if (!API_KEY) {
      throw new Error("YouTube API Key 未設置，請在 .env 文件中配置 VITE_YOUTUBE_API_KEY");
    }

    const videoIds = await searchRandomVideos();
    if (videoIds.length === 0) {
      throw new Error("無法獲取影片 ID");
    }

    const randomIndex = Math.floor(Math.random() * videoIds.length);
    const randomVideoId = videoIds[randomIndex];

    const videoInfo = await getVideoInfo(randomVideoId);
    
    if (!videoInfo) {
      throw new Error("無法獲取影片資訊");
    }
    
    return videoInfo as VideoData;
  } catch (error) {
    console.error("獲取隨機影片錯誤:", error);
    throw error;
  }
};

export const calculateScore = (guess: number, actual: number): number => {
  const difference = Math.abs(guess - actual);
  const percentageDifference = (difference / actual) * 100;
  
  if (percentageDifference < 10) return 100;
  if (percentageDifference < 20) return 80;
  if (percentageDifference < 30) return 60;
  if (percentageDifference < 50) return 40;
  if (percentageDifference < 70) return 20;
  return 10;
};

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
