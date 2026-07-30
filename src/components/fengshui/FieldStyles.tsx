/** text-base (16px) — tránh iOS Safari auto-zoom khi focus input/select. */
export const inputCls =
  'w-full min-w-0 max-w-full px-3 py-2 bg-white border border-fog text-ink text-base';

export function labelCls() {
  return 'block text-xs text-muted';
}

export function actionCls(primaryColor: string): React.CSSProperties {
  return { backgroundColor: primaryColor };
}
