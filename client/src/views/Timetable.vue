<template>
  <div class="timetable">
    <FullCalendar
      ref="cal"
      :header="{
        left: '',
        center: 'title',
        right: ''
      }"
      :firstDay="1"
      :allDaySlot="false"
      :slotDuration="'00:15:00'"
      :slotLabelInterval="'00:30'"
      :min-time="min"
      :max-time="max"
      :timeZone="'utc'"
      :event-sources="eventSources"
      :plugins="calendarPlugins"
      :eventRender="eventRender"
      height="auto"
    />
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import momentPlugin from "@fullcalendar/moment";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import moment from "moment";

let min = moment("23:59", "HH:mm");
let max = moment("01:00", "HH:mm");
let mutexMax = false;

function calcRange(data) {
  min = Math.min(
    min,
    ...data.map(a => {
      return moment(a.startTime, "HH:mm");
    })
  );
  const endMin = Math.min(
    min,
    ...data.map(a => {
      return moment(a.endTime, "HH:mm");
    })
  );
  max = Math.max(
    max,
    ...data.map(a => {
      return moment(a.endTime, "HH:mm");
    })
  );
  if (endMin < min)
    max =
      moment("24:00", "HH:mm") +
      Math.max(
        data
          .map(a => {
            return moment(a.endTime, "HH:mm") - moment("00:00", "HH:mm");
          })
          .filter(a => {
            return a < min;
          })
      );
  return [
    moment(min)
      .subtract(15, "minutes")
      .format("HH:mm"),
    Math.floor(
      (moment(max).add(15, "minutes") - moment("00:00", "HH:mm")) /
        1000 /
        60 /
        60
    ) +
      moment(max)
        .add(15, "minutes")
        .format(":mm")
  ];
}

function calcRangeDate(data) {
  min = Math.min(
    min,
    ...data.map(a => {
      return moment(
        moment(a.start)
          .utc()
          .format("HH:mm"),
        "HH:mm"
      );
    })
  );
  const endMin = Math.min(
    min,
    ...data.map(a => {
      return moment(
        moment(a.end)
          .utc()
          .format("HH:mm"),
        "HH:mm"
      ).utc();
    })
  );
  max = Math.max(
    max,
    ...data.map(a => {
      return moment(
        moment(a.end)
          .utc()
          .format("HH:mm"),
        "HH:mm"
      );
    })
  );
  if (endMin < min)
    max =
      moment("24:00", "HH:mm") +
      Math.max(
        data
          .map(a => {
            return (
              moment(
                moment(a.end)
                  .utc()
                  .format("HH:mm"),
                "HH:mm"
              ) - moment("00:00", "HH:mm")
            );
          })
          .filter(a => {
            return a < min;
          })
      );
  return [
    moment(min)
      .subtract(15, "minutes")
      .format("HH:mm"),
    Math.floor(
      (moment(max).add(15, "minutes") - moment("00:00", "HH:mm")) /
        1000 /
        60 /
        60
    ) +
      moment(max)
        .add(15, "minutes")
        .format(":mm")
  ];
}

export default {
  name: "timetable",
  data() {
    const self = this;
    return {
      min: "00:00",
      max: "24:00",
      eventSources: [
        {
          id: "availability",
          events: (fetchInfo, successCallback, failureCallback) => {
            return axios
              .get("/api/availability/team/re", {
                params: {
                  noLogin: true,
                  team: this.$route.query.team,
                  from: fetchInfo.start,
                  to: fetchInfo.end
                }
              })
              .then(response => {
                [this.min, this.max] = calcRange(response.data);
                return response.data.map(a => {
                  a.rendering = "background";
                  return a;
                });
              });
          }
        },
        {
          id: "events",
          events: (fetchInfo, successCallback, failureCallback) => {
            if (!self.$store.getters.isInTeam) return [];
            return axios
              .get("/api/events/team", {
                params: {
                  noLogin: true,
                  team: this.$route.query.team,
                  from: fetchInfo.start,
                  to: fetchInfo.end
                }
              })
              .then(response => {
                [this.min, this.max] = calcRangeDate(response.data);
                return response.data.map(a => {
                  return a;
                });
              });
          }
        }
      ],
      calendarPlugins: [timeGridPlugin, momentPlugin],
      eventRender: info => {
        if (info.event.source && info.event.source.id === "events") {
          info.el.style.setProperty("margin", "0 4px");
        }
      }
    };
  },
  components: {
    FullCalendar
  },
  beforeMount() {
    this.$store.dispatch("fetchTeam", { team: this.$route.query.team });
  }
};
</script>

<style lang="scss">
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/timegrid/main.css";
</style>
