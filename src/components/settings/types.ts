import type { UserSettings } from '../../store/types'

export type SettingsDraftProps = {
  local: UserSettings
  setLocal: (next: UserSettings) => void
}
