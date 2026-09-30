import { MODES } from "../Constants";
import type { Mode } from "./Types";

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function Toolbar({ mode, onChange }: Props) {
  return (
    <div className="tools">
      {(Object.keys(MODES) as Mode[]).map((key) => (
        <button key={key} className={mode === key ? "on" : ""} onClick={() => onChange(key)} title={MODES[key].title}>
          {MODES[key].icon}
        </button>
      ))}
    </div>
  );
}