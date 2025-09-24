"use client";

import React, { useCallback, useState } from "react";
import { Box, Paper, Typography, IconButton, Alert, Chip } from "@mui/material";
import { CloudUpload, Description, Clear } from "@mui/icons-material";
import { validateExcelFile, formatFileSize } from "@/utils/FileValidation";

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileSelect,
  error,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const selectedFile = files[0];
        const validation = validateExcelFile(selectedFile);

        if (validation.isValid) {
          onFileSelect(selectedFile);
        } else {
          onFileSelect(null);
          // Error will be handled by parent component
        }
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const selectedFile = files[0];
        const validation = validateExcelFile(selectedFile);

        if (validation.isValid) {
          onFileSelect(selectedFile);
        } else {
          onFileSelect(null);
        }
      }
      // Reset input value to allow selecting same file again
      e.target.value = "";
    },
    [onFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    const fileInput = document.getElementById(
      "file-upload-input"
    ) as HTMLInputElement;
    fileInput?.click();
  }, [disabled]);

  return (
    <Box>
      {/* Hidden file input */}
      <input
        id="file-upload-input"
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {/* Upload area */}
      <Paper
        elevation={dragOver ? 8 : 3}
        sx={{
          p: 3,
          border: dragOver ? "2px dashed #1976d2" : "2px dashed #e0e0e0",
          backgroundColor: dragOver ? "#f3f7ff" : "background.paper",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.3s ease-in-out",
          opacity: disabled ? 0.6 : 1,
          "&:hover": {
            borderColor: disabled ? "#e0e0e0" : "#1976d2",
            backgroundColor: disabled ? "background.paper" : "#f8f9fa",
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          gap={2}
        >
          <CloudUpload
            sx={{
              fontSize: 48,
              color: dragOver ? "primary.main" : "text.secondary",
              transition: "color 0.3s ease-in-out",
            }}
          />

          {!file ? (
            <>
              <Typography variant="h6" color="text.primary">
                {dragOver ? "Drop your Excel file here" : "Upload Excel File"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag and drop your file here, or click to browse
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                Supported formats: .xlsx, .xls (Max size: 10MB)
              </Typography>
            </>
          ) : (
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Description color="primary" />
              <Box flex={1} textAlign="left">
                <Typography variant="body1" color="text.primary" noWrap>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              <Chip
                label="Selected"
                color="success"
                size="small"
                variant="outlined"
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={disabled}
                sx={{
                  "&:hover": {
                    backgroundColor: "error.light",
                    color: "error.contrastText",
                  },
                }}
              >
                <Clear />
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
