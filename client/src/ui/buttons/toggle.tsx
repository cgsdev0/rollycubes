import { styled } from 'stitches.config';

const SwitchLabel = styled('label', {
  position: 'relative',
  display: 'inline-block',
  width: 60,
  height: 34,
  '& input': {
    opacity: 0,
    width: 0,
    height: 0,
    '&:checked + span': {
      backgroundColor: '$brand',
    },
    '&:focus + span': {
      boxShadow: '0 0 1px $brand',
    },
    '&:checked + span:before': {
      transform: 'translateX(26px)',
    },
  },
  '& span': {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '$gray500',
    transition: '.4s',
    borderRadius: 34,
    '&:before': {
      borderRadius: '50%',
      position: 'absolute',
      content: '',
      height: 26,
      width: 26,
      left: 4,
      bottom: 4,
      backgroundColor: '$primary',
      transition: '.4s',
    },
  },
});

const Fieldset = styled('fieldset', {
  border: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'none',
  '& label': {
    color: '$primary',
  },
  '&:has(:focus-visible)': {
    border: '2px solid $primary',
    margin: -2,
  },
});

interface Props {
  id: string;
  desc: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const ToggleSwitch: React.FC<Props> = ({
  id,
  desc,
  checked,
  onChange,
}) => {
  return (
    <Fieldset>
      <SwitchLabel>
        <input type="checkbox" id={id} checked={checked} onChange={onChange} />
        <span></span>
      </SwitchLabel>
      <label htmlFor={id}>{desc}</label>
    </Fieldset>
  );
};
