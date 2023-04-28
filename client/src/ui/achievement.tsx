import { AchievementUnlock } from 'types/store_types';

export const Achievement = (props: AchievementUnlock) => {
  return (
    <div className="achievement">
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
    </div>
  );
};
