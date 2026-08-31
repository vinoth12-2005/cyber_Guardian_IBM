class Scheduler {

    constructor(interval = 5000) {

        this.interval = interval;
        this.timer = null;

    }

    start(task) {

        console.log(`Scheduler started (${this.interval} ms)`);

        this.timer = setInterval(async () => {

            try {

                await task();

            } catch (error) {

                console.error("Scheduler Error:", error.message);

            }

        }, this.interval);

    }

    stop() {

        if (this.timer) {

            clearInterval(this.timer);

            this.timer = null;

            console.log("Scheduler stopped.");

        }

    }

}

module.exports = Scheduler;