export const inputCls =
  'w-full px-3 py-2 bg-white border border-fog text-ink text-sm';

export function labelCls() {
  return 'block text-xs text-muted';
}

export function actionCls(primaryColor: string): React.CSSProperties {
  return { backgroundColor: primaryColor };
}
