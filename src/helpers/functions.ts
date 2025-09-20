export function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.split('@')[0];
}
