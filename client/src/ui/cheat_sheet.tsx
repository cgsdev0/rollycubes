import { css, styled } from 'stitches.config';

const ScoreTableContainer = styled('div', {
  padding: 6,
});

const ScoreTable = styled('table', {
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  height: 90,
  '& tr td': {
    height: 26,
  },
  '& tr:last-child td': {
    borderBottom: 0,
    height: 19,
    verticalAlign: 'bottom',
    paddingBottom: 2,
  },
  '& tr td:last-child': {
    borderRight: 0,
  },
  '& tr:last-child': {},
  '& td': {
    '&:hover': {
      color: '$primary',
    },
    textAlign: 'center',
    fontSize: 10,
    color: '$primaryDimmed',
    padding: 0,
    borderBottom: '1px dotted $primaryDimmed',
    borderRight: '1px dotted $primaryDimmed',
    '&.blank': {
      border: 0,
    },
  },
});
const scoreTableTitle = css({
  color: '$primaryDimmed',
  textAlign: 'center',
  fontSize: 12,
  marginTop: 19,
});

export const CheatSheet = () => {
  return (
    <ScoreTableContainer
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ScoreTable style={{ width: 90 }}>
        <tbody>
          <tr>
            <td className="blank" colSpan={2}>
              &nbsp;
            </td>
            <td colSpan={2}>33</td>
          </tr>
          <tr>
            <td className="blank" colSpan={1}>
              &nbsp;
            </td>
            <td colSpan={2}>66</td>
            <td colSpan={2}>67</td>
          </tr>
          <tr>
            <td colSpan={2}>98</td>
            <td colSpan={2}>99</td>
            <td colSpan={2}>100</td>
          </tr>
        </tbody>
      </ScoreTable>
      <p className={scoreTableTitle()}>Winning Scores</p>
    </ScoreTableContainer>
  );
};
