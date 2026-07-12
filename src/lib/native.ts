import { Capacitor } from '@capacitor/core'

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

export async function initNativeShell(): Promise<void> {
  if (!isNativeApp()) return

  const { StatusBar, Style } = await import('@capacitor/status-bar')
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: '#0f1219' })

  const { SplashScreen } = await import('@capacitor/splash-screen')
  await SplashScreen.hide()
}
