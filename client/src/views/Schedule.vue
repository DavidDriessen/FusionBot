<template>
  <div class="schedule">
    <h4>Schedule</h4>
    <div class="filters">
      <b-checkbox v-model="conf.cross">Cross</b-checkbox>
      <b-checkbox
        v-for="mem in $store.getters.TeamMembers"
        :key="mem.id"
        @input="exclude(mem.id, $event)"
        :checked="true"
        >{{ mem.name }}
      </b-checkbox>
    </div>
    <FullCalendar
      ref="cal"
      :header="{
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,listMonth'
      }"
      :firstDay="1"
      :editable="true"
      :selectable="true"
      :selectMirror="true"
      :allDaySlot="false"
      :slotDuration="'00:15:00'"
      :slotLabelInterval="'00:30'"
      :scrollTime="'13:00:00'"
      :timeZone="'local'"
      :event-sources="eventSources"
      :plugins="calendarPlugins"
      :eventOverlap="eventOverlap"
      :eventRender="eventRender"
      :height="'100%'"
      @select="select"
      @eventDrop="editSlot"
      @eventResize="editSlot"
      @eventClick="eventClick"
    />
    <b-modal id="event" title="Event" @ok="save" @hide="hide">
      <b-form>
        <b-form-group
          label="Title"
          label-for="title"
          description="Name of event."
        >
          <b-form-input
            v-model="eventEditTitle"
            id="title"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Start" label-for="start">
          <b-form-input
            v-model="eventEditStart"
            type="datetime-local"
            id="start"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group label="End" label-for="end">
          <b-form-input
            v-model="eventEditEnd"
            type="datetime-local"
            id="end"
            required
          ></b-form-input>
        </b-form-group>
      </b-form>

      <template v-slot:modal-footer="{ ok, cancel, hide }">
        <b-button
          size="md"
          variant="danger"
          @click="hide('delete')"
          style="position: absolute;left: 20px;"
        >
          Delete
        </b-button>
        <b-button size="md" variant="" @click="cancel()">Cancel</b-button>
        <b-button size="md" variant="success" @click="ok()">Save</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import momentPlugin from "@fullcalendar/moment";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import moment from "moment";

export default {
  name: "schedule",
  data() {
    const self = this;
    return {
      conf: {
        cross: true,
        exclude: []
      },
      eventEdit: {},
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
                    timeZoneOffset: moment(fetchInfo.start).format("Z"),
                    cross: self.conf.cross,
                    exclude: self.conf.exclude
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
      calendarPlugins: [
        timeGridPlugin,
        interactionPlugin,
        listPlugin,
        momentPlugin
      ],
      eventRender: info => {
        if (info.event.source && info.event.source.id === "events") {
          info.el.style.setProperty("margin", "0 4px");
        }
      },
      eventOverlap: (stillEvent, movingEvent) => {
        return stillEvent.source.id !== movingEvent.source.id;
      },
      eventClick: info => {
        if (info.event.source && info.event.source.id === "events") {
          this.open(info.event);
        }
      },
      select: info => {
        this.open(info);
      }
    };
  },
  components: {
    FullCalendar
  },
  computed: {
    eventEditTitle: {
      get() {
        return this.eventEdit.title;
      },
      set(val) {
        this.eventEdit.setProp("title", val);
      }
    },
    eventEditStart: {
      get() {
        return moment(this.eventEdit.start).format("YYYY-MM-DDTHH:mm");
      },
      set(val) {
        this.eventEdit.setStart(moment(val, "YYYY-MM-DDTHH:mm").toDate());
      }
    },
    eventEditEnd: {
      get() {
        return moment(this.eventEdit.end).format("YYYY-MM-DDTHH:mm");
      },
      set(val) {
        this.eventEdit.setEnd(moment(val, "YYYY-MM-DDTHH:mm").toDate());
      }
    }
  },
  methods: {
    open(event) {
      if (event.id) this.eventEdit = event;
      else this.eventEdit = this.$refs.cal.getApi().addEvent(event);
      this.$bvModal.show("event");
    },
    save() {
      if (!this.eventEdit.title) {
        alert("Please fill in a title");
      } else {
        if (this.eventEdit.id) this.editSlot({ event: this.eventEdit });
        else this.addSlot({ event: this.eventEdit });
      }
    },
    addSlot(info) {
      const event = {
        title: info.event.title,
        start: info.event.start,
        end: info.event.end
      };
      axios.put("/api/events/team", event).then(response => {
        this.$refs.cal.getApi().refetchEvents();
        // this.$refs.cal.getApi().addEvent(response.data);
      });
    },
    editSlot(info) {
      const event = {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end
      };
      axios.post("/api/events/team", event);
    },
    removeSlot() {
      axios
        .delete("/api/events/team", { params: { id: this.eventEdit.id } })
        .then(response => {
          this.eventEdit.remove();
        });
    },
    hide(e) {
      if (e.trigger === "delete") this.removeSlot();
      this.$refs.cal.getApi().unselect();
      if (!this.eventEdit.id) this.eventEdit.remove();
    },
    exclude(id, value) {
      if (!value) {
        this.conf.exclude.push(id);
      } else {
        if (this.conf.exclude.indexOf(id) >= 0)
          this.conf.exclude.splice(this.conf.exclude.indexOf(id), 1);
      }
      this.$refs.cal.getApi().refetchEvents();
    }
  },
  watch: {
    "conf.cross": function(e) {
      this.$refs.cal.getApi().refetchEvents();
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
