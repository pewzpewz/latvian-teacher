import { Bell } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { requestNotificationPermission, isNotificationSupported } from '../../lib/streakReminder'
import type { SettingsDraftProps } from './types'

export function SettingsNotificationsSection({ local, setLocal }: SettingsDraftProps) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Bell size={18} className="text-gold" />
        <h2 className="font-semibold">{t('settings.notifications')}</h2>
      </div>
      {!isNotificationSupported() ? (
        <p className="text-sm text-muted">{t('settings.notificationsUnsupported')}</p>
      ) : (
        <>
          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={local.streakReminderEnabled ?? false}
              onChange={async (e) => {
                const enabled = e.target.checked
                if (enabled) {
                  const perm = await requestNotificationPermission()
                  if (perm !== 'granted') return
                }
                setLocal({ ...local, streakReminderEnabled: enabled })
              }}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm">{t('settings.streakReminder')}</span>
          </label>
          <p className="mb-4 text-xs text-muted">{t('settings.streakReminderDesc')}</p>
          {local.streakReminderEnabled && (
            <label className="block">
              <span className="mb-1 block text-sm text-muted">{t('settings.reminderHour')}</span>
              <input
                type="number"
                min={0}
                max={23}
                value={local.streakReminderHour ?? 19}
                onChange={(e) => setLocal({ ...local, streakReminderHour: Number(e.target.value) })}
                className="w-24 rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
              />
            </label>
          )}
        </>
      )}
    </section>
  )
}
