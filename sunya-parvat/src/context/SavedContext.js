import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../lib/storage';
import { getTrek } from '../data/treks';

/*
  Shortlist ("saved") and compare selection, kept in this browser only.
  No account, nothing leaves the device.
*/
const SavedContext = createContext(null);
export const MAX_COMPARE = 3;

const clean = list => (Array.isArray(list) ? list : [])
  .map(id => getTrek(id)?.id)          // migrate legacy ids, drop unknown ones
  .filter((id, i, arr) => id && arr.indexOf(id) === i);

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(() => clean(storage.getJSON('sp.saved', [])));
  const [compare, setCompare] = useState(() => clean(storage.getJSON('sp.compare', [])).slice(0, MAX_COMPARE));
  const [notice, setNotice] = useState('');

  useEffect(() => storage.setJSON('sp.saved', saved), [saved]);
  useEffect(() => storage.setJSON('sp.compare', compare), [compare]);

  const toggleSaved = useCallback(id => {
    setSaved(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  }, []);

  const toggleCompare = useCallback(id => {
    setCompare(c => {
      if (c.includes(id)) return c.filter(x => x !== id);
      if (c.length >= MAX_COMPARE) { setNotice('compare.full'); return c; }
      return [...c, id];
    });
  }, []);

  const setCompareList = useCallback(ids => setCompare(clean(ids).slice(0, MAX_COMPARE)), []);
  const clearCompare = useCallback(() => setCompare([]), []);
  const clearNotice = useCallback(() => setNotice(''), []);

  const value = useMemo(() => ({
    saved, toggleSaved, isSaved: id => saved.includes(id),
    compare, toggleCompare, isComparing: id => compare.includes(id), setCompareList, clearCompare,
    notice, clearNotice,
  }), [saved, toggleSaved, compare, toggleCompare, setCompareList, clearCompare, notice, clearNotice]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export const useSaved = () => useContext(SavedContext);
