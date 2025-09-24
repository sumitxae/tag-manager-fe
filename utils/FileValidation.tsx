/**
 * File validation utilities for Excel file uploads
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a file is a supported Excel format
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export const validateExcelFile = (file: File): FileValidationResult => {
  // Check file type by extension
  const allowedExtensions = [".xlsx", ".xls"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "Please select a valid Excel file (.xlsx or .xls)",
    };
  }

  // Check MIME type
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file format. Please select an Excel file.",
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 10MB",
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "File cannot be empty",
    };
  }

  return { isValid: true };
};

/**
 * Formats file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Validates EPC number input
 * @param value - The EPC number as string
 * @returns Validation result
 */
export const validateEPCNumber = (value: string): FileValidationResult => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return {
      isValid: false,
      error: "EPC number is required",
    };
  }

  const numValue = Number(trimmedValue);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: "Please enter a valid number",
    };
  }

  // Check if it's a positive integer
  if (!Number.isInteger(numValue) || numValue <= 0) {
    return {
      isValid: false,
      error: "EPC number must be a positive integer",
    };
  }

  return { isValid: true };
};
