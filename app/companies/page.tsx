"use client";

import React, { useState } from "react";
import { Container, Paper, Typography, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
// import { CreateCompanyForm } from "@/components/CreateCompanyForm";
import { CompanyList } from "@/components/CompanyList";
import { CreateCompanyForm } from "@/components/CreateCompanyForm";

const CompaniesPage = () => {
  // This state is used to trigger a refresh in the CompanyList
  // when a new company is created in the CreateCompanyForm.
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompanyCreated = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        Company Management
      </Typography>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: "#f8f9fa" }}>
        <Grid container spacing={5}>
          <Grid>
            <CreateCompanyForm onCompanyCreated={handleCompanyCreated} />
          </Grid>
          <Grid>
            <Divider
              orientation="vertical"
              sx={{ display: { xs: "none", md: "block" } }}
            />
            <Divider sx={{ display: { xs: "block", md: "none" }, my: 2 }} />
          </Grid>
          <Grid>
            <CompanyList refreshTrigger={refreshKey} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CompaniesPage;
