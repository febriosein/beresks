import { useEffect, useMemo, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import { Icon } from './Icon.js';
import { useKeyboardInset } from '../lib/useKeyboardInset.js';
import { haptic } from '../lib/haptic.js';
import type { CSSProperties } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  supportingText?: string;
  icon?: string;
  /** Warna titik penanda di kiri (mis. warna mata kuliah) */
  color?: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  className?: string;
  style?: CSSProperties;
}

/** Ambang jumlah opsi sebelum kolom pencarian ditampilkan di picker mobile */
const SEARCH_THRESHOLD = 6;

function useIsMobile(maxWidth = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= maxWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [maxWidth]);

  return isMobile;
}

export function Select(props: SelectProps) {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSelect {...props} /> : <DesktopSelect {...props} />;
}

/* -------------------------------------------------------------------------- */
/*  Desktop: Material Web outlined select (menu bekerja baik di layar lebar)   */
/* -------------------------------------------------------------------------- */

function DesktopSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  required,
  supportingText,
  error,
  errorText,
  className,
  style,
}: SelectProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onChange(el.value);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onChange]);

  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  return (
    <md-outlined-select
      ref={ref}
      label={label}
      value={value}
      disabled={disabled}
      required={required}
      supporting-text={supportingText}
      error={error}
      error-text={errorText}
      class={className}
      style={style}
    >
      {options.map((opt) => (
        <md-select-option
          key={opt.value}
          value={opt.value}
          selected={opt.value === value}
        >
          {opt.icon && <Icon slot="start" name={opt.icon} />}
          <div slot="headline">{opt.label}</div>
          {opt.supportingText && <div slot="supporting-text">{opt.supportingText}</div>}
        </md-select-option>
      ))}
    </md-outlined-select>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile: field pemicu + bottom sheet picker yang bisa di-scroll & dicari    */
/* -------------------------------------------------------------------------- */

function MobileSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  required,
  supportingText,
  error,
  errorText,
  className,
  style,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const keyboardInset = useKeyboardInset();
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const showSearch = options.length > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.supportingText?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  // Reset pencarian setiap picker dibuka, lalu gulir ke opsi terpilih
  useEffect(() => {
    if (!open) return;
    setQuery('');
    const t = window.setTimeout(() => {
      const el = listRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
      el?.scrollIntoView({ block: 'center' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const bukaPicker = () => {
    if (disabled) return;
    haptic('light');
    setOpen(true);
  };

  const pilih = (val: string) => {
    haptic('selection');
    if (val !== value) onChange(val);
    setOpen(false);
  };

  const borderColor = error
    ? 'var(--md-sys-color-error)'
    : open
    ? 'var(--md-sys-color-primary)'
    : 'var(--md-sys-color-outline)';

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      {/* Field pemicu bergaya M3 outlined */}
      <button
        type="button"
        onClick={bukaPicker}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selectedOption?.label ?? 'belum dipilih'}`}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px 8px 16px',
          background: 'transparent',
          border: `${open || error ? 2 : 1}px solid ${borderColor}`,
          borderRadius: 'var(--md-sys-shape-corner-extra-small, 4px)',
          color: 'var(--md-sys-color-on-surface)',
          fontFamily: 'var(--md-ref-typeface-plain)',
          textAlign: 'left',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.38 : 1,
          boxSizing: 'border-box',
        }}
      >
        {selectedOption?.color && (
          <span
            aria-hidden
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: selectedOption.color,
              flexShrink: 0,
            }}
          />
        )}

        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              fontSize: '12px',
              lineHeight: '16px',
              marginBottom: '2px',
              color: error
                ? 'var(--md-sys-color-error)'
                : open
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            {label}
            {required && ' *'}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 'var(--md-sys-typescale-body-large-size, 16px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: selectedOption
                ? 'var(--md-sys-color-on-surface)'
                : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            {selectedOption?.label ?? 'Pilih…'}
          </span>
          {selectedOption?.supportingText && (
            <span
              style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--md-sys-color-on-surface-variant)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}
            >
              {selectedOption.supportingText}
            </span>
          )}
        </span>

        <Icon
          name="arrow_drop_down"
          size="24px"
          color="var(--md-sys-color-on-surface-variant)"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
            flexShrink: 0,
          }}
        />
      </button>

      {(errorText && error) || supportingText ? (
        <div
          style={{
            fontSize: '12px',
            padding: '4px 16px 0',
            color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          {error && errorText ? errorText : supportingText}
        </div>
      ) : null}

      {/* Picker bottom sheet */}
      <Drawer.Root open={open} onOpenChange={setOpen} noBodyStyles>
        <Drawer.Portal>
          <Drawer.Overlay
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              zIndex: 200,
            }}
          />
          <Drawer.Content
            aria-describedby={undefined}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 201,
              maxHeight: '85dvh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              color: 'var(--md-sys-color-on-surface)',
              borderTopLeftRadius: 'var(--md-sys-shape-corner-extra-large, 28px)',
              borderTopRightRadius: 'var(--md-sys-shape-corner-extra-large, 28px)',
              boxShadow: 'var(--bs-elev-3, 0 -2px 10px rgba(0, 0, 0, 0.1))',
              outline: 'none',
            }}
          >
            {/* Handle */}
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <Drawer.Handle
                style={{
                  width: '32px',
                  height: '4px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--md-sys-color-outline-variant)',
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 12px 8px 20px',
                flexShrink: 0,
              }}
            >
              <Drawer.Title
                style={{
                  margin: 0,
                  fontFamily: 'var(--md-ref-typeface-brand)',
                  fontSize: 'var(--md-sys-typescale-title-large-size, 22px)',
                  fontWeight: 700,
                }}
              >
                Pilih {label}
              </Drawer.Title>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '50%',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  cursor: 'pointer',
                }}
              >
                <Icon name="close" size="24px" />
              </button>
            </div>

            {/* Pencarian */}
            {showSearch && (
              <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '48px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                  }}
                >
                  <Icon name="search" size="20px" color="var(--md-sys-color-on-surface-variant)" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Cari ${label.toLowerCase()}…`}
                    enterKeyHint="search"
                    autoComplete="off"
                    autoCorrect="off"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: 'var(--md-sys-color-on-surface)',
                      fontFamily: 'var(--md-ref-typeface-plain)',
                      // 16px mencegah iOS auto-zoom saat fokus
                      fontSize: '16px',
                    }}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="Hapus pencarian"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        display: 'flex',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon name="close" size="18px" />
                    </button>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    padding: '6px 6px 0',
                  }}
                >
                  {filtered.length} dari {options.length} pilihan
                </div>
              </div>
            )}

            {/* Daftar opsi (scrollable) */}
            <div
              ref={listRef}
              role="listbox"
              aria-label={label}
              data-vaul-no-drag
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                padding: '4px 8px',
                paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px) + ${keyboardInset}px)`,
              }}
            >
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    fontSize: 'var(--md-sys-typescale-body-medium-size, 14px)',
                  }}
                >
                  Tidak ada yang cocok dengan “{query}”
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      onClick={() => pilih(opt.value)}
                      style={{
                        width: '100%',
                        minHeight: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '10px 12px',
                        margin: '2px 0',
                        border: 'none',
                        borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
                        background: isSelected
                          ? 'var(--md-sys-color-secondary-container)'
                          : 'transparent',
                        color: isSelected
                          ? 'var(--md-sys-color-on-secondary-container)'
                          : 'var(--md-sys-color-on-surface)',
                        textAlign: 'left',
                        fontFamily: 'var(--md-ref-typeface-plain)',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {opt.color ? (
                        <span
                          aria-hidden
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: opt.color,
                            flexShrink: 0,
                          }}
                        />
                      ) : opt.icon ? (
                        <Icon name={opt.icon} size="22px" />
                      ) : null}

                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 'var(--md-sys-typescale-body-large-size, 16px)',
                            fontWeight: isSelected ? 700 : 500,
                            lineHeight: 1.35,
                            wordBreak: 'break-word',
                          }}
                        >
                          {opt.label}
                        </span>
                        {opt.supportingText && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: '13px',
                              marginTop: '2px',
                              lineHeight: 1.35,
                              color: isSelected
                                ? 'var(--md-sys-color-on-secondary-container)'
                                : 'var(--md-sys-color-on-surface-variant)',
                              opacity: isSelected ? 0.85 : 1,
                              wordBreak: 'break-word',
                            }}
                          >
                            {opt.supportingText}
                          </span>
                        )}
                      </span>

                      {isSelected && <Icon name="check" size="22px" />}
                    </button>
                  );
                })
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
