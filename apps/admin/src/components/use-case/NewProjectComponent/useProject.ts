import { useState, useCallback, useMemo } from "react";
import * as yup from "yup";
import { getTimeZones } from "@vvo/tzdb";


// Schema definition
const projectSchema = yup.object().shape({
    nameOfProject: yup.string().required("Project name is required"),
    clientName: yup.string().required("Client name is required"),
    clientEmail: yup.string().email("Invalid email").required("Client email is required"),
    clientPhone: yup.string().required("Client phone is required"),

    clientCountry: yup.string().required("Client country is required"),

    startTime: yup.string().matches(/^([0-1]\d|2[0-3]):([0-5]\d)(am|pm)?$/, "Invalid time"),
    endTime: yup.string().matches(/^([0-1]\d|2[0-3]):([0-5]\d)(am|pm)?$/, "Invalid time"),
    numberOfHours: yup.number().min(1).max(24).default(8).required("Number of hours is required"),
    overlappingHours: yup
        .number()
        .min(0)
        .max(24)
        .default(4)
        .required("Overlapping hours are required"),
    reportDay: yup
        .string()
        .oneOf(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .required("Report day is required"),
});

const initialFormData = {
    nameOfProject: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCountry: "",
    startTime: "",
    endTime: "",
    overlappingHours: 4,
    reportDay: "Monday",
};


const useProject = () => {
    const countries = useMemo(() => {
        return Array.from(
            new Map(
                getTimeZones({ includeUtc: true }).map((tz) => [tz.countryName, tz.countryCode])
            )
        ).map(([countryName, countryCode]) => ({
            label: countryName,
            value: countryCode,
        }));
    }, []);

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const onChange = useCallback((field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Optionally clear error on change
        setErrors((prev) => ({ ...prev, [field]: "" }));
    }, []);

    const onBlur = useCallback(async (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        try {
            await projectSchema.validateAt(field, formData);
            setErrors((prev) => ({ ...prev, [field]: "" }));
        } catch (err: unknown) {
            if (err instanceof yup.ValidationError) {
                setErrors((prev) => ({ ...prev, [field]: err.message }));
            }
        }
    }, [formData]);

    const validateForm = useCallback(async () => {
        setLoading(true);
        try {
            await projectSchema.validate(formData, { abortEarly: false });
            return { valid: true, errors: null }
        } catch (err: unknown) {
            const newErrors: Record<string, string> = {};
            if (err instanceof yup.ValidationError && err.inner) {
                err.inner.forEach((e) => {
                    if (e.path) {
                        newErrors[e.path] = e.message;
                    }
                });
            }
            setErrors(newErrors);
            return { valid: false, errors: newErrors };
        } finally {
            setLoading(false);
        }
    }, [formData]);

    return {
        formData,
        setFormData,
        errors,
        touched,
        loading,
        onChange,
        onBlur,
        validateForm,
        countries
    };
};

export default useProject;
