const fs = require('fs');
const path = require('path');

const iconMap = {
  add: 'add.svg',
  add_task: 'add_task.svg',
  arrow_back: 'arrow_back.svg',
  arrow_forward: 'arrow_forward.svg',
  assignment: 'assignment.svg',
  assignment_add: 'assignment_add.svg',
  assignment_late: 'assignment_late.svg',
  assignment_turned_in: 'assignment_turned_in.svg',
  bolt: 'bolt.svg',
  calendar_month: 'calendar_month.svg',
  calendar_today: 'calendar_today.svg',
  calendar_view_week: 'calendar_view_week.svg',
  celebration: 'celebration.svg',
  check: 'check.svg',
  check_circle: 'check_circle.svg',
  chevron_right: 'chevron_right.svg',
  date_range: 'date_range.svg',
  delete: 'delete.svg',
  download: 'download.svg',
  edit: 'edit.svg',
  event_available: 'event_available.svg',
  event_busy: 'event_busy.svg',
  event_upcoming: 'event_upcoming.svg',
  file_download: 'download.svg',
  file_upload: 'upload.svg',
  filter_list_off: 'filter_list_off.svg',
  free_cancellation: 'free_cancellation.svg',
  info: 'info.svg',
  install_mobile: 'install_desktop.svg',
  meeting_room: 'meeting_room.svg',
  menu_book: 'menu_book.svg',
  notes: 'notes.svg',
  palette: 'palette.svg',
  pending_actions: 'pending_actions.svg',
  person: 'person.svg',
  radio_button_unchecked: 'radio_button_unchecked.svg',
  schedule: 'schedule.svg',
  school: 'school.svg',
  settings: 'settings.svg',
  task_alt: 'task_alt.svg',
  today: 'today.svg',
  view_day: 'view_day.svg',
  warning: 'warning.svg',
  wifi_off: 'wifi_off.svg',
};

const roundedDir = path.join(__dirname, '../node_modules/@material-symbols/svg-400/rounded');
const result = {};

for (const [name, file] of Object.entries(iconMap)) {
  const filePath = path.join(roundedDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/<path\s+d="([^"]+)"/);
    if (match) {
      result[name] = match[1];
    } else {
      console.warn('No path d in:', file);
    }
  } else {
    console.warn('File not found:', filePath);
  }
}

const outContent = `// Auto-generated SVG icon paths from @material-symbols/svg-400
export const ICONS_DATA: Record<string, string> = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/ui/iconsData.ts'), outContent, 'utf-8');
console.log('Successfully generated src/ui/iconsData.ts with', Object.keys(result).length, 'icons');
