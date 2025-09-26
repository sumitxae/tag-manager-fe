"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Upload,
  FileSpreadsheet,
  ChevronDown,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  Loader2 as Spinner, // Using a different spinner icon for clarity
} from "lucide-react";
import { validateExcelFile } from "@/utils/FileValidation";
import {
  processExcelFile,
  getCompaniesForDropdown,
  CompanyDropdownDto,
  ApiError,
} from "@/utils/apiClient";
import Link from "next/link";

export default function UploadPage() {
  // State for form inputs
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  // State for company data fetching
  const [companies, setCompanies] = useState<CompanyDropdownDto[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState("");

  // State for submission process
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [generateTrue, setGenerateTrue] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyList = await getCompaniesForDropdown();
        setCompanies(companyList);
      } catch (error) {
        console.error("Error fetching companies:", error);
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
    setFileError("");
    setSubmitError("");
    setSuccessMessage("");
  }, []);

  const handleCompanySelect = useCallback(
    (companyId: string) => {
      clearMessages();
      setSelectedCompanyId(companyId);
      // Close the dropdown manually if needed by focusing away
      (document.activeElement as HTMLElement)?.blur();
    },
    [clearMessages]
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      clearMessages();
      const file = event.target.files?.[0];

      if (file) {
        const validation = validateExcelFile(file);
        if (validation.isValid) {
          setUploadedFile(file);
        } else {
          setFileError(validation.error || "Invalid file selected.");
          setUploadedFile(null);
          event.target.value = ""; // Clear the input
        }
      } else {
        setUploadedFile(null);
      }
    },
    [clearMessages]
  );

  const handleProcess = useCallback(async () => {
    const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
    if (!selectedCompany || !uploadedFile) return;

    clearMessages();
    setIsProcessing(true);

    try {
      // The API client from the old code expects the company name
      const { blob: processedFileBlob, filename } = await processExcelFile(
        uploadedFile,
        selectedCompany.name
      );

      // Create a link and trigger the download
      const url = URL.createObjectURL(processedFileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage("File processed successfully and downloaded!");

      // Reset form state
      setSelectedCompanyId("");
      setUploadedFile(null);
      // To clear the file input visually, you might need a ref or a key change
      // For simplicity, we'll rely on the user selecting a new file
      const fileInput = document.getElementById(
        "file-upload-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      const apiError = error as ApiError;
      setSubmitError(apiError.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCompanyId, uploadedFile, companies, clearMessages]);

  // const selectedCompanyName =
  //   companies.find((c) => c.id === selectedCompanyId)?.name ||
  //   "Choose a company...";
  const canProcess =
    selectedCompanyId && uploadedFile && !fileError && !isProcessing;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm border-b">
        <div className="flex-1">
          <Link
            href="/"
            className="btn btn-ghost normal-case text-xl font-bold"
          >
            <Building2 className="w-6 h-6 mr-2" />
            Tag Markers
          </Link>
        </div>
        <div className="flex-none">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>File Upload</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Main Form Card */}
          <div className="card bg-base-100 shadow-xl border border-base-300 rounded-2xl">
            <div className="card-body flex flex-col items-center space-y-6 ">
              {/* header */}
              <div className="text-center mb-8 w-full flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-base-content mb-2 text-center">
                  Upload Excel File
                </h1>
                <p className="text-base-content/70">
                  Select a company and upload your Excel file for processing
                </p>
              </div>
              {/* Company Selection */}
              <div className="form-control w-full max-w-md mx-auto">
                <label className="label flex justify-start">
                  <span className="label-text font-semibold">
                    Select Company
                  </span>
                  <span className="label-text-alt text-error text-xs">*</span>
                </label>
                <div className="dropdown dropdown-bottom w-full border border-gray-300 rounded-lg">
                  <div
                    tabIndex={0}
                    role="button"
                    className={`btn w-full justify-between font-normal normal-case ${
                      selectedCompanyId
                        ? "btn-primary text-primary-content rounded-lg"
                        : "btn-ghost"
                    }`}
                  >
                    <span className="flex items-center">
                      {companiesLoading ? (
                        <Spinner className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Building2 className="w-4 h-4 mr-2" />
                      )}
                      {companiesLoading
                        ? "Loading companies..."
                        : companies.find((c) => c.id === selectedCompanyId)
                            ?.name || "Choose a company..."}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300 mt-1 max-h-60 overflow-y-auto"
                  >
                    {companiesError ? (
                      <li>
                        <span className="text-error">{companiesError}</span>
                      </li>
                    ) : (
                      companies.map((company) => (
                        <li key={company.id}>
                          <a
                            onClick={() => handleCompanySelect(company.id)}
                            className={
                              selectedCompanyId === company.id ? "active" : ""
                            }
                          >
                            <Building2 className="w-4 h-4" />
                            {company.name}
                          </a>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* File Upload */}
              <div className="form-control w-full max-w-md mx-auto">
                <label className="label flex justify-start">
                  <span className="label-text font-semibold">
                    Upload Excel File
                  </span>
                  <span className="label-text-alt text-error text-xs">*</span>
                </label>

                <div className="relative p-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="file-input file-input-bordered file-input-primary w-full"
                  />
                </div>

                <label className="label flex justify-between">
                  <span className="label-text-alt">
                    Supported formats: .xlsx, .xls
                  </span>
                  <span className="label-text-alt">Max size: 10MB</span>
                </label>
                {fileError && (
                  <div className="alert alert-error mt-2">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
              {/* Status Messages */}
              {successMessage && (
                <div className="alert alert-success w-full max-w-md mx-auto">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>{successMessage}</span>
                </div>
              )}
              {submitError && (
                <div className="alert alert-error w-full max-w-md mx-auto">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Process Button */}
              <div className="form-control w-full max-w-md mx-auto pt-4">
                <button
                  onClick={handleProcess}
                  disabled={!canProcess}
                  className="btn btn-primary btn-lg rounded-lg w-full"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="animate-spin w-5 h-5 mr-2" />
                      Processing File...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-5 h-5 mr-2" />
                      Process File
                    </>
                  )}
                </button>
                {/* {!canProcess && !isProcessing && (
                  <div className="flex justify-center w-full">
                    <label className="label w-full max-w-md flex justify-center">
                      <span className="label-text-alt text-base-content/60 text-center break-words">
                        Please select a company and upload a valid file to
                        continue
                      </span>
                    </label>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        {/* <div className="card bg-base-200 shadow-sm border border-base-300 mt-6">
          <div className="card-body">
            <h3 className="card-title text-lg">Instructions</h3>
            <div className="space-y-2 text-sm text-base-content/70">
              <div className="flex items-start">
                <span className="badge badge-primary badge-sm mr-2 mt-0.5">
                  1
                </span>
                <span>Select the company from the dropdown menu</span>
              </div>
              <div className="flex items-start">
                <span className="badge badge-primary badge-sm mr-2 mt-0.5">
                  2
                </span>
                <span>Upload your Excel file (.xlsx or .xls format)</span>
              </div>
              <div className="flex items-start">
                <span className="badge badge-primary badge-sm mr-2 mt-0.5">
                  3
                </span>
                <span>Click "Process File" to begin processing</span>
              </div>
              <div className="flex items-start">
                <span className="badge badge-primary badge-sm mr-2 mt-0.5">
                  4
                </span>
                <span>Wait for the processing to complete</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
