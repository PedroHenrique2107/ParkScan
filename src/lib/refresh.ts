export const APP_REFRESH_EVENT = 'parkscan:refresh'

export function requestAppRefresh(): void {
  window.dispatchEvent(new Event(APP_REFRESH_EVENT))
}
