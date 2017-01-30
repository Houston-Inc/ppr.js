import UniversalLoader from 'ppr.library.utils.loader';

export default {

  /**
   * Initialize builder
   * @returns {Boolean}
   */
  initialize() {
    if (!this.shouldBuild()) {
      return false;
    }

    UniversalLoader.load(this.getDependencies(), { custom: true }, (...dependencies) => {
      this.build(...dependencies);
    });

    return true;
  },

  /**
   * Check whether builder should build
   * @returns {Boolean}
   */
  shouldBuild() {
    return true;
  },

  /**
   * Get list of dependencies to be loaded
   * @returns {Object[]}
   */
  getDependencies() {
    return [];
  },
};
