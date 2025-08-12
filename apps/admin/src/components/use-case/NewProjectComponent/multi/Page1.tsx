import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { typedEntries } from '@/utils/helpers'
import React, { useEffect, useState, type FC } from 'react'
import { checkProjectNameExists } from '@/services/queries'

type FormVal<K = string> = {
    value: K,
    blurred: boolean
}

type FormData = {
    projectName: FormVal,
    projectDescription: FormVal
}

type FormDataAsStrings = {
    [K in keyof FormData]: string
}

type FormDataAsOptionalStrings = Partial<FormDataAsStrings>;

type Fields = keyof FormData

type IProps = {
    next: ((formData: FormDataAsStrings) => void),
    back: () => void,
    defaultValues?: FormDataAsStrings
}

const INITIAL_FORM_VALS = {
    state: {
        projectName: { value: '', blurred: false },
        projectDescription: { value: '', blurred: true },
    },
    error: {
        projectName: '',
        projectDescription: ''
    }
}

const Page1: FC<IProps> = ({ next, back, defaultValues }) => {
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_VALS.state)
    const [errors, setErrors] = useState<FormDataAsStrings>(INITIAL_FORM_VALS.error)
    const [isValidating, setIsValidating] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setFormData({
            projectDescription: {
                value: defaultValues?.projectDescription || '',
                blurred: true
            },
            projectName: {
                value: defaultValues?.projectName || '',
                blurred: false
            }
        })
    }, [])

    const INITIALIZE_FORM_STATES = () => {
        setFormData(INITIAL_FORM_VALS.state);
        setErrors(INITIAL_FORM_VALS.error)
    }

    // Validation function
    const validateField = async (field: Fields, value: string) => {
        let error = "";
        const trimmedValue = value.trim();

        switch (field) {
            case "projectName":
                if (trimmedValue === '' || !trimmedValue) {
                    error = 'Project name is required';
                } else {
                    // Check for duplicate project names
                    setIsValidating(true);
                    try {
                        const result = await checkProjectNameExists(trimmedValue);
                        if (result.error) {
                            error = 'Error checking project name availability';
                        } else if (result.data) {
                            error = 'A project with this name already exists';
                        }
                    } catch (err) {
                        error = 'Error validating project name';
                    } finally {
                        setIsValidating(false);
                    }
                }
                break;
            case "projectDescription":
                break;
        }

        setErrors((prev) => ({ ...prev, [field]: error }));
        return error === "";
    };

    const handleChange = (name: Fields, value: string) => {
        // Clear error immediately on change
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setFormData((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
            }
        }));
    };

    const handleBlur = async (name: Fields) => {
        setFormData((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                blurred: true
            }
        }));

        // Validate field on blur
        await validateField(name, formData[name].value);
    };

    const hasErrors = Object.values(errors).some((err) => err !== "");
    const allBlurred = Object.values(formData).every((formEl) => formEl.blurred)

    return (
        <section className='flex flex-col gap-3'>
            <h1 className='font-bold text-xl'>Basic Information</h1>
            <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                setIsSubmitting(true);

                // Validate all fields
                let isValid = true;
                for (const el in formData) {
                    const field = el as Fields
                    const fieldValid = await validateField(field, formData[field].value);
                    if (!fieldValid) {
                        isValid = false;
                    }
                }

                if (isValid && allBlurred) {
                    const temp: FormDataAsOptionalStrings = {};
                    typedEntries(formData).forEach(([key, val]) => {
                        // Trim the values before submitting
                        temp[key] = val.value.trim();
                    });

                    next(temp as FormDataAsStrings)
                }
                
                setIsSubmitting(false);
            }} className='flex flex-col gap-3'>
                <div className="flex flex-col gap-1">
                    <Input
                        name="projectName"
                        value={formData.projectName.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleChange('projectName', e.target.value)
                        }}
                        onBlur={() => handleBlur('projectName')}
                        label="Name of Project"
                        disabled={isValidating}
                    />
                    {isValidating && formData.projectName.value.trim() ? (
                        <p className='text-blue-600 text-sm'>Checking availability...</p>
                    ) : null}
                    {errors.projectName ? <p className='text-destructive'>{errors.projectName}</p> : null}
                </div>
                <div className="flex flex-col gap-1">
                    <Textarea name="projectDescription"
                        value={formData.projectDescription.value}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            handleChange('projectDescription', e.target.value)
                            setFormData(prevState => ({
                                ...prevState, projectDescription: {
                                    ...prevState.projectDescription,
                                    blurred: true
                                }
                            }))
                        }}
                        rows={4}
                        onBlur={() => handleBlur('projectDescription')}
                        label="Project Description"
                        placeholder='Enter Project Description'
                    />
                    {errors.projectDescription ? <p className='text-destructive'>{errors.projectDescription}</p> : null}
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="submit" 
                        disabled={hasErrors || !allBlurred || isValidating || isSubmitting}
                        loading={isSubmitting}
                    >
                        {isValidating ? 'Validating...' : 'Next'}
                    </Button>
                    <Button onClick={() => {
                        back()
                        INITIALIZE_FORM_STATES()
                    }} variant={"outline"} disabled={isSubmitting}>Cancel</Button>
                </div>
            </form>
        </section>
    )
}

export default Page1