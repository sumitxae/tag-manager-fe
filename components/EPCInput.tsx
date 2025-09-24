"use client";

import React, { useState, useCallback } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Tag } from "@mui/icons-material";
import { validateEPCNumber } from "@/utils/FileValidation";

interface EPCInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export const EPCInput: React.FC<EPCInputProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [localError, setLocalError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow empty value for better UX during typing
      if (newValue === "") {
        setLocalError("");
        onChange(newValue, false);
        return;
      }

      // Only allow numeric input (including negative sign for validation)
      const numericRegex = /^-?\d*$/;
      if (!numericRegex.test(newValue)) {
        return; // Don't update if non-numeric
      }

      const validation = validateEPCNumber(newValue);
      setLocalError(validation.error || "");
      onChange(newValue, validation.isValid);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (value === "") {
      setLocalError("EPC number is required");
    }
  }, [value]);

  const handleFocus = useCallback(() => {
    if (!touched) {
      setLocalError("");
    }
  }, [touched]);

  const displayError = error || (touched && localError);

  return (
    <TextField
      fullWidth
      type="text" // Using text instead of number for better control
      label="Starting EPC Number"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      error={Boolean(displayError)}
      helperText={
        displayError || "Enter the starting EPC number (positive integer)"
      }
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Tag color={displayError ? "error" : "action"} />
          </InputAdornment>
        ),
        inputProps: {
          min: 1,
          step: 1,
          pattern: "[0-9]*",
          inputMode: "numeric",
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&:hover fieldset": {
            borderColor: disabled ? undefined : "primary.main",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
          },
          "&.Mui-error fieldset": {
            borderColor: "error.main",
          },
        },
        "& .MuiFormHelperText-root": {
          fontSize: "0.875rem",
        },
        "& .MuiFormHelperText-root.Mui-error": {
          color: "error.main",
        },
      }}
    />
  );
};
