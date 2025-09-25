"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { Upload, CheckCircle } from "@mui/icons-material";

import { validateExcelFile } from "@/utils/FileValidation";
import {
  processExcelFile,
  mockProcessExcelFile,
  getCompaniesForDropdown, // NEW: Import function to get companies
  CompanyDropdownDto, // NEW: Import type for company dropdown
  ApiError,
} from "@/utils/apiClient";
import { FileUpload } from "@/components/FileUpload";
// REMOVED: No longer need the EPCInput component
// import { EPCInput } from "@/components/EPCInput";

// NEW: Updated form state interface
interface FormState {
  file: File | null;
  selectedCompany: string; // CHANGED: from epcNumber to selectedCompany
  isSubmitting: boolean;
  submitError: string;
  successMessage: string;
}

export const ProcessingForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    file: null,
    selectedCompany: "", // CHANGED: Initialize as empty string
    isSubmitting: false,
    submitError: "",
    successMessage: "",
  });

  // NEW: State for the company dropdown
  const [companies, setCompanies] = useState<CompanyDropdownDto[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState("");

  const [fileError, setFileError] = useState<string>("");

  // NEW: useEffect to fetch companies when the component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyList = await getCompaniesForDropdown();
        setCompanies(companyList);
      } catch (error) {
        console.log("Error fetching companies:", error);
        setCompaniesError(
          "Failed to load company list. Please refresh the page."
        );
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const clearMessages = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      submitError: "",
      successMessage: "",
    }));
  }, []);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      clearMessages();
      if (file) {
        const validation = validateExcelFile(file);
        if (validation.isValid) {
          setFileError("");
          setFormState((prev) => ({ ...prev, file }));
        } else {
          setFileError(validation.error || "Invalid file");
          setFormState((prev) => ({ ...prev, file: null }));
        }
      } else {
        setFileError("");
        setFormState((prev) => ({ ...prev, file: null }));
      }
    },
    [clearMessages]
  );

  // NEW: Handler for the company dropdown
  const handleCompanyChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      clearMessages();
      setFormState((prev) => ({
        ...prev,
        selectedCompany: event.target.value,
      }));
    },
    [clearMessages]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation check
      if (!formState.file || !formState.selectedCompany) {
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        submitError: "",
        successMessage: "",
      }));

      try {
        const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

        // CHANGED: Pass selectedCompany instead of epcNumber
        // const processedFileBlob = useMockApi
        //   ? await mockProcessExcelFile(
        //       formState.file!,
        //       formState.selectedCompany
        //     )
        //   : await processExcelFile(formState.file!, formState.selectedCompany);

        const { blob: processedFileBlob, filename } = await processExcelFile(
          formState.file!,
          formState.selectedCompany
        );
        const url = URL.createObjectURL(processedFileBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          successMessage: "File processed successfully and downloaded!",
          file: null,
          selectedCompany: "", // Reset selected company
        }));
        setFileError("");
      } catch (error) {
        const apiError = error as ApiError;
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          submitError:
            apiError.message || "An error occurred while processing the file.",
        }));
      }
    },
    [formState.file, formState.selectedCompany]
  );

  // CHANGED: Updated form validation check
  const isFormValid = formState.file && formState.selectedCompany && !fileError;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{ p: 4, backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Excel File Processor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a company and upload an Excel file to generate EPCs
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* NEW: Company Dropdown Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Company
              </Typography>
              <FormControl
                fullWidth
                required
                disabled={formState.isSubmitting || companiesLoading}
              >
                <InputLabel id="company-select-label">Company</InputLabel>
                <Select
                  labelId="company-select-label"
                  value={formState.selectedCompany}
                  label="Company"
                  onChange={handleCompanyChange}
                >
                  {companiesLoading ? (
                    <MenuItem disabled>
                      <em>Loading companies...</em>
                    </MenuItem>
                  ) : companiesError ? (
                    <MenuItem disabled>
                      <em>Error loading companies</em>
                    </MenuItem>
                  ) : (
                    companies.map((company) => (
                      <MenuItem key={company.id} value={company.name}>
                        {company.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {companiesError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {companiesError}
                </Alert>
              )}
            </Box>

            {/* File Upload Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Excel File
              </Typography>
              <FileUpload
                file={formState.file}
                onFileSelect={handleFileSelect}
                error={fileError}
                disabled={formState.isSubmitting}
              />
            </Box>

            {/* REMOVED: EPC Input Section is gone */}

            {/* Error & Success Messages */}
            <Collapse in={Boolean(formState.submitError)}>
              <Alert severity="error" sx={{ mt: 1 }}>
                {formState.submitError}
              </Alert>
            </Collapse>
            <Collapse in={Boolean(formState.successMessage)}>
              <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 1 }}>
                {formState.successMessage}
              </Alert>
            </Collapse>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!isFormValid || formState.isSubmitting}
              startIcon={
                formState.isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Upload />
                )
              }
              sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}
            >
              {formState.isSubmitting ? "Processing..." : "Process File"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ProcessingForm;
