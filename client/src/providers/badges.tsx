import { useGetBadgeListQuery } from 'api/auth';
import React from 'react';
import { useDispatch } from 'react-redux';

export const BadgeProvider: React.FC<{}> = ({ children }) => {
  const { isLoading, data, error } = useGetBadgeListQuery();
  const dispatch = useDispatch();

  const preloaded = React.useRef<any[]>([]);

  React.useEffect(() => {
    if (isLoading) return;
    if (error) {
      console.error(error);
    } else if (data) {
      dispatch({ type: 'GOT_BADGES', badges: data });
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
