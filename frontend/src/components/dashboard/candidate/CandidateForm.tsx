// src/components/dashboard/candidate/CandidateForm.tsx

import { useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  MenuItem,
  FormHelperText,
  Paper,
  styled,
  Autocomplete
} from "@mui/material";
import { Popper, autocompleteClasses } from "@mui/material";

import { useTheme } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import type { StepConnectorProps } from "@mui/material/StepConnector";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

import { degrees } from "../../../constants/degrees";
import { courses } from "../../../constants/courses";
import { skills } from "../../../constants/skills";

const steps = ["Personal Info", "Education & Skills", "Disability Info", "Experience"];

const StyledStepConnector = styled(StepConnector)<StepConnectorProps>(({ theme }) => ({
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const ThreeColumnPopper = styled(Popper)(({ theme }) => ({
  [`& .${autocompleteClasses.listbox}`]: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

type FormValues = {
  name: string;
  gender: string;
  email: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  pincode: string;
  degree: string;
  branch: string;
  disability_type: string;
  disability_percentage: string;
  experience_type: string;
  skills: string[]; // now an array instead of string
  disability_certificate: File | null;
};

export default function CandidateForm() {
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    gender: "",
    email: "",
    phone: "",
    guardian_name: "",
    guardian_phone: "",
    pincode: "",
    degree: "",
    branch: "",
    disability_type: "",
    disability_percentage: "",
    experience_type: "",
    skills: [],
    disability_certificate: null,
  });

  const handleChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      ["name", "gender", "email", "phone", "guardian_name", "guardian_phone", "pincode"].forEach(field => {
        if (!formValues[field as keyof FormValues]) {
          newErrors[field] = "This field is required";
        }
      });
    } else if (step === 1) {
      ["degree", "branch", "skills"].forEach(field => {
        if (
          field === "skills"
            ? formValues.skills.length === 0
            : !formValues[field as keyof FormValues]
        ) {
          newErrors[field] = "This field is required";
        }
      });
    } else if (step === 2) {
      ["disability_type", "disability_percentage"].forEach(field => {
        if (!formValues[field as keyof FormValues]) {
          newErrors[field] = "This field is required";
        }
      });
    } else if (step === 3) {
      ["experience_type"].forEach(field => {
        if (!formValues[field as keyof FormValues]) {
          newErrors[field] = "This field is required";
        }
      });
    }

    setErrors(newErrors);
    setStepErrors(prev => ({ ...prev, [step]: Object.keys(newErrors).length > 0 }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep(steps.length);
  };

  const renderStepContent = (step: number) => {
    const twoColumnGrid = { display: "grid", gridTemplateColumns: { sm: "1fr 1fr" }, gap: 2 };

    switch (step) {
      case 0:
        return (
          <Box sx={twoColumnGrid}>
            <TextField
              label="Full Name"
              value={formValues.name}
              onChange={e => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              select
              label="Gender"
              value={formValues.gender}
              onChange={e => handleChange("gender", e.target.value)}
              error={!!errors.gender}
              helperText={errors.gender}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Email"
              type="email"
              value={formValues.email}
              onChange={e => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />

            <Box>
              <PhoneInput
                country={"in"}
                value={formValues.phone}
                onChange={phone => handleChange("phone", phone)}
                inputStyle={{
                  width: "100%",
                  height: "56px",
                  borderRadius: 4,
                }}
                buttonStyle={{ borderRadius: 4 }}
                specialLabel=""
              />
              {errors.phone && <FormHelperText error>{errors.phone}</FormHelperText>}
            </Box>

            <TextField
              label="Guardian Name"
              value={formValues.guardian_name}
              onChange={e => handleChange("guardian_name", e.target.value)}
              error={!!errors.guardian_name}
              helperText={errors.guardian_name}
            />

            <Box>
              <PhoneInput
                country={"in"}
                value={formValues.guardian_phone}
                onChange={phone => handleChange("guardian_phone", phone)}
                inputStyle={{
                  width: "100%",
                  height: "56px",
                  borderRadius: 4,
                }}
                buttonStyle={{ borderRadius: 4 }}
                specialLabel=""
              />
              {errors.guardian_phone && <FormHelperText error>{errors.guardian_phone}</FormHelperText>}
            </Box>

            <TextField
              label="Pincode"
              value={formValues.pincode}
              onChange={e => handleChange("pincode", e.target.value)}
              error={!!errors.pincode}
              helperText={errors.pincode}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={twoColumnGrid}>
            <TextField
              select
              label="Degree"
              value={formValues.degree}
              onChange={e => handleChange("degree", e.target.value)}
              error={!!errors.degree}
              helperText={errors.degree}
            >
              {degrees.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Branch / Course"
              value={formValues.branch}
              onChange={e => handleChange("branch", e.target.value)}
              error={!!errors.branch}
              helperText={errors.branch}
            >
              {courses.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              multiple
              options={skills}
              value={formValues.skills}
              onChange={(_, newValue) => handleChange("skills", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  error={!!errors.skills}
                  helperText={errors.skills}
                />
              )}
              filterSelectedOptions
              PopperComponent={ThreeColumnPopper} // Use custom 3-col popper
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={twoColumnGrid}>
            <TextField
              label="Disability Type"
              value={formValues.disability_type}
              onChange={e => handleChange("disability_type", e.target.value)}
              error={!!errors.disability_type}
              helperText={errors.disability_type}
            />

            <TextField
              label="Disability Percentage"
              type="number"
              value={formValues.disability_percentage}
              onChange={e => handleChange("disability_percentage", String(e.target.value))}
              error={!!errors.disability_percentage}
              helperText={errors.disability_percentage}
            />

            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Upload Disability Certificate
              <input
                type="file"
                hidden
                onChange={e => handleChange("disability_certificate", e.target.files?.[0] ?? null)}
              />
            </Button>
            {formValues.disability_certificate && (
              <FormHelperText>{formValues.disability_certificate.name}</FormHelperText>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={twoColumnGrid}>
            <TextField
              label="Experience Type"
              value={formValues.experience_type}
              onChange={e => handleChange("experience_type", e.target.value)}
              error={!!errors.experience_type}
              helperText={errors.experience_type}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 5, background: theme.palette.background.default }}>
      <Stepper activeStep={activeStep} alternativeLabel connector={<StyledStepConnector />}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              error={!!stepErrors[index]}
              icon={!stepErrors[index] && activeStep > index ? <CheckCircleIcon color="success" /> : undefined}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {activeStep === steps.length ? (
          <Typography variant="h6" color="success.main">
            All steps completed - Candidate Registered!
          </Typography>
        ) : (
          <>
            {renderStepContent(activeStep)}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}
