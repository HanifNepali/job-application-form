import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  availabilitySchema,
  type AvailabilityFormValues,
  type AvailabilityData,
} from "./schema";
import { FieldCheckboxGroup } from "@/components/FieldCheckboxGroup";
import { FieldTextInput } from "@/components/FieldTextInput";
import { Button } from "@/components/Button";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { mockJobPosting } from "@/lib/jobPosting";
import { StepHeader } from "@/components/StepHeader";
import { FieldYesNo } from "@/components/FieldYesNo";
import { RELOCATION_REGIONS } from "@/lib/constants";
import { useEffect } from "react";

export function AvailabilityStep() {
  const navigate = useNavigate();
  const data = useFormStore((s) => s.data.availability);
  const updateAvailability = useFormStore((s) => s.updateAvailability);
  const setFurthestUnlockedStep = useFormStore(
    (s) => s.setFurthestUnlockedStep,
  );
  const validateOnMount = useFormStore((s) => s.validateOnMount);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AvailabilityFormValues, unknown, AvailabilityData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: data,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Drives the conditional reveal — willingToRelocate isn't itself
  // register()-based, but useWatch (rather than reading relocateField.value
  // directly) keeps this consistent with how every other step reads live
  // values for conditional rendering (Experience's isCurrent check, etc.).
  const willingToRelocateWatchedValue = useWatch({
    control,
    name: "willingToRelocate",
  });

  const onSubmit = (values: AvailabilityData) => {
    updateAvailability(values);
    setFurthestUnlockedStep(5);
    navigate(`/form/${STEPS[5].path}`);
  };

  useEffect(() => {
    if (validateOnMount) {
      trigger(); // no argument = validate the whole step, populate every field's error at once
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // deliberately once-on-mount only — see note below

  return (
    <>
      <StepHeader title={STEPS[4].label} description={STEPS[4].pageSubHeader} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Controller
          name="residesInJobLocation"
          control={control}
          render={({ field }) => (
            <FieldYesNo
              label={`Are you currently residing in ${mockJobPosting.location}?`}
              name="residesInJobLocation"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.residesInJobLocation?.message}
            />
          )}
        />

        <Controller
          name="willingToRelocate"
          control={control}
          render={({ field }) => (
            <FieldYesNo
              label="Are you willing to relocate?"
              name="willingToRelocate"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                // Clear stale regions the moment relocation is turned off — same
                // "don't trust UI-only gating" reasoning as Experience clearing
                // endDate when a role becomes current: the field is about to be
                // hidden, but its old value would otherwise survive untouched.
                if (!val) setValue("relocationRegions", []);
              }}
              onBlur={field.onBlur}
              error={errors.willingToRelocate?.message}
            />
          )}
        />

        {willingToRelocateWatchedValue === true && (
          <Controller
            name="relocationRegions"
            control={control}
            render={({ field }) => (
              <FieldCheckboxGroup
                label="Which regions would you consider relocating to?"
                name="relocationRegions"
                options={RELOCATION_REGIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.relocationRegions?.message}
              />
            )}
          />
        )}

        <div className="grid grid-cols-2">
          <FieldTextInput
            label="Earliest Possible Start Date"
            type="date"
            min={new Date().toISOString()}
            error={errors.earliestStartDate?.message}
            {...register("earliestStartDate")}
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
