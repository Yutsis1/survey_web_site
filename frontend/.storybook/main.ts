import type { StorybookConfig } from '@storybook/nextjs-vite';
import type { RollupLog } from 'rollup';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
  staticDirs: ['../public'],
  framework: '@storybook/nextjs-vite',
  viteFinal: async (viteConfig) => {
    const existingOnwarn = viteConfig.build?.rollupOptions?.onwarn;
    const onwarn = (warning: RollupLog, defaultHandler: (warning: string | RollupLog | (() => string | RollupLog)) => void) => {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }

      if (existingOnwarn) {
        existingOnwarn(warning, defaultHandler);
        return;
      }

      defaultHandler(warning as RollupLog);
    };

    return {
      ...viteConfig,
      esbuild: {
        ...viteConfig.esbuild,
        logOverride: {
          ...((viteConfig.esbuild && typeof viteConfig.esbuild !== 'boolean') ? viteConfig.esbuild.logOverride ?? {} : {}),
          'sourcemap-error': 'silent',
        },
      },
      build: {
        ...viteConfig.build,
        sourcemap: false,
        rollupOptions: {
          ...viteConfig.build?.rollupOptions,
          onwarn,
        },
      },
    };
  },
};
export default config;
