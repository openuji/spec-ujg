import { navigate } from 'astro:transitions/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/react/ui/select';

type Option = { label: string; href: string };

export default function BreadcrumbSelect(props: { valueHref: string; options: Option[] }) {
  const { valueHref, options } = props;

  return (
    <Select
      value={valueHref}
      onValueChange={(href) => {
        if (href !== valueHref) navigate(href);
      }}
    >
      {/* Trigger should look like breadcrumb text */}
      <SelectTrigger
        className="h-auto w-auto gap-1 
                   text-secondary-foreground hover:text-accent transition-[color,box-shadow] duration-200"
        aria-label="Switch section"
      >
        <SelectValue />
      </SelectTrigger>

      {/* This is the key: item-aligned wraps around the selected item */}
      <SelectContent position="item-aligned" align="start" className="min-w-[13rem]">
        {options.map((o) => (
          <SelectItem
            key={o.href}
            value={o.href}
            className="
              data-[state=checked]:bg-zinc-100
              data-[state=checked]:text-zinc-900
            "
          >
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
