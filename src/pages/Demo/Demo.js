import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Grid,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import ImageIcon from "@mui/icons-material/Image";
import WorkIcon from "@mui/icons-material/Work";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import Divider from "@mui/material/Divider";
import SaveProgress from "./components/SaveProgress";
import CustomSnackbar from "./components/Snackbar";
import CustomDataGrid from "./components/CustomDataGrid";
import DiscreteSlider from "./components/Sliders";
import CustomAppBar from "./components/CustomAppBar";
import { useTranslation } from "react-i18next";

const chipData = [
  { key: 1, label: "React" },
  { key: 2, label: "Vue.js" },
];

const DemoPage = () => {
  const [alignment, setAlignment] = useState("javascript");
  const [gender, setGender] = useState("");
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);
  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  const handleChangeGender = (event) => {
    setGender(event.target.value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box width={"calc(100vw - 200px)"} height="100vh">
        <CustomAppBar />
        <Box px={4} mt={10}>
          <Grid container spacing={4}>
            <Grid item xs={12} lg={4}>
              <Box width="100%" display="flex" flexDirection="column" gap={4}>
                <Box maxWidth={300}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>Accordion 1</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Box>
                <Box width="100%">
                  <List
                    sx={{
                      width: "100%",
                      maxWidth: 360,
                      bgcolor: "background.paper",
                    }}
                  >
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <ImageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Photos" secondary="Jan 9, 2023" />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <WorkIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Work" secondary="Jan 7, 2023" />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <BeachAccessIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Vacation"
                        secondary="July 20, 2023"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box display="flex" flexDirection="column" gap={4}>
                <Box maxWidth={300}>
                  <TextField label="Email" variant="outlined" fullWidth />
                </Box>
                <Box maxWidth={300}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={gender}
                      label="Gender"
                      onChange={handleChangeGender}
                    >
                      <MenuItem key="male" value="M">
                        {getLocaleString("Male")}
                      </MenuItem>
                      <MenuItem key="female" value="F">
                        {getLocaleString("Female")}
                      </MenuItem>
                      <MenuItem key="other" value="O">
                        {getLocaleString("Other")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="Label"
                    />
                    <FormControlLabel
                      required
                      control={<Checkbox />}
                      label="Required"
                    />
                    <FormControlLabel
                      disabled
                      control={<Checkbox />}
                      label="Disabled"
                    />
                  </FormGroup>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Label"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="secondary" />}
                    label="Label"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="warning" />}
                    label="Label"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="default" />}
                    label="Label"
                  />
                </Box>
                <Box>
                  <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    aria-label="Platform"
                  >
                    <ToggleButton value="react">React</ToggleButton>
                    <ToggleButton value="javascript">Javascript</ToggleButton>
                    <ToggleButton value="css">CSS</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box display="flex" gap={1}>
                  {chipData.map((data, index) => {
                    let icon;

                    if (data.label === "React") {
                      icon = <TagFacesIcon />;
                    }

                    return (
                      <Chip
                        key={data.key}
                        icon={icon}
                        label={data.label}
                        onDelete={() => null}
                        color={index === 1 ? "primary" : "secondary"}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box display="flex" flexDirection="column" gap={4}>
                <Box maxWidth={300}>
                  <DatePicker label="" defaultValue={dayjs()} />
                </Box>
                <SaveProgress />
                <CustomSnackbar />
                <DiscreteSlider />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <CustomDataGrid />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DemoPage;
