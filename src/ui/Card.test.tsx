import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card, CardHeader, CardContent, CardActions, CardMedia } from './Card.js';

describe('Card Component (Material IO / @material/web)', () => {
  it('renders a filled card by default', () => {
    const html = renderToStaticMarkup(<Card>Konten Kartu</Card>);
    expect(html).toContain('<md-filled-card');
    expect(html).toContain('Konten Kartu');
    expect(html).toContain('m3-card');
  });

  it('renders an elevated card when variant="elevated"', () => {
    const html = renderToStaticMarkup(<Card variant="elevated">Kartu Elevated</Card>);
    expect(html).toContain('<md-elevated-card');
    expect(html).toContain('Kartu Elevated');
  });

  it('renders an outlined card when variant="outlined"', () => {
    const html = renderToStaticMarkup(<Card variant="outlined">Kartu Outlined</Card>);
    expect(html).toContain('<md-outlined-card');
    expect(html).toContain('Kartu Outlined');
  });

  it('renders md-ripple and md-focus-ring when interactive or onClick is provided', () => {
    const fn = vi.fn();
    const html = renderToStaticMarkup(
      <Card interactive onClick={fn}>
        Klik Saya
      </Card>
    );
    expect(html).toContain('<md-ripple');
    expect(html).toContain('<md-focus-ring');
    expect(html).toContain('m3-card--interactive');
    expect(html).toContain('role="button"');
    expect(html).toMatch(/tabindex="0"/i);
  });

  it('does not render ripple or interactive attributes when interactive={false}', () => {
    const html = renderToStaticMarkup(<Card interactive={false}>Statis</Card>);
    expect(html).not.toContain('<md-ripple');
    expect(html).not.toContain('<md-focus-ring');
    expect(html).not.toContain('m3-card--interactive');
  });

  it('applies custom background and outline styles via CSS tokens', () => {
    const html = renderToStaticMarkup(
      <Card
        variant="filled"
        style={{
          backgroundColor: '#006b5a',
          borderRadius: '24px',
          padding: '20px',
        }}
      >
        Custom Card
      </Card>
    );
    expect(html).toContain('--md-filled-card-container-color:#006b5a');
    expect(html).toContain('--md-filled-card-container-shape:24px');
    expect(html).toContain('padding:20px');
  });

  it('renders CardHeader, CardContent, CardActions, and CardMedia correctly', () => {
    const html = renderToStaticMarkup(
      <Card variant="outlined">
        <Card.Media src="/hero.png" alt="Gambar header" />
        <Card.Header
          headline="Mata Kuliah Algoritma"
          subhead="3 SKS · Ruang 402"
          avatar={<span>📘</span>}
          action={<button>Opsi</button>}
        />
        <Card.Content>
          <p>Materi struktur data dan analisis kompleksitas.</p>
        </Card.Content>
        <Card.Actions align="end">
          <button>Buka</button>
        </Card.Actions>
      </Card>
    );

    expect(html).toContain('<md-outlined-card');
    expect(html).toContain('m3-card-media');
    expect(html).toContain('/hero.png');
    expect(html).toContain('m3-card-header');
    expect(html).toContain('Mata Kuliah Algoritma');
    expect(html).toContain('3 SKS · Ruang 402');
    expect(html).toContain('m3-card-content');
    expect(html).toContain('Materi struktur data dan analisis kompleksitas.');
    expect(html).toContain('m3-card-actions');
    expect(html).toContain('Buka');
  });

  it('allows named imports of subcomponents', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardMedia src="/test.jpg" />
        <CardHeader headline="Judul" subhead="Deskripsi" />
        <CardContent>Isi</CardContent>
        <CardActions>Aksi</CardActions>
      </Card>
    );
    expect(html).toContain('m3-card-header');
    expect(html).toContain('Judul');
  });
});
