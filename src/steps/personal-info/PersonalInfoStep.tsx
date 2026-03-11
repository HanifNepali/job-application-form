import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { personalInfoSchema, type PersonalInfoData } from "./schema";
import { FieldTextInput } from "@/components/FieldTextInput";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldError } from "@/components/FieldError";
import { Button } from "@/components/Button";
import { countryOptions } from "@/lib/utils";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { StepHeader } from "@/components/StepHeader";

export function PersonalInfoStep() {
  const navigate = useNavigate();
  const data = useFormStore((s) => s.data.personalInfo);
  const updatePersonalInfo = useFormStore((s) => s.updatePersonalInfo);
  const setFurthestUnlockedStep = useFormStore(
    (s) => s.setFurthestUnlockedStep,
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data, // hydrate from the persisted store, not a blank form
    mode: "onBlur", // matches the spec's onBlur-first validation timing
    reValidateMode: "onChange", // ...then onChange re-validation once a field has errored
    shouldFocusError: true,
  });

  const onSubmit = (values: PersonalInfoData) => {
    updatePersonalInfo(values);
    setFurthestUnlockedStep(1); // index of the next step, "Experience"
    navigate(`/form/${STEPS[1].path}`);
  };

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
                    onChange={field.onChange}
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

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            Next
          </Button>
        </div>
      </form>
    </>
  );
}
