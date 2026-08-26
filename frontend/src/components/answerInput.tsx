interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function AnswerInput({
  value,
  onChange,
  disabled,
  placeholder = "Type your answer here...",
}: AnswerInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={10}
      className="w-full resize-none rounded-xl2 border border-ink/5 bg-white p-5 text-[15px] leading-relaxed text-ink shadow-card placeholder:text-ink/30 disabled:bg-surface disabled:text-ink/50"
    />
  );
}