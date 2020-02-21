<template>
  <div class="schedule">
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
      min-time="13:00"
      max-time="20:00"
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

export default {
  name: "timetable",
  data() {
    const self = this;
    return {
      eventSources: [
        {
          id: "availability",
          events: function(fetchInfo, successCallback, failureCallback) {
            return axios
              .get(
                "/api/availability/" +
                  (self.$store.getters.isInTeam ? "team" : "member") +
                  "/re",
                {
                  params: {
                    timeZoneOffset: moment(fetchInfo.start).format("Z")
                  }
                }
              )
              .then(response => {
                return response.data.map(a => {
                  a.rendering = "background";
                  return a;
                });
              });
          }
        },
        {
          id: "events",
          events: function(fetchInfo, successCallback, failureCallback) {
            if (!self.$store.getters.isInTeam) return [];
            return axios.get("/api/events/team").then(response => {
              return response.data.map(a => {
                return a;
              });
            });
          }
        },
        {
          id: "subbing",
          events: function(fetchInfo, successCallback, failureCallback) {
            return axios.get("/api/events/member").then(response => {
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
  computed: {},
  methods: {}
};
</script>

<style lang="scss">
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/timegrid/main.css";
</style>
