class ModuleLoader {

    constructor() {

        this.modules = [];

    }

    register(module) {

        this.modules.push(module);

    }

    getModules() {

        return this.modules;

    }

    async initialize() {

        for (const module of this.modules) {

            if (typeof module.initialize === "function") {

                await module.initialize();

            }

        }

    }

}

module.exports = ModuleLoader;