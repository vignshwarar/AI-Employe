import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxWithLabelProps {
  text: string;
  htmlFor: string;
  disabled?: boolean;
  selected?: boolean;
  theme?: "light" | "dark";
  onCheckedChange?: (checked: boolean) => void;
}

export function CheckboxWithLabel({
  text,
  htmlFor,
  disabled,
  selected,
  onCheckedChange,
  theme = "dark",
}: CheckboxWithLabelProps): JSX.Element {
  return (
    <div
      className={`flex items-center peer ${
        disabled
          ? "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          : ""
      } mt-4`}
    >
      <Checkbox
        checked={selected}
        id={htmlFor}
        disabled={disabled}
        className={theme}
        onCheckedChange={onCheckedChange}
      />
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-4 text-white"
      >
        &#160;
        {text}
      </label>
    </div>
  );
}
