import { createContext, useContext, useState } from 'react';

const VideoContext = createContext();

export function VideoProvider({ children }) {
  const [videoUrl, setVideoUrl] = useState('');
  return (
    <VideoContext.Provider value={{ videoUrl, setVideoUrl }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  return useContext(VideoContext);
}
