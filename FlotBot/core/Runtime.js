const ConfigManager = require("./ConfigManager");
const ModuleLoader = require("./ModuleLoader");
const Scheduler = require("./Scheduler");

class Runtime {

    constructor() {

        this.config = new ConfigManager();
        this.moduleLoader = new ModuleLoader();
        this.scheduler = new Scheduler(
            this.config.get("scanInterval")
        );

    }

    async start(task) {

        console.log("\n===== FlotBot Starting =====\n");

        await this.moduleLoader.initialize();

        this.scheduler.start(task);

        console.log("FlotBot is running...\n");

    }

}

module.exports = Runtime;