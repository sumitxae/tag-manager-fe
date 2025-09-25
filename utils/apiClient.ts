// --- Custom Error Class ---
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// --- Frontend Types and Enums ---

export interface CompanyDropdownDto {
  id: string;
  name: string;
}

// Matches the EpcScheme enum on the backend
export enum EpcScheme {
  SGTIN_96 = "GTIN",
  GID_96 = "GID",
}

// Matches the CreateCompanyDto on the backend
export interface CreateCompanyDto {
  name: string;
  startNumber: number;
  epcScheme: EpcScheme;
}

// Matches the CompanyResponseDto on the backend
export interface Company {
  id: string;
  name: string;
  startNumber: number;
  epcScheme: EpcScheme;
  upcCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- Company Management Functions ---

/**
 * Fetches all companies from the backend.
 */
export async function getCompanies(): Promise<Company[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/company`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.message || "Failed to fetch companies",
      response.status
    );
  }
  return response.json();
}

/**
 * Creates a new company.
 */
export async function createCompany(
  companyData: CreateCompanyDto
): Promise<Company> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.message || "Failed to create company",
      response.status
    );
  }
  return response.json();
}

export async function getCompaniesForDropdown(): Promise<CompanyDropdownDto[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/company/dropdown`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.message || "Failed to fetch company list",
      response.status
    );
  }
  return response.json();
}

// --- File Processing Functions ---

/**
 * Process Excel file for a specific company using the backend API.
 * @param file - The Excel file to process.
 * @param companyName - The name of the company to process the file for.
 * @returns Promise<Blob> - The processed file as a Blob.
 */
export const processExcelFile = async (
  file: File,
  companyName: string
): Promise<{ blob: Blob; filename: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyName", companyName);

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const response = await fetch(`${baseUrl}/generator/process/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Processing failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Fallback error handling
        errorMessage = `Processing failed with status ${response.status}`;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const disposition = response.headers.get("Content-Disposition");
    let filename = "processed_files.zip"; // A fallback filename
    if (disposition && disposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }
    const blob = await response.blob();
    return { blob, filename };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError("Network error: Could not connect to the server.");
    }
    throw new ApiError("An unexpected error occurred. Please try again.");
  }
};

/**
 * Mock function for testing file processing.
 * @param file - The Excel file to process.
 * @param companyName - The name of the company.
 * @returns Promise<Blob> - Mock processed file as a Blob.
 */
// export const mockProcessExcelFile = async (
//   file: File,
//   companyName: string
// ): Promise<Blob> => {
//   console.warn(`Mock API call for company: ${companyName}`);
//   await new Promise((resolve) => setTimeout(resolve, 1500));

//   if (file.size > 10 * 1024 * 1024) {
//     throw new ApiError("File size too large (Max 10MB).");
//   }

//   const startNum = 1;
//   const csvContent = `Product Name,EPC Number,UPC Code,Status
// Product A,${startNum},123456789012,Processed
// Product B,${startNum + 1},123456789013,Processed`;

//   return new Blob([csvContent], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
// };
