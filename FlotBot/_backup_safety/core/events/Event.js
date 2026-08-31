class Event {

    constructor(type, data = {}) {

        this.id = Date.now().toString();

        this.type = type;

        this.timestamp = new Date();

        this.data = data;

    }

}

module.exports = Event;