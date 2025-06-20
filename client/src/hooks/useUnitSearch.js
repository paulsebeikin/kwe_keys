import { useState, useMemo } from 'react';

// items: array to search
// key: property name for unit number (default: 'unitNumber')
export default function useUnitSearch(items, key = 'unitNumber') {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter(item =>
      String(item[key] ?? '')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [items, search, key]);
  return { search, setSearch, filteredItems };
}
