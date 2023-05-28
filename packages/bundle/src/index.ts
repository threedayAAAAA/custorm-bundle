import type { BundleConfig } from './interface'

import { Bundle } from './Bundle';

export const bundle = (config: BundleConfig) => {
  const bundle = new Bundle({
    config,
  });

  bundle.build();
  return bundle;
};