/* SelectCollection.jsx – single-select with an “All Collections” option */
import React, {useEffect, useMemo, useState} from 'react';
import Select      from 'react-select';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useColorMode} from '@docusaurus/theme-common';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const Group = ({label, len}) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <span>{label}</span>
    <span style={{
      background:'#EBECF0',borderRadius:'2em',fontSize:12,padding:'0 8px',
    }}>{len}</span>
  </div>
);
const formatGroupLabel = g => <Group label={g.label} len={g.options.length} />;

/* Build groups:
   – parents become labels only
   – children become options
   – add a synthetic “All Collections” option at the top               */
function buildGroups(raw = []) {
  const parents = {};

  /* collect parents first */
  raw.forEach(({data}) => {
    if (!data.parentCollection) {
      parents[data.key] = { label: data.name, options: [] };
    }
  });

  /* attach children or make parent selectable if lonely */
  raw.forEach(({data}) => {
    if (data.parentCollection && parents[data.parentCollection]) {
      parents[data.parentCollection].options.push({
        value: data.key,
        label: data.name,
      });
    } else if (!data.parentCollection) {
      parents[data.key].options.push({
        value: data.key,
        label: data.name,
      });
    }
  });

  const groups = Object
    .values(parents)
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {numeric: true}),
    );

  /* prepend global “All Collections” */
  return [
    {
      /* react-select treats a flat list when `label` is undefined */
      options: [{ value: '', label: 'All Collections' }],
    },
    ...groups,
  ];
}

/* ------------------------------------------------------------------ */
/* Inner component – browser-only                                     */
/* ------------------------------------------------------------------ */

function SelectCollectionInner({zotero, onChange}) {
  const {colorMode} = useColorMode();
  const [groupedOptions, setGroupedOptions] = useState([]);

  /* fetch collections once */
  useEffect(() => {
    if (!zotero) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await zotero.collections().get();
        if (!cancelled) setGroupedOptions(buildGroups(res.raw));
      } catch (err) {
        console.error('Could not load Zotero collections:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [zotero]);

  /* theme + styles (unchanged) */
  const theme = useMemo(() => base => ({
    ...base,
    colors: {
      ...base.colors,
      primary:   'var(--ifm-color-primary)',
      primary25: 'var(--ifm-color-primary-lightest)',
      primary50: 'var(--ifm-color-primary-lighter)',
      neutral0:  'var(--ifm-background-surface-color)',
      neutral10: 'var(--ifm-color-emphasis-200)',
      neutral20: 'var(--ifm-color-emphasis-300)',
      neutral30: 'var(--ifm-color-emphasis-400)',
      neutral80: 'var(--ifm-font-color-base)',
    },
    spacing: {...base.spacing, controlHeight: 46},
    borderRadius: 4,
  }), [colorMode]);

  const styles = useMemo(() => ({
    control:        s => ({...s, border:'1px solid #ccc'}),
    valueContainer: s => ({...s, padding:'2px 8px'}),
    option: (base,state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? 'var(--ifm-color-primary-lightest)'
        : base.backgroundColor,
      color: state.isFocused
        ? 'var(--ifm-color-primary-dark)'
        : base.color,
      ...(state.isSelected && {background:'var(--ifm-color-primary-lighter)'}),
    }),
  }), [colorMode]);

  return (
    <Select
      options={groupedOptions}
      placeholder="All Collections"
      formatGroupLabel={formatGroupLabel}
      classNamePrefix="zotero-select"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      theme={theme}
      styles={styles}
      isSearchable
      isClearable           /* ⨉ button clears back to “All” */
      onChange={onChange}   /* (opt) => opt === null when cleared */
    />
  );
}

/* ------------------------------------------------------------------ */
/* Safe wrapper                                                       */
/* ------------------------------------------------------------------ */

export default function SelectCollection(props) {
  return (
    <BrowserOnly>{() => <SelectCollectionInner {...props} />}</BrowserOnly>
  );
}
