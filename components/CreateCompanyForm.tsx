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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        onChange={handleChange}
        required
        fullWidth
        disabled={isLoading}
      />
      <TextField
        label="Default Start Number"
        name="startNumber"
        type="number"
        value={formData.startNumber}
        onChange={handleChange}
        required
        fullWidth
        disabled={isLoading}
        inputProps={{ min: 1 }}
      />
      <FormControl fullWidth required disabled={isLoading}>
        <InputLabel id="epc-scheme-label">EPC Scheme</InputLabel>
        <Select
          labelId="epc-scheme-label"
          name="epcScheme"
          value={formData.epcScheme}
          label="EPC Scheme"
          onChange={handleChange as any} // MUI Select has a different event type
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
        disabled={isLoading || !formData.name}
        sx={{ mt: 1, py: 1.5 }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Add Company"}
      </Button>
    </Box>
  );
};
