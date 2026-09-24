// Usable capacity and fault tolerance for equal-size drives.
export const raidLevels = {
  shr: { label: 'SHR-1', min: 2, tolerance: 1, usable: (n, s) => (n === 2 ? s : (n - 1) * s), note: 'Synology Hybrid RAID: flexible, one-drive protection' },
  raid1: { label: 'RAID 1', min: 2, max: 2, tolerance: 1, usable: (_n, s) => s, note: 'Mirror: simplest protection for 2 drives' },
  raid5: { label: 'RAID 5', min: 3, tolerance: 1, usable: (n, s) => (n - 1) * s, note: 'Balanced capacity and one-drive protection' },
  raid6: { label: 'RAID 6', min: 4, tolerance: 2, usable: (n, s) => (n - 2) * s, note: 'Survives two drive failures' },
  raid10: { label: 'RAID 10', min: 4, even: true, tolerance: 1, usable: (n, s) => (n / 2) * s, note: 'Fastest protected option, 50% capacity' },
  raid0: { label: 'RAID 0', min: 1, tolerance: 0, usable: (n, s) => n * s, note: 'Maximum speed and space, no protection' },
};

export function raidValid(key, drives) {
  const r = raidLevels[key];
  return drives >= r.min && (!r.max || drives <= r.max) && (!r.even || drives % 2 === 0);
}

// Best default for a drive count: RAID 1 for 2, RAID 5 for 3-5, RAID 6 for 6+.
export function defaultRaid(drives) {
  if (drives <= 2) return 'raid1';
  if (drives <= 5) return 'raid5';
  return 'raid6';
}
