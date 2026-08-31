const crypto = require("crypto");

class Alert {

    constructor({
        title,
        severity,
        category,
        source,
        description,
        recommendation,
        evidence = {},
        mitre = []
    }) {

        this.id = crypto.randomUUID();

        this.timestamp = new Date();

        this.title = title;

        this.severity = severity;

        this.category = category;

        this.source = source;

        this.description = description;

        this.recommendation = recommendation;

        this.evidence = evidence;

        this.mitre = mitre;

    }

}

module.exports = Alert;