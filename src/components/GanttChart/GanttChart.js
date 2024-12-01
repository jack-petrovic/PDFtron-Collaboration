import React, { useRef, useEffect } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./GanttChart.css";

export const GanttChart = (props) => {
  const dataSource = props.dataSource;
  const ganttContainerRef = useRef(null);
  const onDataUpdated = props.onDataUpdated;
  const zoom = props.zoom;
  let dataProcessor = null;

  const initGanttDataProcessor = () => {
    /**
     * type: "task"|"link"
     * action: "create"|"update"|"delete"
     * item: data object object
    //  */
    dataProcessor = gantt.createDataProcessor((type, action, item, id) => {
      return new Promise((resolve) => {
        if (onDataUpdated) {
          onDataUpdated(type, action, item, id);
        }
        return resolve();
      });
    });
  };

  const initZoom = () => {
    gantt.ext.zoom.init({
      levels: [
        {
          name: "Hours",
          scale_height: 60,
          min_column_width: 30,
          scales: [
            { unit: "day", step: 1, format: "%d %M" },
            { unit: "hour", step: 1, format: "%H" },
          ],
        },
        {
          name: "Days",
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: "week", step: 1, format: "Week #%W" },
            { unit: "day", step: 1, format: "%d %M" },
          ],
        },
        {
          name: "Months",
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: "month", step: 1, format: "%F" },
            { unit: "week", step: 1, format: "#%W" },
          ],
        },
      ],
    });
  };

  const setZoom = (value) => {
    if (!gantt.ext.zoom.getLevels()) {
      initZoom();
    }
    gantt.ext.zoom.setLevel(value);
  };

  setZoom(zoom);

  useEffect(() => {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.init(ganttContainerRef.current);
    initGanttDataProcessor();
    gantt.parse(dataSource);
    gantt.config.drag_resize = false;
    gantt.config.drag_move = true;

    return () => {
      if (dataProcessor) {
        dataProcessor.destructor();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  useEffect(() => {
    gantt.attachEvent("onTaskClick", (id) => {
      props.onTaskClick(id);
    });

    gantt.attachEvent("onTaskCreated", () => {
      props.onCreateTask();
    });

    return () => {
      gantt.detachEvent("onTaskClick");
      gantt.detachEvent("onTaskCreated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ganttContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};
