import { create } from 'zustand';
import { useEffect, useRef } from 'react';

export interface FabAction {
  label: string;
  icon: string;
  onClick: () => void;
  ariaLabel?: string;
  hide?: boolean;
}

interface FabState {
  currentAction: FabAction | null;
  setAction: (action: FabAction | null) => void;
}

export const useFabStore = create<FabState>((set) => ({
  currentAction: null,
  setAction: (currentAction) =>
    set((prev) => {
      if (!prev.currentAction && !currentAction) return prev;
      if (
        prev.currentAction?.label === currentAction?.label &&
        prev.currentAction?.icon === currentAction?.icon &&
        prev.currentAction?.hide === currentAction?.hide &&
        prev.currentAction?.ariaLabel === currentAction?.ariaLabel
      ) {
        return prev;
      }
      return { currentAction };
    }),
}));

/**
 * Hook for screens to register contextual FAB behavior safely.
 * Uses primitive dependency tracking and a ref for the latest onClick callback
 * to avoid cascading re-renders in React 19.
 */
export function useRegisterFab(action: FabAction | null) {
  const setAction = useFabStore((s) => s.setAction);
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  });

  useEffect(() => {
    if (!action) {
      setAction(null);
      return;
    }

    setAction({
      label: action.label,
      icon: action.icon,
      ariaLabel: action.ariaLabel,
      hide: action.hide,
      onClick: () => {
        actionRef.current?.onClick();
      },
    });

    return () => {
      setAction(null);
    };
  }, [action?.label, action?.icon, action?.ariaLabel, action?.hide, setAction]);
}
