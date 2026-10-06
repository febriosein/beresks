import { useEffect, useRef } from 'react';
import '@material/web/dialog/dialog.js';
import { Icon } from './Icon.js';
import type { CSSProperties, ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  headline: string;
  icon?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Dialog({
  open,
  onClose,
  headline,
  icon,
  children,
  actions,
  className,
  style,
}: DialogProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onClose();
    };
    el.addEventListener('closed', handler);
    return () => el.removeEventListener('closed', handler);
  }, [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.show();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <md-dialog
      ref={ref}
      class={className}
      style={style}
    >
      {icon && <Icon slot="icon" name={icon} />}
      <div slot="headline">{headline}</div>
      <form slot="content" method="dialog" onSubmit={(e) => e.preventDefault()}>
        {children}
      </form>
      {actions && <div slot="actions">{actions}</div>}
    </md-dialog>
  );
}
