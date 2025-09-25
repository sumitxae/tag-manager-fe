"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { Company, getCompanies } from "@/utils/apiClient";
// import { Company, getCompanies } from "./CreateCompanyForm";
// import { getCompanies, Company } from "@/utils/apiClient";

interface CompanyListProps {
  refreshTrigger: number; // A simple prop to trigger re-fetch
}

export const CompanyList: React.FC<CompanyListProps> = ({ refreshTrigger }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
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
        setError("Failed to load companies.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Existing Companies
      </Typography>
      {companies.length === 0 ? (
        <Typography color="text.secondary">
          No companies found. Add one above to get started.
        </Typography>
      ) : (
        <List sx={{ bgcolor: "background.paper" }}>
          {companies.map((company, index) => (
            <React.Fragment key={company.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={company.name}
                  secondary={
                    <>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        Default Start #: {company.startNumber}
                      </Typography>
                      {" — UPCs: " + (company.upcCount || 0)}
                    </>
                  }
                />
                <Chip
                  label={company.epcScheme}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </ListItem>
              {index < companies.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};
