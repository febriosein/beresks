import { format } from 'date-fns';
import { type Semester, type MataKuliah, type SesiKelas, type Tugas } from '../../data/db.js';

function formatIcsDateTime(date: Date): string {
  // Format YYYYMMDDTHHMMSS
  return format(date, "yyyyMMdd'T'HHmmss");
}

function formatIcsDateOnly(date: Date): string {
  return format(date, 'yyyyMMdd');
}

/**
 * Menghasilkan file .ics berisi seluruh sesi kelas (berulang mingguan sampai akhir semester)
 * dan seluruh tugas aktif (dengan alarm pengingat 2 jam sebelumnya).
 */
export function hasilkanIcs(params: {
  semester: Semester;
  daftarMatkul: MataKuliah[];
  daftarSesi: SesiKelas[];
  daftarTugas: Tugas[];
}): string {
  const { semester, daftarMatkul, daftarSesi, daftarTugas } = params;

  const matkulMap = new Map<number, MataKuliah>();
  for (const m of daftarMatkul) {
    if (m.id) matkulMap.set(m.id, m);
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KuliahKu//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Jadwal & Tugas Kuliah - ${semester.nama}`,
  ];

  const nowStamp = formatIcsDateTime(new Date()) + 'Z';
  const semesterMulai = new Date(semester.tanggalMulai);
  const semesterSelesai = new Date(semester.tanggalSelesai);
  const untilFormatted = formatIcsDateOnly(semesterSelesai) + 'T235959Z';

  // 1. Ekspor Sesi Kelas sebagai VEVENT berulang
  for (const sesi of daftarSesi) {
    const matkul = matkulMap.get(sesi.matkulId);
    if (!matkul) continue;

    const [mulaiJam, mulaiMenit] = sesi.jamMulai.split(':').map(Number);
    const [selesaiJam, selesaiMenit] = sesi.jamSelesai.split(':').map(Number);

    // Cari tanggal kejadian pertama setelah tanggalMulai semester yang harinya cocok
    const firstDate = new Date(semesterMulai);
    let dayOffset = (sesi.hari - (firstDate.getDay() || 7) + 7) % 7;
    firstDate.setDate(firstDate.getDate() + dayOffset);
    firstDate.setHours(mulaiJam, mulaiMenit, 0, 0);

    const endDate = new Date(firstDate);
    endDate.setHours(selesaiJam, selesaiMenit, 0, 0);

    const summary = `${matkul.nama} (${sesi.tipe.toUpperCase()})`;
    const location = sesi.ruang ? `Ruang ${sesi.ruang}` : matkul.ruangDefault || '';
    const description = `Dosen: ${matkul.dosen || '-'}; SKS: ${matkul.sks || '-'}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:sesi-${sesi.id || Math.random()}@kuliahku`,
      `DTSTAMP:${nowStamp}`,
      `SUMMARY:${summary}`,
      location ? `LOCATION:${location}` : '',
      `DESCRIPTION:${description}`,
      `DTSTART:${formatIcsDateTime(firstDate)}`,
      `DTEND:${formatIcsDateTime(endDate)}`,
      `RRULE:FREQ=WEEKLY;UNTIL=${untilFormatted}`,
      'END:VEVENT'
    );
  }

  // 2. Ekspor Tugas sebagai VEVENT dengan VALARM
  for (const tugas of daftarTugas) {
    if (!tugas.tenggat || tugas.status === 'selesai') continue;
    const matkul = matkulMap.get(tugas.matkulId);
    const tenggatDate = new Date(tugas.tenggat);

    lines.push(
      'BEGIN:VEVENT',
      `UID:tugas-${tugas.id || Math.random()}@kuliahku`,
      `DTSTAMP:${nowStamp}`,
      `SUMMARY:Tugas: ${tugas.judul} (${matkul?.nama || 'Kuliah'})`,
      `DESCRIPTION:${tugas.catatan || 'Pengingat tenggat tugas KuliahKu'}`,
      `DTSTART:${formatIcsDateTime(tenggatDate)}`,
      `DTEND:${formatIcsDateTime(tenggatDate)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Tenggat tugas: ${tugas.judul}`,
      'TRIGGER:-PT2H', // 2 jam sebelum tenggat
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return lines.filter(Boolean).join('\r\n');
}

/**
 * Trigger download file .ics langsung di browser
 */
export function unduhFileIcs(isiIcs: string, namaFile = 'jadwal_kuliahku.ics'): void {
  const blob = new Blob([isiIcs], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
