import { TEXT_COLORS } from '~/lib/colors';

/**
 * 文字色の見本。塗りは操作の装飾ではなく値そのものなので、`button.no-fill` の対象外とする。
 * 選択中は枠線で示す。色の違いだけに頼らないよう、名前を支援技術へ渡す。
 */
export const ColorPresets = ({ value, onPick }: { value: string; onPick: (color: string) => void }) => (
  <div role="radiogroup" aria-label="文字色の見本" className="color-presets">
    {TEXT_COLORS.map((color) => (
      <button
        key={color.value}
        type="button"
        role="radio"
        aria-checked={value.toLowerCase() === color.value}
        aria-label={color.label}
        title={color.label}
        className="color-swatch"
        style={{ background: color.value }}
        onClick={() => onPick(color.value)}
      />
    ))}
  </div>
);
