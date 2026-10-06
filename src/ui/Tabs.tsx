import { useEffect, useRef } from 'react';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/secondary-tab.js';
import { Icon } from './Icon.js';
import type { CSSProperties } from 'react';

export interface TabItem {
  label: string;
  icon?: string;
  badge?: string | number;
}

interface TabsProps {
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  tabs: TabItem[];
  variant?: 'primary' | 'secondary';
  className?: string;
  style?: CSSProperties;
}

export function Tabs({
  activeTabIndex,
  onTabChange,
  tabs,
  variant = 'primary',
  className,
  style,
}: TabsProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onTabChange(el.activeTabIndex);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onTabChange]);

  useEffect(() => {
    if (ref.current && ref.current.activeTabIndex !== activeTabIndex) {
      ref.current.activeTabIndex = activeTabIndex;
    }
  }, [activeTabIndex]);

  return (
    <md-tabs
      ref={ref}
      active-tab-index={activeTabIndex}
      class={className}
      style={style}
    >
      {tabs.map((tab, idx) =>
        variant === 'secondary' ? (
          <md-secondary-tab key={idx} active={idx === activeTabIndex}>
            {tab.icon && <Icon slot="icon" name={tab.icon} />}
            {tab.label}
          </md-secondary-tab>
        ) : (
          <md-primary-tab key={idx} active={idx === activeTabIndex}>
            {tab.icon && <Icon slot="icon" name={tab.icon} />}
            {tab.label}
          </md-primary-tab>
        )
      )}
    </md-tabs>
  );
}
