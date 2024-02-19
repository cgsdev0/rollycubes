import { styled } from 'stitches.config';

const SliderContainer = styled('div', {
  '& input': {
    appearance: 'none',
    background: '$gray500',
    height: 16,
    borderRadius: 16,
    display: 'flex',
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      background: '$primary',
      width: 26,
      height: 26,
      borderRadius: '50%',
    },
  },
});

const Fieldset = styled('fieldset', {
  border: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  maxHeight: 34,
  transition: 'none',
  '& label': {
    color: '$primary',
    display: 'flex',
  },
  '&:has(:focus-visible)': {
    border: '2px solid $primary',
    margin: -2,
  },
});

interface Props {
  id: string;
  desc: string;
  min: number;
  max: number;
  value: number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const Slider: React.FC<Props> = ({
  id,
  desc,
  min,
  max,
  value,
  onChange,
}) => {
  return (
    <Fieldset>
      <SliderContainer>
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
        />
      </SliderContainer>
      <label htmlFor={id}>{desc}</label>
    </Fieldset>
  );
};
