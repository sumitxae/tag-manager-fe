"use client";

import React, { useState, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Collapse,
} from "@mui/material";
import { Upload, CheckCircle } from "@mui/icons-material";

import { validateExcelFile, validateEPCNumber } from "@/utils/FileValidation";
import {
  processExcelFile,
  mockProcessExcelFile,
  ApiError,
} from "@/utils/apiClient";
import { FileUpload } from "@/components/FileUpload";
import { EPCInput } from "@/components/EPCInput";

interface FormState {
  file: File | null;
  epcNumber: string;
  isSubmitting: boolean;
  submitError: string;
  successMessage: string;
}

export const ProcessingForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    file: null,
    epcNumber: "",
    isSubmitting: false,
    submitError: "",
    successMessage: "",
  });

  const [fileError, setFileError] = useState<string>("");
  const [epcValid, setEpcValid] = useState(false);

  // Clear messages when form changes
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

  const handleEPCChange = useCallback(
    (value: string, isValid: boolean) => {
      clearMessages();
      setEpcValid(isValid);
      setFormState((prev) => ({ ...prev, epcNumber: value }));
    },
    [clearMessages]
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    // Validate file
    if (!formState.file) {
      setFileError("Please select an Excel file");
      isValid = false;
    } else {
      const fileValidation = validateExcelFile(formState.file);
      if (!fileValidation.isValid) {
        setFileError(fileValidation.error || "Invalid file");
        isValid = false;
      }
    }

    // Validate EPC number
    const epcValidation = validateEPCNumber(formState.epcNumber);
    if (!epcValidation.isValid) {
      isValid = false;
    }

    return isValid;
  }, [formState.file, formState.epcNumber]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        submitError: "",
        successMessage: "",
      }));

      try {
        // Choose between mock and real API based on environment
        const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

        const processedFileBlob = useMockApi
          ? await mockProcessExcelFile(formState.file!, formState.epcNumber)
          : await processExcelFile(formState.file!, formState.epcNumber);

        // Create download link and trigger download
        const url = URL.createObjectURL(processedFileBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `processed_${formState.file!.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          successMessage: "File processed successfully and downloaded!",
          file: null, // Reset file after successful processing
          epcNumber: "", // Reset EPC number
        }));

        // Reset file error and validation states
        setFileError("");
        setEpcValid(false);
      } catch (error) {
        const apiError = error as ApiError;
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          submitError:
            apiError.message ||
            "An error occurred while processing the file. Please check your file format and try again.",
        }));
      }
    },
    [formState.file, formState.epcNumber, validateForm]
  );

  const isFormValid = formState.file && epcValid && !fileError;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Excel File Processor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your Excel file with UPC codes and get processed results
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
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

            {/* EPC Input Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Starting EPC Number
              </Typography>
              <EPCInput
                value={formState.epcNumber}
                onChange={handleEPCChange}
                disabled={formState.isSubmitting}
              />
            </Box>

            {/* Error Message */}
            <Collapse in={Boolean(formState.submitError)}>
              <Alert severity="error" sx={{ mt: 1 }}>
                {formState.submitError}
              </Alert>
            </Collapse>

            {/* Success Message */}
            <Collapse in={Boolean(formState.successMessage)}>
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{ mt: 1 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, successMessage: "" }))
                    }
                  >
                    Process Another File
                  </Button>
                }
              >
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
              sx={{
                mt: 2,
                py: 1.5,
                minHeight: 48,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: 4,
                },
                "&:disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                },
              }}
            >
              {formState.isSubmitting ? "Processing..." : "Process File"}
            </Button>

            {/* Form Requirements */}
            <Box
              sx={{
                p: 2,
                backgroundColor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Requirements:</strong>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="ul"
                sx={{ pl: 2, m: 0 }}
              >
                <li>Excel file (.xlsx or .xls format)</li>
                <li>File must contain items with UPC codes and quantities</li>
                <li>Maximum file size: 10MB</li>
                <li>EPC number must be a positive integer</li>
              </Typography>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ProcessingForm;
