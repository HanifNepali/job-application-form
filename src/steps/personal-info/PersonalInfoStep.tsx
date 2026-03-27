import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { personalInfoSchema, type PersonalInfoData } from "./schema";
import { FieldTextInput } from "@/components/FieldTextInput";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldError } from "@/components/FieldError";
import { countryOptions } from "@/lib/utils";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { StepHeader } from "@/components/StepHeader";
import { useEffect } from "react";
import { UnsavedChangesModal } from "@/components/UnsavedChangesModal";
import { useUnsavedChangesWarning } from "@/lib/hooks";
import FormFooter from "@/components/FormFooter";
import NextButton from "@/components/NextButton";

export function PersonalInfoStep() {
  const navigate = useNavigate();
  const data = useFormStore((s) => s.data.personalInfo);
  const updatePersonalInfo = useFormStore((s) => s.updatePersonalInfo);
  const setFurthestUnlockedStep = useFormStore(
    (s) => s.setFurthestUnlockedStep,
  );
  const STEP_INDEX = 1; // this file's own position in STEPS — 1 for Experience, 2 for Skills & Links, etc.
  const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data, // hydrate from the persisted store, not a blank form
    mode: "onBlur", // matches the spec's onBlur-first validation timing
    reValidateMode: "onChange", // ...then onChange re-validation once a field has errored
    shouldFocusError: true,
  });

  const { blocker, allowNextNavigation } = useUnsavedChangesWarning(isDirty);

  const onSubmit = (values: PersonalInfoData) => {
    updatePersonalInfo(values);
    setFurthestUnlockedStep(1); // index of the next step, "Experience"
    allowNextNavigation(); // a plain function call in an event handler — nothing ref-shaped crosses any boundary here
    reset(values);
    navigate(`/form/${STEPS[1].path}`);
  };

  // Check if any errors exist explicitly:
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    // if (validateOnMount) {
    if (furthestUnlockedStep > STEP_INDEX) {
      trigger(); // no argument = validate the whole step, populate every field's error at once
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // deliberately once-on-mount only — see note below

  return (
    <>
      <StepHeader title={STEPS[0].label} description={STEPS[0].pageSubHeader} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-8">
          <FieldTextInput
            label="First Name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <FieldTextInput
            label="Middle Name"
            error={errors.middleName?.message}
            {...register("middleName")}
          />
          <FieldTextInput
            label="Last Name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-8">
          <FieldTextInput
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Phone Number
            </label>
            <div className="flex w-full items-center rounded-md border bg-surface px-3 py-2 focus-within:outline focus-within:outline-offset-2 border-line focus-within:outline-accent">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="phone"
                    international
                    value={field.value}
                    onBlur={field.onBlur}
                    onCountryChange={(selectedCountry) => {
                      // Auto-populate Country from the phone's selected country, but
                      // only as a convenience default — never clobber a value the user
                      // (or a returning session's persisted data) already set.
                      if (selectedCountry && !dirtyFields.country) {
                        setValue("country", selectedCountry, {
                          shouldDirty: false, // this is an auto-fill, not a real user edit
                        });
                      }
                    }}
                    // By design, when a user completely clears out react-phone-number-input
                    // or erases it past a valid parsing state, the library explicitly emits undefined as its argument
                    // to denote an empty state. The UI retains whatever fallback or country placeholder logic
                    // it has internally, making it look like a previous state while the data stream sends undefined
                    onChange={(value) => {
                      field.onChange(value || ""); // Normalize undefined to an empty string for RHF
                    }}
                  />
                )}
              />
            </div>
            <FieldError id="phone-error" message={errors.phone?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FieldTextInput
            label="City"
            error={errors.city?.message}
            {...register("city")}
          />
          <FieldSelect
            label="Country"
            placeholder="Select a country"
            options={countryOptions}
            error={errors.country?.message}
            {...register("country")}
          />
        </div>

        <FormFooter>
          <NextButton isSubmitting={isSubmitting} formHasError={hasErrors} />
        </FormFooter>
      </form>

      <UnsavedChangesModal blocker={blocker} />
    </>
  );
}
