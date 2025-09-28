import { VideoData } from "../types";

// 由於我們沒有真正的 YouTube API 金鑰，這裡使用預先定義的影片列表
const popularVideos: VideoData[] = [
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
  },
  {
    id: "RgKAFK5djSk",
    title: "Wiz Khalifa - See You Again ft. Charlie Puth",
    viewCount: 5766477126
  },
  {
    id: "pRpeEdMmmQ0",
    title: "Shakira - Waka Waka (This Time for Africa)",
    viewCount: 3434712211
  },
  {
    id: "CevxZvSJLk8",
    title: "Katy Perry - Roar",
    viewCount: 3806582926
  },
  {
    id: "l0U7SxXHkPY",
    title: "Justin Bieber - Baby ft. Ludacris",
    viewCount: 2855090453
  },
  {
    id: "PT2_F-1esPk",
    title: "Adele - Hello",
    viewCount: 3224302307
  }
];

// 獲取隨機影片
export const getRandomVideo = (): Promise<VideoData> => {
  return new Promise((resolve) => {
    // 模擬網絡請求延遲
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * popularVideos.length);
      resolve(popularVideos[randomIndex]);
    }, 1000);
  });
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
