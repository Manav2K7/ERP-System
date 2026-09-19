import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  TextField,
} from "@mui/material";

/**
 * THE one React Hook Form + MUI input wrapper, reused across every form
 * (rules.md §1 — never hand-roll a second form-field component).
 *
 * Usage (all forms in F1+ use this exact pattern):
 *
 *   const { control } = useForm({ resolver: yupResolver(schema) });
 *   <FormField name="email" label="Email" control={control} />
 *   <FormField name="role" label="Role" control={control} options={ROLE_OPTIONS} />
 *   <FormField name="active" label="Active" control={control} type="checkbox" />
 *
 * Types: "text" (default), "number", "password", "date", "textarea", "select",
 * "checkbox". Value transforms: number -> valueAsNumber, checkbox -> checked.
 */
export default function FormField({
  control,
  name,
  label,
  type = "text",
  options = [],
  required = false,
  disabled = false,
  placeholder,
  multilineRows,
}) {
  const isError = (fieldState) => Boolean(fieldState.error);
  const helper = (fieldState) => fieldState.error?.message || null;

  if (type === "checkbox") {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <FormControl error={isError(fieldState)} disabled={disabled}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                />
              }
              label={label}
            />
            {helper(fieldState) && <FormHelperText>{helper(fieldState)}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

  if (type === "select") {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            select
            fullWidth
            size="small"
            label={label}
            required={required}
            disabled={disabled}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={isError(fieldState)}
            helperText={helper(fieldState)}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          fullWidth
          size="small"
          type={type}
          label={label}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          multiline={type === "textarea"}
          rows={type === "textarea" ? multilineRows || 3 : undefined}
          value={field.value ?? ""}
          onChange={
            type === "number"
              ? (e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
              : field.onChange
          }
          onBlur={field.onBlur}
          error={isError(fieldState)}
          helperText={helper(fieldState)}
        />
      )}
    />
  );
}

FormField.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["text", "number", "password", "date", "textarea", "select", "checkbox"]),
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.any, label: PropTypes.string })),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  multilineRows: PropTypes.number,
};
