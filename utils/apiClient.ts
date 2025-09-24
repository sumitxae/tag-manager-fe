/**
 * API client for handling Excel file processing
 */

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Process Excel file using the backend API
 * @param file - The Excel file to process
 * @param epcNumber - Optional EPC number for processing
 * @returns Promise<Blob> - The processed file as a Blob
 */
export const processExcelFile = async (
  file: File,
  startNumber: string
): Promise<Blob> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("startNumber", startNumber);

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const response = await fetch(`${baseUrl}/generator/process`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Processing failed";

      try {
        // Try to parse error response as JSON first
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If not JSON, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Use status-based error messages
          switch (response.status) {
            case 400:
              errorMessage =
                "Invalid file format or missing required data. Please check your Excel file.";
              break;
            case 413:
              errorMessage = "File too large. Please upload a smaller file.";
              break;
            case 422:
              errorMessage =
                "Invalid file content. Please check your Excel file format and data.";
              break;
            case 500:
              errorMessage =
                "Server error occurred while processing. Please try again later.";
              break;
            default:
              errorMessage = `Processing failed with status ${response.status}`;
          }
        }
      }

      throw new ApiError(errorMessage, response.status);
    }

    // Check if response is actually a file
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/")) {
      throw new ApiError("Invalid response format from server");
    }

    return response.blob();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Network error: Unable to connect to server. Please check your connection."
      );
    }

    throw new ApiError("An unexpected error occurred. Please try again.");
  }
};

/**
 * Mock function for testing - simulates API processing
 * @param file - The Excel file to process
 * @param startNumber - Starting EPC number for processing
 * @returns Promise<Blob> - Mock processed file as a Blob
 */
export const mockProcessExcelFile = async (
  file: File,
  startNumber: string
): Promise<Blob> => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate file validation errors
  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    throw new ApiError("File size too large. Maximum size allowed is 10MB.");
  }

  // Simulate invalid file format error
  if (
    !file.name.toLowerCase().endsWith(".xlsx") &&
    !file.name.toLowerCase().endsWith(".xls")
  ) {
    throw new ApiError(
      "Invalid file format. Please upload an Excel file (.xlsx or .xls)."
    );
  }

  // Simulate random processing errors (5% chance)
  if (Math.random() < 0.05) {
    throw new ApiError(
      "Processing failed: Invalid data format in Excel file. Please check your file structure."
    );
  }

  // Create mock processed content with sequential EPC numbers
  const startNum = parseInt(startNumber) || 1;
  const csvContent = `Product Name,EPC Number,UPC Code,Original Price,Processed Price,Status
iPhone 14,${startNum
    .toString()
    .padStart(12, "0")},123456789012,999,899,Processed
Samsung Galaxy S23,${(startNum + 1)
    .toString()
    .padStart(12, "0")},123456789013,849,765,Processed
iPad Pro,${(startNum + 2)
    .toString()
    .padStart(12, "0")},123456789014,1099,989,Processed
MacBook Air,${(startNum + 3)
    .toString()
    .padStart(12, "0")},123456789015,1199,1079,Processed
Dell XPS 13,${(startNum + 4)
    .toString()
    .padStart(12, "0")},123456789016,1099,989,Processed`;

  return new Blob([csvContent], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
