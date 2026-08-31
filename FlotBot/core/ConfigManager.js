class ConfigManager {

    constructor() {

        this.config = {

            scanInterval: 5000,

            aiProvider: "llama3.1",

            debug: true

        };

    }

    get(key) {

        return this.config[key];

    }

    set(key, value) {

        this.config[key] = value;

    }

}

module.exports = ConfigManager;