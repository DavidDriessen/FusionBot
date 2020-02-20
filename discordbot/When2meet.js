const axios = require('axios')
const _eval = require('eval');
const moment = require('moment');
moment.updateLocale('en', {
    week: {
        dow: 1,
    },
});

function When2meet(members, id = "") {
    if (!id)
        return new Promise(resolve => resolve([]));

    function teamIsAvailable(slot, PeopleNames, PeopleIDs) {
        if (members.length === 0) return false;
        for (let member of members) {
            let memberId = PeopleNames.indexOf(member);
            if (memberId >= 0)
                if (slot.indexOf(PeopleIDs[memberId]) === -1)
                    return false;
        }
        return true;
    }

    function parseSlots(data) {
        let slots = [];
        let timeEnd = 0;
        for (let slot of Object.entries(data.AvailableAtSlot)) {
            if (teamIsAvailable(slot[1], data.PeopleNames, data.AvailableIDs)) {
                if (slots.length === 0 || slots[slots.length - 1].end !== 0) {
                    slots.push({"start": data.TimeOfSlot[slot[0]], "end": 0})
                }
                timeEnd = data.TimeOfSlot[slot[0]];
            } else {
                if (timeEnd !== 0) {
                    slots[slots.length - 1].end = data.TimeOfSlot[slot[0]];
                    timeEnd = 0;
                }
            }
        }
        if (timeEnd !== 0)
            slots[slots.length - 1].end = timeEnd;
        return slots;
    }

    function formatMomentThisWeek(timestamp) {
        return moment(moment.unix(timestamp).subtract(0, 'hours').format("hh:mm a"), "hh:mm a")
            .isoWeekday(moment.unix(timestamp).isoWeekday());
    }

    function parseResponse(body) {
        let o = "let PeopleNames = [];\n";
        o += "let PeopleIDs = [];\n";
        o += "let TimeOfSlot = [];\n";
        o += "let AvailableAtSlot = [];\n";
        o += "TimeOfSlot[0]";
        o += body.split("TimeOfSlot[0]")[1].split("</script>")[0];
        o += "\nmodule.exports = {PeopleNames, AvailableIDs, TimeOfSlot, AvailableAtSlot}";
        return o;
    }

    return axios.get('https://www.when2meet.com/?' + id).then(response => {
        if (response.data.includes("<title>When2meet</title>")) return [];
        let res = _eval(parseResponse(response.data));
        let slots = parseSlots(res);
        for (let slot of slots) {
            slot.start = formatMomentThisWeek(slot.start);
            slot.end = formatMomentThisWeek(slot.end);
        }
        return slots;
    }).catch(console.error);
}

// When2meet([ 'DavidDual', 'Alocoste', 'dylan', 'swiift' ], "8483926-DUWtI").then(r=>console.log(r.map(s=>s.start.format("ddd hh:mm a"))));

module.exports = {When2meet};