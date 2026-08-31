const { exec } = require("child_process");

class ProcessCollector {

    async collect() {

        return new Promise((resolve, reject) => {

            exec(
                'tasklist /FO CSV',
                (error, stdout) => {

                    if (error) {
                        return reject(error);
                    }

                    const lines = stdout.trim().split("\n");

                    const headers = lines[0]
                        .replace(/"/g, "")
                        .split(",");

                    const processes = lines
                        .slice(1)
                        .map(line => {

                            const values = line
                                .replace(/"/g, "")
                                .split(",");

                            return {
                                image: values[0],
                                pid: values[1],
                                session: values[2],
                                sessionNumber: values[3],
                                memory: values[4]
                            };

                        });

                    resolve(processes);

                });

        });

    }

}

module.exports = ProcessCollector;