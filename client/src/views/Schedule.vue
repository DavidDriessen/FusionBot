<template>
  <div class="schedule">
    <h4>Schedule</h4>
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
    <div class="modal" v-show="isOpen" style="display: block">
      <div class="modal-dialog" role="document" style="height: 100%;">
        <div class="modal-content" style="max-height: 80%">
          <div class="modal-header">
            <h5 class="modal-title">Event</h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              @click="close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <fieldset>
              <div class="form-group">
                <label for="title">Title</label>
                <input
                  id="title"
                  type="text"
                  class="form-control"
                  placeholder="Title"
                  v-model="eventEditTitle"
                />
              </div>
              <div class="form-group">
                <label for="start">Start</label>
                <input
                  id="start"
                  type="datetime-local"
                  class="form-control"
                  v-model="eventEditStart"
                />
              </div>
              <div class="form-group">
                <label for="end">End</label>
                <input
                  id="end"
                  type="datetime-local"
                  class="form-control"
                  v-model="eventEditEnd"
                />
              </div>
            </fieldset>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-danger"
              v-if="eventEdit.id"
              @click="removeSlot"
              style="float: left"
            >
              Delete
            </button>
            <button type="button" class="btn btn-primary" @click="save">
              Save changes
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
              @click="close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
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
      isOpen: false,
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
    close() {
      this.isOpen = false;
      this.$refs.cal.getApi().unselect();
      if (!this.eventEdit.id) this.eventEdit.remove();
    },
    open(event) {
      if (event.id) this.eventEdit = event;
      else this.eventEdit = this.$refs.cal.getApi().addEvent(event);
      this.isOpen = true;
    },
    save() {
      if (!this.eventEdit.title) {
        alert("Please fill in a title");
      } else {
        if (this.eventEdit.id) this.editSlot({ event: this.eventEdit });
        else this.addSlot({ event: this.eventEdit });
        this.close();
      }
    },
    addSlot(info) {
      const event = {
        title: info.event.title,
        start: info.event.start,
        end: info.event.end
      };
      axios.put("/api/events/team", event).then(response => {
        this.$refs.cal.getApi().addEvent(response.data);
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
          this.close();
          this.eventEdit.remove();
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
