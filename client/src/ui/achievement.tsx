import { styled } from 'stitches.config';
import { AchievementUnlock } from 'types/api';

const AchievementDiv = styled('div', {
  display: 'flex',
  gap: 16,
  '& img': {
    borderRadius: 4,
    imageRendering: 'pixelated',
  },
});

export const Achievement = (props: AchievementUnlock) => {
  return (
    <AchievementDiv>
      <img
        width={48}
        height={48}
        src={props.image_url || undefined}
        alt={props.description}
      />
      <div>
        <p className="header">Achievement Unlocked</p>
        <p className="name">{props.name}</p>
      </div>
    </AchievementDiv>
  );
};
