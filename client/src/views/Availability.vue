<template>
  <div class="availability">
    <h1>Availability</h1>
    <FullCalendar
      ref="cal"
      :header="{
        left: '',
        center: '',
        right: ''
      }"
      :now-indicator="true"
      :firstDay="1"
      :editable="true"
      :selectable="true"
      :selectMirror="true"
      :allDaySlot="false"
      :eventOverlap="false"
      :slotDuration="'00:15:00'"
      :slotLabelInterval="'00:30'"
      :scrollTime="'13:00:00'"
      :timeZone="'local'"
      :event-sources="eventSources"
      :plugins="calendarPlugins"
      :eventRender="eventRender"
      @select="addSlot"
      @eventDrop="editSlot"
      @eventResize="editSlot"
    />
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

export default {
  name: "availability",
  data() {
    return {
      eventSources: [
        {
          id: "events",
          events: function(fetchInfo, successCallback, failureCallback) {
            return axios.get("/api/availability/member").then(response => {
              return response.data.map(a => {
                return a;
              });
            });
          }
        }
      ],
      calendarPlugins: [timeGridPlugin, interactionPlugin],
      eventRender: info => {
        let span = document.createElement("span");
        span.className = "closeon";
        span.style = "position: absolute;top: 0;right: 5px;z-index:99";
        span.innerText = "X";
        span.addEventListener("click", () => {
          this.removeSlot(info.event);
        });
        info.el.appendChild(span);
      }
    };
  },
  components: {
    FullCalendar
  },
  methods: {
    addSlot(args) {
      axios
        .put("/api/availability/member", {
          title: args.title,
          start: args.start,
          end: args.end
        })
        .then(response => {
          this.$refs.cal.getApi().addEvent(response.data);
        });
    },
    editSlot(info) {
      const event = info.event;
      const eventOb = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end
      };
      axios
        .post("/api/availability/member", eventOb)
        .then(function(responce) {});
    },
    removeSlot(event) {
      axios
        .delete("/api/availability/member", { params: { id: event.id } })
        .then(function(responce) {
          event.remove();
        });
    }
  },
  beforeMount() {
    this.$store.dispatch("fetchData");
  }
};
</script>

<style lang="scss">
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/timegrid/main.css";
</style>
