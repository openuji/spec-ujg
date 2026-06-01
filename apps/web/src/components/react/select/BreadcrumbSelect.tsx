import { navigate } from 'astro:transitions/client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/react/ui/select';
import type { EditorDraftDocumentFamily } from '@/lib/load';

type Option = { label: string; href: string; family: EditorDraftDocumentFamily };

export default function BreadcrumbSelect(props: { valueHref: string; options: Option[] }) {
  const { valueHref, options } = props;
  const specOptions = options.filter((option) => option.family === 'spec');
  const moduleOptions = options.filter((option) => option.family === 'module');
  const extensionOptions = options.filter((option) => option.family === 'extension');

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
        <SelectGroup>
          {specOptions.map((o) => (
            <SelectItem
              key={o.href}
              value={o.href}
              className="
                data-[state=checked]:bg-accent-soft/80
                data-[state=checked]:text-foreground
              "
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>

        {moduleOptions.length > 0 && (
          <>
            <div className="px-1 pt-2 pb-1">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Modules
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            <SelectGroup className="mx-1 mb-1 rounded-md border border-border/70 bg-accent/10 p-1">
              {moduleOptions.map((o) => (
                <SelectItem
                  key={o.href}
                  value={o.href}
                  className="
                    data-[highlighted]:bg-accent/15
                    data-[state=checked]:bg-accent/20
                    data-[state=checked]:text-foreground
                  "
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}

        {extensionOptions.length > 0 && (
          <>
            <div className="px-1 pt-2 pb-1">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Extensions
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            <SelectGroup className="mx-1 mb-1 rounded-md border border-border/70 bg-accent/10 p-1">
              {extensionOptions.map((o) => (
                <SelectItem
                  key={o.href}
                  value={o.href}
                  className="
                    data-[highlighted]:bg-accent/15
                    data-[state=checked]:bg-accent/20
                    data-[state=checked]:text-foreground
                  "
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
