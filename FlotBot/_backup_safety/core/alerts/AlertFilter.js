/**
 * AlertFilter
 * Utility class to filter arrays of Alert objects.
 */
class AlertFilter {

    /**
     * Filter alerts based on criteria.
     * @param {Array} alerts - list of alert objects
     * @param {object} criteria - { severity, category, source, acknowledged, startDate, endDate }
     */
    static filter(alerts, criteria = {}) {

        return alerts.filter(alert => {

            if (criteria.severity && alert.severity !== criteria.severity) {
                return false;
            }

            if (criteria.category && alert.category !== criteria.category) {
                return false;
            }

            if (criteria.source && alert.source !== criteria.source) {
                return false;
            }

            if (criteria.acknowledged !== undefined) {
                const ack = alert.acknowledged === true || alert.acknowledged === 1;
                if (ack !== criteria.acknowledged) {
                    return false;
                }
            }

            if (criteria.startDate) {
                const start = new Date(criteria.startDate);
                if (new Date(alert.timestamp) < start) {
                    return false;
                }
            }

            if (criteria.endDate) {
                const end = new Date(criteria.endDate);
                if (new Date(alert.timestamp) > end) {
                    return false;
                }
            }

            return true;

        });

    }

}

module.exports = AlertFilter;
