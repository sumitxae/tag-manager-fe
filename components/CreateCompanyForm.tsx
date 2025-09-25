"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import {
  createCompany,
  CreateCompanyDto,
  EpcScheme,
  ApiError,
} from "@/utils/apiClient";

interface CreateCompanyFormProps {
  onCompanyCreated: () => void; // Callback to refresh the list
}

export const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({
  onCompanyCreated,
}) => {
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: "",
    startNumber: 1,
    epcScheme: EpcScheme.SGTIN_96,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [startNumberError, setStartNumberError] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "startNumber") {
      const numericValue = value.replace(/[^0-9]/g, ""); // Allow only digits
      if (numericValue.length > 10) return; // Prevent typing more than 10 digits

      setFormData((prev) => ({ ...prev, [name]: Number(numericValue) }));

      if (numericValue.length !== 10 && numericValue.length > 0) {
        setStartNumberError("Start number must be exactly 10 digits.");
      } else {
        setStartNumberError(""); // Clear error if valid
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler specifically for the Select dropdown
  const handleSelectChange = (e: SelectChangeEvent<EpcScheme>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startNumber.toString().length !== 10) {
      setStartNumberError("Start number must be exactly 10 digits.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await createCompany(formData);
      setSuccess(`Company '${formData.name}' created successfully!`);
      setFormData({ name: "", startNumber: 1, epcScheme: EpcScheme.SGTIN_96 }); // Reset form
      onCompanyCreated(); // Trigger list refresh
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Create New Company
      </Typography>
      <TextField
        label="Company Name"
        name="name"
        value={formData.name}
        onChange={handleTextChange}
        required
        fullWidth
        disabled={isLoading}
      />
      <TextField
        label="Default Start Number"
        name="startNumber"
        type="number"
        value={formData.startNumber === 0 ? "" : formData.startNumber}
        onChange={handleTextChange}
        required
        fullWidth
        disabled={isLoading}
        error={!!startNumberError}
        helperText={startNumberError || "Must be a 10-digit number."}
        inputProps={{
          maxLength: 10,
        }}
      />
      <FormControl fullWidth required disabled={isLoading}>
        <InputLabel id="epc-scheme-label">EPC Scheme</InputLabel>
        {/* @typescript-eslint/no-explicit-any */}
        <Select
          labelId="epc-scheme-label"
          name="epcScheme"
          value={formData.epcScheme}
          label="EPC Scheme"
          onChange={handleSelectChange}
        >
          {Object.values(EpcScheme).map((scheme) => (
            <MenuItem key={scheme} value={scheme}>
              {scheme}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Button
        type="submit"
        variant="contained"
        disabled={
          isLoading ||
          !formData.name ||
          !!startNumberError ||
          formData.startNumber.toString().length !== 10
        }
        sx={{ mt: 1, py: 1.5 }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Add Company"}
      </Button>
    </Box>
  );
};
