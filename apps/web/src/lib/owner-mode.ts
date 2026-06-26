/** Owner-operated launch: just you + partner, no external driver matching */
export function isOwnerOperated(): boolean {
  return process.env.OWNER_OPERATED !== "false";
}

export function getOwnerNotificationEmail(): string | undefined {
  return process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
}
