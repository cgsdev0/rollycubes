import { styled } from 'stitches.config';

const Fieldset = styled('fieldset', {
  border: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  transition: 'none',
  '& label': {
    color: '$primary',
  },
  '&:has(:focus-visible)': {
    border: '2px solid $primary',
    margin: -2,
  },
});

const Textarea = styled('textarea', {
  flex: 1,
  backgroundColor: '$gray900',
  '@bp0': {
    backgroundColor: '$gray800',
  },
  border: 0,
  resize: 'none',
  fontFamily: 'Amiko',
  padding: 8,
  borderRadius: 8,
  color: '$primaryDimmed',
  '&:focus-visible': {
    color: '$primary',
  },
});

interface Props {
  id: string;
  desc: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}

export const TextArea: React.FC<Props> = ({
  placeholder,
  id,
  desc,
  value,
  onChange,
}) => {
  return (
    <Fieldset>
      <label htmlFor={id}>{desc}</label>
      <Textarea
        placeholder={placeholder}
        id={id}
        value={value}
        onChange={onChange}
      />
    </Fieldset>
  );
};
