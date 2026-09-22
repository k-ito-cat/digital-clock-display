import { describeScrimValue, SCRIM_VALUE_MAX, SCRIM_VALUE_MIN } from '~/lib/scrim';
import { Field } from './Field';

type Props = {
  range: number;
  amount: number;
  onRangeChange: (value: number) => void;
  onAmountChange: (value: number) => void;
};

const ScrimSlider = ({
  label,
  value,
  startLabel,
  endLabel,
  onChange,
}: {
  label: string;
  value: number;
  startLabel: string;
  endLabel: string;
  onChange: (value: number) => void;
}) => (
  <Field label={label}>
    <input
      type="range"
      aria-label={label}
      aria-valuetext={describeScrimValue(value)}
      min={SCRIM_VALUE_MIN}
      max={SCRIM_VALUE_MAX}
      step={1}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="min-h-[var(--size-hit)] w-full"
    />
    <div
      aria-hidden="true"
      className="flex justify-between text-[length:var(--text-label)] text-[var(--color-fg-secondary)]"
    >
      <span>{startLabel}</span>
      <span>{endLabel}</span>
    </div>
  </Field>
);

export const ScrimControls = ({ range, amount, onRangeChange, onAmountChange }: Props) => (
  <div className="grid gap-[var(--spacing-group)]">
    <ScrimSlider label="減光の範囲" value={range} startLabel="狭い" endLabel="広い" onChange={onRangeChange} />
    <ScrimSlider label="減光量" value={amount} startLabel="弱い" endLabel="強い" onChange={onAmountChange} />
  </div>
);
