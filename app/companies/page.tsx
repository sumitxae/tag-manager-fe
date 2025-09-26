// src/app/companies/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Building2, Plus } from "lucide-react";
import {
  getCompanies,
  createCompany,
  Company as CompanyDto,
  CreateCompanyDto,
  ApiError,
  EpcScheme,
} from "@/utils/apiClient"; // Assuming these exist in your API client
import Link from "next/link";

//==============================================================================
// 1. CREATE COMPANY FORM COMPONENT
//==============================================================================
interface CreateCompanyFormProps {
  onCompanyCreated: () => void;
}

const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({
  onCompanyCreated,
}) => {
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: "",
    startNumber: 0,
    epcScheme: EpcScheme.SGTIN_96,
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    startNumber: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generateTrue, setGenerateTrue] = useState(true);

  const validateForm = (): boolean => {
    const errors = { name: "", startNumber: "" };
    let isValid = true;
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Company name must be at least 2 characters";
      isValid = false;
    }
    if (!/^\d{10}$/.test(formData.startNumber.toString())) {
      errors.startNumber = "Must be exactly 10 digits";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (field: keyof CreateCompanyDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createCompany(formData);
      onCompanyCreated(); // Notify parent to refresh the list
      setFormData({ name: "", startNumber: "", epcScheme: EpcScheme.SGTIN_96 });
      setFormErrors({ name: "", startNumber: "" });
    } catch (error) {
      const apiError = error as ApiError;
      setSubmitError(apiError.message || "Failed to create company.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 sticky top-8">
      <div className="card-body">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mr-4">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="card-title text-xl">Create New Company</h2>
            <p className="text-base-content/70 text-sm">
              Add a new company to the system
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold pb-1.5">
                Company Name
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter company name"
              className={`input input-bordered border w-full ${
                formErrors.name ? "input-error" : ""
              }`}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {formErrors.name && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.name}
                </span>
              </label>
            )}
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold pb-1.5 ">
                Default Start Number
              </span>
            </label>
            <input
              type="text"
              placeholder="1234567890"
              maxLength={10}
              className={`input input-bordered w-full border ${
                formErrors.startNumber ? "input-error" : ""
              }`}
              value={formData.startNumber}
              onChange={(e) =>
                handleInputChange(
                  "startNumber",
                  e.target.value.replace(/\D/g, "")
                )
              }
            />
            {formErrors.startNumber && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.startNumber}
                </span>
              </label>
            )}
          </div>
          {/* checkbox for generate upc */}{" "}
          <label className="label">
            <input
              type="checkbox"
              checked={generateTrue}
              onChange={() => {
                setGenerateTrue(!generateTrue);
                setFormData((prev) => ({
                  ...prev,
                  generateUpc: !generateTrue,
                }));
              }}
              className="checkbox border rounded-sm border-gray-400"
            />
            <span className="label-text font-semibold pl-2">Generate EPCs</span>
          </label>
          {/* epc scheme dropdown */}
          {generateTrue && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold pb-1.5">
                  EPC Scheme
                </span>
              </label>
              <select
                className="select border w-full  border-thin"
                value={formData.epcScheme}
                onChange={(e) =>
                  handleInputChange(
                    "epcScheme",
                    e.target.value as "GTIN" | "GIF"
                  )
                }
              >
                <div className="border">
                  <option className="border-b " value="GTIN">
                    GTIN
                  </option>
                  <option className="" value="GID">
                    GID
                  </option>
                </div>
              </select>
            </div>
          )}
          {submitError && (
            <div className="alert alert-error text-sm">{submitError}</div>
          )}
          <div className="card-actions pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn-primary w-full ${
                isSubmitting ? "loading" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//==============================================================================
// 2. COMPANY LIST COMPONENT
//==============================================================================
interface CompanyListProps {
  refreshTrigger: number;
}

const CompanyList: React.FC<CompanyListProps> = ({ refreshTrigger }) => {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to fetch companies.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, [refreshTrigger]); // Refreshes when the trigger number changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center">
          <Building2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">
            No companies found
          </h3>
          <p className="text-base-content/50">
            Create your first company to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">Existing Companies</h2>
        <div className="overflow-x-auto max-h-83">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Default Start Number</th>
                <th>EPC Scheme</th>
                <th>Number of UPCs</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="hover">
                  <td>
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-sm text-base-content/60">
                      ID: {company.id}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono">{company.startNumber}</span>
                  </td>
                  <td>
                    <div
                      className={`badge ${
                        company.epcScheme === EpcScheme.SGTIN_96
                          ? "badge-primary"
                          : "badge-secondary"
                      } p-2`}
                    >
                      {company.epcScheme.toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold">{company.upcCount}</span>
                  </td>
                  {/* <td>
                    <button className="btn btn-ghost btn-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

//==============================================================================
// 3. MAIN PAGE COMPONENT (DEFAULT EXPORT)
//==============================================================================
export default function CompaniesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompanyCreated = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="min-h-screen bg-base-100">
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
              <li>Companies</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 block ">
            <h1 className="text-3xl font-bold text-base-content mb-1">
              Company Management
            </h1>
            {/* <p className="text-base-content/70 ">
              Create new companies and manage existing ones
            </p> */}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <CreateCompanyForm onCompanyCreated={handleCompanyCreated} />
            </div>
            <div className="lg:col-span-2">
              <CompanyList refreshTrigger={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
