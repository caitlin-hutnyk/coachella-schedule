import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export function Select({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const current = options.find(o => o.value === value);
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className="view-select-trigger" aria-label="View">
        <SelectPrimitive.Value>{current?.label}</SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown size={14} strokeWidth={2.5} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="view-select-content" position="popper" sideOffset={4}>
          <SelectPrimitive.Viewport>
            {options.map(opt => (
              <SelectPrimitive.Item key={opt.value} value={opt.value} className="view-select-item">
                <SelectPrimitive.ItemIndicator>
                  <Check size={12} strokeWidth={2.5} />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
