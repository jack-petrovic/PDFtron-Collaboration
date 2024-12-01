export const tableCellStyle = {
  borderRight: 1,
  borderColor: "#d4d4d4",
};

const styles = {
  tableContainer: {
    paddingX: "20px",
    paddingBottom: "50px",
    overflow: "auto",
  },
  table: {
    border: 1,
    borderColor: "#d4d4d4",
  },
  tableHeader: {
    ...tableCellStyle,
    background: "#909090",
    color: "white",
  },
  sumLabel: {
    ...tableCellStyle,
    fontWeight: 500,
    fontSize: 15,
  },
  sumValue: {
    ...tableCellStyle,
    fontWeight: 600,
    fontSize: 15,
  },
};

export default styles;
