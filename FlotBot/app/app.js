const Runtime = require("../core/Runtime");

const ThreatEngine = require("../core/threats/ThreatEngine");

const AlertManager = require("../core/alerts/AlertManager");
const Alert = require("../core/alerts/Alert");
const Severity = require("../core/alerts/Severity");
const Category = require("../core/alerts/AlertCategory");

const SystemCollector = require("../modules/system/collector");
const SystemSkill = require("../modules/system/skill");

const PowerShellRule = require("../modules/system/rules/PowerShellRule");
const CmdRule = require("../modules/system/rules/CmdRule");
const WmicRule = require("../modules/system/rules/WmicRule");
const Rundll32Rule = require("../modules/system/rules/Rundll32Rule");
const MshtaRule = require("../modules/system/rules/MshtaRule");
const Regsvr32Rule = require("../modules/system/rules/Regsvr32Rule");

(async () => {

    const runtime = new Runtime();

    const collector = new SystemCollector();
    const threatEngine = new ThreatEngine();
    const alertManager = new AlertManager();

    threatEngine.registerRule(new PowerShellRule());
    threatEngine.registerRule(new CmdRule());
    threatEngine.registerRule(new WmicRule());
    threatEngine.registerRule(new Rundll32Rule());
    threatEngine.registerRule(new MshtaRule());
    threatEngine.registerRule(new Regsvr32Rule());

    const systemSkill = new SystemSkill(
        collector,
        threatEngine,
        alertManager
    );

    await runtime.start(async () => {

        const detections = await systemSkill.execute();

        console.clear();

        console.log("========== FlotBot ==========\n");

        console.log("Alerts:", detections.length);

        if (detections.length > 0) {

            const output = detections.map(detection => new Alert({

                title: detection.rule,

                severity: Severity.MEDIUM,

                category: Category.EXECUTION,

                source: "System Collector",

                description: detection.reason,

                recommendation: detection.recommendation,

                evidence: {
                    process: detection.process,
                    pid: detection.pid
                },

                mitre: ["T1059.001"]

            }));

            console.table(output);

        }

    });

})();