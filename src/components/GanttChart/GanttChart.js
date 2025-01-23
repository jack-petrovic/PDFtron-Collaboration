import React, { useRef, useEffect } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./GanttChart.css";

export const GanttChart = (props) => {
  const { dataSource, onDataUpdated, zoom, onTaskClick, onCreateTask } = props;
  const ganttContainerRef = useRef(null);
  let dataProcessor = null;

  const initGanttDataProcessor = () => {
    dataProcessor = gantt.createDataProcessor((type, action, item, id) => {
      return new Promise((resolve) => {
        if (onDataUpdated) {
          onDataUpdated(type, action, item, id);
        }
        resolve();
      });
    });
  };

  const weekScaleTemplate = (date) => {
    const dateToStr = gantt.date.date_to_str("%d %M");
    const endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
    return dateToStr(date) + " - " + dateToStr(endDate);
  };

  const setScaleConfig = (level) => {
    // eslint-disable-next-line default-case
    switch (level) {
      case "hour":
        gantt.config.scales = [
          { unit: "day", step: 1, format: "%d %M" },
          { unit: "hour", step: 1, format: "%H" },
        ];
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 30;
        break;
      case "day":
        gantt.config.scales = [
          { unit: "week", step: 1, format: weekScaleTemplate },
          { unit: "day", step: 1, format: "%d %M" },
        ];
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 70;
        break;
      case "month":
        gantt.config.scales = [
          { unit: "month", step: 1, format: "%F" },
          { unit: "week", step: 1, format: weekScaleTemplate },
        ];
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 70;
    }
  };

  useEffect(() => {
    setScaleConfig(zoom);
    gantt.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  useEffect(() => {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.init(ganttContainerRef.current);
    initGanttDataProcessor();
    gantt.config.drag_resize = false;
    gantt.config.drag_links = false;
    gantt.config.drag_move = true;

    return () => {
      if (dataProcessor) {
        dataProcessor.destructor();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gantt.clearAll();
    gantt.parse(dataSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  useEffect(() => {
    gantt.attachEvent("onTaskClick", (id) => {
      onTaskClick(id);
    });

    gantt.attachEvent("onTaskCreated", () => {
      onCreateTask();
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
