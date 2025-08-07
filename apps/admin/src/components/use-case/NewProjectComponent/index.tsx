import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useProject from "./useProject";
import TimePickerComponent from "@/components/common/TimePickerComponent";
import AutcompleteComponent from "@/components/common/AutocompleteComponent";
import type { FC, FormEvent } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type IProps = {
    next: (projectId: string | number) => void;
}

const NewProjectComponent: FC<IProps> = ({ next }) => {
    const {
        formData,
        errors,
        touched,
        onChange,
        onBlur,
        validateForm,
        loading,
        countries
    } = useProject();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await validateForm();
        if (result?.valid) {
            console.log("✅ Form Data:", { formData });
            next('123')
        } else {
            console.warn("❌ Validation Errors:", result?.errors);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* Project Name */}
            <div>
                <Input label="Project Name"
                    value={formData.nameOfProject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("nameOfProject", e.target.value)}
                    onBlur={() => onBlur("nameOfProject")}
                />
                {touched.nameOfProject && errors.nameOfProject && (
                    <p className="text-sm text-red-500">{errors.nameOfProject}</p>
                )}
            </div>
            {/* Client Name */}
            <div className="flex gap-2">
                <div className="w-full">
                    <Input label="Client Name"
                        value={formData.clientName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("clientName", e.target.value)}
                        onBlur={() => onBlur("clientName")}
                    />
                    {touched.clientName && errors.clientName && (
                        <p className="text-sm text-red-500">{errors.clientName}</p>
                    )}
                </div>
                <div className="w-full">
                    <Input label="Client's Email"
                        value={formData.clientEmail}
                        type="email"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("clientEmail", e.target.value)}
                        onBlur={() => onBlur("clientEmail")}
                    />
                    {touched.clientEmail && errors.clientEmail && (
                        <p className="text-sm text-red-500">{errors.clientEmail}</p>
                    )}
                </div>
                <div className="w-full">
                    <Input label="Client's Phone"
                        value={formData.clientPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("clientPhone", e.target.value)}
                        onBlur={() => onBlur("clientPhone")}
                        type="tel"
                    />
                    {touched.clientPhone && errors.clientPhone && (
                        <p className="text-sm text-red-500">{errors.clientPhone}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <Label>Select Client's Country</Label>
                    <AutcompleteComponent sideEffects={(selectedCountry) => {
                        onChange("clientCountry", selectedCountry.value)
                    }} options={countries} defaultLabel="Select Country" />
                </div>
            </div>
            <div className="flex gap-2">
                {/* Report Day (Select) */}
                <div className="flex flex-col gap-2 w-full">
                    <Label>Report Day</Label>
                    <Select
                        defaultValue={formData.reportDay}
                        onValueChange={(val) => onChange("reportDay", val)}
                    >
                        <SelectTrigger className="w-full" onBlur={() => onBlur("reportDay")}>
                            <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                            {days.map((day) => (
                                <SelectItem key={day} value={day}>
                                    {day}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {touched.reportDay && errors.reportDay && (
                        <p className="text-sm text-red-500">{errors.reportDay}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <TimePickerComponent
                        sideEffects={(e) => onChange("startTime", e)}
                        label="Start Time" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <TimePickerComponent
                        sideEffects={(e) => onChange("endTime", e)}
                        label="End Time" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <Input label="Overlapping Hours"
                        type="number"
                        value={formData.overlappingHours}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("overlappingHours", e.target.value)}
                        onBlur={() => onBlur("overlappingHours")}
                    />
                </div>
            </div>
            {/* Submit Button */}
            <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Create Project"}
            </Button>
        </form>
    );
};

export default NewProjectComponent;
