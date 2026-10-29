/* One DataBridge workspace icon (see dbIcons.ts). The paths are static strings from this repository. */
import { DB_ICONS, type DbIconName } from './dbIcons';

export function DbIcon({ name, size = 18 }: { name: DbIconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: DB_ICONS[name] }}
    />
  );
}
