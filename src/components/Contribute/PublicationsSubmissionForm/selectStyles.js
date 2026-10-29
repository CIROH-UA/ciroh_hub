export const zoteroSelectTheme = (base) => ({
  ...base,
  colors: {
    ...base.colors,
    primary: 'var(--ifm-color-primary)',
    primary25: 'var(--ifm-color-primary-lightest)',
    primary50: 'var(--ifm-color-primary-lighter)',
    neutral0: 'var(--ifm-background-surface-color)',
    neutral10: 'var(--ifm-color-emphasis-200)',
    neutral20: 'var(--ifm-color-emphasis-300)',
    neutral30: 'var(--ifm-color-emphasis-400)',
    neutral80: 'var(--ifm-font-color-base)',
  },
  spacing: {...base.spacing, controlHeight: 46},
  borderRadius: 4,
});

export const zoteroSelectStyles = {
  menuPortal: (base) => ({...base, zIndex: 9999}),
  control: (s) => ({...s, border: '1px solid #ccc'}),
  valueContainer: (s) => ({...s, padding: '2px 8px'}),
  multiValueLabel: (s) => ({...s, color: 'var(--ifm-font-color-base)'}),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--ifm-color-primary)'
      : state.isFocused
        ? 'var(--ifm-color-primary-lightest)'
        : base.backgroundColor,
    color: state.isSelected
      ? '#fff'
      : state.isFocused
        ? '#fff'
        : base.color,
  }),
};