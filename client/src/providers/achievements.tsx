import { useGetAchievementListQuery } from 'api/auth';
import React from 'react';
import { useDispatch } from 'react-redux';

export const AchievementProvider: React.FC<{}> = ({ children }) => {
  const { isLoading, data, error } = useGetAchievementListQuery();
  const dispatch = useDispatch();

  const preloaded = React.useRef<any[]>([]);

  React.useEffect(() => {
    if (isLoading) return;
    if (error) {
      console.error(error);
    } else if (data) {
      dispatch({ type: 'GOT_ACHIEVEMENTS', achievements: data });
      preloaded.current = Object.values(data)
        .map((a) => {
          if (!a.image_url) return null;
          const img = new Image();
          img.src = a.image_url;
          return img;
        })
        .filter(Boolean);
    }
  }, [isLoading, data, error, preloaded]);

  if (isLoading) return null;
  return <>{children}</>;
};
