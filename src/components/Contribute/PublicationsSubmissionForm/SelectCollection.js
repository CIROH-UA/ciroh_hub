import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {zoteroSelectStyles, zoteroSelectTheme} from './selectStyles';

/* ------------------------------------------------------------------ */
/* Helpers (unchanged)                                                */
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

function buildGroups(raw = []) {
  const parents = {};
  raw.forEach(({data}) => {
    if (!data.parentCollection) {
      parents[data.key] = {
        label: data.name,
        options: [{value: data.key, label: data.name}],
      };
    }
  });
  raw.forEach(({data}) => {
    if (data.parentCollection && parents[data.parentCollection]) {
      parents[data.parentCollection].options.push({
        value: data.key,
        label: data.name,
      });
    }
  });

  const parentsDebug = Object.values(parents).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {numeric: true}),
    );

  return Object.values(parents).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, {numeric: true}),
  );
}

/* ------------------------------------------------------------------ */
/* Inner component (runs only in the browser)                         */
/* ------------------------------------------------------------------ */

function SelectCollectionInner({zotero, onChange}) {
  const [groupedOptions, setGroupedOptions] = useState([]);

  /* fetch collections once ----------------------------------------- */
  useEffect(() => {
    if (!zotero) return;    // guard: no client provided
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

  return (
    <Select
      isMulti
      options={groupedOptions}
      placeholder="Add to collection(s)…"
      formatGroupLabel={formatGroupLabel}
      classNamePrefix="zotero-select"
      theme={zoteroSelectTheme}
      styles={zoteroSelectStyles}
      onChange={onChange}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Safe wrapper                                                       */
/* ------------------------------------------------------------------ */

export default function SelectCollection(props) {
  /* Expect a `zotero` client instance in props */
  return (
    <BrowserOnly>
      {() => <SelectCollectionInner {...props} />}
    </BrowserOnly>
  );
}
