import { Link } from 'react-router-dom';
import { css } from 'stitches.config';

const centered = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
});

interface Props {
  error: string;
}
export const GenericErrorPage: React.FC<Props> = ({ error }) => {
  return (
    <div className="flex flex-col">
      <h1>Error</h1>
      <p>{error}</p>
      <div className={centered()}>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};
