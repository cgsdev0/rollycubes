import { Link } from 'react-router-dom';
import { css } from 'stitches.config';

const centered = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
});

export const TabErrorPage = () => {
  return (
    <div className="flex flex-col">
      <h1>Error</h1>
      <p>You already have that room open in another tab.</p>
      <div className={centered()}>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};
