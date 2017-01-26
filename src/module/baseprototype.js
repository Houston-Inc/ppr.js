export default {

  isInitialized: false,
  configList: {},
  eventBus: undefined,
  messages: {},

  /**
   * Build module
   * @returns {Boolean}
   */
  build() {
    return true;
  },

  /**
   * Create and return a new module based on this one
   */
  createModule(obj) {
    return Object.assign({}, this, obj);
  },

  /**
   * Initialize module
   * @param {Object} configs  list of configurations
   * @param {Object} eventBus global event bus instance
   */
  initialize(configs, eventBus) {
    if (this.isInitialized) {
      return false;
    }

    this.eventBus = eventBus;
    this.configList = Object.assign({}, this.configList, configs);
    this.isInitialized = true;

    this.build();

    return true;
  },

  /**
   * Get list of messages
   */
  getMessages() {
    return this.messages;
  },
};
