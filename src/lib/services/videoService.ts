import { VideoData } from "../types";

export const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const count = 50;
const LOCAL_STORAGE_KEY = 'youtube_guesser_videos';

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

// 檢查 localStorage 是否有保存的影片資料
export const getStoredVideos = (): VideoData[] => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('解析儲存的影片資料時出錯', e);
      return [];
    }
  }
  return [];
};

// 儲存影片資料到 localStorage
export const storeVideos = (videos: VideoData[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(videos));
};

// 批量獲取影片資訊
export const fetchVideosBatch = async (): Promise<VideoData[]> => {
  try {
    if (!API_KEY) {
      console.error("YouTube API Key 未設置，請在 .env 文件中配置 VITE_YOUTUBE_API_KEY");
      return [DEFAULT_VIDEO_DATA];
    }

    const videoIds = await searchRandomVideos();
    if (videoIds.length === 0) {
      console.error("無法獲取影片 ID");
      return [DEFAULT_VIDEO_DATA];
    }

    const videos: VideoData[] = [];
    
    // 批量獲取影片資訊
    for (const videoId of videoIds) {
      const videoInfo = await getVideoInfo(videoId);
      if (videoInfo) {
        videos.push(videoInfo as VideoData);
      }
    }
    
    if (videos.length === 0) {
      console.error("無法獲取任何影片資訊");
      return [DEFAULT_VIDEO_DATA];
    }
    
    // 儲存到 localStorage
    storeVideos(videos);
    return videos;
    
  } catch (error) {
    console.error("批量獲取影片錯誤:", error);
    return [DEFAULT_VIDEO_DATA];
  }
};

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


// 預設影片資料 - 當 API 調用失敗時使用
const DEFAULT_VIDEO_DATA: VideoData = {
  id: "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
  title: "Rick Astley - Never Gonna Give You Up",
  viewCount: 1437591533 // 更新截至 2023 年的大約觀看次數
};

export const getRandomVideo = async (): Promise<VideoData> => {
  // 先從 localStorage 中獲取影片
  const storedVideos = getStoredVideos();
  
  // 如果有儲存的影片，直接從中隨機選一個
  if (storedVideos.length > 0) {
    const randomIndex = Math.floor(Math.random() * storedVideos.length);
    return storedVideos[randomIndex];
  }
  
  // 如果沒有儲存的影片，則獲取新的影片
  try {
    if (!API_KEY) {
      console.error("YouTube API Key 未設置，請在 .env 文件中配置 VITE_YOUTUBE_API_KEY");
      return DEFAULT_VIDEO_DATA;
    }

    const videoIds = await searchRandomVideos();
    if (videoIds.length === 0) {
      console.error("無法獲取影片 ID");
      return DEFAULT_VIDEO_DATA;
    }

    const randomIndex = Math.floor(Math.random() * videoIds.length);
    const randomVideoId = videoIds[randomIndex];

    const videoInfo = await getVideoInfo(randomVideoId);
    
    if (!videoInfo) {
      console.error("無法獲取影片資訊");
      return DEFAULT_VIDEO_DATA;
    }
    
    return videoInfo as VideoData;
  } catch (error) {
    console.error("獲取隨機影片錯誤:", error);
    return DEFAULT_VIDEO_DATA;
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
