export default {
  open: false,
  watch: true,
  rootDir: "./public",
  appIndex: 'index.html',

  X_nodeResolve: {
    exportConditions: ['development'],
    dedupe: true,
  },
  X_esbuildTarget: 'auto',
};
